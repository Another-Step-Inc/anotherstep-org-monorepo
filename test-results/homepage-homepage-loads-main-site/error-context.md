# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps/main-site/tests/homepage.spec.ts >> homepage loads
- Location: apps/main-site/tests/homepage.spec.ts:3:1

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /.+/
Received string:  ""
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    12 × locator resolved to <html>…</html>
       - unexpected value ""

```

```yaml
- text: Upgrade Required
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 | 
  3 | test('homepage loads', async ({page}) => {
  4 |     await page.goto('/');
  5 | 
> 6 |     await expect(page).toHaveTitle(/.+/);
    |                        ^ Error: expect(page).toHaveTitle(expected) failed
  7 | });
```