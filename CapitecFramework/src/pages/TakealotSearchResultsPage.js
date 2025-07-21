/**
 * Page object for Takealot search results or category page interactions
 */
import BasePage from "./BasePage";

class TakealotSearchResultsPage extends BasePage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        super(page);
        // Selector for individual result items
        this.resultItemsSelector = '.search-result-item';
        // A function to build a filter option button selector by its visible text
        this.filterOptionButton = (optionName) => `button:has-text("${optionName}")`;
    }

    /**
     * Get the number of results displayed on the page
     * @returns {Promise<number>}
     */
    async getResultCount() {
        return await this.page.locator(this.resultItemsSelector).count();
    }

    /**
     * Click on a result item by its zero-based index
     * @param {number} index
     */
    async clickResultByIndex(index) {
        await this.page.locator(this.resultItemsSelector).nth(index).click();
    }

    /**
     * Apply a filter by clicking on the specified filter option
     * @param {string} optionName - The visible name of the filter option
     */
    async filterByFilterOption(optionName) {
        const selector = this.filterOptionButton(optionName);
        await this.page.click(selector);
    }
}

export default TakealotSearchResultsPage;
