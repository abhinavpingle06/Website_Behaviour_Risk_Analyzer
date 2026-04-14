
import requests
API_KEY = "AIzaSyADSNT3qPf31-fPc4yRonZRkZ_jkOV7qmU"
def check_url_safe():
    endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={API_KEY}"

    payload = {
        "client": {
            "clientId": "your-app",
            "clientVersion": "1.0"
        },
        "threatInfo": {
            "threatTypes": [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE"
            ],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [
                {"url": "http://testsafebrowsing.appspot.com/s/phishing.html"}
            ]
        }
    }

    res = requests.post(endpoint, json=payload)
    print(res.status_code)
    print(res.text)
    # if response.status_code == 200:
    #     data = response.json()
    #     return "matches" in data
    # else:
    #     print("Error:", response.text)
    #     return False
    
check_url_safe()