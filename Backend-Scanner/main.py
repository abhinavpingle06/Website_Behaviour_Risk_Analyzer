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
from features.text_analyzer.text_fraud_model import analyze_text

load_dotenv()
api_key_google = os.getenv("GOOGLE_API_KEY_REPORT")

app = FastAPI()

genai.configure(api_key=api_key_google)
model = genai.GenerativeModel("gemini-3-flash-preview")
# Docker client
# docker_client = docker.from_env()

# Request model
class ScanRequest(BaseModel):
    url: str

class BotRequest(BaseModel):
    result: dict

class TextRequest(BaseModel):
    content: str

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
def bot(req:BotRequest):
    scan_data = req.result
    prompt = f"""
    You are a cybersecurity assistant.

    Analyze this:
    Website scan result
    {scan_data}

    First start with the introduction on the main url and then talk about what we found and explain how can it be dangerous/cautious.
    Explain the scan in clean markdown format with:
    - Headings
    - Bullet points
    - Short paragraphs
    - Add one line space between each topics/titles/new concept

    Keep it concise and readable.
    """
    response = model.generate_content(prompt,
                                    #   generation_config={
                                    #     "temperature": 0.3,
                                    #     "max_output_tokens": 150, }
                                    )

    return {"reply": response.text}

@app.post("/text")
async def text(request:TextRequest):
    content_data = request.content
    analysis_result = await analyze_text(content_data)
    prompt = f'''You are an expert Phishing content analyst trained to detect whether a piece of text is scammy/phishing.

I've already made an analysis model which provides result of the text with label like reason and category & percentage.
Your task is to carefully analyze the provided text and give a detailed evaluation of why t.

Instructions:
1. Examine writing style, tone, structure, repetition, and predictability.
2. Look for signs of phishing content such as:
3. Also consider human-like traits.
4.Tell and analyse why my analysis model output such results.

Output format:
- Key Indicators: (bullet points explaining why)
- Detailed Feedback: (clear explanation of reasoning)
- Send in Markdown Format so that React react-markdown can be used to make the recive text displayed in readable way

Text to analyze:{content_data}
Analysis Model Result : {analysis_result}
'''
    response = model.generate_content(prompt,
                                      generation_config={
                                        "temperature": 0.2,
                                        }
                                    )
    return {"model_result":analysis_result, "reply":response.text}

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