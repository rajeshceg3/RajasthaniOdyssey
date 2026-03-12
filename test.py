import os
from playwright.sync_api import sync_playwright

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        file_path = f"file://{os.path.abspath('index.html')}"
        print(f"Loading {file_path}...")
        page.goto(file_path)

        print("Waiting for uncovering effect...")
        page.wait_for_selector('#unveiling', state='visible')

        # Click the unveiling to enter
        unveiling = page.locator('#unveiling')
        unveiling.click()

        print("Waiting for main canvas...")
        page.wait_for_selector('#maru-canvas.visible')

        # Verify Chapters are present
        chapters = page.locator('.chapter').all()
        print(f"Found {len(chapters)} chapters.")
        assert len(chapters) == 6, f"Expected 6 chapters, found {len(chapters)}"

        # Simulate Mouse Move
        print("Simulating mouse movements...")
        page.mouse.move(100, 100)
        page.mouse.move(500, 500)

        # Check an active chapter exists
        active_chapters = page.locator('.chapter.active').all()
        assert len(active_chapters) == 1, f"Expected 1 active chapter, found {len(active_chapters)}"

        # Simulate Wheel Scroll
        print("Simulating scroll...")
        page.mouse.wheel(0, 500)

        # Wait a bit for scroll animation
        page.wait_for_timeout(2000)

        # Check new active chapter
        new_active = page.locator('.chapter.active')
        new_active_id = new_active.get_attribute('id')
        print(f"Active chapter after scroll: {new_active_id}")
        assert new_active_id != 'chapter-jaipur', "Chapter did not change after scroll"

        print("All tests passed!")
        browser.close()

if __name__ == '__main__':
    run_test()
