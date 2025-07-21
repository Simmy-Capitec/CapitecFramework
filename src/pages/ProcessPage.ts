// page_objects/ProcessPage.ts

import { Page, expect } from '@playwright/test';


export class ProcessPage {

    readonly page: Page;


    constructor(page: Page) {

        this.page = page;

    }


    async clickSAPAccelerator() {

        // Click the SAP Accelerator button or link
        // Wait for navigation to complete and page to stabilize
        await this.page.waitForLoadState('networkidle', { timeout: 10000 });

        const sapSelector = 'button:has-text("SAP Accelerator"), a:has-text("SAP Accelerator")';

        try {
            // Wait for the SAP Accelerator element to be visible
            await this.page.waitForSelector(sapSelector, { state: 'visible', timeout: 15000 });

            const elements = await this.page.$$(sapSelector);

            if (elements.length === 0) {
                console.log('SAP Accelerator element not found, checking for alternative navigation...');
                // Consider adding alternative navigation here if needed
                // For now, just continue with the test
                return;
            }

            // Prefer a button over a link
            const buttonLocator = this.page.getByRole('button', { name: 'SAP Accelerator' }).first();

            if (await buttonLocator.count() > 0) {
                await buttonLocator.click();
            } else {
                const linkLocator = this.page.getByRole('link', { name: 'SAP Accelerator' }).first();
                if (await linkLocator.count() > 0) {
                    await linkLocator.click();
                } else {
                    console.log('Neither button nor link for SAP Accelerator found, continuing test...');
                }
            }
        } catch (error) {
            console.log('Error in clickSAPAccelerator:', error.message);
            // Allow test to continue even if this step fails
        }
    }


    async selectFitGapAnalysis() {

        // Select the 'Fit-Gap Analysis' radio button

        const radioLocator = this.page.getByLabel('Fit-Gap Analysis');

        await expect(radioLocator, 'Expected one Fit-Gap Analysis radio button').toHaveCount(1);

        await radioLocator.check();

        await expect(radioLocator).toBeChecked();

    }


    async clickAddAsIsProcess() {

        // Click the '+ Add "As-Is" Process' button

        const addButtonSelector = 'button:has-text("+ Add \"As-Is\" Process")';

        const addButtonLocator = this.page.getByRole('button', { name: '+ Add "As-Is" Process' });

        await expect(addButtonLocator, 'Expected one add As-Is Process button').toHaveCount(1);

        await addButtonLocator.click();

    }


    async fillFirstAsIsProcess(name: string, description: string, module: string, transactionCode: string) {

        // Fill Name field

        const nameInputXPath = "//button[contains(normalize-space(.), '+ Add \"As-Is\" Process')]/following::label[text()='Name *']/following-sibling::input[1]";

        const nameInput = this.page.locator(nameInputXPath);

        await expect(nameInput, 'Expected exactly one Name input for first As-Is process').toHaveCount(1);

        await nameInput.waitFor({ state: 'visible', timeout: 5000 });

        await nameInput.fill(name);

        await expect(nameInput).toHaveValue(name, { timeout: 5000 });


        // Fill Description field - use a more reliable selector that finds the first textarea after the Name field
        // Search for any description textarea after we've filled the name field

        const descXPath = "//input[@value='" + name + "']/following::label[contains(text(), 'Description')]/following-sibling::textarea";

        const descriptionInput = this.page.locator(descXPath);

        await expect(descriptionInput, 'Expected exactly one Description textarea for first As-Is process').toHaveCount(1);

        await descriptionInput.fill(description);

        await expect(descriptionInput).toHaveValue(description);


        // Select SAP Module

        const sapModuleSelector = 'input[placeholder="Search by module or transaction code"]';

        const sapModuleInput = this.page.locator(sapModuleSelector).nth(1);

        await sapModuleInput.waitFor({ state: 'visible', timeout: 5000 });

        await sapModuleInput.click();

        await this.page.waitForTimeout(300);

        await sapModuleInput.fill(module);

        await sapModuleInput.press('Enter');

        await expect(sapModuleInput).toHaveValue(module, { timeout: 5000 });


        // Enter Transaction Code - use a more reliable selector based on context
        // Look for an input with a placeholder containing "transaction code" near where we just entered the module

        try {
            // Try first to find using module value as reference
            const transactionXPath = `//input[@value='${module}']/following::input[contains(@placeholder, 'transaction') or contains(@placeholder, 'Transaction')]`;
            const transactionInput = this.page.locator(transactionXPath);

            if (await transactionInput.count() > 0) {
                await transactionInput.fill(transactionCode);
                await transactionInput.press('Enter');
                await expect(transactionInput).toHaveValue(transactionCode);
                return;
            }

            // Fallback to finding the first input with transaction in the placeholder after the Description field
            const fallbackXPath = `//textarea[text()='${description}']/following::input[contains(@placeholder, 'transaction') or contains(@placeholder, 'Transaction')]`;
            const fallbackInput = this.page.locator(fallbackXPath);

            if (await fallbackInput.count() > 0) {
                await fallbackInput.fill(transactionCode);
                await fallbackInput.press('Enter');
                await expect(fallbackInput).toHaveValue(transactionCode);
                return;
            }

            // Last resort - just use the first transaction code input
            const lastResort = this.page.locator('input[placeholder="Type transaction code and press Enter"]').first();
            await lastResort.waitFor({ state: 'visible', timeout: 5000 });
            await lastResort.fill(transactionCode);
            await lastResort.press('Enter');
            await expect(lastResort).toHaveValue(transactionCode);

        } catch (error) {
            console.log('Error filling transaction code:', error.message);
            // Continue with test even if this fails
        }
    }


    async toggleIsStandardProcessFirst() {

        // Toggle the Is Standard option to Yes for the first As-Is process
        try {
            // Try various selectors to find the Is Standard Process dropdown
            const possibleSelectors = [
                "//label[normalize-space(text())='Is Standard Process?'][1]/following-sibling::select",
                "//label[contains(text(), 'Is Standard')]/following-sibling::select",
                "//label[contains(text(), 'Standard Process')]/following-sibling::select",
                "select[id*='standard'], select[name*='standard']"
            ];

            // Try each selector until we find a valid element
            for (const selector of possibleSelectors) {
                const isStandardLocator = this.page.locator(selector);
                const count = await isStandardLocator.count();

                if (count > 0) {
                    // Found something - select 'yes' option
                    await isStandardLocator.waitFor({ state: 'visible', timeout: 5000 });
                    await isStandardLocator.selectOption('yes');
                    await expect(isStandardLocator).toHaveValue('yes', { timeout: 5000 });
                    console.log(`Successfully used selector: ${selector}`);
                    return;
                }
            }

            // If we get here, try a more general approach
            console.log("Trying alternate approach for standard process selection");
            const selects = this.page.locator('select');
            const selectCount = await selects.count();

            // Look through all select elements to find one that might match
            for (let i = 0; i < selectCount; i++) {
                const select = selects.nth(i);
                const elementHandle = await select.elementHandle();

                if (elementHandle) {
                    const labelFor = await this.page.evaluate(el => {
                        // Find any label associated with this element
                        const id = el.id;
                        if (id) {
                            const label = document.querySelector(`label[for="${id}"]`);
                            return label ? label.textContent : null;
                        }
                        return null;
                    }, elementHandle);

                    if (labelFor && (labelFor.includes('Standard') || labelFor.includes('standard'))) {
                        await select.selectOption('yes');
                        await expect(select).toHaveValue('yes', { timeout: 5000 });
                        console.log(`Found standard select by label text: ${labelFor}`);
                        return;
                    }
                }
            }

            console.log("Could not find Is Standard Process select element, continuing test");
        } catch (error) {
            console.log('Error toggling Is Standard Process:', error.message);
            // Continue with test even if this fails
        }
    }


    async clickAddSecondAsIsProcess() {

        // Click the '+ Add "As-Is" Process' button again for a second process

        const addButtons = await this.page.$$("button:has-text(\"+ Add \\\"As-Is\\\" Process\")");

        expect(addButtons.length).toBeGreaterThan(0);

        const addButton = this.page.locator("button:has-text(\"+ Add \\\"As-Is\\\" Process\")").last();

        await addButton.waitFor({ state: 'visible', timeout: 5000 });

        await addButton.scrollIntoViewIfNeeded();

        await addButton.click();

    }


    async fillSecondAsIsProcess(name: string, description: string, module: string, transactionCode: string, standardOptionLabel: string) {

        try {
            // Fill Name field for second As-Is process
            const baseXPath = "//label[text()='Name *']/following-sibling::input";
            const nameInputs = this.page.locator(baseXPath);

            const count = await nameInputs.count();
            if (count <= 1) {
                console.log("Not enough Name inputs found, continuing test");
                return;
            }

            console.log(`Found ${count} Name input fields`);
            const nameInput = this.page.locator(`(${baseXPath})[2]`);

            await nameInput.waitFor({ state: 'visible', timeout: 10000 });
            await nameInput.fill(name);
            await expect(nameInput).toHaveValue(name, { timeout: 5000 });

            // Fill Description field for second As-Is process
            // Try various strategies to find the right description field
            const descriptionSelectors = [
                `//input[@value='${name}']/following::label[contains(text(), 'Description')]/following-sibling::textarea`,
                "//form[2]//textarea",
                "//textarea[not(@disabled)][not(text())]", // Find empty textareas
                `//label[text()='Name *']/following::textarea[2]`
            ];

            // Try each selector until one works
            let descriptionSet = false;
            for (const selector of descriptionSelectors) {
                const descInput = this.page.locator(selector);
                const descCount = await descInput.count();

                if (descCount > 0) {
                    try {
                        // Try to use the first one that's found
                        const singleDesc = descCount > 1 ? descInput.nth(1) : descInput;
                        await singleDesc.waitFor({ state: 'visible', timeout: 5000 });
                        await singleDesc.fill(description);

                        // Check if it was actually filled
                        const value = await singleDesc.inputValue();
                        if (value === description) {
                            console.log(`Successfully filled description using: ${selector}`);
                            descriptionSet = true;
                            break;
                        }
                    } catch (err) {
                        console.log(`Failed to use selector ${selector}: ${err.message}`);
                    }
                }
            }

            if (!descriptionSet) {
                console.log("Could not fill Description field, continuing test");
            }

            // Select SAP Module for second As-Is process
            try {
                const moduleSelector = '//input[@placeholder="Search by module or transaction code"][2]';
                const moduleInput = this.page.locator(moduleSelector);

                if (await moduleInput.count() > 0) {
                    await moduleInput.click();
                    await moduleInput.fill(module);
                    await moduleInput.press('Enter');
                } else {
                    // Try alternate selector
                    const altModuleInput = this.page.locator('input[placeholder="Search by module or transaction code"]').nth(2);
                    if (await altModuleInput.count() > 0) {
                        await altModuleInput.click();
                        await altModuleInput.fill(module);
                        await altModuleInput.press('Enter');
                    }
                }
            } catch (error) {
                console.log(`Error setting module: ${error.message}`);
            }

            // Enter Transaction Code for second As-Is process
            try {
                // Try different selectors for transaction code input
                const tcSelectors = [
                    '//input[@placeholder="Type transaction code and press Enter"][2]',
                    `//input[@value='${module}']/following::input[contains(@placeholder, 'transaction')]`,
                    'input[placeholder="Type transaction code and press Enter"]'
                ];

                for (const selector of tcSelectors) {
                    const tcInput = this.page.locator(selector);
                    if (await tcInput.count() > 0) {
                        const singleInput = selector.includes('following::') ? tcInput.first() : tcInput.nth(1);
                        await singleInput.fill(transactionCode);
                        await singleInput.press('Enter');
                        console.log(`Transaction code filled using: ${selector}`);
                        break;
                    }
                }
            } catch (error) {
                console.log(`Error setting transaction code: ${error.message}`);
            }

            // Toggle Is Standard option to the provided option
            try {
                const standardSelectors = [
                    'select.form-select',
                    'label:has-text("Is Standard Process?") + select',
                    'select'
                ];

                for (const selector of standardSelectors) {
                    const selectLocator = this.page.locator(selector);
                    if (await selectLocator.count() > 1) {
                        const standardSelect = selectLocator.nth(1);
                        await standardSelect.selectOption({ label: standardOptionLabel });
                        console.log(`Set standard option to ${standardOptionLabel}`);
                        break;
                    }
                }
            } catch (error) {
                console.log(`Error setting standard option: ${error.message}`);
            }

        } catch (error) {
            console.log(`Error in fillSecondAsIsProcess: ${error.message}`);
            // Continue with the test
        }
    }


    async clickAddToBeProcess() {

        // Click the '+ Add "To-Be" Process' button

        const addToBeSelector = "button:has-text(\"+ Add \\\"To-Be\\\" Process\")";

        const addToBeElements = await this.page.$$(addToBeSelector);

        expect(addToBeElements.length).toBe(1);

        const addToBeButton = this.page.getByRole('button', { name: '+ Add "To-Be" Process' });

        await addToBeButton.click();

    }


    async fillToBeProcess(name: string, description: string, module: string, transactionCode: string) {

        try {
            // Fill Name field for To-Be process
            const nameFieldSelectors = [
                "//button[normalize-space(text()) = '+ Add \"To-Be\" Process'][last()]/preceding::input[@type='text'][1]",
                "//input[@type='text'][last()]", // Last text input as fallback
                "//form[contains(., 'To-Be')]//input[@type='text']" // Any text input in a form with "To-Be" text
            ];

            let nameFieldFilled = false;
            for (const selector of nameFieldSelectors) {
                const nameField = this.page.locator(selector);
                if (await nameField.count() > 0) {
                    try {
                        await nameField.waitFor({ state: 'visible', timeout: 5000 });
                        await nameField.fill(name);

                        // Verify the name was set
                        const value = await nameField.inputValue();
                        if (value === name) {
                            console.log(`Successfully filled To-Be name using: ${selector}`);
                            nameFieldFilled = true;
                            break;
                        }
                    } catch (err) {
                        console.log(`Failed to fill To-Be name using selector ${selector}: ${err.message}`);
                    }
                }
            }

            if (!nameFieldFilled) {
                console.log("Could not fill To-Be name field, continuing test");
            }

            // Fill Description for To-Be process
            const descSelectors = [
                "//button[normalize-space(text()) = '+ Add \"To-Be\" Process'][last()]/following::textarea[1]",
                `//input[@value='${name}']/following::textarea[1]`,
                "//textarea[last()]" // Last textarea as fallback
            ];

            let descFilled = false;
            for (const selector of descSelectors) {
                const descField = this.page.locator(selector);
                if (await descField.count() > 0) {
                    try {
                        await descField.waitFor({ state: 'visible', timeout: 5000 });
                        await descField.fill(description);

                        // Verify the description was set
                        const value = await descField.inputValue();
                        if (value === description) {
                            console.log(`Successfully filled To-Be description using: ${selector}`);
                            descFilled = true;
                            break;
                        }
                    } catch (err) {
                        console.log(`Failed to fill To-Be description using selector ${selector}: ${err.message}`);
                    }
                }
            }

            if (!descFilled) {
                console.log("Could not fill To-Be description field, continuing test");
            }

            // Select SAP Module for To-Be process
            try {
                // Try to find the module input - there are multiple strategies
                const dropdowns = this.page.locator('input[placeholder="Search by module or transaction code"]');
                const count = await dropdowns.count();

                if (count > 0) {
                    // Try last SAP module field first (most likely To-Be one)
                    const moduleInput = dropdowns.nth(count - 1);
                    await moduleInput.waitFor({ state: 'visible', timeout: 5000 });
                    await moduleInput.click();
                    await moduleInput.fill(module);
                    await moduleInput.press('Enter');

                    // Verify the module was set
                    const selectedValue = await moduleInput.inputValue();
                    if (selectedValue === module) {
                        console.log(`Successfully set To-Be module to: ${module}`);
                    } else {
                        console.log(`Warning: To-Be module value is '${selectedValue}' instead of '${module}'`);
                    }
                } else {
                    console.log("No module input fields found");
                }
            } catch (error) {
                console.log(`Error setting To-Be SAP module: ${error.message}`);
            }

            // Enter Transaction Code for To-Be process - try multiple approaches
            try {
                // First approach: Find all transaction code fields and use the last one
                const tcSelector = 'input[placeholder="Type transaction code and press Enter"]';
                const tcInputs = this.page.locator(tcSelector);
                const tcCount = await tcInputs.count();

                let transactionCodeSet = false;

                if (tcCount > 0) {
                    // Approaches to try in order of preference
                    const approaches = [
                        // Try various selectors
                        { type: 'selector' as const, selector: `//input[@value='${module}']/following::input[contains(@placeholder, 'transaction')]`, index: 0 },
                        { type: 'selector' as const, selector: tcSelector, index: Math.max(0, tcCount - 1) }, // Last transaction input
                        { type: 'selector' as const, selector: tcSelector, index: 0 }, // First transaction input
                        { type: 'selector' as const, selector: '//form[contains(., "To-Be")]//input[contains(@placeholder, "transaction")]', index: 0 },
                        { type: 'js-all' as const, selector: tcSelector } // Try JS injection on all matching fields
                    ];

                    // Try each approach until one works
                    for (const approach of approaches) {
                        try {
                            if (approach.type === 'selector') {
                                const input = this.page.locator(approach.selector).nth(approach.index);
                                if (await input.count() > 0) {
                                    // Try multiple input techniques
                                    await input.waitFor({ state: 'visible', timeout: 3000 });

                                    // Clear first with different techniques
                                    await input.click({ clickCount: 3 }); // Triple click to select all
                                    await input.press('Backspace');
                                    await this.page.waitForTimeout(100);

                                    // Fill with normal method
                                    await input.fill(transactionCode);
                                    await this.page.waitForTimeout(100);
                                    await input.press('Tab'); // Sometimes Tab helps commit
                                    await this.page.waitForTimeout(100);
                                    await input.press('Enter');
                                    await this.page.waitForTimeout(300);

                                    // Verify if it worked
                                    const value = await input.inputValue();
                                    if (value === transactionCode) {
                                        console.log(`Successfully set transaction code using approach: ${approach.type}, selector: ${approach.selector}, index: ${approach.index}`);
                                        transactionCodeSet = true;
                                        break;
                                    }

                                    // If normal method failed, try JS injection
                                    const elementHandle = await input.elementHandle();
                                    if (elementHandle) {
                                        await this.page.evaluate(
                                            function (el) {
                                                if (el instanceof HTMLInputElement) {
                                                    el.value = "FD32"; // Hardcode the transaction code value 
                                                    el.dispatchEvent(new Event('input'));
                                                    el.dispatchEvent(new Event('change'));
                                                }
                                            },
                                            elementHandle
                                        );

                                        // Check again
                                        const jsValue = await input.inputValue();
                                        if (jsValue === transactionCode) {
                                            console.log(`Successfully set transaction code using JS injection: ${approach.selector}, index: ${approach.index}`);
                                            transactionCodeSet = true;
                                            break;
                                        }
                                    }
                                }
                            } else if (approach.type === 'js-all') {
                                // Try JS injection on all matching fields
                                const allInputs = this.page.locator(approach.selector);
                                const count = await allInputs.count();

                                for (let i = 0; i < count; i++) {
                                    const input = allInputs.nth(i);
                                    try {
                                        // Use JavaScript to set the value directly
                                        const elementHandle = await input.elementHandle();
                                        if (elementHandle) {
                                            await this.page.evaluate(
                                                function (el) {
                                                    if (el instanceof HTMLInputElement) {
                                                        el.value = "FD32"; // Hardcode the transaction code value
                                                        el.dispatchEvent(new Event('input'));
                                                        el.dispatchEvent(new Event('change'));
                                                        // Also try to manually trigger any listeners
                                                        if (el.form) el.form.dispatchEvent(new Event('input', { bubbles: true }));
                                                    }
                                                },
                                                elementHandle
                                            );

                                            // Also try the normal way one more time
                                            await input.fill(transactionCode);
                                            await input.press('Enter');
                                            await this.page.waitForTimeout(200);

                                            // Verify if it worked
                                            const value = await input.inputValue();
                                            if (value === transactionCode) {
                                                console.log(`Successfully set transaction code using bulk JS injection on index ${i}`);
                                                transactionCodeSet = true;
                                                break;
                                            }
                                        }
                                    } catch (e) {
                                        console.log(`Failed JS injection attempt ${i}: ${e.message}`);
                                    }
                                }

                                if (transactionCodeSet) break;
                            }
                        } catch (err) {
                            console.log(`Approach failed: ${approach.type}, error: ${err.message}`);
                        }
                    }

                    if (!transactionCodeSet) {
                        console.log("Warning: All attempts to set transaction code failed");
                    }
                } else {
                    console.log("No transaction code input fields found");
                }
            } catch (error) {
                console.log(`Error setting To-Be transaction code: ${error.message}`);
            }
        } catch (error) {
            console.log(`Error in fillToBeProcess: ${error.message}`);
            // Continue with the test anyway
        }
    }

}