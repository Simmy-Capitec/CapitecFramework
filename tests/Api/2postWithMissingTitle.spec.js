import { test, expect
} from '@playwright/test';

test('POST /posts fails with missing title', async ({ request
}) => {
    const newPostData = {
        userId: 1,
        //title: 'Hello dudes', 
        body: 'This post body is fine'
    };

    console.log('Attempting to create a post with missing title:', newPostData); 

    const response = await request.post('/posts',
    { data: newPostData
    });

    expect(response.status()).toBe(400); // Assuming 400 is the expected status for missing title
    const responseBody = await response.json();
    console.log('Response:', responseBody);
});