from fastapi import APIRouter, Depends, HTTPException
from database import get_db_connection
from .auth import get_current_user, role_required
from schemas import ComplaintResolve, ActionRecordCreate, RestrictionCreate, TokenData

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
    cursor = conn.cursor()
    try:
        official_data = get_official_details_from_email(current_user.id)
        official_id = official_data['OfficialID']
        
        # Verify citizen exists
        cursor.execute("SELECT CitizenID FROM citizen WHERE CitizenID = %s", (action.CitizenID,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail=f"Citizen with ID {action.CitizenID} not found")
        
        query = "INSERT INTO citizen_action_record (CitizenID, ActionTypeID, ActionDate, OfficialID) VALUES (%s, %s, CURDATE(), %s)"
        cursor.execute(query, (action.CitizenID, action.ActionTypeID, official_id))
        
        # Update citizen's score
        cursor.execute("SELECT ScoreImpact FROM action_type WHERE ActionTypeID = %s", (action.ActionTypeID,))
        impact_row = cursor.fetchone()
        if impact_row:
            impact = impact_row[0]
            # Ensure score doesn't go below 0 (DB has CHECK constraint)
            cursor.execute("""
                UPDATE citizen 
                SET CurrentScore = GREATEST(0, CurrentScore + %s) 
                WHERE CitizenID = %s
            """, (impact, action.CitizenID))
        
        conn.commit()
        return {"message": "Action recorded successfully"}
    finally:
        cursor.close()
        conn.close()

@router.post("/restriction")
def issue_restriction(restriction: RestrictionCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Verify citizen exists
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
