import BasePage from '../BasePage.js';

/**
 * Very simple cart page for DemoBlaze
 */
class SimpleCartPage extends BasePage {
    /**
     * @param {import('@playwright/test').Page} page - Playwright page object
     */
    constructor(page) {
        super(page);

        // This selector uses the :nth-child pseudo-selector
        // It finds the second cell in each row of the table body
        // This is where product names appear in the DemoBlaze cart

        // This selector targets the second cell in each row of the table body within the cart.
        // The '#tbodyid' part refers to the table body element with the ID 'tbodyid'.
        // The 'td:nth-child(2)' part specifies that we want the second 'td' (table data) element in each row.
        // This is where the names of the products in the DemoBlaze cart are displayed.
        this.productNames = '#tbodyid td:nth-child(2)'; // Pretend productNames = sony
        // #tbodyid - is the first part
        // td:nth-child(2) - is the second part
    }

    /**
     * Check if a specific product is in the cart
     * @param {string} productName - Name of product to check for
     * @returns {Promise<boolean>} True if product is in cart
     * Boolean means this returns true or false
     */
    async hasProduct(productName) {
        // Get all product names in cart
        const products = await this.page.locator(this.productNames).all();
        console.log(`Found ${products.length} products in cart`);

        for (const product of products) {
            // textContent() gets the text inside the element
            const text = await product.textContent();

            //If the text matches the product name we're looking for
            // == ===
            if (text === productName) {

                console.log(`Found product in cart: ${productName}`);

                //Let's define the return statement
                //return is used to return a value from a function
                //In this case, we're returning the product name  
                return true;
            }
        }

        console.log(`Product not found in cart: ${productName}`);
        return false;


    }
}

export default SimpleCartPage;