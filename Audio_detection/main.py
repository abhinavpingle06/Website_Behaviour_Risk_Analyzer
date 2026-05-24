import os
import base64
import io
import joblib
import librosa
import numpy as np
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File

# =========================
# App Initialization
# =========================
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# API Key (use env var in production)
# =========================
API_KEY = os.getenv("API_KEY", "test_key_123")
@app.get("/")
def health():
    return {"status": "Abhik"}

_model = None

def get_model():
    global _model
    if _model is None:
        _model = joblib.load("voice_model.pkl")
    return _model

# =========================
# Feature Extraction
# =========================
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

# =========================
# Rule-Based Detection (Fallback)
# =========================
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

# =========================
# ML Detection
# =========================
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

# =========================
# Final Decision Logic
# =========================
def final_decision(features):
    prob_ai = ml_detection(features)
    print("ML prob_ai:", prob_ai)   # 👈 ADD THIS

    if prob_ai is not None:
        if prob_ai >= 0.4:
            return "AI_GENERATED", round(prob_ai, 2), "ML model detected synthetic voice patterns"
        else:
            return "HUMAN", round(1 - prob_ai, 2), "ML model detected natural human speech patterns"

    return rule_based_detection(features)


# =========================
# API Endpoint
# =========================
@app.post("/api/voice-detection")
async def voice_detection(file: UploadFile = File(...), x_api_key: str = Header(None)):
    # API key validation
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    try:
        # Decode Base64 audio
        audio_bytes = await file.read()
        # audio, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000, mono=True)

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
