# API Testing Assessment Overview

This assessment evaluates students' understanding of fundamental API testing concepts using Playwright, focusing on the following key areas covered in our lessons:

## Core Concepts to Assess

### Data Retrieval and Validation
The first area should assess students' ability to interact with REST APIs, particularly their understanding of making GET requests with query parameters. Students should demonstrate knowledge of how to filter data server-side using appropriate URL parameters and validate response data. The assessment should verify they understand how to make assertions about response status codes and the content of response bodies.

Key skills to test include:
- Making parameterized GET requests
- Handling JSON response data
- Writing appropriate assertions for data validation
- Understanding server-side filtering mechanisms

### API Error Handling and Validation
Students should demonstrate their understanding of API validation and error handling. This involves constructing deliberately invalid requests to verify the API's validation mechanisms function correctly. The focus should be on ensuring students can identify appropriate status codes for error conditions and validate error message content.

Key skills to test include:
- Constructing incomplete or invalid request bodies
- Interpreting HTTP 400-level status codes
- Validating error message content
- Understanding API validation requirements

### Authentication Fundamentals
Authentication is a critical aspect of API testing. The assessment should verify students' understanding of Bearer token authentication, including the difference between authenticated, unauthorized, and forbidden states. Students should demonstrate knowledge of how to include authentication headers in requests and interpret different authentication-related status codes.

Key skills to test include:
- Constructing requests with Bearer token authentication
- Understanding the authentication header format
- Differentiating between 401 (unauthorized) and 403 (forbidden) status codes
- Testing both positive and negative authentication scenarios

### Authentication Methods Comparison
The assessment should evaluate students' theoretical understanding of different authentication methods by having them compare approaches. This should go beyond just Bearer tokens to include Basic Authentication and API Key mechanisms. Students should demonstrate knowledge of each method's technical implementation, security characteristics, and appropriate use cases.

Key skills to test include:
- Explaining how different authentication mechanisms work
- Identifying security considerations for each approach
- Recommending appropriate contexts for different authentication methods
- Implementing at least one authentication method in code

## Assessment Format

The assessment should consist of three practical tasks:

1. A task focusing on data retrieval and validation, requiring students to make requests with query parameters and validate response content.

2. A task focusing on authentication implementation, requiring students to test multiple authentication scenarios against a protected endpoint.

3. A task combining practical implementation with theoretical knowledge, requiring students to demonstrate understanding of different authentication methods, implement one method of their choice, and explain security considerations.

A optional bonus question on security best practices could also be included to challenge advanced students.

## Task 1: API Filtering and Data Validation

**Scenario:**
You are working with a REST API at `http://localhost:3000` that contains information about blog posts. Each post has a `userId` field indicating which user created it.

**Task:**
1. Write a test using Playwright that verifies a specific user (userId=1) has created at least 2 posts
2. Write another test that attempts to create a post with missing required fields and checks that the server properly rejects it

**Example Code Structure:**
```javascript
import { test, expect } from '@playwright/test';

test('Check if a user has created multiple posts', async ({ request }) => {
    // Your code here to:
    // - Make a GET request with appropriate query parameter
    // - Verify the status code is 200
    // - Validate that the user has at least 2 posts
    // - Check that all returned posts have the correct userId
});

test('POST /posts fails with missing required fields', async ({ request }) => {
    // Your code here to:
    // - Create an incomplete post object (missing a required field)
    // - Send a POST request to create the post
    // - Verify the server rejects it with 400 status
    // - Check the error message mentions missing fields
});
```

## Task 2: Bearer Token Authentication

**Scenario:**
Your API server protects certain endpoints using Bearer token authentication. The endpoint `/secure-data` requires a valid token.

**Task:**
Create a test suite that verifies:
1. Requests without authentication are rejected with 401 Unauthorized
2. Requests with an invalid token are rejected with 403 Forbidden
3. Requests with a valid token (use 'my-secret-token') succeed with 200 OK

**Example Code Structure:**
```javascript
import { test, expect } from '@playwright/test';

const SECRET_TOKEN = 'my-secret-token';

test('GET /secure-data authentication scenarios', async ({ request }) => {
    // Test 1: No authentication
    // Your code here to:
    // - Make a request without any authentication header
    // - Verify 401 status code
    
    // Test 2: Invalid authentication
    // Your code here to:
    // - Make a request with an incorrect bearer token
    // - Verify 403 status code
    
    // Test 3: Valid authentication
    // Your code here to:
    // - Make a request with the correct bearer token
    // - Verify 200 status code and response content
});
```

## Task 3: Authentication Methods Comparison

**Scenario:**
Modern APIs use different authentication methods. Your team needs to evaluate which authentication method to use for a new API.

**Task:**
Write a short report (250-300 words) comparing the following authentication methods:
1. Basic Authentication
2. API Key Authentication
3. Bearer Token (OAuth 2.0)

For each method, explain:
- How it works (technically)
- Security considerations
- Appropriate use cases 
- Implementation complexity

Then, create a simple code example for ONE of these methods (your choice) using Playwright's request object.

**Example Code Structure (for your chosen method):**
```javascript
import { test, expect } from '@playwright/test';

test('Authentication example', async ({ request }) => {
    // Your code here implementing ONE of:
    // - Basic Authentication
    // - API Key Authentication
    // - Bearer Token Authentication
    
    // Make a request to a protected endpoint using your chosen method
    // Verify successful authentication (200 status)
});
```

**Bonus Question:**
Explain why storing JWT tokens in localStorage is considered a security risk, and suggest a more secure alternative for web applications. 