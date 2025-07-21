import { test as base, expect } from '@playwright/test';

/*
USING PLAYWRIGHT FIXTURES FOR AUTHENTICATION
===========================================

Fixtures are a powerful feature in Playwright that allow you to:
1. Reuse setup code across tests
2. Share data between tests
3. Create clean abstractions

This file demonstrates how to create authentication fixtures
that make API tests more elegant and maintainable.
*/

// Define a custom test with authentication fixtures
const test = base.extend({
    // Basic fixture that provides the token string
    authToken: async ({ }, use) => {
        // In a real app, you might get this from an environment variable
        const token = 'my-secret-token';

        // Use the token in the test
        await use(token);

        // Optional teardown after the test completes
        // This could be a logout request if needed
    },

    // Advanced fixture that provides an authenticated API client
    authAPI: async ({ request }, use) => {
        // Create a wrapper for the Playwright request object that
        // automatically adds authentication headers
        const authAPI = {
            // Add authenticated GET method
            async get(url, options = {}) {
                return request.get(url, {
                    ...options,
                    headers: {
                        'Authorization': 'Bearer my-secret-token',
                        ...options.headers
                    }
                });
            },

            // Add authenticated POST method
            async post(url, options = {}) {
                return request.post(url, {
                    ...options,
                    headers: {
                        'Authorization': 'Bearer my-secret-token',
                        ...options.headers
                    }
                });
            },

            // Add other methods as needed: PUT, DELETE, etc.
            async put(url, options = {}) {
                return request.put(url, {
                    ...options,
                    headers: {
                        'Authorization': 'Bearer my-secret-token',
                        ...options.headers
                    }
                });
            },

            async delete(url, options = {}) {
                return request.delete(url, {
                    ...options,
                    headers: {
                        'Authorization': 'Bearer my-secret-token',
                        ...options.headers
                    }
                });
            }
        };

        // Use the authenticated API client in the test
        await use(authAPI);

        // No teardown needed in this case - Possibly teardown needed - comment on this when we get here ;)
    }
});

// Now we can use our custom test with the auth fixtures

test('Using the authToken fixture', async ({ request, authToken }) => {
    console.log('Making authenticated request using authToken fixture');

    // The authToken fixture provides the token string
    const response = await request.get('http://localhost:3000/secure-data', {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.message).toContain('This is secure data');
});

test('Using the authAPI fixture for simplified authenticated requests', async ({ authAPI }) => {
    console.log('Making authenticated requests using authAPI fixture');

    // The authAPI fixture handles authentication automatically
    // No need to add auth headers manually
    const response = await authAPI.get('http://localhost:3000/secure-data');

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.message).toContain('This is secure data');

    // This makes tests much cleaner, especially when you have many authenticated requests
});

test('Creating and modifying secure resources with authAPI', async ({ authAPI }) => {
    /*
    This test demonstrates using the authAPI fixture for a complete CRUD flow
    with protected resources. Notice how much cleaner the test is without
    having to handle authentication headers for every request.
    */

    // Step 1: Create a post (requires authentication in a real app)
    const newPost = {
        userId: 1,
        title: 'Secure Post Creation',
        body: 'This post was created with authenticated API',
        published: true
    };

    const createResponse = await authAPI.post('http://localhost:3000/posts', {
        data: newPost
    });

    expect(createResponse.status()).toBe(201);

    const post = await createResponse.json();
    const postId = post.id;

    console.log(`Created post with ID: ${postId}`);

    // Step 2: Update the post (requires authentication in a real app)
    const updateData = {
        userId: 1,
        title: 'Updated Secure Post',
        body: 'This post was updated with authenticated API',
        published: false,
        tags: ['secure', 'authenticated'],
        metadata: { secure: true }
    };

    const updateResponse = await authAPI.put(`http://localhost:3000/posts/${postId}`, {
        data: updateData
    });

    expect(updateResponse.status()).toBe(200);

    // Step 3: Delete the post (requires authentication in a real app)
    const deleteResponse = await authAPI.delete(`http://localhost:3000/posts/${postId}`);
    expect(deleteResponse.status()).toBe(204);

    console.log('CRUD operations completed with authenticated API');
});

// You can also create a special version of test with a specific role
const adminTest = base.extend({
    adminAPI: async ({ request }, use) => {
        // In a real app, you might get an admin token through a specific login
        // For our demo, we'll use the same token but imagine it has admin privileges
        const adminAPI = {
            async get(url, options = {}) {
                return request.get(url, {
                    ...options,
                    headers: {
                        'Authorization': 'Bearer my-secret-token', // Admin token in reality
                        ...options.headers
                    }
                });
            },
            // Add other methods as needed (post, put, delete)
        };

        await use(adminAPI);
    }
});

// Use the admin-specific test
adminTest('Admin-only operations', async ({ adminAPI }) => {
    // This test simulates admin-only operations
    // In a real app with RBAC, these endpoints would only be accessible to admins

    console.log('Performing admin operations');

    // This call would only work with admin privileges in a real app
    // For our demo API server, we don't have admin-specific endpoints
    const response = await adminAPI.get('http://localhost:3000/secure-data');

    expect(response.status()).toBe(200);

    // In a real app, you might verify admin-specific data here
    console.log('Admin operation completed successfully');
});

/*
BENEFITS OF USING FIXTURES FOR AUTHENTICATION:

1. Cleaner Tests
   - Authentication details are abstracted away
   - Tests focus on business logic, not auth mechanics

2. Reduced Duplication
   - Auth logic defined once, reused everywhere
   - Easier to update when auth requirements change

3. Better Organization
   - Different fixtures for different roles (user, admin, etc.)
   - Clear separation between auth and test logic

4. Improved Reliability
   - Centralized error handling for auth issues
   - Consistent auth approach across all tests

In larger projects, you might define these fixtures in a separate file
and import them where needed.
*/ 