import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import sys

BASE_URL = 'http://localhost:8000'

def fetch_api(endpoint, method='GET', body=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    data = None
    if method == 'POST' and endpoint == '/auth/token':
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
        data = body.encode('utf-8')
    elif body:
        data = json.dumps(body).encode('utf-8')
        
    req = Request(BASE_URL + endpoint, data=data, headers=headers, method=method)
    try:
        resp = urlopen(req)
        content = resp.read()
        return resp.status, json.loads(content.decode()) if content else {}
    except HTTPError as e:
        content = e.read()
        return e.code, content.decode()

status, result = fetch_api('/auth/token', method='POST', body='username=admin@gov.in&password=admin123&grant_type=password')
if 'access_token' not in result:
    print("Login fail:", result)
    sys.exit(1)
token = result['access_token']

print('\nTesting ADD ActionType...')
payload = {'ActionName': 'New ActionTest', 'ScoreImpact': 5, 'Severity': 1}
print(fetch_api('/admin/action-types', method='POST', body=payload, token=token))

print('\nTesting ADD Department...')
payload = {'DepartmentID': 991, 'DepartmentName': 'New Dept Test'}
print(fetch_api('/admin/departments', method='POST', body=payload, token=token))

print('\nTesting ADD Benefit...')
payload = {'BenefitName': 'New Ben Test', 'MinScoreRequired': 100}
print(fetch_api('/admin/benefits', method='POST', body=payload, token=token))

print('\nTesting ADD AgeGroup...')
payload = {'GroupName': 'New Age Test', 'MinAge': 120, 'MaxAge': 150}
print(fetch_api('/admin/agegroups', method='POST', body=payload, token=token))
