from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

import docker
import json
import uuid
from core.context import scan_url
import asyncio
asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
from dotenv import load_dotenv
import os

load_dotenv()
api_key_google = os.getenv("GOOGLE_API_KEY")

app = FastAPI()

genai.configure(api_key=api_key_google)
model = genai.GenerativeModel("gemini-3-flash-preview")
# Docker client
# docker_client = docker.from_env()

# Request model
class ScanRequest(BaseModel):
    url: str

class BotRequest(BaseModel):
    ''''''

# CORS (React frontend support)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/bot")
def bot(req:Request):
    body = req.json()
    # scan_data = body.get("result")
    scan_data = {
  "result": {
    "redirects": {
      "redirect_chain": [
        "https://ai.google.dev/gemini-api/docs"
      ],
      "google_result": [],
      "tags": [
        "Number of Redirects : 1"
      ],
      "redirect_len": "The page is redirecting user",
      "score": 0
    },
    "content": {
      "risk": 0.45966749597679296,
      "category": [
        "Authority Impersonation"
      ],
      "reason": [
        "Impersonates authority or official entity"
      ]
    },
    "network": {
      "post_requests": 5,
      "post_url": [
        "https://ai.google.dev/_d/profile/ogb",
        "https://ai.google.dev/_d/profile/user",
        "https://www.google-analytics.com/g/collect?v=2&tid=G-64EQFFKSHW&gtm=45je64e1h1v9185711061z89183356566za20gzb9183356566zd9183356566&_p=1776350114129&gcs=G111&gcd=13r3r3r3r5l1&npa=0&dma=0&are=1&cid=1248369223.1776350115&frm=0&pscdl=noapi&rcb=8&sr=1280x720&uaa=x86&uab=64&uafvl=Not%253AA-Brand%3B99.0.0.0%7CHeadlessChrome%3B145.0.7632.6%7CChromium%3B145.0.7632.6&uam=&uamb=0&uap=Windows&uapv=19.0.0&uaw=0&ul=en-gb&_s=1&tag_exp=0~115938465~115938468~116363098~117266400~117971173&dl=https%3A%2F%2Fai.google.dev%2Fgemini-api%2Fdocs&dt=Gemini%20API%20%C2%A0%7C%C2%A0%20Google%20AI%20for%20Developers&sid=1776350114&sct=1&seg=0&en=page_view&_fv=2&_nsi=1&_ss=1&ep.allowLinker=true&ep.anonymizeIp=true&ep.location=https%3A%2F%2F&ep.alwaysSendReferrer=true&ep.legacyHistoryImport=false&ep.storage=false&ep.experimentIds=&ep.langMachineTranslated=False&ep.langRequested=en&ep.langServed=en&ep.tenant=googledevai&ep.contentType=article&ep.inPreferredLanguage=True&ep.recommendationExperiment=&epn.recommendationSourceDescriptionWords=0&epn.recommendationSourceIdentDescriptions=0&ep.recommendationSourcePage=&epn.recommendationSourceRank=0&epn.recommendationSourceTitleWords=0&epn.recommendationSourceType=0&up.internalUser=False&up.signedIn=False&tfd=7729",
        "https://analytics.google.com/g/collect?v=2&tid=G-P1DBVKWT6V&gtm=45je64f0h2v9168640211z89168640146za20gzb9168640146zd9168640146&_p=1776350114130&_gaz=1&gcs=G111&gcd=13r3r3r3r5l1&npa=0&dma=0&ecid=1410461436&_eu=EAAAAGA&_ng=1&are=1&cid=1248369223.1776350115&frm=0&ir=1&pscdl=noapi&rcb=5&sr=1280x720&uaa=x86&uab=64&uafvl=Not%253AA-Brand%3B99.0.0.0%7CHeadlessChrome%3B145.0.7632.6%7CChromium%3B145.0.7632.6&uam=&uamb=0&uap=Windows&uapv=19.0.0&uaw=0&ul=en-gb&gaf=2&_s=1&tag_exp=0~115616985~115938465~115938468~116363098~117266400~117971173&dl=https%3A%2F%2Fai.google.dev%2Fgemini-api%2Fdocs%2F&sid=1776350114&sct=1&seg=0&dt=Gemini%20API%20%C2%A0%7C%C2%A0%20Google%20AI%20for%20Developers&en=page_view&_fv=1&_ss=1&ep.page_locale=default&ep.is_eea=false&ep.ads_storage=true&ep.analytics_storage=true&ep.internal_user=False&ep.signed_in=False&ep.percent_scrolled=0&ep.scroll_increment=0&ep.scroll_instance=1&tfd=7794",
        "https://stats.g.doubleclick.net/g/collect?v=2&_ng=1&tid=G-P1DBVKWT6V&cid=1248369223.1776350115&gtm=45je64f0h2v9168640211z89168640146za20gzb9168640146zd9168640146&rcb=5&aip=1&dma=0&gcs=G111&gcd=13r3r3r3r5l1&npa=0&frm=0&tag_exp=0~115616985~115938465~115938468~116363098~117266400~117971173"
      ],
      "external_requests": [],
      "external_count": 0,
      "ip_requests": [],
      "ip_count": 0,
      "score": 0
    },
    "cookies": {
      "Cookie_Stealing": [],
      "length": 0,
      "score": 0
    },
    "url": "https://ai.google.dev/gemini-api/docs"
    }
    }
    prompt = f"""
    You are a cybersecurity assistant.

    Analyze this:
    Website scan result
    {scan_data}

    First start with the introduction on the main url and then talk about what we found and explain how can it be dangerous/cautious.
    """
    response = model.generate_content(prompt)

    return {"reply": response.text}

@app.post("/scan")
async def scan(request: ScanRequest):

    # scan_id = str(uuid.uuid4())

    try:
        # print(type(request))
        result = await scan_url(request.url)
        # 🚀 Start container in detached mode
        # container = docker_client.containers.run(
        #     image="malicious-scanner",
        #     command=f"python run_scan.py {request.url}",
        #     detach=True,
        #     remove=False  # manual cleanup after logs
        # )

        # ⏳ Wait until scan finishes
        # container.wait()

        # 📜 Collect logs (scan result)
        # logs = container.logs()

        # Convert bytes → string
        # output = logs.decode("utf-8").strip()

        # if not output:
        #     return {"error": "Container returned empty output"}

        # Parse JSON safely
        # try:
        #     result = json.loads(output)
        # except json.JSONDecodeError:
        #     return {
        #         "error": "Invalid JSON from container",
        #         "raw_output": output
        #     }

        # 🗑️ Remove container manually
        # container.remove()
        # print(result)

        return {
            # "scan_id": scan_id,
            # "status": "completed",
            "result": result
        }

    except Exception as e:
        return {"error": str(e)}