import { test, expect } from '../src/fixtures/testFixtures.js';
import { TakealotHomePage } from '../src/pages/TakealotHomePage.js';
import { TakealotSearchResultsPage } from '../src/pages/TakealotSearchResultsPage.js';
import { TakealotProductPage } from '../src/pages/TakealotProductPage.js';

test('takealot navigation flow', async ({ page }) => {
  // Instantiate page objects
  const homePage = new TakealotHomePage(page);
  const searchResultsPage = new TakealotSearchResultsPage(page);
  const productPage = new TakealotProductPage(page);

  // Define search term
  const searchTerm = 'laptop';

  // Navigate to Takealot home and accept cookies
  await homePage.goto();
  await homePage.acceptCookies();

  // Perform search
  await homePage.search(searchTerm);

  // Verify that we have results
  const resultsCount = await searchResultsPage.getResultsCount();
  await expect(resultsCount).toBeGreaterThan(0);

  // Click the first result
  await searchResultsPage.clickFirstResult();

  // Verify that the product title contains the search term
  const productTitle = await productPage.getProductTitle();
  await expect(productTitle.toLowerCase()).toContain(searchTerm.toLowerCase());
});
