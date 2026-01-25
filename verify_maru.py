
from playwright.sync_api import Page, expect, sync_playwright
import time
import re

def test_maru_experience(page: Page):
    # 1. Arrange: Go to the local page.
    page.goto("http://localhost:8080/index.html")

    # 2. Act: Wait for the unveiling to finish.
    print("Waiting for unveiling to finish...")
    time.sleep(7)

    # Wait for the canvas to be visible
    # We use regex to match if 'visible' is part of the class list
    expect(page.locator("#maru-canvas")).to_have_class(re.compile(r"visible"), timeout=10000)

    # 3. Assert: Check for new elements
    # Check atmosphere canvas
    expect(page.locator("#dust-canvas")).to_be_visible()

    # Check text splitting (spans inside title)
    jaipur_title = page.locator(".chapter-title").first
    expect(jaipur_title).to_contain_text("Jaipur")
    # Verify it has spans
    expect(jaipur_title.locator("span").first).to_be_visible()

    # Wait a bit for GSAP animations to settle (text reveal)
    time.sleep(2)

    # 4. Screenshot
    page.screenshot(path="/home/jules/verification/maru_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})
        try:
            test_maru_experience(page)
        finally:
            browser.close()
