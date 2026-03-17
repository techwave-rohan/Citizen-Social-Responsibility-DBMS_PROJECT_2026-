from fastapi import APIRouter, Depends, HTTPException
from database import get_db_connection
from schemas import CitizenDashboardStats, ActionDisplay, ComplaintCreate, TokenData
from .auth import get_current_user, role_required

router = APIRouter(prefix="/citizen", tags=["citizen"], dependencies=[Depends(role_required("citizen"))])

@router.get("/dashboard/{citizen_id}")
def get_dashboard(citizen_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT CitizenID, FirstName, LastName, City, CurrentScore FROM citizen WHERE CitizenID = %s", (citizen_id,))
        citizen = cursor.fetchone()
        if not citizen:
            raise HTTPException(status_code=404, detail="Citizen not found")
        
        cursor.execute("SELECT AVG(CurrentScore) as CityAvgScore FROM citizen WHERE City = %s", (citizen['City'],))
        city_avg = cursor.fetchone()['CityAvgScore'] or 0.0
        
        full_name = f"{citizen['FirstName']} {citizen['LastName']}".strip()
        
        return {
            "CitizenID": citizen['CitizenID'],
            "Name": full_name,
            "City": citizen['City'],
            "TrustScore": citizen['CurrentScore'],
            "CityAvgScore": float(city_avg),
            "ScoreDelta": citizen['CurrentScore'] - float(city_avg)
        }
    finally:
        cursor.close()
        conn.close()

@router.get("/score-history/{citizen_id}")
def get_score_history(citizen_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM score_history WHERE CitizenID = %s ORDER BY ChangeDate DESC", (citizen_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/actions/{citizen_id}")
def get_actions(citizen_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT a.ActionName, a.ScoreImpact, r.ActionDate
        FROM citizen_action_record r
        JOIN action_type a ON r.ActionTypeID = a.ActionTypeID
        WHERE r.CitizenID = %s
        ORDER BY r.ActionDate DESC
        """
        cursor.execute(query, (citizen_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/benefits/{citizen_id}")
def get_benefits(citizen_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT CurrentScore FROM citizen WHERE CitizenID = %s", (citizen_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Citizen not found")
        score = row['CurrentScore']
        
        # Get active/received benefits
        cursor.execute("""
            SELECT b.BenefitName
            FROM benefit b
            JOIN citizen_benefit cb ON b.BenefitID = cb.BenefitID
            WHERE cb.CitizenID = %s
        """, (citizen_id,))
        active = [r['BenefitName'] for r in cursor.fetchall()]
        
        # Get eligible benefits (not yet granted)
        cursor.execute("""
            SELECT b.BenefitName
            FROM benefit b
            WHERE b.MinScoreRequired <= %s
            AND b.BenefitID NOT IN (
                SELECT cb.BenefitID FROM citizen_benefit cb WHERE cb.CitizenID = %s
            )
        """, (score, citizen_id))
        eligible = [r['BenefitName'] for r in cursor.fetchall()]
        
        return {"ActiveBenefits": active, "EligibleBenefits": eligible}
    finally:
        cursor.close()
        conn.close()

@router.post("/complaint")
def file_complaint(complaint: ComplaintCreate, current_user: TokenData = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Get citizen ID from the Aadhaar stored in token
        cursor.execute("SELECT CitizenID FROM citizen WHERE AadhaarNumber = %s", (current_user.id,))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Citizen not found for token")
        filer_id = result['CitizenID']

        # Verify the target citizen exists
        cursor.execute("SELECT CitizenID FROM citizen WHERE CitizenID = %s", (complaint.AgainstCitizenID,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Citizen with ID {complaint.AgainstCitizenID} not found")

        query = "INSERT INTO complaint (FiledByCitizenID, AgainstCitizenID, Description, FiledDate, Status) VALUES (%s, %s, %s, CURDATE(), 'Pending')"
        cursor.execute(query, (filer_id, complaint.AgainstCitizenID, complaint.Description))
        conn.commit()
        return {"message": "Complaint filed successfully", "ComplaintID": cursor.lastrowid}
    finally:
        cursor.close()
        conn.close()

@router.get("/complaints/{citizen_id}")
def get_citizen_complaints(citizen_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM complaint WHERE FiledByCitizenID = %s ORDER BY FiledDate DESC", (citizen_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/restrictions/{citizen_id}")
def get_restrictions(citizen_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT r.*, d.DepartmentName 
            FROM restriction r
            JOIN department d ON r.DepartmentID = d.DepartmentID
            WHERE r.CitizenID = %s
            ORDER BY r.StartDate DESC
        """, (citizen_id,))
        restrictions = cursor.fetchall()
        # Add IsActive flag for frontend
        from datetime import date as date_type
        for r in restrictions:
            end = r.get('EndDate')
            r['IsActive'] = end is not None and end >= date_type.today()
        return restrictions
    finally:
        cursor.close()
        conn.close()
