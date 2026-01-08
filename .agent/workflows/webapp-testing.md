---
description: Test web applications using Playwright for UI verification, debugging, and browser automation. Supports both static HTML and dynamic web apps.
license: Based on Anthropic's webapp-testing skill
---

# Web Application Testing

Test local web applications using Playwright for UI verification and debugging.

## Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Start server first, then run Playwright script
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

---

## Quick Start

### Installation
```bash
pip install playwright
playwright install chromium
```

### Basic Test Script
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')  # CRITICAL for dynamic apps
    
    # Take screenshot
    page.screenshot(path='screenshot.png', full_page=True)
    
    # Verify element exists
    assert page.locator('h1').is_visible()
    
    browser.close()
```

---

## Testing Patterns

### Static HTML Testing
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('file:///path/to/index.html')
    
    # Verify content
    heading = page.locator('h1')
    assert heading.text_content() == 'Expected Title'
    
    browser.close()
```

### Dynamic App Testing with Server
```python
import subprocess
import time
from playwright.sync_api import sync_playwright

# Start server
server = subprocess.Popen(['npm', 'run', 'dev'], cwd='./frontend')
time.sleep(5)  # Wait for server to start

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')
        
        # Your test logic here
        page.click('button:has-text("Submit")')
        page.wait_for_selector('.success-message')
        
        browser.close()
finally:
    server.terminate()
```

### Reconnaissance-Then-Action Pattern
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    
    # Step 1: Inspect rendered DOM
    page.screenshot(path='inspect.png', full_page=True)
    content = page.content()
    buttons = page.locator('button').all()
    print(f"Found {len(buttons)} buttons")
    
    # Step 2: Identify selectors from inspection
    for btn in buttons:
        print(f"Button: {btn.text_content()}")
    
    # Step 3: Execute actions with discovered selectors
    page.click('button:has-text("Login")')
    
    browser.close()
```

---

## Common Selectors

```python
# By text content
page.locator('text=Submit')
page.locator('button:has-text("Login")')

# By role
page.get_by_role('button', name='Submit')
page.get_by_role('heading', level=1)

# By test ID
page.get_by_test_id('submit-button')

# By CSS selector
page.locator('.btn-primary')
page.locator('#login-form input[type="email"]')

# By placeholder
page.get_by_placeholder('Enter email')

# By label
page.get_by_label('Email address')
```

---

## Form Interaction

```python
# Fill form
page.fill('input[name="email"]', 'user@example.com')
page.fill('input[name="password"]', 'password123')

# Select dropdown
page.select_option('select#country', 'US')

# Check checkbox
page.check('input[type="checkbox"]')

# Click button
page.click('button[type="submit"]')

# Wait for navigation
page.wait_for_url('**/dashboard')
```

---

## Assertions

```python
from playwright.sync_api import expect

# Visibility
expect(page.locator('h1')).to_be_visible()
expect(page.locator('.error')).to_be_hidden()

# Text content
expect(page.locator('.message')).to_have_text('Success!')
expect(page.locator('.message')).to_contain_text('Success')

# Count
expect(page.locator('.item')).to_have_count(5)

# Attribute
expect(page.locator('input')).to_have_attribute('disabled', '')

# URL
expect(page).to_have_url('**/dashboard')
```

---

## Common Pitfalls

❌ **Don't** inspect the DOM before waiting for `networkidle` on dynamic apps
✅ **Do** wait for `page.wait_for_load_state('networkidle')` before inspection

❌ **Don't** use hard-coded sleeps for waiting
✅ **Do** use `page.wait_for_selector()` or `page.wait_for_load_state()`

❌ **Don't** forget to close the browser
✅ **Do** always call `browser.close()` or use context managers

---

## Best Practices

- Use `sync_playwright()` for synchronous scripts
- Always close the browser when done
- Use descriptive selectors: `text=`, `role=`, CSS, or IDs
- Add appropriate waits: `wait_for_selector()` or `wait_for_load_state()`
- Take screenshots for debugging
- Use headless mode for CI/CD

## Reference
- [Playwright Python Docs](https://playwright.dev/python/docs/intro)
- [Locators Guide](https://playwright.dev/python/docs/locators)
- [Assertions](https://playwright.dev/python/docs/test-assertions)
