import mysql.connector
from fastapi import APIRouter, Depends, HTTPException
from database import get_db_connection
from .auth import get_current_user, role_required
from schemas import ComplaintResolve, ActionRecordCreate, RestrictionCreate, TokenData, CitizenBenefitAssign

router = APIRouter(prefix="/official", tags=["official"], dependencies=[Depends(role_required("official"))])

def get_official_details_from_email(identifier: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
       
        cursor.execute("SELECT OfficialID, DepartmentID FROM government_official WHERE Email = %s", (identifier,))
        res = cursor.fetchone()
        return res if res else {'OfficialID': 1, 'DepartmentID': 1}
    finally:
        cursor.close()
        conn.close()

def get_official_details(current_user: TokenData):
 
    if current_user.user_id is not None:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT OfficialID, DepartmentID FROM government_official WHERE OfficialID = %s",
                (current_user.user_id,),
            )
            res = cursor.fetchone()
            if res:
                return res
        finally:
            cursor.close()
            conn.close()
    return get_official_details_from_email(current_user.id)

@router.get("/stats")
def get_official_stats():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT COUNT(*) AS total_actions FROM citizen_action_record")
        total_actions = cursor.fetchone()['total_actions']

        cursor.execute("SELECT COUNT(DISTINCT CitizenID) AS citizens_restricted FROM restriction")
        citizens_restricted = cursor.fetchone()['citizens_restricted']

        return {"total_actions": total_actions, "citizens_restricted": citizens_restricted}
    finally:
        cursor.close()
        conn.close()

@router.get("/complaints/pending")
def get_pending_complaints():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT c.*, CONCAT(f.FirstName, ' ', f.LastName) as FilerName, CONCAT(a.FirstName, ' ', a.LastName) as AgainstName
        FROM complaint c
        JOIN citizen f ON c.FiledByCitizenID = f.CitizenID
        JOIN citizen a ON c.AgainstCitizenID = a.CitizenID
        WHERE c.Status = 'Pending'
        ORDER BY c.FiledDate DESC
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.put("/complaint/{complaint_id}/resolve")
def resolve_complaint(complaint_id: int, payload: ComplaintResolve):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE complaint SET Status = %s, ResolutionNote = %s WHERE ComplaintID = %s", (payload.Status, payload.ResolutionNote, complaint_id))
        conn.commit()
        return {"message": "Complaint status updated successfully"}
    finally:
        cursor.close()
        conn.close()

@router.post("/action")
def record_action(action: ActionRecordCreate, current_user: TokenData = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        official_data = get_official_details(current_user)
        official_id = official_data['OfficialID']
        
        # Verify citizen exists and get old score
        cursor.execute("SELECT CitizenID, CurrentScore FROM citizen WHERE CitizenID = %s", (action.CitizenID,))
        citizen_row = cursor.fetchone()
        if not citizen_row:
            raise HTTPException(status_code=404, detail=f"Citizen with ID {action.CitizenID} not found")
        old_score = citizen_row['CurrentScore']
        
        # Get action details for response
        cursor.execute("SELECT ActionName, ScoreImpact FROM action_type WHERE ActionTypeID = %s", (action.ActionTypeID,))
        action_info = cursor.fetchone()
        if not action_info:
            raise HTTPException(status_code=404, detail=f"Action type {action.ActionTypeID} not found")
        
        # Count existing restrictions before insert (to detect new auto-restrictions)
        cursor.execute(
            "SELECT COUNT(*) AS cnt FROM restriction WHERE CitizenID = %s",
            (action.CitizenID,)
        )
        old_restriction_count = cursor.fetchone()['cnt']
        
        # INSERT only — the MySQL triggers handle everything:
        #   - after_action_insert: updates CurrentScore, inserts score_history
        #   - auto_flag_high_risk: creates 'High Risk Flag' restriction if score < 40
        #   - auto_restrict_repeated_violation: creates 'Auto: ...' restriction for 3+ same violations/month
        query = "INSERT INTO citizen_action_record (CitizenID, ActionTypeID, ActionDate, OfficialID) VALUES (%s, %s, CURDATE(), %s)"
        cursor.execute(query, (action.CitizenID, action.ActionTypeID, official_id))
        conn.commit()
        
        # Re-fetch updated data after triggers have fired
        cursor.execute("SELECT CurrentScore FROM citizen WHERE CitizenID = %s", (action.CitizenID,))
        new_score = cursor.fetchone()['CurrentScore']
        
        # Check for new auto-generated restrictions
        cursor.execute(
            """SELECT RestrictionType, StartDate, EndDate 
               FROM restriction 
               WHERE CitizenID = %s 
               ORDER BY RestrictionID DESC""",
            (action.CitizenID,)
        )
        all_restrictions = cursor.fetchall()
        new_restriction_count = len(all_restrictions)
        
        auto_restrictions = []
        if new_restriction_count > old_restriction_count:
            # New restrictions were auto-generated by triggers
            new_count = new_restriction_count - old_restriction_count
            auto_restrictions = all_restrictions[:new_count]
        
        return {
            "message": "Action recorded successfully",
            "action_name": action_info['ActionName'],
            "score_impact": action_info['ScoreImpact'],
            "old_score": old_score,
            "new_score": new_score,
            "auto_restrictions": auto_restrictions,
            "high_risk_flagged": new_score < 40 and old_score >= 40
        }
    finally:
        cursor.close()
        conn.close()

@router.post("/restriction")
def issue_restriction(restriction: RestrictionCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT CitizenID FROM citizen WHERE CitizenID = %s", (restriction.CitizenID,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Citizen with ID {restriction.CitizenID} not found")
            
        query = "INSERT INTO restriction (CitizenID, DepartmentID, RestrictionType, StartDate, EndDate) VALUES (%s, %s, %s, CURDATE(), %s)"
        cursor.execute(query, (restriction.CitizenID, restriction.DepartmentID, restriction.RestrictionType, restriction.EndDate))
        conn.commit()
        return {"message": "Restriction issued successfully"}
    finally:
        cursor.close()
        conn.close()

@router.get("/violations")
def get_violations():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT c.CitizenID, CONCAT(c.FirstName, ' ', c.LastName) as FullName, 
               a.ActionName, a.ScoreImpact, r.ActionDate
        FROM citizen_action_record r
        JOIN citizen c ON r.CitizenID = c.CitizenID
        JOIN action_type a ON r.ActionTypeID = a.ActionTypeID
        WHERE a.ScoreImpact < 0
        ORDER BY r.ActionDate DESC
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/action-types")
def get_action_types():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT a.*, 
                   GROUP_CONCAT(DISTINCT ag.AgeGroupID) AS AgeGroupIDs
            FROM action_type a
            LEFT JOIN action_agegroup ag ON a.ActionTypeID = ag.ActionTypeID
            GROUP BY a.ActionTypeID
        """
        cursor.execute(query)
        results = cursor.fetchall()
        for r in results:
            if r['AgeGroupIDs']:
                r['AgeGroupIDs'] = [int(i) for i in str(r['AgeGroupIDs']).split(',')]
            else:
                r['AgeGroupIDs'] = []
        return results
    finally:
        cursor.close()
        conn.close()

@router.get("/departments")
def get_departments():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM department")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/citizen/{citizen_id}/eligible-benefits")
def get_citizen_eligible_benefits(citizen_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT CurrentScore FROM citizen WHERE CitizenID = %s", (citizen_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Citizen not found")
            
        score = row['CurrentScore']
        
        query = """
            SELECT b.BenefitID, b.BenefitName, b.MinScoreRequired
            FROM benefit b
            WHERE b.MinScoreRequired <= %s
            AND b.BenefitID NOT IN (
                SELECT cb.BenefitID FROM citizen_benefit cb WHERE cb.CitizenID = %s
            )
            ORDER BY b.MinScoreRequired DESC
        """
        cursor.execute(query, (score, citizen_id))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/benefit/assign")
def assign_benefit(payload: CitizenBenefitAssign):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT CurrentScore FROM citizen WHERE CitizenID = %s", (payload.CitizenID,))
        cit = cursor.fetchone()
        if not cit:
            raise HTTPException(status_code=404, detail="Citizen not found")
            
        cursor.execute("SELECT MinScoreRequired FROM benefit WHERE BenefitID = %s", (payload.BenefitID,))
        ben = cursor.fetchone()
        if not ben:
            raise HTTPException(status_code=404, detail="Benefit not found")
            
        if cit['CurrentScore'] < ben['MinScoreRequired']:
            raise HTTPException(status_code=400, detail="Citizen is not eligible for this benefit")
            
        cursor.execute("INSERT INTO citizen_benefit (CitizenID, BenefitID, GrantedDate) VALUES (%s, %s, CURDATE())", (payload.CitizenID, payload.BenefitID))
        conn.commit()
        return {"message": "Benefit assigned successfully"}
    except mysql.connector.IntegrityError:
        raise HTTPException(status_code=400, detail="Benefit already assigned to this citizen")
    finally:
        cursor.close()
        conn.close()

@router.get("/violations/repeated")
def get_repeated_violations():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT c.CitizenID, CONCAT(c.FirstName, ' ', c.LastName) as FullName,
                   a.ActionName, COUNT(*) as ViolationCount, MAX(r.ActionDate) as LastViolationDate
            FROM citizen_action_record r
            JOIN citizen c ON r.CitizenID = c.CitizenID
            JOIN action_type a ON r.ActionTypeID = a.ActionTypeID
            WHERE a.ScoreImpact < 0
            GROUP BY c.CitizenID, a.ActionName
            HAVING COUNT(*) > 1
            ORDER BY ViolationCount DESC
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/restrictions")
def get_department_restrictions():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT r.*, CONCAT(c.FirstName, ' ', c.LastName) as CitizenName,
                   d.DepartmentName
            FROM restriction r
            JOIN citizen c ON r.CitizenID = c.CitizenID
            JOIN department d ON r.DepartmentID = d.DepartmentID
            ORDER BY r.StartDate DESC
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/citizens-with-issues")
def get_citizens_with_issues():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT DISTINCT c.CitizenID, CONCAT(c.FirstName, ' ', c.LastName) as FullName,
            (SELECT COUNT(*) FROM complaint where AgainstCitizenID = c.CitizenID) as ComplaintCount,
            (SELECT COUNT(*) FROM citizen_action_record r JOIN action_type a ON r.ActionTypeID = a.ActionTypeID WHERE a.ScoreImpact < 0 AND r.CitizenID = c.CitizenID) as ViolationCount
            FROM citizen c
            WHERE (SELECT COUNT(*) FROM complaint where AgainstCitizenID = c.CitizenID) > 0
              AND (SELECT COUNT(*) FROM citizen_action_record r JOIN action_type a ON r.ActionTypeID = a.ActionTypeID WHERE a.ScoreImpact < 0 AND r.CitizenID = c.CitizenID) > 0
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/high-risk-citizens")
def get_high_risk_citizens():
    """Returns citizens auto-flagged by the auto_flag_high_risk trigger (score dropped below 40)."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT c.CitizenID, CONCAT(c.FirstName, ' ', c.LastName) as FullName,
                   c.City, c.CurrentScore,
                   r.StartDate as FlaggedDate, r.EndDate as FlagExpiry
            FROM restriction r
            JOIN citizen c ON r.CitizenID = c.CitizenID
            WHERE r.RestrictionType = 'High Risk Flag'
              AND r.EndDate >= CURDATE()
            ORDER BY r.StartDate DESC
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/auto-restrictions")
def get_auto_restrictions():
    """Returns restrictions auto-generated by the auto_restrict_repeated_violation trigger."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT r.RestrictionID, c.CitizenID, 
                   CONCAT(c.FirstName, ' ', c.LastName) as CitizenName,
                   r.RestrictionType, d.DepartmentName,
                   r.StartDate, r.EndDate
            FROM restriction r
            JOIN citizen c ON r.CitizenID = c.CitizenID
            JOIN department d ON r.DepartmentID = d.DepartmentID
            WHERE r.RestrictionType LIKE 'Auto:%%' OR r.RestrictionType = 'High Risk Flag'
            ORDER BY r.StartDate DESC
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
