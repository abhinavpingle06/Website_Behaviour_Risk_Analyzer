from .text_fraud_model import analyze_text

async def content_analyzer(page):

    result = {
        "risk": 0,
        "category": [],
        "reason": []
    }

    page_text = await page.evaluate("() => document.body.innerText")
    risk, reasons, categories = analyze_text(page_text)

    result["category"] = categories
    result["reason"] = reasons
    result["risk"] = risk

    return result