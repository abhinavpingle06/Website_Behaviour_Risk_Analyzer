from urllib.parse import urlparse
import re

def monitor_network(page):
    original_domain = urlparse(page.url).netloc
    result = {
        "post_requests": 0,
        "post_url":[],
        "external_requests": [],
        "external_count":0,
        "ip_requests": [],
        "ip_count":0,
        "score":0,
        
    }

    def is_ip(domain):
        return re.match(r"^\d+\.\d+\.\d+\.\d+$", domain)

    def handle_request(req):
        method = req.method # post put del
        request_url = req.url
        domain = urlparse(request_url).netloc

        if method == "POST":
            result["post_requests"] += 1
            result["post_url"].append(request_url)

        if is_ip(domain):
            result["ip_requests"].append(request_url)
            result["ip_count"] += 1

        # if domain != original_domain:
        #     result["external_requests"].append(request_url)

    page.on("request", handle_request)
    
    def finalize():
        score = 0
        if result["post_requests"] < 1:
            score += 0
        elif result["post_requests"] <= 3:
            score += 30
        else: 
            score += 50

        if len(result["ip_requests"]) >= 1:
            score += 50
    # ext_count = len(result["external_requests"])
    # if ext_count >= 10:
    #     score += 30
    # elif ext_count >= 5:
    #     score += 20
    # else:
    #     score += 10     
        result["score"] = score
        return result
    
    return result, finalize