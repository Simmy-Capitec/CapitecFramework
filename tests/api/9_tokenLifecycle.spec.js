import { test, expect } from '@playwright/test';

/*
TOKEN LIFECYCLE AND TESTING STRATEGIES
======================================

This file demonstrates practical techniques for managing token lifecycles in API testing.
While our test server doesn't implement full token lifecycle functionality 
(like expiry or refresh), we can simulate these behaviors.

KEY CONCEPTS:
1. Token setup and reuse across tests
2. Testing with expired tokens (simulated)
3. Implementing a token management system for tests
4. Practical handling of authentication in a test suite
*/

// In a real project, you might store this in an environment variable
// or configuration file, never hardcode tokens in production code
const SECRET_TOKEN = 'my-secret-token';

// For demonstration, we'll create a simple token manager
class TokenManager {
    constructor() {
        this.token = null;
        this.expiresAt = null;
        this.refreshToken = null;
    }

    // Simulate getting a token
    async getAccessToken(request) {
        // Check if token exists and is not expired
        if (this.token && this.expiresAt && Date.now() < this.expiresAt) {
            console.log('Using existing token');
            return this.token;
        }

        // In reality, we would call a login/token endpoint
        // For this demo, we'll simulate it 
        console.log('Getting new token');

        // With our test server, we'll just use the known token
        // In a real scenario, this would be a POST to /login or /token
        this.token = SECRET_TOKEN;
        this.expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour expiry
        this.refreshToken = 'refresh-token-123'; // Simulated refresh token

        return this.token;
    }

    // Simulate refreshing a token
    async refreshAccessToken(request) {
        console.log('Refreshing token');

        // In a real API, we would call the refresh token endpoint
        // For our demo, we'll just simulate this

        // Simulate a call to refresh endpoint
        // const response = await request.post('http://localhost:3000/refresh-token', {
        //     data: { refresh_token: this.refreshToken }
        // });

        // Use our known token since our server doesn't have a refresh endpoint
        this.token = SECRET_TOKEN;
        this.expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour expiry

        return this.token;
    }

    // Simulate token expiry
    invalidateToken() {
        console.log('Invalidating token (simulating expiry)');
        this.expiresAt = Date.now() - 1000; // Set expiry to the past
    }
}

// Create a singleton instance for use across tests
const tokenManager = new TokenManager();

// Helper function for authenticated requests
async function authenticatedRequest(request, url, options = {}) {
    // Get a valid token (refreshes if needed)
    const token = await tokenManager.getAccessToken(request);

    // Add token to headers
    const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    // Make the request
    return request.get(url, {
        ...options,
        headers
    });
}

test('Token lifecycle demonstration - initial access', async ({ request }) => {
    // Step 1: Access a protected resource with a fresh token
    console.log('Step 1: Accessing protected resource with fresh token');
    const response = await authenticatedRequest(request, 'http://localhost:3000/secure-data');

    // Should succeed
    expect(response.status()).toBe(200);

    // Verify response
    const data = await response.json();
    expect(data.message).toBe('This is secure data, access granted.');

    console.log('Successfully accessed protected resource');
});

test('Token lifecycle demonstration - token reuse', async ({ request }) => {
    // This test demonstrates token reuse
    // The token manager should reuse the existing token instead of generating a new one

    console.log('Accessing protected resource with existing token');
    const response = await authenticatedRequest(request, 'http://localhost:3000/secure-data');

    // Should succeed
    expect(response.status()).toBe(200);

    // Verify we got the expected response
    const data = await response.json();
    expect(data.message).toBe('This is secure data, access granted.');

    console.log('Successfully reused token');
});

test('Token lifecycle demonstration - simulated expiry and refresh', async ({ request }) => {
    // Step 1: Simulate token expiry
    console.log('Step 1: Simulating token expiry');
    tokenManager.invalidateToken();

    // Step 2: Access a protected resource (should automatically refresh)
    console.log('Step 2: Accessing protected resource with expired token (should trigger refresh)');
    const response = await authenticatedRequest(request, 'http://localhost:3000/secure-data');

    // Should succeed after refresh
    expect(response.status()).toBe(200);

    // Verify we got the expected response
    const data = await response.json();
    expect(data.message).toBe('This is secure data, access granted.');

    console.log('Successfully refreshed token and accessed resource');
});

test('Handling invalid or malformed tokens', async ({ request }) => {
    /*
    In actual testing, we should also handle cases where:
    1. Tokens are malformed
    2. Refresh tokens are invalid
    3. Authentication service is unavailable
    */

    // Test with malformed token
    console.log('Testing with malformed token');
    const malformedResponse = await request.get('http://localhost:3000/secure-data', {
        headers: {
            'Authorization': 'Bearer malformed.token.format'
        }
    });

    // Should fail with 403 Forbidden
    expect(malformedResponse.status()).toBe(403);

    // Test with wrong token format
    console.log('Testing with wrong token format');
    const wrongFormatResponse = await request.get('http://localhost:3000/secure-data', {
        headers: {
            'Authorization': 'NotBearer token'
        }
    });

    // Should fail with 401 Unauthorized (wrong format)
    expect(wrongFormatResponse.status()).toBe(401);

    // Test with missing Authorization header
    console.log('Testing with missing Authorization header');
    const noAuthResponse = await request.get('http://localhost:3000/secure-data');

    // Should fail with 401 Unauthorized
    expect(noAuthResponse.status()).toBe(401);
});

test('Practical token management in a test suite', async ({ request }) => {
    /*
    In a larger test suite, we would organize token management to:
    1. Initialize tokens before all tests
    2. Properly handle expiry during longer test runs
    3. Clean up tokens after tests
    
    This is often done with test fixtures or setup/teardown hooks
    */

    // In Playwright, we could use a fixture for this
    // For demonstration, we'll just show how tests would use the token manager

    // Get a token directly (simulating a fixture that would provide this)
    const token = await tokenManager.getAccessToken(request);

    // Use the token for an authenticated request
    const response = await request.get('http://localhost:3000/secure-data', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // Should succeed
    expect(response.status()).toBe(200);

    /*
    BEST PRACTICES FOR TOKEN MANAGEMENT IN TEST SUITES:
    
    1. Use a centralized token management system
       - Avoids duplication of authentication logic
       - Makes it easy to update or change authentication if needed
    
    2. Implement proper retry and refresh mechanisms
       - Handles token expiry gracefully
       - Reduces test flakiness
    
    3. Use environment variables for credentials
       - Avoids hardcoding secrets in test code
       - Makes it easier to use different credentials in different environments
    
    4. Clean up properly after tests
       - Log out or invalidate tokens if appropriate
       - Avoid leaving lingering sessions
    */

    console.log('Token management demonstration completed');
}); 