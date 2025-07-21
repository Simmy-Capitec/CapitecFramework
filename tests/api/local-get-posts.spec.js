import { test, expect } from '@playwright/test';

test('GET /posts returns a list of posts from local API', async ({ request }) => {
    const response = await request.get('http://localhost:3000/posts');
    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log(body);

    // Check that the response is an array and has at least one post
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    // Optionally, check the structure of the first post
    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('userId');
    expect(body[0]).toHaveProperty('title');
    expect(body[0]).toHaveProperty('body');
}); 