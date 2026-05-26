# 🕵️ Website Activity Analyzer & Phishing TEXT/VOICE Detector

**Secure360** 🌍 is an AI-driven security platform that detects phishing messages, malicious web activity, and AI-generated voice scams in real time.

<img width="1902" height="856" alt="image" src="https://github.com/user-attachments/assets/c68670c8-1f8a-460b-abf2-ae237627e2c2" />

With real-time analysis capabilities, the project demonstrates how artificial intelligence can be leveraged to improve online security, reduce phishing risks, and enhance user awareness in an increasingly AI-driven digital world.

## 🔍 Project Structure 
```bash
Website_Behaviour_Risk_Analyzer/
│
├── Backend-Scanner/         # Backend APIs and Scanning Engine
├── Frontend-Scanner/        # Scanner Frontend Dashboard
├── website/main_app         # Landing Webiste to Access Features
├── chrome-extension         # Chrome Extension Codes
└── README.md
```

## 🚀 Features
### 🌐 Website Behaviour Monitoring
- Track website activity in real time
- Analyze request flows and user interactions
- Detect unusual browsing or behavioural patterns

### 🛡️ Risk & Suspicious Activity Detection
- Identify potentially risky website actions
- Monitor abnormal request spikes and traffic behaviour
- Detect suspicious network activities and anomalies
  
### 📊 Analytics & Insights
- Behaviour analysis dashboards
- Structured activity logs
- Risk-based event visualization

### 🔨 Chrome Extension
- Extension supports Chromium-based browsers
- Reduces the friction to just "**Right Click To Scan**"
- Enables quick behavioural scans in real time without changing tabs

## Previews 
<img width="812" height="296" alt="image" src="https://github.com/user-attachments/assets/0cb1a9bc-fc4f-432e-a5f3-6ea39f0c949d" />
<img width="1912" height="900" alt="image" src="https://github.com/user-attachments/assets/c432d2cb-1c66-4949-8023-dcdcb89638bb" />
<img width="1899" height="898" alt="image" src="https://github.com/user-attachments/assets/661b9b22-06db-4dd1-9c59-580615dc9c75" />
<img width="1132" height="833" alt="image" src="https://github.com/user-attachments/assets/45b662fb-176c-48ba-b632-07262e559db9" />

# 🚀 Getting Started & Quick Set-ups

### ⚙️ Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/abhinavpingle06/Website_Behaviour_Risk_Analyzer.git
cd Website_Behaviour_Risk_Analyzer
```

2. **Install dependencies**
```bash
# RUN ON CMD TERMINAL 
cd Website/main
npm install

cd Frontend-Scanner
npm install

cd Backend-Scanner
python -m venv venv
pip install -r requirements.txt
python playwright chromium
```

3. **Setup environment variables**

Create a `.env` file in the root directory:
```env
GOOGLE_API_KEY = YOUR_API_KEY
```

4. **Run the development server**
```bash
# RUN MAIN WEBSITE
cd Website/main
npm run dev

# RUN SCANNER FRONTEND
cd Frontend-Scanner
npm run dev

# RUN SCANNER BACKEND
cd BAckend-Scanner
uvicorn main:app
```

## Tech Stack
### Frontend
```
React.js
NEXT.js/VITE
Tailwind
```
### Backend
```
Python
FastAPI
REST APIs
```
### Machine Learning
```
Scikit-learn
StandardScaler
Logistic Regression
TfidfVectorizer
```

## 🤝 Contributing

Contributions are welcome! 🚀  

1. Fork the repository
2. Clone the repo in your local machine
   ```bash
   git clone
   https://github.com/your-username/Website_Behaviour_Risk_Analyzer.git
   ```
4. Create a new branch  
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. Make your changes  
6. Commit your changes  
   ```bash
   git commit -m "Add your message"
   ```
7. Push to your branch  
   ```bash
   git push origin feature/your-feature-name
   ```
8. Open a Pull Request 

Please ensure your **Pull Requests (PRs)** and **Issues** follow a clean, detailed approach, adhere to good coding practices, and are properly tested.

***Happy Coding 🌿***

