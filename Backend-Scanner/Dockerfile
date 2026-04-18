FROM python:3.10-slim

WORKDIR /app

# Install required base tools
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

# THIS IS IMPORTANT 🔥
RUN playwright install --with-deps chromium

CMD ["python", "run_scan.py"]