from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int

class TokenData(BaseModel):
    id: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None

class UserLogin(BaseModel):
    identifier: str
    password: str

# Database DTOs

class AgeGroup(BaseModel):
    AgeGroupID: int
    GroupName: str
    MinAge: int
    MaxAge: int

class CitizenCreate(BaseModel):
    AadhaarNumber: str
    FirstName: str
    LastName: str
    DateOfBirth: date
    City: str
    ContactNo: str
    Password: str
    AgeGroupID: Optional[int] = None

class OfficialCreate(BaseModel):
    FirstName: str
    LastName: str
    Email: str
    Password: str
    Designation: str
    DepartmentID: Optional[int] = None

class AdminCreate(BaseModel):
    Email: str
    Password: str

class Citizen(BaseModel):
    CitizenID: int
    AadhaarNumber: str
    FirstName: str
    LastName: str
    DOB: date
    City: str
    ContactNo: str
    CurrentScore: int
    AgeGroupID: int

class ActionType(BaseModel):
    ActionTypeID: int
    ActionName: str
    ScoreImpact: int
    Severity: Optional[int] = None

class CitizenActionRecord(BaseModel):
    RecordID: int
    CitizenID: int
    ActionTypeID: int
    ActionDate: date
    OfficialID: int

class GovernmentOfficial(BaseModel):
    OfficialID: int
    FirstName: Optional[str] = None
    LastName: Optional[str] = None
    Designation: Optional[str] = None
    Email: Optional[str] = None
    DepartmentID: int

class Department(BaseModel):
    DepartmentID: int
    DepartmentName: str

class Complaint(BaseModel):
    ComplaintID: int
    FiledByCitizenID: int
    AgainstCitizenID: int
    Description: Optional[str] = None
    Status: Optional[str] = None
    FiledDate: Optional[date] = None

class Benefit(BaseModel):
    BenefitID: int
    BenefitName: str
    MinScoreRequired: int

class CitizenBenefit(BaseModel):
    CitizenID: int
    BenefitID: int
    GrantedDate: Optional[date] = None

class ScoreHistory(BaseModel):
    HistoryID: int
    CitizenID: int
    OldScore: Optional[int] = None
    NewScore: Optional[int] = None
    Reason: Optional[str] = None
    ChangeDate: Optional[date] = None

class Restriction(BaseModel):
    RestrictionID: int
    CitizenID: int
    DepartmentID: int
    RestrictionType: Optional[str] = None
    StartDate: Optional[date] = None
    EndDate: Optional[date] = None

# Request Response Schemas

class CitizenDashboardStats(BaseModel):
    CitizenID: int
    Name: str
    City: str
    TrustScore: int
    CityAvgScore: float
    ScoreDelta: float

class ActionDisplay(BaseModel):
    ActionName: str
    ScoreImpact: int
    ActionDate: date

class ComplaintCreate(BaseModel):
    AgainstCitizenID: int
    Description: str

class ComplaintResolve(BaseModel):
    Status: str
    ResolutionNote: Optional[str] = None

class ActionRecordCreate(BaseModel):
    CitizenID: int
    ActionTypeID: int

class RestrictionCreate(BaseModel):
    CitizenID: int
    RestrictionType: str
    EndDate: Optional[date] = None
    DepartmentID: int

class CitizenBenefitAssign(BaseModel):
    CitizenID: int
    BenefitID: int

class TopCitizen(BaseModel):
    CitizenID: int
    FullName: str
    City: str
    CurrentScore: int

# Admin CRUD schemas
class ActionTypeCreate(BaseModel):
    ActionName: str
    ScoreImpact: int
    Severity: Optional[int] = None
    AgeGroupIDs: Optional[List[int]] = []
    DepartmentIDs: Optional[List[int]] = []

class ActionTypeUpdate(BaseModel):
    ActionName: Optional[str] = None
    ScoreImpact: Optional[int] = None
    Severity: Optional[int] = None
    AgeGroupIDs: Optional[List[int]] = None
    DepartmentIDs: Optional[List[int]] = None

class BenefitCreate(BaseModel):
    BenefitName: str
    MinScoreRequired: int

class BenefitUpdate(BaseModel):
    BenefitName: Optional[str] = None
    MinScoreRequired: Optional[int] = None

class DepartmentCreate(BaseModel):
    DepartmentID: int
    DepartmentName: str

class DepartmentUpdate(BaseModel):
    DepartmentName: Optional[str] = None

class AgeGroupCreate(BaseModel):
    GroupName: str
    MinAge: int
    MaxAge: int

class AgeGroupUpdate(BaseModel):
    GroupName: Optional[str] = None
    MinAge: Optional[int] = None
    MaxAge: Optional[int] = None
