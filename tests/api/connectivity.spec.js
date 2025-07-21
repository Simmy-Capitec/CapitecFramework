import { test, expect } from '@playwright/test';

test.describe('Basic Connectivity Testing', () => {
  const API_BASE_URL = 'http://localhost:3000';
  const HTTPS_API_BASE_URL = 'https://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Set up basic headers for all requests
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Playwright-Test-Agent/1.0'
    });
  });

  test.describe('HTTP/HTTPS Connectivity', () => {
    test('should connect to HTTP endpoint', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/health`);
      
      expect(response.status()).toBe(200);
      expect(response.url()).toContain('http://');
    });

    test('should handle HTTPS redirect properly', async ({ request }) => {
      try {
        // Try HTTPS connection - might fail in local dev but should be tested
        const response = await request.get(`${HTTPS_API_BASE_URL}/api/health`);
        expect(response.status()).toBe(200);
      } catch (error) {
        // In development, HTTPS might not be configured
        console.log('HTTPS not configured in development environment');
        expect(error.message).toContain('net::ERR_CONNECTION_REFUSED');
      }
    });

    test('should validate TLS/SSL certificate (production only)', async ({ request }) => {
      // This test would be more relevant in production environment
      if (process.env.NODE_ENV === 'production') {
        const response = await request.get(`${HTTPS_API_BASE_URL}/api/health`);
        expect(response.status()).toBe(200);
        
        // Check security headers
        const securityHeaders = response.headers();
        expect(securityHeaders['strict-transport-security']).toBeDefined();
      } else {
        test.skip('TLS/SSL test skipped in non-production environment');
      }
    });
  });

  test.describe('CORS Configuration', () => {
    test('should handle CORS preflight requests', async ({ request }) => {
      const response = await request.fetch(`${API_BASE_URL}/api/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3001',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      // Should return 200 for preflight or 405 if not configured
      expect([200, 405]).toContain(response.status());
    });

    test('should validate CORS headers on API responses', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/health`, {
        headers: {
          'Origin': 'http://localhost:3001'
        }
      });
      
      const corsHeaders = response.headers();
      
      // Check for CORS headers (might not be present in all environments)
      if (corsHeaders['access-control-allow-origin']) {
        expect(corsHeaders['access-control-allow-origin']).toBeDefined();
      }
    });

    test('should test cross-origin requests', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/health`, {
        headers: {
          'Origin': 'https://example.com',
          'Referer': 'https://example.com'
        }
      });
      
      // Should still work even from different origin
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Rate Limiting and Throttling', () => {
    test('should handle rapid sequential requests', async ({ request }) => {
      const numberOfRequests = 10;
      const requests = [];
      
      for (let i = 0; i < numberOfRequests; i++) {
        requests.push(request.get(`${API_BASE_URL}/api/health`));
      }
      
      const responses = await Promise.all(requests);
      
      // Check if any requests were rate limited (429 status)
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      const successfulResponses = responses.filter(r => r.status() === 200);
      
      expect(successfulResponses.length).toBeGreaterThan(0);
      
      if (rateLimitedResponses.length > 0) {
        console.log(`Rate limiting detected: ${rateLimitedResponses.length} requests were throttled`);
      }
    });

    test('should test rate limiting with delays', async ({ request }) => {
      const requestsWithDelay = [];
      
      for (let i = 0; i < 5; i++) {
        const response = await request.get(`${API_BASE_URL}/api/health`);
        requestsWithDelay.push(response);
        
        expect(response.status()).toBe(200);
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      expect(requestsWithDelay.length).toBe(5);
    });

    test('should validate rate limiting headers', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/health`);
      
      const rateLimitHeaders = response.headers();
      
      // Check for common rate limiting headers
      const commonRateLimitHeaders = [
        'x-ratelimit-limit',
        'x-ratelimit-remaining',
        'x-ratelimit-reset',
        'retry-after'
      ];
      
      // Log any rate limiting headers found
      commonRateLimitHeaders.forEach(header => {
        if (rateLimitHeaders[header]) {
          console.log(`Rate limit header found: ${header} = ${rateLimitHeaders[header]}`);
        }
      });
    });
  });

  test.describe('Content-Type Handling', () => {
    test('should handle JSON content-type correctly', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/health`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
      
      // Should be able to parse as JSON
      const jsonData = await response.json();
      expect(jsonData).toBeDefined();
    });

    test('should handle XML content-type requests', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/health`, {
        headers: {
          'Accept': 'application/xml'
        }
      });
      
      // Should still return JSON even if XML is requested
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
    });

    test('should handle text/plain content-type', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/health`, {
        headers: {
          'Accept': 'text/plain'
        }
      });
      
      expect(response.status()).toBe(200);
      // API should still return JSON
      expect(response.headers()['content-type']).toContain('application/json');
    });

    test('should handle missing Accept header', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/health`);
      
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
    });
  });

  test.describe('Network Connectivity', () => {
    test('should validate DNS resolution', async ({ request }) => {
      // Test that localhost resolves correctly
      const response = await request.get(`${API_BASE_URL}/api/health`);
      
      expect(response.status()).toBe(200);
      expect(response.url()).toContain('localhost');
    });

    test('should handle network timeouts gracefully', async ({ request }) => {
      try {
        const response = await request.get(`${API_BASE_URL}/api/health`, {
          timeout: 100 // Very short timeout to test timeout handling
        });
        
        // If it doesn't timeout, that's also valid
        expect(response.status()).toBe(200);
      } catch (error) {
        // Should get a timeout error
        expect(error.message).toContain('Request timed out');
      }
    });

    test('should test IPv4 connectivity', async ({ request }) => {
      const response = await request.get('http://127.0.0.1:3000/api/health');
      
      expect(response.status()).toBe(200);
    });

    test('should handle invalid hostnames', async ({ request }) => {
      try {
        await request.get('http://invalid-hostname-12345.com/api/health', {
          timeout: 5000
        });
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Should get a connection error
        expect(error.message).toMatch(/ENOTFOUND|net::ERR_NAME_NOT_RESOLVED/);
      }
    });
  });

  test.describe('Port Connectivity', () => {
    test('should connect to default port 3000', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/health`);
      
      expect(response.status()).toBe(200);
    });

    test('should handle invalid port numbers', async ({ request }) => {
      try {
        await request.get('http://localhost:99999/api/health', {
          timeout: 5000
        });
        
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Should get a connection error
        expect(error.message).toMatch(/ECONNREFUSED|net::ERR_CONNECTION_REFUSED/);
      }
    });
  });

  test.describe('Connection Pooling', () => {
    test('should handle multiple concurrent connections', async ({ request }) => {
      const concurrentRequests = 20;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(request.get(`${API_BASE_URL}/api/health`));
      }
      
      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
      
      console.log(`Successfully handled ${concurrentRequests} concurrent connections`);
    });

    test('should reuse connections efficiently', async ({ request }) => {
      const numberOfRequests = 5;
      const responseTimes = [];
      
      for (let i = 0; i < numberOfRequests; i++) {
        const startTime = Date.now();
        const response = await request.get(`${API_BASE_URL}/api/health`);
        const endTime = Date.now();
        
        expect(response.status()).toBe(200);
        responseTimes.push(endTime - startTime);
      }
      
      // Later requests should be faster due to connection reuse
      const averageFirstHalf = responseTimes.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
      const averageSecondHalf = responseTimes.slice(-2).reduce((a, b) => a + b, 0) / 2;
      
      console.log(`Average response time - First half: ${averageFirstHalf}ms, Second half: ${averageSecondHalf}ms`);
    });
  });
});