import json
import urllib.request
from urllib.error import HTTPError

def test():
    
    data = "grant_type=password&username=admin@gov.in&password=admin123".encode()
    req = urllib.request.Request('http://localhost:8000/auth/token', data=data)
    with urllib.request.urlopen(req) as res:
        token = json.loads(res.read())['access_token']


    req = urllib.request.Request('http://localhost:8000/official/action', method='POST')
    req.add_header('Authorization', f'Bearer {token}')
    req.add_header('Content-Type', 'application/json')
    req.data = json.dumps({"CitizenID": 101, "ActionTypeID": 1}).encode()
    
    try:
        with urllib.request.urlopen(req) as res:
            print("Action Result:", res.read().decode())
    except HTTPError as e:
        print("Action Error:", e.code, e.read().decode())
    except Exception as e:
        print("Action Exception:", e)

  
    data = "grant_type=password&username=123456789012&password=password".encode()
    req = urllib.request.Request('http://localhost:8000/auth/token', data=data)
    try:
        with urllib.request.urlopen(req) as res:
            token = json.loads(res.read())['access_token']
    except HTTPError as e:
        print("Citizen Login Error:", e.code, e.read().decode())
        return

    req = urllib.request.Request('http://localhost:8000/citizen/score-history/101', method='GET')
    req.add_header('Authorization', f'Bearer {token}')
    
    try:
        with urllib.request.urlopen(req) as res:
            print("History Result:", res.read().decode())
    except HTTPError as e:
        print("History Error:", e.code, e.read().decode())

test()
