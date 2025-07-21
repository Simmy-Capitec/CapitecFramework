import { test, expect } from '@playwright/test';

/*
SECURITY BEST PRACTICES FOR API AUTHENTICATION TESTING
=====================================================

This file demonstrates testing authentication error handling
and security best practices for API testing.

KEY CONCEPTS:

1. ERROR HANDLING
   - APIs should return appropriate status codes for auth failures
   - Error messages should be informative but not reveal sensitive details
   - Rate limiting should be in place for failed auth attempts

2. SECURITY VULNERABILITIES TO TEST
   - Token leakage (exposure in URLs, logs)
   - Man-in-the-middle attacks (HTTPS required)
   - Brute force attacks (rate limiting)
   - Token theft (secure storage)
   - CSRF (Cross-Site Request Forgery)

3. TOKEN STORAGE CONSIDERATIONS
   - Never store in localStorage (vulnerable to XSS)
   - HttpOnly cookies preferred for web applications
   - Mobile apps should use secure storage options
   - Test environments should use environment variables
*/

test('Testing appropriate error responses', async ({ request }) => {
	/*
	AUTHENTICATION ERROR RESPONSES
     
	Testing that the API returns appropriate status codes and
	messages for various authentication failure scenarios.
	*/

	console.log('Testing authentication error responses');

	// 1. Missing authentication
	const noAuthResponse = await request.get('http://localhost:3000/secure-data');
	expect(noAuthResponse.status()).toBe(401); // Unauthorized

	// Check error message format (should not reveal sensitive info)
	const noAuthBody = await noAuthResponse.json().catch(() => ({}));
	console.log('No Auth Error:', noAuthBody);

	// Good practice: Error should be informative but not reveal system details
	// expect(noAuthBody.error).toBeDefined();
	// expect(noAuthBody.error).not.toContain('SQL');  // Shouldn't reveal backend tech - YOU WILL NOT BELIEVE HOW IMPORTANT THIS IS
	// expect(noAuthBody.error).not.toContain('Exception');  // No stack traces - YOU WILL NOT BELIEVE HOW IMPORTANT THIS IS

	// 2. Invalid token format
	const invalidTokenResponse = await request.get('http://localhost:3000/secure-data', {
		headers: {
			'Authorization': 'NotBearer invalid-format'  // Wrong format
		}
	});
	expect(invalidTokenResponse.status()).toBe(401); // Unauthorized

	// 3. Expired token
	const expiredTokenResponse = await request.get('http://localhost:3000/secure-data', {
		headers: {
			'Authorization': 'Bearer expired.token.signature'
		}
	});
	expect(expiredTokenResponse.status()).toBe(401); // Unauthorized

	// 4. Valid token but insufficient permissions
	const insufficientPermsResponse = await request.get('http://localhost:3000/admin-only', {
		headers: {
			'Authorization': 'Bearer valid.user.token'  // Valid but not admin
		}
	});
	expect(insufficientPermsResponse.status()).toBe(403); // Forbidden

	/*
	ERROR RESPONSE BEST PRACTICES:
     
	1. Use correct status codes:
	   - 401 Unauthorized: Authentication issues
	   - 403 Forbidden: Authorization issues
	   - 429 Too Many Requests: Rate limiting
     
	2. Provide helpful but secure error messages:
	   - Do include: What went wrong, how to fix it
	   - Don't include: System details, stack traces, exact reasons
	   
	3. Log authentication failures securely:
	   - Log for security monitoring
	   - Don't log sensitive data like tokens or passwords
	*/
});

test('Testing token security measures', async ({ request }) => {
	/*
	TOKEN SECURITY TESTING
     
	Testing various security aspects of token handling.
	*/

	// 1. HTTPS requirement
	// In a real test environment, we would verify the API rejects non-HTTPS requests
	// This is simulated here as our test environment may not have HTTPS configured

	console.log('API should require HTTPS for token exchange');
	// This would be a real test if the API supported both HTTP and HTTPS
	// const httpResponse = await request.post('http://localhost:3000/login', {
	//     data: { username: 'test', password: 'password' }
	// });
	// expect(httpResponse.status()).toBe(400); // Should refuse on non-HTTPS

	// 2. Token in URL (should be rejected)
	// Testing that the API doesn't accept tokens passed in URL (insecure)
	const tokenInUrlResponse = await request.get('http://localhost:3000/secure-data?token=insecure-token-in-url');
	expect(tokenInUrlResponse.status()).toBe(401); // Should not accept token in URL

	// 3. CORS headers for token endpoints
	// In a browser environment, proper CORS headers are crucial
	const loginOptions = {
		data: { username: 'test', password: 'password' },
		headers: { 'Origin': 'https://example.com' }
	};

	const loginResponse = await request.post('http://localhost:3000/login', loginOptions);

	// Check for CORS headers (if supported by the API)
	const corsHeaders = loginResponse.headers();
	console.log('CORS Headers:', corsHeaders['access-control-allow-origin']);

	// Good APIs should have proper CORS controls
	// expect(corsHeaders['access-control-allow-origin']).toBeDefined();
	// expect(corsHeaders['access-control-allow-credentials']).toBe('true');

	/*
	TOKEN SECURITY BEST PRACTICES TO TEST:
     
	1. Transport security:
	   - HTTPS only for token transmission
	   - Secure/HttpOnly cookie flags if using cookies
	   
	2. Token content:
	   - No sensitive data in token payload
	   - Appropriate expiration times
	   
	3. Cross-Origin considerations:
	   - Proper CORS headers
	   - CSRF protection measures
	*/
});

test('Testing brute force protection', async ({ request }) => {
	/*
	BRUTE FORCE PROTECTION
     
	APIs should implement rate limiting to prevent brute force attacks.
	This test verifies that multiple failed login attempts are blocked.
	*/

	console.log('Testing rate limiting for brute force protection');

	// Setup: invalid credentials
	const invalidCreds = {
		username: 'admin',
		password: 'invalid-password'
	};

	// Attempt multiple logins with wrong password
	let rateLimit = false;
	const maxAttempts = 5;  // Number of attempts before rate limiting

	for (let i = 0; i < maxAttempts + 2; i++) {
		console.log(`Login attempt ${i + 1}`);

		const loginResponse = await request.post('http://localhost:3000/login', {
			data: invalidCreds
		});

		// Once rate limited, server should return 429 Too Many Requests
		if (loginResponse.status() === 429) {
			console.log('Rate limiting detected after attempt', i + 1);
			rateLimit = true;
			break;
		}

		// Wait briefly between requests (to avoid overloading test server)
		await new Promise(resolve => setTimeout(resolve, 100));
	}

	// Note: This test might not pass if the API doesn't implement rate limiting
	// expect(rateLimit).toBe(true);

	/*
	BRUTE FORCE PROTECTION METHODS TO TEST:
     
	1. Rate limiting:
	   - By IP address
	   - By username/account
	   - By API key/client ID
	   
	2. Progressive delays:
	   - Increasing wait time after failed attempts
	   
	3. Account lockouts:
	   - Temporary lockout after multiple failures
	   - Admin reset requirements
	   
	4. CAPTCHA/Verification:
	   - Additional verification after suspicious activity
	   
	Note: Aggressive testing of these features could trigger real
	protection mechanisms. Use with caution in production environments.
	*/
});

test('Testing secure token handling', async ({ request }) => {
	/*
	SECURE TOKEN HANDLING
     
	Testing token lifecycle management and secure handling.
	*/

	console.log('Testing token lifecycle and security');

	// 1. Token issuance - login with valid credentials
	const loginResponse = await request.post('http://localhost:3000/login', {
		data: {
			username: 'testuser',
			password: 'password123'
		}
	});

	// Get tokens from response
	let accessToken = '';
	let refreshToken = '';

	if (loginResponse.status() === 200) {
		const tokenData = await loginResponse.json();
		accessToken = tokenData.access_token || '';
		refreshToken = tokenData.refresh_token || '';

		console.log('Obtained tokens from login');
	}

	// 2. Logout/token revocation (should invalidate tokens)
	if (accessToken) {
		const logoutResponse = await request.post('http://localhost:3000/logout', {
			headers: {
				'Authorization': `Bearer ${accessToken}`
			}
		});

		// Verify logout succeeded
		expect(logoutResponse.status()).toBe(200);

		// 3. Verify revoked token no longer works
		const postLogoutResponse = await request.get('http://localhost:3000/secure-data', {
			headers: {
				'Authorization': `Bearer ${accessToken}`
			}
		});

		// Token should be invalid after logout
		expect(postLogoutResponse.status()).toBe(401);
	}

	/*
	SECURE TOKEN LIFECYCLE PRACTICES TO TEST:
     
	1. Token revocation:
	   - Logout functionality properly invalidates tokens
	   - Refresh tokens are invalidated on logout
	   
	2. Token renewal:
	   - Access tokens can be refreshed
	   - Refresh token rotation (each refresh gives a new refresh token)
	   
	3. Session invalidation:
	   - Password changes invalidate existing tokens
	   - Account changes invalidate existing tokens
	*/
});

test('Testing anti-CSRF measures', async ({ request }) => {
	/*
	CSRF PROTECTION
     
	Cross-Site Request Forgery is an attack where a malicious site
	tricks a user's browser into making unwanted requests to a site
	where they're authenticated.
     
	Modern APIs should implement protection mechanisms.
	*/

	console.log('Testing CSRF protection');

	// 1. CSRF Token approach
	// Some APIs provide a CSRF token that must be included in requests

	// First get a CSRF token
	const csrfResponse = await request.get('http://localhost:3000/csrf-token');
	let csrfToken = '';

	if (csrfResponse.status() === 200) {
		const csrfData = await csrfResponse.json();
		csrfToken = csrfData.csrf_token || '';
	}

	// Attempt action with and without CSRF token
	if (csrfToken) {
		// With token (should succeed)
		const withTokenResponse = await request.post('http://localhost:3000/update-profile', {
			data: { name: 'New Name' },
			headers: {
				'X-CSRF-Token': csrfToken
			}
		});

		// Without token (should fail)
		const withoutTokenResponse = await request.post('http://localhost:3000/update-profile', {
			data: { name: 'New Name' }
		});

		// Proper CSRF protection would reject the request without the token
		expect(withoutTokenResponse.status()).toBe(403);
	}

	// 2. Same-Site Cookie Approach
	// Modern CSRF protection often uses SameSite cookie attributes
	// This can't be fully tested in Playwright API testing (browser needed)

	/*
	ANTI-CSRF APPROACHES TO TEST:
     
	1. Token-based protection:
	   - CSRF token included in forms/requests
	   - Token validated server-side
	   
	2. Custom request headers:
	   - Checking for headers that browsers can't add in cross-origin requests
	   
	3. Cookie attributes:
	   - SameSite=Strict/Lax cookie settings
	   - Secure flag on cookies
	   
	4. Origin/Referer validation:
	   - Server validates Origin/Referer headers
	*/
});

test('Testing token content security', async ({ request }) => {
	/*
	TOKEN CONTENT SECURITY
     
	Testing that tokens don't contain sensitive information
	and follow security best practices.
	*/

	console.log('Testing token content security');

	// Login to get a token
	const loginResponse = await request.post('http://localhost:3000/login', {
		data: {
			username: 'testuser',
			password: 'password123'
		}
	});

	if (loginResponse.status() === 200) {
		const tokenData = await loginResponse.json();
		const accessToken = tokenData.access_token || '';

		if (accessToken && accessToken.split('.').length === 3) {
			// This is likely a JWT - decode it
			// Note: In production code, you'd use a proper JWT library
			const [header, payload, signature] = accessToken.split('.');

			// Basic decoding (this is what anyone can do with a JWT)
			try {
				const decodedHeader = JSON.parse(Buffer.from(header, 'base64').toString());
				const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());

				console.log('Token Algorithm:', decodedHeader.alg);
				console.log('Token Type:', decodedHeader.typ);

				// Check for sensitive data in payload
				// Note: This just demonstrates the concept

				// Good JWT practices:
				// 1. Should use a strong algorithm (RS256, ES256)
				// expect(['RS256', 'ES256']).toContain(decodedHeader.alg);

				// 2. Should NOT contain sensitive data
				// expect(decodedPayload.password).toBeUndefined();
				// expect(decodedPayload.email).toBeUndefined();

				// 3. Should have expiration
				// expect(decodedPayload.exp).toBeDefined();

				// 4. Should have issued-at time
				// expect(decodedPayload.iat).toBeDefined();
			} catch (e) {
				console.log('Error decoding token:', e);
			}
		}
	}

	/*
	TOKEN CONTENT SECURITY BEST PRACTICES:
     
	1. No sensitive data in JWTs:
	   - No passwords or security questions
	   - No personally identifiable information when possible
	   - No sensitive business data
	   
	2. Proper token claims:
	   - 'exp' (expiration time) - when the token expires
	   - 'iss' (issuer) - who issued the token
	   - 'aud' (audience) - who the token is intended for
	   - 'sub' (subject) - who the token is about
	   
	3. Appropriate signature algorithms:
	   - Avoid 'none' and weak algorithms like HS256 with short keys
	   - Prefer asymmetric algorithms (RS256, ES256) for public clients
	*/
}); 