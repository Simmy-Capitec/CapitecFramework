import { test, expect } from '@playwright/test';

test.describe('Gemini Creative API Endpoints', () => {

  const baseURL = 'http://localhost:3000';

  test('GET /api/creative/escape-risks should return potential escape risks', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/creative/escape-risks`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Assuming Penny the penguin is a known escape risk
    const penny = data.find(animal => animal.AnimalName === 'Penny');
    expect(penny).toBeDefined();
    expect(penny.weight_kg).toBeLessThan(10);
  });

  test('GET /api/creative/friendship-candidates should return potential friends', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/creative/friendship-candidates`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
  });

  test('GET /api/creative/a-team should return a valid team', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/creative/a-team`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
    const team = data[0];
    expect(team.Veterinarian).toBeDefined();
    expect(team.Trainer).toBeDefined();
    expect(team.Caretaker).toBeDefined();
  });
});
