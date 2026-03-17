import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

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
        return resp.status, json.loads(resp.read().decode())
    except HTTPError as e:
        return e.code, e.read().decode()

print("Testing Admin Login...")
status, result = fetch_api('/auth/token', method='POST', body='username=admin@gov.in&password=admin123&grant_type=password')
print("Login status:", status)
if status == 200:
    token = result['access_token']
    print("Logged in as Admin successfully.")
    
    print("\nTesting ADD Action Type...")
    payload = {"ActionName": "Test Action From Script", "ScoreImpact": 5, "Severity": 1}
    st, res = fetch_api('/admin/action-types', method='POST', body=payload, token=token)
    print("ADD status:", st, res)
    if st == 200:
        action_id = res.get("ActionTypeID")
        print("  Created ID:", action_id)
        
        print(f"\nTesting EDIT Action Type {action_id}...")
        edit_payload = {"ActionName": "Test Action Edited", "ScoreImpact": -10, "Severity": 3}
        st_edit, res_edit = fetch_api(f'/admin/action-types/{action_id}', method='PUT', body=edit_payload, token=token)
        print("EDIT status:", st_edit, res_edit)
        
        print(f"\nTesting DELETE Action Type {action_id}...")
        st_del, res_del = fetch_api(f'/admin/action-types/{action_id}', method='DELETE', token=token)
        print("DELETE status:", st_del, res_del)
else:
    print("Login failed:", result)
