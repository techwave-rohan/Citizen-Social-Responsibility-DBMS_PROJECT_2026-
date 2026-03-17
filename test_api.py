"""Quick test script to verify API endpoints work with the DB"""
from jose import jwt
import os, json
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv('backend/.env')
SECRET = os.getenv('SECRET_KEY')

def make_token(role, sub, user_id=0):
    return jwt.encode(
        {'sub': sub, 'role': role, 'user_id': user_id, 'exp': datetime.utcnow() + timedelta(hours=1)},
        SECRET, algorithm='HS256'
    )

def api_get(path, token):
    req = Request(f'http://localhost:8000{path}', headers={'Authorization': f'Bearer {token}'})
    try:
        resp = urlopen(req)
        return json.loads(resp.read())
    except HTTPError as e:
        body = e.read().decode()
        return f"ERROR {e.code}: {body}"

# Admin token
admin_token = make_token('admin', 'admin@gov.in')

# Citizen token (Rohan Kumar, Aadhaar 123456789012, CitizenID 101)
citizen_token = make_token('citizen', '123456789012', 101)

print("=== ADMIN: Action Types ===")
result = api_get('/admin/action-types', admin_token)
if isinstance(result, list):
    print(f"  OK - {len(result)} action types loaded")
    for r in result:
        print(f"    {r['ActionTypeID']}: {r['ActionName']} (Impact: {r['ScoreImpact']}, Severity: {r['Severity']})")
else:
    print(f"  FAIL - {result}")

print("\n=== ADMIN: Benefits ===")
result = api_get('/admin/benefits', admin_token)
if isinstance(result, list):
    print(f"  OK - {len(result)} benefits loaded")
else:
    print(f"  FAIL - {result}")

print("\n=== ADMIN: Departments ===")
result = api_get('/admin/departments', admin_token)
if isinstance(result, list):
    print(f"  OK - {len(result)} departments loaded")
else:
    print(f"  FAIL - {result}")

print("\n=== ADMIN: Age Groups ===")
result = api_get('/admin/agegroups', admin_token)
if isinstance(result, list):
    print(f"  OK - {len(result)} age groups loaded")
else:
    print(f"  FAIL - {result}")

print("\n=== CITIZEN: Dashboard (ID 101) ===")
result = api_get('/citizen/dashboard/101', citizen_token)
if isinstance(result, dict) and 'Name' in result:
    print(f"  OK - Name: {result['Name']}, City: {result['City']}, Score: {result['TrustScore']}")
else:
    print(f"  FAIL - {result}")

print("\n=== CITIZEN: Actions (ID 101) ===")
result = api_get('/citizen/actions/101', citizen_token)
if isinstance(result, list):
    print(f"  OK - {len(result)} actions loaded")
else:
    print(f"  FAIL - {result}")

print("\n=== CITIZEN: Benefits (ID 101) ===")
result = api_get('/citizen/benefits/101', citizen_token)
if isinstance(result, dict):
    print(f"  OK - Active: {result.get('ActiveBenefits', [])}, Eligible: {result.get('EligibleBenefits', [])}")
else:
    print(f"  FAIL - {result}")

print("\n=== CITIZEN: Complaints (ID 101) ===")
result = api_get('/citizen/complaints/101', citizen_token)
if isinstance(result, list):
    print(f"  OK - {len(result)} complaints loaded")
else:
    print(f"  FAIL - {result}")

print("\n=== CITIZEN: Restrictions (ID 101) ===")
result = api_get('/citizen/restrictions/101', citizen_token)
if isinstance(result, list):
    print(f"  OK - {len(result)} restrictions loaded")
else:
    print(f"  FAIL - {result}")

print("\nAll tests complete!")
