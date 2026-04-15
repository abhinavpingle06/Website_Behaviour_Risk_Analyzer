import base64
import requests

# Load your audio file
with open("ai_voice3.wav", "rb") as f:
    audio_base64 = base64.b64encode(f.read()).decode("utf-8")

# API URL
url = "http://localhost:7860/api/voice-detection"

# Headers (IMPORTANT)
headers = {
    "x-api-key": "test_key_123",
    "Content-Type": "application/json"
}

# Data
data = {
    "audioBase64": audio_base64,
    "language": "en"
}

# Send request
response = requests.post(url, json=data, headers=headers)

print(response.json())