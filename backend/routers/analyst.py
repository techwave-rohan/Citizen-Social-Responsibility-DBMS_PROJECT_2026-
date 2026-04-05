from fastapi import APIRouter, Depends
from database import get_db_connection
from .auth import role_required

router = APIRouter(prefix="/analyst", tags=["analyst"], dependencies=[Depends(role_required("analyst"))])

@router.get("/overview")
def get_analyst_overview():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT COUNT(*) as TotalCitizens, AVG(CurrentScore) as NationalAvgScore FROM citizen")
        res1 = cursor.fetchone()
        cursor.execute("SELECT COUNT(*) as TotalComplaints FROM complaint")
        res2 = cursor.fetchone()
        cursor.execute("SELECT COUNT(*) as TotalRestrictions FROM restriction WHERE EndDate >= CURDATE()")
        res3 = cursor.fetchone()
        return {
            "TotalCitizens": res1['TotalCitizens'],
            "NationalAvgScore": res1['NationalAvgScore'] or 0,
            "TotalComplaints": res2['TotalComplaints'],
            "TotalRestrictions": res3['TotalRestrictions']
        }
    finally:
        cursor.close()
        conn.close()

@router.get("/scores/by-city")
def get_avg_score_by_city():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT City, AVG(CurrentScore) as AvgScore FROM citizen GROUP BY City")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/scores/by-agegroup")
def get_avg_score_by_agegroup():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT a.GroupName, AVG(c.CurrentScore) as AvgScore
        FROM citizen c
        JOIN agegroup a ON c.AgeGroupID = a.AgeGroupID
        GROUP BY a.GroupName
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/citizens/top")
def get_top_citizens():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT CitizenID, CONCAT(FirstName, ' ', LastName) as Name, City, CurrentScore as TrustScore
            FROM citizen 
            ORDER BY CurrentScore DESC 
            LIMIT 10
        """)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/violations/frequent")
def get_frequent_violations():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT a.ActionName, COUNT(r.RecordID) as Count
        FROM citizen_action_record r
        JOIN action_type a ON r.ActionTypeID = a.ActionTypeID
        WHERE a.ScoreImpact < 0
        GROUP BY a.ActionTypeID, a.ActionName
        ORDER BY Count DESC
        LIMIT 5
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/complaints/by-city")
def get_complaints_by_city():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT c.City, COUNT(cm.ComplaintID) as Count
        FROM complaint cm
        JOIN citizen c ON cm.AgainstCitizenID = c.CitizenID
        GROUP BY c.City
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/score-trends")
def get_score_trends():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT DATE(ChangeDate) as Date, AVG(NewScore) as AvgScore
        FROM score_history
        GROUP BY DATE(ChangeDate)
        ORDER BY Date ASC
        """
        cursor.execute(query)
        trends = cursor.fetchall()
        for t in trends:
            if hasattr(t['Date'], 'isoformat'):
                t['Date'] = t['Date'].isoformat()
        return trends
    finally:
        cursor.close()
        conn.close()

@router.get("/benefits/popularity")
def get_benefits_popularity():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT b.BenefitName, COUNT(cb.CitizenID) as GrantedCount
        FROM citizen_benefit cb
        JOIN benefit b ON cb.BenefitID = b.BenefitID
        GROUP BY b.BenefitID, b.BenefitName
        ORDER BY GrantedCount DESC
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/citizens/all-benefits-eligible")
def get_all_benefits_eligible():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT MAX(MinScoreRequired) as MaxScore FROM benefit")
        res = cursor.fetchone()
        max_score = res['MaxScore'] if res and res['MaxScore'] else 0
        
        cursor.execute("""
            SELECT CitizenID, CONCAT(FirstName, ' ', LastName) as FullName, CurrentScore 
            FROM citizen 
            WHERE CurrentScore >= %s
        """, (max_score,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/citizens/highest-violations")
def get_highest_violations():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT c.CitizenID, CONCAT(c.FirstName, ' ', c.LastName) as FullName, COUNT(r.RecordID) as ViolationCount
        FROM citizen_action_record r
        JOIN action_type a ON r.ActionTypeID = a.ActionTypeID
        JOIN citizen c ON r.CitizenID = c.CitizenID
        WHERE a.ScoreImpact < 0
        GROUP BY c.CitizenID
        ORDER BY ViolationCount DESC
        LIMIT 10
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.get("/citizens/with-restrictions")
def get_citizens_with_restrictions():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT c.CitizenID, CONCAT(c.FirstName, ' ', c.LastName) as FullName, r.RestrictionType, d.DepartmentName, r.EndDate
        FROM restriction r
        JOIN citizen c ON r.CitizenID = c.CitizenID
        JOIN department d ON r.DepartmentID = d.DepartmentID
        WHERE r.EndDate >= CURDATE()
        ORDER BY r.EndDate ASC
        """
        cursor.execute(query)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
