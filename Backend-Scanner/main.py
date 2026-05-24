from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import base64
import io
import joblib
import librosa
import numpy as np
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File
import json
import uuid
from core.context import scan_url
import asyncio
asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
from dotenv import load_dotenv

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

_model = None

def get_model():
    global _model
    if _model is None:
        _model = joblib.load("voice_model.pkl")
    return _model

def extract_features(audio, sr):
    features = {}

    # Pitch features
    pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
    pitch_values = pitches[pitches > 0]

    features["pitch_mean"] = float(np.mean(pitch_values)) if len(pitch_values) > 0 else 0.0
    features["pitch_std"] = float(np.std(pitch_values)) if len(pitch_values) > 0 else 0.0

    # MFCCs
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
    mfcc_means = np.mean(mfcc, axis=1)
    for i, val in enumerate(mfcc_means):
        features[f"mfcc_{i+1}"] = float(val)

    # Spectral centroid
    centroid = librosa.feature.spectral_centroid(y=audio, sr=sr)
    features["spectral_centroid_mean"] = float(np.mean(centroid))

    # Energy variation
    rms = librosa.feature.rms(y=audio)
    features["rms_std"] = float(np.std(rms))

    # Zero Crossing Rate
    zcr = librosa.feature.zero_crossing_rate(y=audio)
    features["zcr_mean"] = float(np.mean(zcr))

    return features

# Rule-Based Detection (Fallback)
def rule_based_detection(features):
    score = 0
    reasons = []

    if features["pitch_std"] < 50:
        score += 1
        reasons.append("Unnaturally stable pitch detected")

    if features["spectral_centroid_mean"] > 3000:
        score += 1
        reasons.append("Overly smooth spectral characteristics")

    if features["rms_std"] < 0.01:
        score += 1
        reasons.append("Low energy variation typical of synthetic speech")

    if score >= 2:
        return "AI_GENERATED", 0.65, "; ".join(reasons)

    return "HUMAN", 0.55, "Natural human-like speech dynamics observed"


# ML Detection
def ml_detection(features):
    try:
        model = get_model()
        print("✅ Model loaded successfully")
    except Exception as e:
        print("❌ Model load failed:", e)
        return None

    # FIXED feature order (VERY IMPORTANT)
    feature_order = [
        "pitch_mean", "pitch_std",
        "mfcc_1","mfcc_2","mfcc_3","mfcc_4","mfcc_5",
        "mfcc_6","mfcc_7","mfcc_8","mfcc_9","mfcc_10",
        "mfcc_11","mfcc_12","mfcc_13",
        "spectral_centroid_mean",
        "rms_std",
        "zcr_mean"
    ]

    vector = np.array([features[f] for f in feature_order]).reshape(1, -1)

    print("📊 Feature vector:", vector)

    try:
        prob = model.predict_proba(vector)[0][1]
        print("🔥 Prediction probability:", prob)
        return prob
    except Exception as e:
        print("❌ Prediction failed:", e)
        return None


# Final Decision Logic
def final_decision(features):
    prob_ai = ml_detection(features)
    print("ML prob_ai:", prob_ai)  

    if prob_ai is not None:
        if prob_ai >= 0.4:
            return "AI_GENERATED", prob_ai, "ML model detected synthetic voice patterns"
        else:
            return "HUMAN", 1 - prob_ai , "ML model detected natural human speech patterns"

    return rule_based_detection(features)



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
    analysis_result = analyze_text(content_data)
    prompt = f'''You are an expert Phishing content analyst trained to detect whether a piece of text is scammy/phishing.

I've already made an analysis model which provides result of the text with label like reason and category & percentage.
Your task is to carefully analyze the provided text and give a detailed evaluation of why t.

Instructions:
1. Examine writing style, tone, structure, repetition, and predictability.
2. Look for signs of phishing content.
3. Also consider human-like traits.
4.Tell and analyse why my analysis model output such results.

Output format:
- Analysis Report: ( Include this fields **Model Confidence Score:** , 
**Classification:** ,
**Reason:** these value should be taken from the analysis report )
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
    return {"reply":response.text}


@app.post("/voice-detection")
async def voice_detection(file: UploadFile = File(...)):

    try:
        # Decode Base64 audio
        audio_bytes = await file.read()

        # Load audio (MP3/WAV)
        audio, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000, mono=True)

        if len(audio) < sr:
            raise ValueError("Audio too short")

        # Feature extraction
        features = extract_features(audio, sr)

        # Final decision
        classification, confidence, explanation = final_decision(features)

        return {
            "status": "success",
            # "language": payload.get("language"),
            "classification": classification,
            "confidenceScore": confidence,
            "explanation": explanation
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Audio processing failed: {str(e)}")

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