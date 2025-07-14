// Importing means we're bringing code from another file into this one
// BasePage contains common functionality we want to reuse
import BasePage from "../BasePage.js";

// This will be a very simple homePage for DemoBlaze

// A class is a blueprint for creating objects
// "extends" BasePage means this class inherits all the methods and properties from the BasePage
// This lets us reuse code instead of writing the same things over and over
class SimpleHomePage extends BasePage {
    /**
     * @param {import ('@playwright/test').Page} page -- Playwright page object
     * This special comment tells the editor that 'page' is a Playwright page object
     * It helps with code completion and error checking
     */
    constructor(page) {
        // 'Super' calls the parent class {BasePage} constructor
        // We must call this before using 'this' in the constructor
        super(page);

        // 'this' refers to the current instance of SimpleHomePage
        // We're setting properties on this specific instance

        this.baseUrl = 'https://www.demoblaze.com/';

        // CSS selectors - ways to find elements on the web page
        this.laptopCategory = 'a[onClick="byCat(\'notebook\')"]';
        this.productLinks = '.card-title a';
        this.cartLink = '#cartur';
    }

    /**
     * Go to the website home page
     * Each method should do one specific thing, as the name suggests
     * 
     * 'async' means this function will do something that takes time
     * It allows other code to run while waiting for the browser
     */
    async goToHomePage() {
        // 'await' pauses execution until the navigation() method completes
        // Without await, the code would continue before the page finishes loading
        await this.navigate('/');
    }
}
