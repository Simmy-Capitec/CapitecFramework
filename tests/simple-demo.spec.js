//Import the test and expect functions from the testFixtures file
//This is a fixture that contains the test and expect functions
import { test, expect } from '../src/fixtures/testFixtures';

//This is a test function that will be used to test the simple shopping flow with DemoBlaze
test('simple shopping flow with DemoBlaze', async ({ homePage, productPage, cartPage, page }) => {

    // Step 1: Go to the DemoBlaze home page
    await homePage.goToHomePage();

    //Step 2: Click on Laptops Category
    await homePage.clickLaptopsCategory();
    await page.waitForTimeout(2000);




    //Step 3: Click on a specific laptop
    const laptopToTest = 'Sony vaio i5';
    await homePage.clickProduct(laptopToTest);



    //Step 4: Verify we're on the right product page
    //We get the product title text from the page
    const title = await productPage.getProductTitle();

    //Our first check - make sure we're looking at the right product
    // expect() is a Playwright assertion function
    // .toContain() checks if the title includes our product name
    expect(title).toContain(laptopToTest);

    //Step 5: Add to the cart
    await productPage.addToCart();
    await page.screenshot({ path: 'AddToCart.png' });


    //Step 6: Go to cart
    await homePage.goToCart();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'cartScreenshot.png' });

    //Step 7: Verify product is in cart
    //We check if our product is in the cart
    const isInCart = await cartPage.hasProduct(laptopToTest);

    //Our FINAL CHECK! - make sure the product was added to the cart
    // .toBeTruthy() checks if the value is true
    expect(isInCart).toBeTruthy();

});