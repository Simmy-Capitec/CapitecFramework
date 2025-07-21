import { test, expect } from '@playwright/test';

/*
TOKEN EXPIRY AND REFRESH FLOWS
==============================

In modern API authentication systems, tokens are typically short-lived for security reasons.
This creates several important concepts to understand:

1. TOKEN EXPIRY
   - Tokens have a limited lifespan (e.g., 15 minutes to 24 hours)
   - Expiry is often stored in the token itself (in JWTs, this is the 'exp' claim)
   - Once expired, the token is no longer valid for authentication

2. REFRESH TOKENS
   - Longer-lived tokens used to get new access tokens without re-authenticating
   - Allow for maintaining sessions without requiring password re-entry
   - Should be stored securely (like passwords)
   - Can be revoked by the server in case of security incidents

3. TYPICAL AUTHENTICATION FLOW WITH REFRESH TOKENS:
   a. User logs in with username/password
   b. Server returns:
      - Access token (short-lived)
      - Refresh token (long-lived)
   c. Client uses access token until it expires
   d. When access token expires, client uses refresh token to get a new access token
   e. If refresh token is expired or invalid, user must log in again

4. HANDLING EXPIRY IN API TESTS:
   - Tests need to handle 401 responses due to token expiry
   - May need to implement token refresh logic
   - Time-based tests require careful handling of token lifetimes
*/

test('Simulating token expiry and handling', async ({ request }) => {
    // In a real-world scenario, we would first obtain valid tokens
    // For educational purposes, we're using mock tokens and simulating expiry

    let accessToken = 'expired-access-token'; // Simulating an expired token
    let refreshToken = 'valid-refresh-token';

    // Step 1: Try to access a protected endpoint with expired token
    const firstResponse = await request.get('http://localhost:3000/protected-resource', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    // This would normally fail with a 401 Unauthorized status
    // We're simulating this behavior for educational purposes
    console.log('First attempt with expired token');


    // Step 2: Use the refresh token to obtain a new access token
    // This would normally be a POST request to a refresh endpoint
    console.log('Using refresh token to get a new access token');
    const refreshResponse = await request.post('http://localhost:3000/refresh-token', {
        data: {
            refresh_token: refreshToken
        }
    });

    // In a real scenario, this would return a new access token if the refresh token is valid
    // For our simulation, we'll just pretend we got a new token
    const newTokenData = {
        access_token: 'new-valid-access-token',
        expires_in: 3600 // Seconds until this token expires
    };

    // Update our token with the new one
    accessToken = newTokenData.access_token;

    // Step 3: Retry the request with the new token
    const secondResponse = await request.get('http://localhost:3000/protected-resource', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    // This should now succeed (in our simulation, we're using non-existent endpoints)
    console.log('Second attempt with new token');
    expect(secondResponse.status()).toBe(401); // Will fail unless the endpoint exists

    /*
    BEST PRACTICES FOR TOKEN HANDLING IN TESTS:
    
    1. Don't hardcode tokens in test files
       - Use environment variables or config files
       - Consider using fixtures or helper functions to handle token lifecycle
    
    2. Be prepared to handle token expiry
       - Implement refresh logic or re-authentication
       - Some test frameworks allow for automatic token renewal
    
    3. Avoid time-dependent tests when possible
       - Tests that depend on token expiry can be fragile
       - Consider mocking time or using test doubles for auth services
    */
});

test('Implementing a refresh token interceptor pattern', async ({ request }) => {
    /*
    In real-world testing, we often need to handle token expiry automatically.
    This test demonstrates a pattern for automatically refreshing tokens during tests.
    */

    // We would normally store these securely or in test environment variables
    let tokenData = {
        accessToken: 'initial-access-token',
        refreshToken: 'refresh-token-123',
        expiresAt: Date.now() + 3600000 // 1 hour from now
    };

    // Helper function to check if token is expired
    function isTokenExpired() {
        return Date.now() >= tokenData.expiresAt;
    }

    // Helper function to refresh token
    async function refreshAccessToken() {
        console.log('Refreshing access token...');

        // In real tests, this would be an actual API call
        const response = await request.post('http://localhost:3000/refresh-token', {
            data: { refresh_token: tokenData.refreshToken }
        });

        // Simulate getting new token data
        tokenData = {
            accessToken: 'new-access-token-' + Date.now(),
            refreshToken: tokenData.refreshToken, // Usually refresh token stays the same
            expiresAt: Date.now() + 3600000 // 1 hour from now
        };

        console.log('Token refreshed successfully');
        return tokenData.accessToken;
    }

    // Helper function for making authenticated requests with automatic token refresh
    async function authenticatedRequest(url, options = {}) {
        // Check if token is expired and refresh if needed
        if (isTokenExpired()) {
            await refreshAccessToken();
        }

        // Add the current token to request headers
        const headers = {
            'Authorization': `Bearer ${tokenData.accessToken}`,
            ...options.headers
        };

        // Make the request
        const response = await request.get(url, {
            ...options,
            headers
        });

        // If we get a 401, token might have just expired - try refreshing once
        if (response.status() === 401) {
            console.log('Received 401, attempting token refresh and retry');
            await refreshAccessToken();

            // Retry the request with new token
            return request.get(url, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${tokenData.accessToken}`,
                    ...options.headers
                }
            });
        }

        return response;
    }

    // Example usage of our helper function
    console.log('Making authenticated request...');
    const response = await authenticatedRequest('http://localhost:3000/user-profile');

    // In a real test, we would expect successful responses
    // For our simulation with non-existent endpoints:
    expect(response.status()).toBe(404); // Will be 404 if endpoint doesn't exist

    /*
    IMPORTANT CONSIDERATIONS:
    
    1. This pattern creates a reusable helper that handles token refresh automatically
    
    2. In real test frameworks, this could be implemented as:
       - A custom request wrapper
       - A Playwright fixture
       - A custom API client class
    
    3. Benefits of this approach:
       - Tests don't need to worry about token expiry
       - Reduces duplication of refresh logic
       - Makes tests more reliable
    */
}); 