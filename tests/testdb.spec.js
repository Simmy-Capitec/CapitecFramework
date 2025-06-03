import { test, expect } from '@playwright/test';
import { executeQuery, executeDDL, connectToDatabase, closeConnections } from '../../../src/utils/database.js';

test('should query users from candidate_01_db and validate data structure', async () => {
    console.log('Hi')
});