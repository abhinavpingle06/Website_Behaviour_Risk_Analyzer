from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import docker
import json
import uuid
from core.context import scan_url
import asyncio
asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

app = FastAPI()

# Docker client
# docker_client = docker.from_env()

# Request model
class ScanRequest(BaseModel):
    url: str

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