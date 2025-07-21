/**
 * Page object for Takealot home page
 */
import BasePage from "./BasePage";

class TakealotHomePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);
    // Selectors for elements on the Takealot home page
    this.cookieBanner = '#onetrust-banner-sdk';
    this.acceptCookiesButton = '#onetrust-accept-btn-handler';
    this.searchInput = 'input[aria-label="Search"]';
    this.categoryMenu = '[data-testid="categories-menu"]';
  }

  /**
   * Navigate to the Takealot home page
   */
  async goToHomePage() {
    await this.navigate('/');
  }

  /**
   * Accept cookies if the banner is present
   */
  async acceptCookiesIfPresent() {
    if (await this.isVisible(this.cookieBanner)) {
      await this.page.click(this.acceptCookiesButton);
      // wait for banner to disappear
      await this.wait(500);
    }
  }

  /**
   * Search for a given term using the search input
   * @param {string} term
   */
  async searchFor(term) {
    await this.page.fill(this.searchInput, term);
    await this.page.press(this.searchInput, 'Enter');
  }

  /**
   * Open a category from the category menu by visible name
   * @param {string} categoryName
   */
  async openCategory(categoryName) {
    // Open the category dropdown/menu if necessary
    if (!(await this.isVisible(`${this.categoryMenu} >> text="${categoryName}"`))) {
      await this.page.click(this.categoryMenu);
    }
    await this.page.click(`${this.categoryMenu} >> text="${categoryName}"`);
  }
}

export default TakealotHomePage;
