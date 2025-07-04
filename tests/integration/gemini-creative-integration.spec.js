import { test, expect } from '@playwright/test';
import { executeQuery } from '../../src/utils/database';

test.describe('Gemini Creative Scenarios - Integration Tests', () => {

  const baseURL = 'http://localhost:3000';

  test('Escape Risks API and DB should be in sync', async ({ request }) => {
    // 1. Fetch from API
    const apiResponse = await request.get(`${baseURL}/api/creative/escape-risks`);
    expect(apiResponse.ok()).toBeTruthy();
    const apiData = await apiResponse.json();

    // 2. Fetch from Database
    const dbQuery = `
      WITH AtRiskHabitats AS (
          SELECT habitat_id
          FROM habitats
          WHERE habitat_type = 'Outdoor' OR (temp_range_high - temp_range_low) > 20
      )
      SELECT
          a.name AS AnimalName,
          a.species,
          a.weight_kg,
          h.habitat_name AS HabitatName,
          h.habitat_type
      FROM
          animals a
      JOIN
          habitats h ON a.habitat_id = h.habitat_id
      WHERE
          a.weight_kg < 10
          AND a.habitat_id IN (SELECT habitat_id FROM AtRiskHabitats);
    `;
    const dbData = await executeQuery(dbQuery);

    // 3. Compare results
    expect(apiData.length).toEqual(dbData.length);
    expect(apiData).toEqual(expect.arrayContaining(dbData));
  });

  test('Friendship Candidates API and DB should be in sync', async ({ request }) => {
    // 1. Fetch from API
    const apiResponse = await request.get(`${baseURL}/api/creative/friendship-candidates`);
    expect(apiResponse.ok()).toBeTruthy();
    const apiData = await apiResponse.json();

    // 2. Fetch from Database
    const dbQuery = `
      SELECT
          a1.name AS Animal1,
          a1.species,
          h1.habitat_name AS Habitat1,
          a2.name AS Animal2,
          h2.habitat_name AS Habitat2
      FROM
          animals a1
      JOIN
          animals a2 ON a1.species = a2.species AND a1.animal_id < a2.animal_id
      JOIN
          habitats h1 ON a1.habitat_id = h1.habitat_id
      JOIN
          habitats h2 ON a2.habitat_id = h2.habitat_id
      WHERE
          a1.habitat_id != a2.habitat_id;
    `;
    const dbData = await executeQuery(dbQuery);

    // 3. Compare results
    expect(apiData.length).toEqual(dbData.length);
    expect(apiData).toEqual(expect.arrayContaining(dbData));
  });

  test('A-Team API and DB should be in sync', async ({ request }) => {
    // 1. Fetch from API
    const apiResponse = await request.get(`${baseURL}/api/creative/a-team`);
    expect(apiResponse.ok()).toBeTruthy();
    const apiData = await apiResponse.json();

    // 2. Fetch from Database
    const dbQuery = `
      SELECT
          vet.first_name AS Veterinarian,
          trainer.first_name AS Trainer,
          caretaker.first_name AS Caretaker
      FROM
          staff vet
      CROSS JOIN
          staff trainer
      CROSS JOIN
          staff caretaker
      WHERE
          vet.role = 'Veterinarian'
          AND trainer.role = 'Trainer'
          AND caretaker.role = 'Caretaker'
          AND vet.staff_id != trainer.staff_id
          AND vet.staff_id != caretaker.staff_id
          AND trainer.staff_id != caretaker.staff_id;
    `;
    const dbData = await executeQuery(dbQuery);

    // 3. Compare results
    expect(apiData.length).toEqual(dbData.length);
    expect(apiData).toEqual(expect.arrayContaining(dbData));
  });
});
