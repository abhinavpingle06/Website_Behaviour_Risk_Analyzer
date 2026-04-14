import requests
from dotenv import load_dotenv
import os

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

async def detect_redirects(response, original_url):

    redirect_chain = []
    google_result = []
    tag = []

    # Checking for redirects
    request = response.request # It returns the final redirecte page
    while request:
        redirect_chain.append(request.url)
        request = request.redirected_from # Returns none if no redirect - causing the loop to stop

    redirect_chain = redirect_chain[::-1]  # correct order

    # Google Safe Api
    for url in redirect_chain:
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
                    {"url": url}
                ]
            }
        }

        res = requests.post(endpoint, json=payload)
        data = res.json()

        if "matches" in data:
        # 🚨 Malicious
            for match in data["matches"]:
                google_result.append({
                    "url": match["threat"]["url"],
                    "threatType": match["threatType"],
                    "status": "MALICIOUS"
                })

    if len(redirect_chain) > 0:
        conc = "The page is redirecting user"
        tag.append(f"Number of Redirects : {len(redirect_chain)}")
    else:
        conc = "No suspicious redirects found!"
        tag.append("Safe")

    if len(redirect_chain) > 1:
        tag.append("Multiple redirects")

    if len(redirect_chain) <= 1:
        score = 0
    elif len(redirect_chain) <= 3:
        score = 0.3
    else:
        score = 0.6

    if len(google_result) > 0:
        score = 1
        tag.append("Malicious Records Detected")

    return {
        "redirect_chain": redirect_chain,
        "google_result":google_result,
        "tags": tag,
        "redirect_len": conc,
        "score": score,
    }