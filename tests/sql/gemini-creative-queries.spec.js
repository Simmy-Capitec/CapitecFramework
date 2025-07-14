import { test, expect } from '@playwright/test';
import { executeQuery } from '../../src/utils/database';

test.describe('Gemini Creative SQL Scenarios', () => {

  test('The Great Escape Caper should identify potential escape risks', async () => {
    const query = `
      WITH AtRiskHabitats AS (
          SELECT habitat_id
          FROM habitats
          WHERE habitat_type = 'Outdoor' OR (temp_range_high - temp_range_low) > 20
      )
      SELECT
          a.name AS AnimalName
      FROM
          animals a
      JOIN
          habitats h ON a.habitat_id = h.habitat_id
      WHERE
          a.weight_kg < 10
          AND a.habitat_id IN (SELECT habitat_id FROM AtRiskHabitats);
    `;
    const results = await executeQuery(query);
    const animalNames = results.map((row) => row.AnimalName);

    // Assuming 'Penny' the penguin is a small animal in an outdoor habitat
    expect(animalNames).toContain('Penny');
  });

  test('Operation: Animal Friendship should find potential friends', async () => {
    const query = `
      SELECT
          a1.name AS Animal1,
          a2.name AS Animal2
      FROM
          animals a1
      JOIN
          animals a2 ON a1.species = a2.species AND a1.animal_id < a2.animal_id
      WHERE
          a1.habitat_id != a2.habitat_id;
    `;
    const results = await executeQuery(query);

    // Expecting to find at least one pair of potential friends
    expect(results.length).toBeGreaterThan(0);
  });

  test('The "A-Team" Project should assemble a valid team', async () => {
    const query = `
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
    const results = await executeQuery(query);

    // Expecting to find at least one valid team combination
    expect(results.length).toBeGreaterThan(0);
    const team = results[0];
    expect(team.Veterinarian).toBeDefined();
    expect(team.Trainer).toBeDefined();
    expect(team.Caretaker).toBeDefined();
  });
});
