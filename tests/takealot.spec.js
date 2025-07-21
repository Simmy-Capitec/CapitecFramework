import { test, expect } from '@playwright/test';

test('Generated AI Test for https://www.takealot.com/', async ({ page }) => {

     // Test Run Session ID: 5c40a215-0e7a-4b1d-b025-7fef1f2cdf60

     // Target URL: https://www.takealot.com/

     // Overall Result: Success

     await page.goto('https://www.takealot.com/', { waitUntil: 'networkidle', timeout: 60000 });

     // Step 1: Enter "laptop" into the search input field

     // Playwright Locator: page.locator('input[name="search"]')

     const searchInputSelector = 'input[name="search"]';

     const searchInputElements = await page.$$(searchInputSelector);

     expect(searchInputElements.length, `Pre-Action Check Failed (CSS/XPath): Expected 1 element for selector '${searchInputSelector}', but found ${searchInputElements.length}.`).toBe(1);

     const searchInputLocator = page.locator('input[name="search"]');

     await searchInputLocator.fill('laptop');

     await expect(searchInputLocator).toHaveValue('laptop');

     // Step 2: Click the search button

     // Playwright Locator: page.locator('button[type="submit"]')

     const searchButtonSelector = 'button[type="submit"]';

     const searchButtonElements = await page.$$(searchButtonSelector);

     expect(searchButtonElements.length, `Pre-Action Check Failed (CSS/XPath): Expected 1 element for selector '${searchButtonSelector}', but found ${searchButtonElements.length}.`).toBe(1);

     const searchButton = page.locator(searchButtonSelector);

     await searchButton.click();

     // Step 3: Click the first product in the search results

     // Healing Strategy: Use a more reliable selector targeting the "Go to product details" link inside each article

     // (Optional) Dismiss cookie/banner if it's blocking the view

     const dismissBtn = page.locator('button:has-text("Got it")');

     if (await dismissBtn.isVisible({ timeout: 2000 })) {
          await dismissBtn.click();
     }

     const firstProductSelector = 'article a[aria-label="Go to product details"]';

     // Wait for at least one product-detail link to appear

     await page.waitForSelector(firstProductSelector, { timeout: 15000 });

     const productLinks = await page.$$(firstProductSelector);

     expect(productLinks.length, `Pre-Action Check Failed: Expected at least 1 element for selector '${firstProductSelector}', but found ${productLinks.length}.`).toBeGreaterThan(0);

     // Click the first product link
     await page.locator(firstProductSelector).first().click({ timeout: 5000 });

     // Step 4: Click the "Add to Cart" button

     // Alternative CSS/XPath healing: scope to the first product article and then find its Add to Cart button

     const articles = await page.$$('article');

     expect(articles.length, 'Pre-Action Check Failed: No <article> elements found on page.').toBeGreaterThan(0);

     const addToCartButtons = await articles[0].$$('button:has-text("Add to Cart")');

     expect(addToCartButtons.length, `Pre-Action Check Failed: Expected 1 Add to Cart button in first article, but found ${addToCartButtons.length}.`).toBe(1);

     await addToCartButtons[0].click();

});

