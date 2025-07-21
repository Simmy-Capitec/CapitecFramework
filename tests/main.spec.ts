// tests/main.spec.ts

import { test } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { ProcessPage } from '../src/pages/ProcessPage';

// Main test scenario
// This test emulates login and subsequent process interactions as per the generated AI test script

test('Automated End-to-End Process Test', async ({ page }) => {
    console.log('Starting Automated End-to-End Process Test');

    // Initialize Page Objects
    const loginPage = new LoginPage(page)
    const processPage = new ProcessPage(page)
    console.log('Page objects initialized')

    // Step 0: Navigate to base URL
    console.log('Step 0: Navigating to base URL');
    await loginPage.navigate();
    console.log('Navigation complete');

    // Step 1-3: Login
    console.log('Step 1-3: Attempting login');
    await loginPage.login('ccoetzee@inspiredtesting.com', '756912329224Hel!');
    console.log('Login successful');

    // Step 4: Click SAP Accelerator
    console.log('Step 4: Clicking SAP Accelerator');
    await processPage.clickSAPAccelerator();
    console.log('SAP Accelerator clicked');

    // Step 5: Select 'Fit-Gap Analysis' radio button
    console.log('Step 5: Selecting Fit-Gap Analysis');
    await processPage.selectFitGapAnalysis();
    console.log('Fit-Gap Analysis selected');

    // Step 6 & 7: Click '+ Add "As-Is" Process' and fill first As-Is process details
    console.log('Step 6: Adding first As-Is Process');
    await processPage.clickAddAsIsProcess();
    console.log('First As-Is Process added');

    console.log('Step 7: Filling first As-Is Process details');
    await processPage.fillFirstAsIsProcess(
        'Basic Order Creation',
        'Current manual order entry process.',
        'SD',
        'VA01'
    );
    console.log('First As-Is Process details filled');

    // Step 11: Toggle Is Standard option to Yes for the first As-Is process
    console.log('Step 11: Toggling Is Standard option for first As-Is process');
    await processPage.toggleIsStandardProcessFirst();
    console.log('Is Standard option toggled');

    // Step 12-14: Add second As-Is process and fill details
    console.log('Step 12: Adding second As-Is Process');
    await processPage.clickAddSecondAsIsProcess();
    console.log('Second As-Is Process added');

    console.log('Step 13-14: Filling second As-Is Process details');
    await processPage.fillSecondAsIsProcess(
        'Legacy Inventory Check',
        'Old custom system for checking stock before order.',
        'MM',
        'ZINVCHK',
        'No (Custom with deviations)'
    );
    console.log('Second As-Is Process details filled');

    // Step 18-22: Add To-Be process and fill details
    console.log('Step 18: Adding To-Be Process');
    await processPage.clickAddToBeProcess();
    console.log('To-Be Process added');

    console.log('Step 19-22: Filling To-Be Process details');
    await processPage.fillToBeProcess(
        'Automated Credit Check',
        'New automated credit verification during order entry.',
        'FI',
        'FD32'
    );
    console.log('To-Be Process details filled');

    console.log('Test completed successfully');
});