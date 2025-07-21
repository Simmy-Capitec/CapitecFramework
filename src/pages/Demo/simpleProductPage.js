//Importing means we're bringing code from another file into this one
//BasePage contains common functionality we want to reuse
import BasePage from "../BasePage.js";

//This will be a very simple homePage for DemoBlaze


//What is a class? A class is a blueprint for creating objects
// "extends" BasePage means this class inhereits all the methods and properties from the BasePage
//This lets us reuse code instead of writing the same things over and over
class SimpleProductPage extends BasePage {


    /** 
        @param {import ('@playwright/test').Page} page -- Playwright page object
    This special comment tells the editor that 'page' is a Playwright page object
    It helps with code completion and error checking
        */

    //The constructor is a special method that runs when we create a new instance of this class
    //It's like the initialization procedure
    constructor(page) {
        //'Super' calls the parent class {BasePage} constructor
        //We must call this before using 'this' in the constructor
        super(page);

        // 'this' refers to the current instance of SimpleProductPage
        // We're setting properties on this specific instance



        //I will follow this up with CSS selectors - ways to find elements on the web page
        //They're like adresses that tell the browser which elements to interact with

        //We're going to primarily be dealing with two locators

        //Locator #1
        this.productTitle = '.name';

        //Locator #2
        this.addToCartButton = '.btn-success';

    }


    /**
     * Get the title of the product
     * @returns {Promise<string>} The Product Title
     * The @returns tag explains what the method returns and it's type
     * Promise<string> means it will eventually return a string after the async operations completes
     *
     */
    async getProductTitle() {
        // textContent() gets the text inside the element
        const title = await this.page.locator(this.productTitle).textContent();
        console.log(`Got product title ${title}`);

        return title;
    }

    //Add the current product to cart
    async addToCart() {
        await this.page.click(this.addToCartButton);
        console.log('Clicked Add to Cart Button');

        //DemoBlaze shows a Javascript alert when adding to the cart
        //We need to handle this alert or the test will get stuck

        try {
            //once() sets up a one-time event handler
            //When a dialog (alert) appears, this function will run
            this.page.once('dialog', dialog => {
                console.log(`Accepting alert: ${dialog.message()}`);
                dialog.accept();
            });

            await this.page.waitForTimeout(1000);
        }
        catch (error) {
            // try/catch is error handling - if something goes wrong above,
            // execution jumps to this catch block
            console.log('Alert may have been handled already');
        }
    }
}

export default SimpleProductPage;