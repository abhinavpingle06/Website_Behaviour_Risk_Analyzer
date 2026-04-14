# Create isolated context
# Assigned - Abhinav

from .browser import launch_browser
from features.redirect_detector import detect_redirects
from features.network_monitor import monitor_network
# from scanner.features.form_detector import detect_forms
from features.cookie_monitor import monitor_cookies
from features.text_analyzer.text_test import content_analyzer

async def scan_url(url: str):
    # Launching the browser
    p, browser, context, page = await launch_browser()
    #  Storing the results
    results = {}

    try:
        # Setting Listners
        network_data = monitor_network(page)
        cookies_data = monitor_cookies(page)

        async def handle_route(route, request):
            if request.resource_type in ["image", "media", "font"]:
                await route.abort()
            else:
                await route.continue_()

        await page.route("**/*", handle_route)

        response = await page.goto(
            url,
            wait_until="domcontentloaded",
            timeout=10000
        )

        # Run feature 
        results["redirects"] =await detect_redirects(response, url)
        results["content"] = await content_analyzer(page)
        results["network"] = network_data
        # results["forms"] = await detect_forms(page, url)
        results["cookies"] = cookies_data
        
    except Exception as e:
        results["error"] = str(e)

    finally:
        try:
            await page.unroute("**/*")
        except:
            pass
        await context.close()
        await browser.close()
        await p.stop()

    results["url"] = url
    print(results)
    return results
