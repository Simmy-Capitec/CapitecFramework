/**
 * Page object for Takealot product detail page
 */
import BasePage from "./BasePage";

class TakealotProductPage extends BasePage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        super(page);
        // Selectors for product page elements
        this.productTitleSelector = 'h1.product-title';
        this.productPriceSelector = '.product-price';
        this.addToCartButtonSelector = 'button.add-to-cart';
    }

    /**
     * Get the product title text
     * @returns {Promise<string|null>}
     */
    async getProductTitle() {
        const locator = this.page.locator(this.productTitleSelector);
        return await locator.textContent();
    }

    /**
     * Get the product price text
     * @returns {Promise<string|null>}
     */
    async getProductPrice() {
        const locator = this.page.locator(this.productPriceSelector);
        return await locator.textContent();
    }

    /**
     * Click the add to cart button
     */
    async addToCart() {
        await this.page.locator(this.addToCartButtonSelector).click();
    }
}

export default TakealotProductPage;
