from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import re

# ===============================
# TRAINING DATA
# ===============================

fraud_samples = [
    # Credential theft
    "verify your account immediately",
    "confirm your password now",
    "enter your otp to continue",
    "security alert update your login details",
    "your account has been suspended verify now",
    "confirm your debit card details",
    "provide your security code",
    "verify your identity immediately",
    "login attempt detected confirm now",
    "reset your password urgently",

    # Financial scams
    "send money to receive reward",
    "crypto transfer required to unlock funds",
    "payment verification needed urgently",
    "bank transfer required immediately",
    "update your billing information",
    "confirm your credit card number",
    "transaction failed verify payment",
    "wire transfer needed today",
    "invoice overdue pay now",
    "unauthorized transaction detected",

    # Reward scams
    "claim your lottery prize now",
    "you are our lucky winner",
    "congratulations you won a prize",
    "claim your free gift immediately",
    "bonus reward waiting for you",
    "limited time cash reward",
    "exclusive prize offer",
    "win big today claim now",
    "free vacation prize",
    "reward expires today",

    # Urgency pressure
    "urgent action required update now",
    "act fast limited time offer",
    "final notice respond immediately",
    "within 24 hours account blocked",
    "last warning confirm now",
    "immediate response required",
    "time sensitive security alert",
    "urgent verification needed",
    "deadline today update details",
    "critical account issue act now",

    # Authority impersonation
    "official notice from bank support",
    "government department security alert",
    "irs tax refund confirmation",
    "tax department requires action",
    "security team requesting verification",
    "bank support urgent message",
    "legal action will be taken",
    "court notice payment required",
    "police investigation warning",
    "customs clearance payment required"
]

safe_samples = [
    # Daily conversation
    "let's have lunch tomorrow",
    "meeting scheduled for friday",
    "happy birthday have a great day",
    "how are you doing today",
    "see you at the office",
    "thank you for your help",
    "please review the document",
    "call me when available",
    "project deadline extended",
    "family dinner tonight",

    # Work related
    "project report attached",
    "team meeting agenda shared",
    "client feedback received",
    "presentation scheduled next week",
    "budget approval confirmed",
    "design update completed",
    "testing phase started",
    "deployment successful",
    "code review comments added",
    "performance metrics updated",

    # E-commerce normal
    "your order has been shipped",
    "delivery expected tomorrow",
    "tracking number attached",
    "your purchase was successful",
    "refund processed successfully",
    "thank you for shopping with us",
    "cart reminder notification",
    "new product available",
    "discount applied at checkout",
    "invoice attached for your order",

    # Casual
    "see you soon",
    "good morning",
    "have a nice weekend",
    "thank you very much",
    "congratulations on your promotion",
    "let me know your thoughts",
    "can we reschedule the meeting",
    "looking forward to hearing from you",
    "attached is the file",
    "please find the details below"
]


texts = fraud_samples + safe_samples
labels = [1]*len(fraud_samples) + [0]*len(safe_samples)

vectorizer = TfidfVectorizer(ngram_range=(1,2), stop_words='english')
X = vectorizer.fit_transform(texts)

model = LogisticRegression()
model.fit(X, labels)

# ===============================
# FRAUD PATTERN LIBRARIES
# ===============================

CREDENTIAL_TERMS = [
    "password", "otp", "pin", "verify account",
    "login details", "security code", "confirm identity"
]

FINANCIAL_TERMS = [
    "bank", "payment", "transfer", "credit card",
    "debit card", "transaction", "crypto", "wallet",
    "funds", "invoice"
]

URGENCY_TERMS = [
    "urgent", "immediately", "now", "today",
    "within 24 hours", "act fast", "limited time",
    "final notice"
]

REWARD_TERMS = [
    "winner", "lottery", "reward", "prize",
    "bonus", "free gift", "claim now"
]

THREAT_TERMS = [
    "account suspended", "blocked", "legal action",
    "security alert", "unauthorized access",
    "breach detected"
]

AUTHORITY_IMPERSONATION = [
    "bank support", "security team", "official notice",
    "government department", "irs", "tax department"
]

# ===============================
# ANALYSIS FUNCTION
# ===============================

def analyze_text(text):
    text_lower = text.lower()

    vec = vectorizer.transform([text_lower])
    ml_prob = model.predict_proba(vec)[0][1]

    reasons = []
    categories = []

    # credential harvesting detection
    if any(term in text_lower for term in CREDENTIAL_TERMS):
        reasons.append("Requests sensitive credentials")
        categories.append("Credential Theft")

    # financial scam detection
    if any(term in text_lower for term in FINANCIAL_TERMS):
        reasons.append("Requests financial/payment information")
        categories.append("Financial Scam")

    # urgency pressure
    if any(term in text_lower for term in URGENCY_TERMS):
        reasons.append("Creates urgency pressure")
        categories.append("Psychological Pressure")

    # reward lure detection
    if any(term in text_lower for term in REWARD_TERMS):
        reasons.append("Promises reward or prize")
        categories.append("Reward Scam")

    # threat / fear tactics
    if any(term in text_lower for term in THREAT_TERMS):
        reasons.append("Uses threat or fear tactics")
        categories.append("Fear Manipulation")

    # authority impersonation
    if any(term in text_lower for term in AUTHORITY_IMPERSONATION):
        reasons.append("Impersonates authority or official entity")
        categories.append("Authority Impersonation")

    # suspicious links
    if re.search(r'http[s]?://', text_lower):
        reasons.append("Contains external link")
        categories.append("Phishing Link")

    # excessive exclamation
    if text.count("!") >= 3:
        reasons.append("Excessive urgency punctuation")
        categories.append("Pressure Tactics")

    if not reasons:
        reasons.append("No fraud indicators detected")
        categories.append("Safe")

    return ml_prob, reasons, list(set(categories))