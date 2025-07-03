import { test, expect } from '../src/fixtures/testFixtures';
import productData from '../src/data/testData.json' assert { type: 'json' };

for (const laptop of productData.laptop) {
    test(`Shopping flow with ${laptop.name}`, async ({ homepage, productPage, cartPage, page }) => {
        // Go to the home page
        await homepage.goToHomePage();

        // Navigate to the laptop category
        await homepage.clickLaptopCategory();
        await page.waitForTimeout(2000)

        // Find and click the product based on the laptop name
        const productLink = await productPage.getProductLink(laptop.name);
        await productLink.click();

        // Add the product to the cart
        await productPage.addToCart(); // Assuming a method to add the product to the cart

        // Go to the cart page
        await homepage.goToCartPage();

        // Verify the product is in the cart
        const cartProduct = await cartPage.getProductInCart(laptop.name); // Assuming a method to get the product in the cart
        expect(cartProduct).toBeDefined();
        expect(cartProduct.name).toBe(laptop.name);

        // Verify cart total (assuming you want to check the total)
        const cartTotal = await cartPage.getCartTotal(); // Assuming a method for cart total
        expect(cartTotal).toBe(laptop.price); // Assuming the laptop's price is the expected total
    });
}
