import { test, expect } from '@playwright/test';

/*
AUTHENTICATION METHODS IN APIs
==============================

Authentication is the process of verifying the identity of a user or system.
This file demonstrates different authentication methods commonly used in APIs.

1. BASIC AUTHENTICATION
   - Simplest form of authentication
   - Sends username and password with each request
   - Format: "Authorization: Basic base64(username:password)"
   - NOT SECURE unless used with HTTPS
   - Easily decoded if intercepted

2. API KEY AUTHENTICATION
   - Uses a unique generated string to identify the client
   - Can be passed in headers, query parameters, or request body
   - Simpler than OAuth but less secure and feature-rich
   - Example: "X-API-Key: api_key_12345"
   - Best for: Public APIs with low security requirements, internal services

3. BEARER TOKEN / OAuth 2.0
   - Modern, token-based authentication
   - Separates authentication from authorization
   - More secure and flexible
   - Format: "Authorization: Bearer token123"
   - Best for: APIs that need user context, third-party access

4. JWT (JSON Web Token)
   - Not an authentication method itself, but a token format
   - Self-contained tokens with encoded data
   - Three parts: header.payload.signature
   - Used with OAuth 2.0 and other token-based auth systems
*/

// The server's authentication token (from api-server.js)
const SECRET_TOKEN = 'my-secret-token';

test('Basic Authentication example', async ({ request }) => {
    // BASIC AUTH EXAMPLE
    // Format is "username:password" encoded in base64
    const username = 'testuser';
    const password = 'password123';
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');

    const response = await request.get('http://localhost:3000/basic-auth-endpoint', {
        headers: {
            'Authorization': `Basic ${credentials}`
        }
    });

    // In a real test, we would expect a 200 status for valid credentials
    // For now, we're just simulating what the test would look like
    expect(response.status()).toBe(404); // This endpoint doesn't exist in our API server

    // NOTE: Basic Auth sends credentials with EVERY request
    // This is why it should ONLY be used with HTTPS (TLS/SSL)
});

test('API Key Authentication example', async ({ request }) => {
    // API KEY EXAMPLE
    // API keys can be included in:
    // 1. Header (most common)
    // 2. Query parameter
    // 3. Request body (less common)

    const apiKey = 'your_api_key_12345';

    // Method 1: Via Header
    const headerResponse = await request.get('http://localhost:3000/api-key-endpoint', {
        headers: {
            'X-API-Key': apiKey
            // Some APIs use different header names like:
            // 'api-key', 'x-api-token', etc.
        }
    });

    // Method 2: Via Query Parameter
    const queryResponse = await request.get(`http://localhost:3000/api-key-endpoint?api_key=${apiKey}`);

    // In actual tests, verify the correct response
    expect(headerResponse.status()).toBe(404); // This endpoint doesn't exist in our API server
    expect(queryResponse.status()).toBe(404); // This endpoint doesn't exist in our API server

    /*
    SECURITY CONSIDERATIONS FOR API KEYS:
    - API keys should be kept secret
    - Using query parameters exposes the key in logs and browser history
    - Prefer header-based API keys when possible
    - API keys don't typically expire unless manually revoked
    */
});

test('Bearer Token / OAuth 2.0 example', async ({ request }) => {
    /*
    OAUTH 2.0 FLOW (simplified):
    1. Client requests access (often redirects user to login)
    2. User authenticates and authorizes the client
    3. Authorization server provides an access token
    4. Client uses the token for API requests
    
    In testing, we often skip the login flow and simulate having a token directly.
    */

    console.log('Testing Bearer Token authentication with a real endpoint');

    // Example with a made-up token (will fail)
    const fakeBearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0';
    const fakeResponse = await request.get('http://localhost:3000/secure-data', {
        headers: {
            'Authorization': `Bearer ${fakeBearerToken}`
        }
    });
    console.log('Response with fake token:', fakeResponse.status());
    expect(fakeResponse.status()).toBe(403); // Should be forbidden

    // Using our actual server token (will succeed)
    const response = await request.get('http://localhost:3000/secure-data', {
        headers: {
            'Authorization': `Bearer ${SECRET_TOKEN}`
        }
    });

    console.log('Response with valid token:', response.status());
    expect(response.status()).toBe(200); // Should be successful

    // Verify we got protected data
    const data = await response.json();
    expect(data.message).toContain('This is secure data');

    /*
    ADVANTAGES OF BEARER TOKENS:
    - Short-lived (typically expires after a short time)
    - Can contain user information and permissions (JWT)
    - Can be revoked
    - Separates authentication from API usage
    */
});

test('JWT structure explanation', async () => {
    /*
    JWT (JSON WEB TOKEN) STRUCTURE
    ==============================
    JWTs consist of three parts separated by dots:
    
    1. HEADER - Algorithm and token type
       {
         "alg": "HS256",
         "typ": "JWT"
       }
    
    2. PAYLOAD - The data (claims)
       {
         "sub": "1234567890",  // Subject (user ID)
         "name": "John Doe",   // Custom claim
         "admin": true,        // Custom claim for authorization
         "iat": 1516239022     // Issued At timestamp
       }
    
    3. SIGNATURE - To verify the token hasn't been tampered with
       HMACSHA256(
         base64UrlEncode(header) + "." + base64UrlEncode(payload),
         secret_key
       )
    
    When combined, a JWT looks like:
    xxxxx.yyyyy.zzzzz
    
    Note: The payload is NOT encrypted, just base64 encoded.
    Anyone can decode it, but they cannot modify it without the secret key.
    */

    // This is just an educational test - no actual API call
    const jwtParts = {
        header: {
            alg: "HS256",
            typ: "JWT"
        },
        payload: {
            sub: "1234567890",
            name: "Test User",
            role: "admin",
            exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expires in 1 hour
        },
        // The signature would be created using a secret key
    };

    // Log the structure for educational purposes
    console.log('JWT Structure Example:', jwtParts);

    // This is for demonstration only
    expect(typeof jwtParts.payload.exp).toBe('number');
    expect(jwtParts.payload.role).toBe('admin');
}); 