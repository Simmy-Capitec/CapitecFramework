import { test as base } from '@playwright/test';
import { LoginPage, ProductsPage, CartPage, CheckoutPage } from '../pages/index.js';
import TestDataManager from '../data/TestDataManager.js';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Define the base fixtures
 */
export const test = base.extend({
    /**
     * Login page fixture
     */
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },

    /**
     * Products page fixture
     */
    productsPage: async ({ page }, use) => {
        const productsPage = new ProductsPage(page);
        await use(productsPage);
    },

    /**
     * Cart page fixture
     */
    cartPage: async ({ page }, use) => {
        const cartPage = new CartPage(page);
        await use(cartPage);
    },

    /**
     * Checkout page fixture
     */
    checkoutPage: async ({ page }, use) => {
        const checkoutPage = new CheckoutPage(page);
        await use(checkoutPage);
    },

    /**
     * Test data manager fixture
     */
    testData: async ({ }, use) => {
        const dataFilePath = path.resolve(process.cwd(), 'src/data/testData.json');
        const testDataManager = new TestDataManager(dataFilePath);
        await use(testDataManager);
    },

    /**
     * Authenticated page fixture - automatically logs in with standard user
     */
    authenticatedPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('standard_user', 'secret_sauce');
        await use(page);
    }
});

export { expect } from '@playwright/test'; 