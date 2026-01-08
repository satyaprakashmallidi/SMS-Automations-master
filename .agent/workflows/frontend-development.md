---
description: Develop and test frontend web applications using modern HTML/CSS/JS frameworks with React, Tailwind, and shadcn/ui components. Includes UI testing with Playwright.
---

# Frontend Development Skill

## Overview
Build beautiful, responsive web interfaces with modern frontend technologies. This skill covers component development, styling, testing, and browser automation.

## Technology Stack
- **Core**: HTML5, CSS3, JavaScript/TypeScript
- **Framework**: React, Vue, or vanilla JS
- **Styling**: Tailwind CSS, CSS Modules, or vanilla CSS
- **Components**: shadcn/ui, Radix UI primitives
- **Testing**: Playwright for UI verification
- **Build Tools**: Vite, Next.js, or Create React App

---

## Development Workflow

### Phase 1: Project Setup
1. Initialize project with appropriate scaffolding:
   ```bash
   npx -y create-vite@latest ./ --template react-ts
   # or
   npx -y create-next-app@latest ./ --typescript --tailwind
   ```

2. Install dependencies:
   ```bash
   npm install
   npm install -D playwright @playwright/test
   npx playwright install chromium
   ```

### Phase 2: Component Development
1. Create component in appropriate directory
2. Follow atomic design principles (atoms → molecules → organisms)
3. Implement responsive design (mobile-first approach)
4. Use semantic HTML elements
5. Add proper ARIA labels for accessibility

### Phase 3: Styling Guidelines
```css
/* Design System Tokens */
:root {
  --primary: hsl(222, 47%, 11%);
  --secondary: hsl(217, 19%, 27%);
  --accent: hsl(210, 100%, 50%);
  --background: hsl(0, 0%, 100%);
  --foreground: hsl(222, 47%, 11%);
  --muted: hsl(210, 40%, 96%);
  --border: hsl(214, 32%, 91%);
  --radius: 0.5rem;
}
```

### Phase 4: Testing with Playwright

**Static HTML Testing:**
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('file:///path/to/index.html')
    # Verify elements exist
    assert page.locator('h1').is_visible()
    browser.close()
```

**Dynamic App Testing:**
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')  # CRITICAL for dynamic apps
    page.screenshot(path='screenshot.png', full_page=True)
    browser.close()
```

---

## Best Practices

### Code Quality
- Use TypeScript for type safety
- Follow component composition patterns
- Implement error boundaries
- Lazy load heavy components
- Optimize images and assets

### Performance
- Minimize bundle size
- Use code splitting
- Implement proper caching
- Optimize Core Web Vitals (LCP, FID, CLS)

### Accessibility
- Use semantic HTML elements
- Add proper heading hierarchy
- Include alt text for images
- Ensure keyboard navigation
- Test with screen readers

### Common Pitfalls
❌ **Don't** inspect DOM before waiting for `networkidle` on dynamic apps
✅ **Do** wait for `page.wait_for_load_state('networkidle')` before inspection

❌ **Don't** use inline styles for reusable components
✅ **Do** use CSS classes or styled components

---

## Quick Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Production build
npm run preview       # Preview production build

# Testing
npx playwright test   # Run all tests
npx playwright test --ui  # Interactive test runner
npx playwright codegen    # Record tests
```

## Reference Resources
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Playwright](https://playwright.dev/docs/intro)
