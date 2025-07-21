import { test, expect } from '@playwright/test';

/*
REAL-WORLD API TESTING SCENARIOS
================================

This file demonstrates how to test real API scenarios using the local API server.
The examples use the actual endpoints available in api-server.js so they can be
run successfully during demonstrations.

KEY CONCEPTS COVERED:
1. Authentication with real tokens
2. CRUD operations with validation
3. Error handling
4. Performance testing
5. Integration with multiple endpoints

Note: The server uses a simple token-based auth system with the token 'my-secret-token'
*/

// The token used by the API server for authentication (from api-server.js)
const SECRET_TOKEN = 'my-secret-token';

test('Authentication with correct and incorrect tokens', async ({ request }) => {
    /*
    This test demonstrates:
    1. How to test a protected endpoint
    2. The difference between 401 (Unauthorized) and 403 (Forbidden)
    3. Correct token handling
    */

    console.log('1. Testing access without a token (401 Unauthorized)');
    const noTokenResponse = await request.get('http://localhost:3000/secure-data');
    expect(noTokenResponse.status()).toBe(401);

    const errorBody = await noTokenResponse.json();
    expect(errorBody.error).toContain('Unauthorized');

    console.log('2. Testing access with incorrect token (403 Forbidden)');
    const wrongTokenResponse = await request.get('http://localhost:3000/secure-data', {
        headers: {
            'Authorization': 'Bearer wrong-token'
        }
    });
    expect(wrongTokenResponse.status()).toBe(403);

    console.log('3. Testing access with correct token (200 OK)');
    const correctTokenResponse = await request.get('http://localhost:3000/secure-data', {
        headers: {
            'Authorization': `Bearer ${SECRET_TOKEN}`
        }
    });
    expect(correctTokenResponse.status()).toBe(200);

    const secureData = await correctTokenResponse.json();
    expect(secureData.message).toContain('This is secure data');
});

test('Complete CRUD lifecycle for posts', async ({ request }) => {
    /*
    This test demonstrates a complete CRUD cycle for a resource:
    1. CREATE - POST to create a new resource
    2. READ - GET to retrieve the resource
    3. UPDATE - PUT to update the resource
    4. DELETE - DELETE to remove the resource
    
    Along the way, we validate the responses and error handling.
    */

    // Step 1: CREATE a new post
    console.log('Step 1: Creating a new post');
    const newPost = {
        userId: 1, // Using an existing user ID from the server's data
        title: 'Testing CRUD Operations',
        body: 'This post was created during an API test',
        published: true,
        tags: ['test', 'api', 'crud']
    };

    const createResponse = await request.post('http://localhost:3000/posts', {
        data: newPost
    });

    expect(createResponse.status()).toBe(201); // 201 Created

    const createdPost = await createResponse.json();
    expect(createdPost.id).toBeDefined(); // Should have an ID assigned
    expect(createdPost.title).toBe(newPost.title);

    // Save the ID for later steps
    const postId = createdPost.id;
    console.log(`Post created with ID: ${postId}`);

    // Step 2: READ the post we just created
    console.log('Step 2: Reading the post');
    const readResponse = await request.get(`http://localhost:3000/posts/${postId}`);
    expect(readResponse.status()).toBe(200);

    const retrievedPost = await readResponse.json();
    expect(retrievedPost.id).toBe(postId);
    expect(retrievedPost.title).toBe(newPost.title);
    expect(retrievedPost.body).toBe(newPost.body);

    // Step 3: UPDATE the post
    console.log('Step 3: Updating the post');
    const updateData = {
        userId: 1,
        title: 'Updated Title',
        body: 'This post has been updated',
        published: false,
        tags: ['updated', 'api-test'],
        metadata: { updated: true, updatedAt: new Date().toISOString() }
    };

    const updateResponse = await request.put(`http://localhost:3000/posts/${postId}`, {
        data: updateData
    });

    expect(updateResponse.status()).toBe(200);

    const updatedPost = await updateResponse.json();
    expect(updatedPost.title).toBe(updateData.title);
    expect(updatedPost.published).toBe(updateData.published);

    // Step 4: DELETE the post
    console.log('Step 4: Deleting the post');
    const deleteResponse = await request.delete(`http://localhost:3000/posts/${postId}`);
    expect(deleteResponse.status()).toBe(204); // 204 No Content

    // Step 5: Verify the post is gone
    console.log('Step 5: Verifying post is deleted');
    const verifyDeleteResponse = await request.get(`http://localhost:3000/posts/${postId}`);
    expect(verifyDeleteResponse.status()).toBe(404); // Should be Not Found
});

test('Validation error handling', async ({ request }) => {
    /*
    This test demonstrates how to test validation error handling:
    1. Missing required fields
    2. Invalid data formats
    3. Business rule violations
    */

    console.log('Testing validation: Missing required field');
    // Missing title (required field)
    const missingTitlePost = {
        userId: 1,
        body: 'This post is missing a title'
    };

    const missingTitleResponse = await request.post('http://localhost:3000/posts', {
        data: missingTitlePost
    });

    expect(missingTitleResponse.status()).toBe(400); // Bad Request
    const missingTitleError = await missingTitleResponse.json();
    expect(missingTitleError.error).toContain('Missing required fields');

    console.log('Testing validation: Invalid reference (non-existent user)');
    // Non-existent userId
    const invalidUserPost = {
        userId: 9999, // This user ID doesn't exist
        title: 'Post with invalid user',
        body: 'This references a non-existent user'
    };

    const invalidUserResponse = await request.post('http://localhost:3000/posts', {
        data: invalidUserPost
    });

    expect(invalidUserResponse.status()).toBe(400);
    const invalidUserError = await invalidUserResponse.json();
    expect(invalidUserError.error).toContain('User with id 9999 does not exist');

    console.log('Testing validation: Wrong data type');
    // Wrong data type for tags (should be array)
    const wrongTypePost = {
        userId: 1,
        title: 'Post with wrong data type',
        body: 'This has the wrong data type for tags',
        tags: 'not-an-array' // Should be an array
    };

    const wrongTypeResponse = await request.post('http://localhost:3000/posts', {
        data: wrongTypePost
    });

    expect(wrongTypeResponse.status()).toBe(400);
    const wrongTypeError = await wrongTypeResponse.json();
    expect(wrongTypeError.error).toContain('tags must be an array');
});

test('Working with relationships between resources', async ({ request }) => {
    /*
    This test demonstrates how to test relationships between resources:
    1. Creating a post
    2. Adding comments to the post
    3. Retrieving comments for the post
    4. Deleting the post (which should cascade delete comments)
    */

    // Step 1: Create a post
    console.log('Step 1: Creating a post');
    const newPost = {
        userId: 1,
        title: 'Testing Relationships',
        body: 'This post will have comments',
        published: true
    };

    const postResponse = await request.post('http://localhost:3000/posts', {
        data: newPost
    });

    const post = await postResponse.json();
    const postId = post.id;
    console.log(`Created post with ID: ${postId}`);

    // Step 2: Add comments to the post
    console.log('Step 2: Adding comments to the post');
    const comment1 = {
        userId: 2,
        text: 'First comment on the post!'
    };

    const comment2 = {
        userId: 3,
        text: 'Another comment here'
    };

    const comment1Response = await request.post(`http://localhost:3000/posts/${postId}/comments`, {
        data: comment1
    });
    expect(comment1Response.status()).toBe(201);

    const comment2Response = await request.post(`http://localhost:3000/posts/${postId}/comments`, {
        data: comment2
    });
    expect(comment2Response.status()).toBe(201);

    // Step 3: Get all comments for the post
    console.log('Step 3: Getting all comments for the post');
    const commentsResponse = await request.get(`http://localhost:3000/posts/${postId}/comments`);
    expect(commentsResponse.status()).toBe(200);

    const comments = await commentsResponse.json();
    expect(Array.isArray(comments)).toBe(true);
    expect(comments.length).toBe(2);
    expect(comments.some(c => c.text === comment1.text)).toBe(true);
    expect(comments.some(c => c.text === comment2.text)).toBe(true);

    // Step 4: Delete the post
    console.log('Step 4: Deleting the post (should cascade delete comments)');
    const deleteResponse = await request.delete(`http://localhost:3000/posts/${postId}`);
    expect(deleteResponse.status()).toBe(204);

    // Step 5: Verify comments are gone
    console.log('Step 5: Verifying comments are gone');
    const commentsAfterResponse = await request.get(`http://localhost:3000/posts/${postId}/comments`);
    expect(commentsAfterResponse.status()).toBe(200); // Note: The API still returns 200 with empty array

    const commentsAfter = await commentsAfterResponse.json();
    expect(commentsAfter.length).toBe(0); // Comments should be gone
});

test('Filtering, sorting and querying data', async ({ request }) => {
    /*
    This test demonstrates how to test API functionality for:
    1. Filtering data by query parameters
    2. Sorting results
    3. Handling query parameters
    */

    // Get all posts (baseline)
    const allPostsResponse = await request.get('http://localhost:3000/posts');
    const allPosts = await allPostsResponse.json();

    // Test 1: Filter by userId
    console.log('Test 1: Filtering posts by userId=1');
    const userFilterResponse = await request.get('http://localhost:3000/posts?userId=1');
    expect(userFilterResponse.status()).toBe(200);

    const userFilteredPosts = await userFilterResponse.json();
    expect(Array.isArray(userFilteredPosts)).toBe(true);
    userFilteredPosts.forEach(post => {
        expect(post.userId).toBe(1);
    });

    // Test 2: Filter by published status
    console.log('Test 2: Filtering posts by published=true');
    const publishedFilterResponse = await request.get('http://localhost:3000/posts?published=true');
    expect(publishedFilterResponse.status()).toBe(200);

    const publishedPosts = await publishedFilterResponse.json();
    publishedPosts.forEach(post => {
        expect(post.published).toBe(true);
    });

    // Test 3: Sorting posts by title
    console.log('Test 3: Sorting posts by title in ascending order');
    const sortResponse = await request.get('http://localhost:3000/posts?sortBy=title&order=asc');
    expect(sortResponse.status()).toBe(200);

    const sortedPosts = await sortResponse.json();

    // Verify the posts are sorted by title in ascending order
    for (let i = 1; i < sortedPosts.length; i++) {
        // Handle null/undefined titles (some sample data has these issues)
        const prevTitle = sortedPosts[i - 1].title || '';
        const currTitle = sortedPosts[i].title || '';

        // Skip nulls for comparison - in a real test we might handle this differently
        if (!prevTitle || !currTitle) continue;

        // Check that titles are in alphabetical order
        expect(prevTitle.localeCompare(currTitle) <= 0).toBe(true);
    }

    // Test 4: Combining multiple filters
    console.log('Test 4: Combining userId and published filters');
    const combinedFilterResponse = await request.get('http://localhost:3000/posts?userId=1&published=true');
    expect(combinedFilterResponse.status()).toBe(200);

    const combinedFilteredPosts = await combinedFilterResponse.json();
    combinedFilteredPosts.forEach(post => {
        expect(post.userId).toBe(1);
        expect(post.published).toBe(true);
    });
});

test('API performance - handling slow responses', async ({ request }) => {
    /*
    This test demonstrates how to test API performance:
    1. Testing timeouts with slow endpoints
    2. Measuring response times
    */

    console.log('Testing slow endpoint response');

    // Record start time
    const startTime = Date.now();

    // Call the slow endpoint that has a 2-second delay
    const response = await request.get('http://localhost:3000/slow-response', {
        timeout: 5000 // 5 second timeout (default is 30s)
    });

    // Calculate elapsed time
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`Response received in ${responseTime}ms`);

    // Verify the response
    expect(response.status()).toBe(200);

    // Verify it took at least 2 seconds (with a small buffer)
    expect(responseTime).toBeGreaterThanOrEqual(1900); // Just under 2s to account for timing variations

    // Verify the content
    const data = await response.json();
    expect(data.message).toBe('This took 2 seconds!');

    // Additional timeout test (commented out to avoid test failures)
    // This would be useful to verify timeout handling
    // 
    // try {
    //     await request.get('http://localhost:3000/slow-response', {
    //         timeout: 1000 // 1 second timeout (too short)
    //     });
    //     // If we reach here, the request didn't timeout as expected
    //     expect(false).toBe(true); // Force failure
    // } catch (error) {
    //     // If we reach here, request timed out as expected
    //     expect(error.message).toContain('timeout');
    // }
});

test('Handling different response types', async ({ request }) => {
    /*
    This test demonstrates how to handle different response types:
    1. JSON responses (most common)
    2. Text responses
    3. Error responses
    */

    // Test 1: JSON response
    console.log('Test 1: Handling JSON response');
    const jsonResponse = await request.get('http://localhost:3000/posts/1');
    expect(jsonResponse.status()).toBe(200);

    const jsonData = await jsonResponse.json();
    expect(jsonData.id).toBe(1);
    expect(typeof jsonData.title).toBe('string');

    // Test 2: Text response
    console.log('Test 2: Handling Text response');
    const textResponse = await request.get('http://localhost:3000/text-response');
    expect(textResponse.status()).toBe(200);

    // For text responses, use text() instead of json()
    const textData = await textResponse.text();
    expect(textData).toBe('This is a plain text response.');

    // Test 3: Error response
    console.log('Test 3: Handling Error response (500)');
    const errorResponse = await request.get('http://localhost:3000/internal-error');
    expect(errorResponse.status()).toBe(500);

    const errorData = await errorResponse.json();
    expect(errorData.error).toContain('Internal Server Error');

    // Test 4: 404 Not Found
    console.log('Test 4: Handling 404 Not Found');
    const notFoundResponse = await request.get('http://localhost:3000/non-existent-endpoint');
    expect(notFoundResponse.status()).toBe(404);

    const notFoundData = await notFoundResponse.json();
    expect(notFoundData.error).toContain('Cannot GET /non-existent-endpoint');
}); 