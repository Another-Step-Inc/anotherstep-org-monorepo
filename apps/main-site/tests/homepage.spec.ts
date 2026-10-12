import { test, expect, type Browser, type Page } from '@playwright/test';

test.setTimeout(120000);
test.describe.configure({mode: 'serial'});

let page: Page;

test.beforeAll(async ({browser}: {browser: Browser}) => {
    page = await browser.newPage();
    const response = await page.goto('/', {
        waitUntil: 'domcontentloaded'
    });
}, 120000);

test.afterAll(async () => {
  await page.close();
});
test.describe('homepage', () => {
    test('loads', async () => {
        await expect(page).toHaveTitle(/.+/);
    });

    test('pop up modal displays', async () => {
        await expect(page.locator('#wp-dynamic-promo')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Support Our 2026 Mission' })).toBeVisible();
    });

    test('content loads from query', async () => {
        await page.getByRole('button', { name: 'Maybe Later' }).click();

        await expect(page.locator('section').filter({ hasText: 'Partnering with People to' })).toBeVisible();

        await expect(page.locator('section').filter({ hasText: 'Who We Are The Originator of' })).toBeVisible();
        await expect(page.locator('section').filter({ hasText: 'Our Values "Consistent with' })).toBeVisible();
        await expect(page.locator('section').filter({ hasText: 'Code Of Ethics Maintaining' })).toBeVisible();
        await expect(page.locator('section').filter({ hasText: 'Administrative Records' })).toBeVisible();
        await expect(page.getByRole('contentinfo')).toBeVisible();
    });
});
