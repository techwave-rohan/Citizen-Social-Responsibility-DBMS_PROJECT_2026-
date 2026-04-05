from fastapi import APIRouter, Depends, HTTPException
import mysql.connector
from database import get_db_connection
from .auth import role_required
from schemas import (ActionTypeCreate, ActionTypeUpdate, BenefitCreate, BenefitUpdate,
                     DepartmentCreate, DepartmentUpdate, AgeGroupCreate, AgeGroupUpdate)

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(role_required("admin"))])

@router.get("/citizens")
def get_all_citizens():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT CitizenID, AadhaarNumber, FirstName, LastName, DOB AS DateOfBirth, City, ContactNo, CurrentScore, AgeGroupID FROM citizen")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.delete("/citizen/{citizen_id}")
def delete_citizen(citizen_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM citizen WHERE CitizenID = %s", (citizen_id,))
        conn.commit()
        return {"message": "Citizen deleted successfully"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Cannot delete citizen: {str(err)}")
    finally:
        cursor.close()
        conn.close()

@router.get("/officials")
def get_all_officials():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT OfficialID, FirstName, LastName, Designation, Email, DepartmentID FROM government_official")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.delete("/official/{official_id}")
def delete_official(official_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM government_official WHERE OfficialID = %s", (official_id,))
        conn.commit()
        return {"message": "Official deleted successfully"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Cannot delete official: {str(err)}")
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
                   GROUP_CONCAT(DISTINCT ag.AgeGroupID) AS AgeGroupIDs,
                   GROUP_CONCAT(DISTINCT ad.DepartmentID) AS DepartmentIDs
            FROM action_type a
            LEFT JOIN action_agegroup ag ON a.ActionTypeID = ag.ActionTypeID
            LEFT JOIN action_department ad ON a.ActionTypeID = ad.ActionTypeID
            GROUP BY a.ActionTypeID
        """
        cursor.execute(query)
        results = cursor.fetchall()
        for r in results:
            if r['AgeGroupIDs']:
                r['AgeGroupIDs'] = [int(i) for i in str(r['AgeGroupIDs']).split(',')]
            else:
                r['AgeGroupIDs'] = []
                
            if r['DepartmentIDs']:
                r['DepartmentIDs'] = [int(i) for i in str(r['DepartmentIDs']).split(',')]
            else:
                r['DepartmentIDs'] = []
        return results
    finally:
        cursor.close()
        conn.close()

@router.post("/action-types")
def create_action_type(data: ActionTypeCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO action_type (ActionName, ScoreImpact, Severity) VALUES (%s, %s, %s)",
            (data.ActionName, data.ScoreImpact, data.Severity)
        )
        new_id = cursor.lastrowid
        
        if data.AgeGroupIDs:
            ag_values = [(new_id, ag_id) for ag_id in data.AgeGroupIDs]
            cursor.executemany(
                "INSERT INTO action_agegroup (ActionTypeID, AgeGroupID) VALUES (%s, %s)",
                ag_values
            )
            
        if data.DepartmentIDs:
            dept_values = [(new_id, dept_id) for dept_id in data.DepartmentIDs]
            cursor.executemany(
                "INSERT INTO action_department (ActionTypeID, DepartmentID) VALUES (%s, %s)",
                dept_values
            )
            
        conn.commit()
        return {"message": "Action type created", "ActionTypeID": new_id}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(err)}")
    finally:
        cursor.close()
        conn.close()

@router.put("/action-types/{action_type_id}")
def update_action_type(action_type_id: int, data: ActionTypeUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        updates = []
        values = []
        if data.ActionName is not None:
            updates.append("ActionName = %s")
            values.append(data.ActionName)
        if data.ScoreImpact is not None:
            updates.append("ScoreImpact = %s")
            values.append(data.ScoreImpact)
        if data.Severity is not None:
            updates.append("Severity = %s")
            values.append(data.Severity)
        
        if not updates and data.AgeGroupIDs is None and data.DepartmentIDs is None:
            return {"message": "No fields to update"}
            
        if updates:
            values.append(action_type_id)
            cursor.execute(f"UPDATE action_type SET {', '.join(updates)} WHERE ActionTypeID = %s", values)
            
        if data.AgeGroupIDs is not None:
            # Delete old mappings
            cursor.execute("DELETE FROM action_agegroup WHERE ActionTypeID = %s", (action_type_id,))
            if data.AgeGroupIDs:
                # Insert new mappings
                ag_values = [(action_type_id, ag_id) for ag_id in data.AgeGroupIDs]
                cursor.executemany(
                    "INSERT INTO action_agegroup (ActionTypeID, AgeGroupID) VALUES (%s, %s)",
                    ag_values
                )
                
        if data.DepartmentIDs is not None:
            # Delete old dept mappings
            cursor.execute("DELETE FROM action_department WHERE ActionTypeID = %s", (action_type_id,))
            if data.DepartmentIDs:
                # Insert new dept mappings
                dept_values = [(action_type_id, dept_id) for dept_id in data.DepartmentIDs]
                cursor.executemany(
                    "INSERT INTO action_department (ActionTypeID, DepartmentID) VALUES (%s, %s)",
                    dept_values
                )
        
        conn.commit()
        return {"message": "Action type updated"}
    finally:
        cursor.close()
        conn.close()

@router.delete("/action-types/{action_type_id}")
def delete_action_type(action_type_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM action_type WHERE ActionTypeID = %s", (action_type_id,))
        conn.commit()
        return {"message": "Action type deleted"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Cannot delete Action Type (it may be in use): {str(err)}")
    finally:
        cursor.close()
        conn.close()

@router.get("/benefits")
def get_benefits_admin():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM benefit")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/benefits")
def create_benefit(data: BenefitCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO benefit (BenefitName, MinScoreRequired) VALUES (%s, %s)",
            (data.BenefitName, data.MinScoreRequired)
        )
        conn.commit()
        return {"message": "Benefit created", "BenefitID": cursor.lastrowid}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(err)}")
    finally:
        cursor.close()
        conn.close()

@router.put("/benefits/{benefit_id}")
def update_benefit(benefit_id: int, data: BenefitUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        updates = []
        values = []
        if data.BenefitName is not None:
            updates.append("BenefitName = %s")
            values.append(data.BenefitName)
        if data.MinScoreRequired is not None:
            updates.append("MinScoreRequired = %s")
            values.append(data.MinScoreRequired)
        
        if not updates:
            return {"message": "No fields to update"}
        
        values.append(benefit_id)
        cursor.execute(f"UPDATE benefit SET {', '.join(updates)} WHERE BenefitID = %s", values)
        conn.commit()
        return {"message": "Benefit updated"}
    finally:
        cursor.close()
        conn.close()

@router.delete("/benefits/{benefit_id}")
def delete_benefit(benefit_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM benefit WHERE BenefitID = %s", (benefit_id,))
        conn.commit()
        return {"message": "Benefit deleted"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Cannot delete Benefit (it may be in use): {str(err)}")
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

@router.post("/departments")
def create_department(data: DepartmentCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO department (DepartmentID, DepartmentName) VALUES (%s, %s)",
            (data.DepartmentID, data.DepartmentName)
        )
        conn.commit()
        return {"message": "Department created"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(err)}")
    finally:
        cursor.close()
        conn.close()

@router.put("/departments/{dept_id}")
def update_department(dept_id: int, data: DepartmentUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if data.DepartmentName is not None:
            cursor.execute("UPDATE department SET DepartmentName = %s WHERE DepartmentID = %s", (data.DepartmentName, dept_id))
            conn.commit()
        return {"message": "Department updated"}
    finally:
        cursor.close()
        conn.close()

@router.delete("/departments/{dept_id}")
def delete_department(dept_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM department WHERE DepartmentID = %s", (dept_id,))
        conn.commit()
        return {"message": "Department deleted"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Cannot delete Department (it may be in use): {str(err)}")
    finally:
        cursor.close()
        conn.close()


@router.get("/agegroups")
def get_agegroups():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM agegroup")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router.post("/agegroups")
def create_agegroup(data: AgeGroupCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO agegroup (GroupName, MinAge, MaxAge) VALUES (%s, %s, %s)",
            (data.GroupName, data.MinAge, data.MaxAge)
        )
        conn.commit()
        return {"message": "Age group created", "AgeGroupID": cursor.lastrowid}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(err)}")
    finally:
        cursor.close()
        conn.close()

@router.put("/agegroups/{agegroup_id}")
def update_agegroup(agegroup_id: int, data: AgeGroupUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        updates = []
        values = []
        if data.GroupName is not None:
            updates.append("GroupName = %s")
            values.append(data.GroupName)
        if data.MinAge is not None:
            updates.append("MinAge = %s")
            values.append(data.MinAge)
        if data.MaxAge is not None:
            updates.append("MaxAge = %s")
            values.append(data.MaxAge)
        
        if not updates:
            return {"message": "No fields to update"}
        
        values.append(agegroup_id)
        cursor.execute(f"UPDATE agegroup SET {', '.join(updates)} WHERE AgeGroupID = %s", values)
        conn.commit()
        return {"message": "Age group updated"}
    finally:
        cursor.close()
        conn.close()

@router.delete("/agegroups/{agegroup_id}")
def delete_agegroup(agegroup_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM agegroup WHERE AgeGroupID = %s", (agegroup_id,))
        conn.commit()
        return {"message": "Age group deleted"}
    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Cannot delete Age Group (it may be in use): {str(err)}")
    finally:
        cursor.close()
        conn.close()
