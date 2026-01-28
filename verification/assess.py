
import time
from playwright.sync_api import sync_playwright

def assess_maru():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Capture console messages
        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"{msg.type}: {msg.text}"))

        # Capture page errors
        page_errors = []
        page.on("pageerror", lambda exc: page_errors.append(str(exc)))

        print("Navigating to Maru...")
        try:
            page.goto("http://localhost:8080", timeout=10000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            browser.close()
            return

        print("Waiting for Unveiling...")
        # Check if unveiling is present
        unveiling = page.locator("#unveiling")
        if unveiling.is_visible():
            print("Unveiling found. Clicking to enter...")
            # Take screenshot of unveiling
            page.screenshot(path="verification/1_unveiling.png")
            unveiling.click()
            time.sleep(2) # Wait for animation
        else:
            print("Unveiling not visible initially.")

        # Check for main canvas visibility
        maru_canvas = page.locator("#maru-canvas")
        if maru_canvas.is_visible():
            print("Main canvas is visible.")
            page.screenshot(path="verification/2_main_canvas.png")
        else:
            print("Main canvas NOT visible.")

        # Check chapters
        chapters = page.locator(".chapter")
        count = chapters.count()
        print(f"Found {count} chapters.")

        # Accessibility check (manual logic via script)
        # Check for alt text on images (bg-image uses CSS, so no alt text - A11y issue)
        # Check buttons
        buttons = page.locator("button")
        for i in range(buttons.count()):
            btn = buttons.nth(i)
            aria_label = btn.get_attribute("aria-label")
            text = btn.inner_text()
            print(f"Button {i}: Text='{text}', Aria-Label='{aria_label}'")

        # Check contrast (approximated visually via screenshot, but we can check computed styles)
        chapter_title = page.locator(".chapter-title").first
        color = chapter_title.evaluate("el => getComputedStyle(el).color")
        print(f"Chapter Title Color: {color}")

        # Scroll interaction
        print("Attempting to scroll...")
        page.mouse.wheel(0, 1000)
        time.sleep(2)
        page.screenshot(path="verification/3_scrolled.png")

        # Check if we moved to next chapter
        # We can check the transform of .chapters-container or the active class
        active_chapter = page.locator(".chapter.active")
        active_id = active_chapter.get_attribute("id")
        print(f"Active chapter after scroll: {active_id}")

        # Check for console errors
        print("\n--- Console Logs ---")
        for log in console_logs:
            print(log)

        print("\n--- Page Errors ---")
        for err in page_errors:
            print(err)

        browser.close()

if __name__ == "__main__":
    assess_maru()
