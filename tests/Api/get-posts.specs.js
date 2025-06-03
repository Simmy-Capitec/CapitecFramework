import { expect } from "@playwright/test";




test('GET / posts returns a list of posts', async ({ request }) => {

    const response = await request.get('https://jsonplaceholder.typicode.com/posts');
    expect(response.status)
})