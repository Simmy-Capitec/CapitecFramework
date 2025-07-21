// page_objects/LoginPage.ts

import { Page, expect } from '@playwright/test';


export class LoginPage {

    readonly page: Page;

    readonly emailInput = '#email';

    readonly passwordInput = '#password';

    readonly signInButton = 'button:has-text("Sign in")';


    constructor(page: Page) {

        this.page = page;

    }


    async navigate() {

        await this.page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });

    }


    async enterEmail(email: string) {

        const emailLocator = this.page.locator(this.emailInput);

        // Wait for the email field to be visible before checking or interacting with it
        await this.page.waitForSelector(this.emailInput, { state: 'visible', timeout: 10000 });

        await expect(emailLocator, `Expected exactly one element for ${this.emailInput}`).toHaveCount(1);

        await emailLocator.fill(email);

        await expect(emailLocator).toHaveValue(email);

    }


    async enterPassword(password: string) {

        const passwordLocator = this.page.locator(this.passwordInput);

        await expect(passwordLocator, `Expected exactly one element for ${this.passwordInput}`).toHaveCount(1);

        await passwordLocator.fill(password);

        await expect(passwordLocator).toHaveValue(password);

    }


    async clickSignIn() {

        // Wait for the Sign in button to be visible

        await this.page.waitForSelector(this.signInButton, { state: 'visible', timeout: 5000 });

        const btnElements = await this.page.$$(this.signInButton);

        expect(btnElements.length).toBe(1);

        await this.page.click(this.signInButton);

    }


    async login(email: string, password: string) {

        await this.enterEmail(email);

        await this.enterPassword(password);

        await this.clickSignIn();

    }

}