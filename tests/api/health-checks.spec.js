import { test, expect } from '@playwright/test';

test.describe('API Health Monitoring', () => {
  const API_BASE_URL = 'http://localhost:3000';
  const HEALTH_ENDPOINT = '/api/health';

  test.beforeEach(async ({ page }) => {
    // Set up any necessary authentication or headers
    await page.setExtraHTTPHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  });

  test('should respond to health check endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
    
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('should return correct health status structure', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
    const healthData = await response.json();
    
    expect(healthData).toHaveProperty('status');
    expect(healthData).toHaveProperty('timestamp');
    expect(healthData).toHaveProperty('uptime');
    expect(healthData).toHaveProperty('environment');
    expect(healthData).toHaveProperty('version');
    expect(healthData).toHaveProperty('api_type');
    expect(healthData).toHaveProperty('database');
    
    expect(healthData.status).toMatch(/^(healthy|unhealthy)$/);
    expect(healthData.api_type).toBe('Next.js API Routes');
    expect(healthData.version).toBe('1.0.0');
  });

  test('should validate database connectivity in health check', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
    const healthData = await response.json();
    
    expect(healthData.database).toHaveProperty('connected');
    expect(typeof healthData.database.connected).toBe('boolean');
    
    if (healthData.database.connected) {
      expect(healthData.database).toHaveProperty('stats');
      expect(healthData.status).toBe('healthy');
    } else {
      expect(healthData.status).toBe('unhealthy');
      expect(response.status()).toBe(503);
    }
  });

  test('should measure API response time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    
    console.log(`Health check response time: ${responseTime}ms`);
  });

  test('should validate timestamp format', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
    const healthData = await response.json();
    
    // Validate ISO 8601 timestamp format
    const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    expect(healthData.timestamp).toMatch(timestampRegex);
    
    // Validate timestamp is recent (within last 5 seconds)
    const timestampDate = new Date(healthData.timestamp);
    const now = new Date();
    const timeDiff = now.getTime() - timestampDate.getTime();
    
    expect(timeDiff).toBeLessThan(5000);
  });

  test('should validate uptime is a number', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
    const healthData = await response.json();
    
    expect(typeof healthData.uptime).toBe('number');
    expect(healthData.uptime).toBeGreaterThan(0);
  });

  test('should validate environment configuration', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
    const healthData = await response.json();
    
    const validEnvironments = ['development', 'production', 'test', 'staging'];
    expect(validEnvironments).toContain(healthData.environment);
  });

  test('should handle multiple concurrent health checks', async ({ request }) => {
    const concurrentRequests = 5;
    const promises = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(request.get(`${API_BASE_URL}${HEALTH_ENDPOINT}`));
    }
    
    const responses = await Promise.all(promises);
    
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
  });

  test('should test health endpoint with different HTTP methods', async ({ request }) => {
    // Test GET method (should work)
    const getResponse = await request.get(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
    expect(getResponse.status()).toBe(200);
    
    // Test POST method (should return 405 Method Not Allowed)
    const postResponse = await request.post(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
    expect(postResponse.status()).toBe(405);
    
    // Test PUT method (should return 405 Method Not Allowed)
    const putResponse = await request.put(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
    expect(putResponse.status()).toBe(405);
    
    // Test DELETE method (should return 405 Method Not Allowed)
    const deleteResponse = await request.delete(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
    expect(deleteResponse.status()).toBe(405);
  });

  test('should validate health endpoint under load', async ({ request }) => {
    const loadTestDuration = 5000; // 5 seconds
    const requestInterval = 100; // 100ms
    const startTime = Date.now();
    const results = [];
    
    while (Date.now() - startTime < loadTestDuration) {
      const requestStart = Date.now();
      const response = await request.get(`${API_BASE_URL}${HEALTH_ENDPOINT}`);
      const requestEnd = Date.now();
      
      results.push({
        status: response.status(),
        responseTime: requestEnd - requestStart
      });
      
      await new Promise(resolve => setTimeout(resolve, requestInterval));
    }
    
    // Validate all requests succeeded
    results.forEach(result => {
      expect(result.status).toBe(200);
      expect(result.responseTime).toBeLessThan(3000); // Under 3 seconds
    });
    
    // Calculate average response time
    const averageResponseTime = results.reduce((sum, result) => sum + result.responseTime, 0) / results.length;
    console.log(`Average response time under load: ${averageResponseTime.toFixed(2)}ms`);
    console.log(`Total requests processed: ${results.length}`);
  });
});