# Here we will monitor cookies stealing
# Assigned - Dhanasri
from urllib.parse import urlparse
def monitor_cookies(page):
        
        result = {
             "Cookie_Stealing":[],
             "length":0,
             "score":0
        }
        # 🔴 Monitor when cookies are sent in network requests
        def handle_request(req):
            headers = req.headers
            if "cookie" in headers:
            # Only flag if request is going to different origin
                request_origin = urlparse(req.url).netloc
                page_origin = urlparse(page.url).netloc if page.url else ""

                if not page_origin:
                    return
                
                if request_origin and request_origin != page_origin:
                    result["Cookie_Stealing"].append({
                        "url": req.url,
                        "cookie_data": headers["cookie"]
                })
                    result["length"] += 1

        page.on("request", handle_request)

        # # ⚠️ Detect JavaScript trying to read cookies
        # page.add_init_script("""
        #     const originalCookie = document.__lookupGetter__('cookie');
        #     Object.defineProperty(document, 'cookie', {
        #         get: function() {
        #             console.log("⚠️ JavaScript tried to read cookies");
        #             return originalCookie.call(document);
        #         }
        #     });
        # """)
        if result["length"] >10:
            result["score"] = 100
        elif result["length"] >5:
            result["score"] = 60
        elif result["length"] >2:
            result["score"] = 30
        elif result["length"] >= 1:
            result["score"] = 10
        
            
        return result
