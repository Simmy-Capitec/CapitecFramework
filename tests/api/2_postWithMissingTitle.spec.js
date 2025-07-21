import { test, expect } from '@playwright/test';

// This is a negative test because it deliberately omits a required field (title) to verify that the API properly handles invalid input and returns appropriate error responses (400 status code and error message)
test('POST /posts fails with missing title', async ({ request }) => {
    const newPostData = {
        userId: 1,
        // title: 'Hello dudes',
        body: 'This post body is fine',
        user_type: 'admin'
    };

    console.log('Attempting to create a post with missing title:', newPostData);

    const response = await request.post('http://localhost:3000/posts', { data: newPostData });

    const response2 = await request.post('http://localhost:3000/users', {


    });
    const response3 = await request.put('http://localhost:3000/users', {



    });

    //Although it's a negative test, getting an error code - it's a positive scenario because it gives what we expect
    expect(response.status()).toBe(400); //If we expect a negative result, and we get a negative result - then it is what we expected, meaning it's a 
    //positive scenario, and the test will pass (up till this point ofc)

    //negative + negative = positive
    //negative + postive  = negative

    //{}
    //[]

    const body = await response.json();

    console.log('Error reponse', body);

    expect(body.error).toContain();
    // console.log('Test passed: Server correctly rejected post with missing title');
});

//STATUS CODES
//200 - OK
//201 - Created
//204 - No Content
//400 - Bad Request
//401 - Unauthorized
//403 - Forbidden
//404 - Not Found
//500 - Internal Server Error