# We will make the browser
# Assigned - Abhinav
from playwright.async_api import async_playwright

async def launch_browser():
    p = await async_playwright().start()
    browser = await p.chromium.launch(headless=True)
    context = await browser.new_context()
    page = await context.new_page()
    return p, browser, context, page

