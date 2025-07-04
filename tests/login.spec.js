import { test, expect } from '../src/fixtures/testFixtures.js';


test.describe('Login Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the base URL
        await page.goto('/');
    });

    test('should login with valid credentials', async ({ loginPage, productsPage, testData }) => {
        // Get test data
        const { username, password } = testData.getTestData('loginTests').validUser;

        // Login
        await loginPage.login(username, password);

        // Verify successful login
        const isOnProductsPage = await productsPage.isOnProductsPage();
        expect(isOnProductsPage).toBeTruthy();
    });

    test('should show error with invalid credentials', async ({ loginPage, testData }) => {
        // Get test data
        const { username, password } = testData.getTestData('loginTests').invalidUser;

        // Attempt login with invalid credentials
        await loginPage.login(username, password);

        // Verify error message
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain('Username and password do not match any user');
    });

    test('should show error for locked out user', async ({ loginPage, testData }) => {
        // Get test data
        const { username, password } = testData.getTestData('loginTests').lockedOutUser;

        // Attempt login with locked out user
        await loginPage.login(username, password);

        // Verify error message
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain('Sorry, this user has been locked out');
    });
}); 