import { test, expect } from '@playwright/test';



/*
We have two keywords here:

1. Authentication
- Authentication is the process if VERIFYING the identity of a user or system. -- see the captcha example way below
- In the context of API's, it ensure that only verified clients or users can access the system.

2. Authorization
- Authorization determines what an authenticaed user is allowed to do. For example, a user may be authenticated but not AUTHORIZED to access
- admin only endpoints

-- We know, we expect, if I make a purchase - that my banking app on my phone will say 'hey, someone's trying to buy something' - do you agree?
-- If I then agree - I am authorized - or the system is authorized to make the purchase


*/

/*
Why do API's need authentication?
* Protect senstive data 
* Prevent unauthorized access

*/

/*

Few different common authentication methods
Basic Auth - Send a username and password in every request (this is not secure haha)
API Key - Static key used to identify a client or service
OAuth2 + Bearer Token - A more secure, flexible token-based system. In my experience, this is very commonly used for modern api's

*/

/*
What is a bearer token - it's a string that identifies a user/session and is used to access protected routes/resources. It 'bears' the access rights.
//Let's define the word 'bearer' (not in code context just in general)
//Bearer is a word that means 'to carry' or 'to hold'

//How does works?
1. User logs in with credentials (username and password)
2. API Says I'm logged in and then it responds with a bearer token
3. It allows the client to send the token with every future request using the authorization header.

// Token have different formats or variations
// The most common one you'll see and what we'll work with - JWT (Json Web Token)
// Usually looks like : ayAws6ci0i...

A JWT has three parts, seperated by dots
1. Header - specifies the signing algorithm
2. Payload - user and whatever permissions the user may or may not have
3. Signature - to verifies the integrity of the token

/GET /secure-data
Authorization: Bearer ayAws6ci0iIUz1NuIChCRRR...

* Treat tokens like passwords
* Never store them in anything that's public 
* Tokens are stateless - NO SESSION IS STORED ON THE SERVER

What could happen if someone gets hold of my bearer token???? AND HOW?

-- Linus Media Group had a breach a few months ago - something something session/token/etc related




10 things to the first character, 8 things to seconed - 





// What is a Captcha check defined is just in general when I register for example - Thank you Ashley for the good question
// I have to do a captcha check to prove I'm human - Does it have something to do with authentication or authorization?
// It has to do with authentication - because it's verifying my identity 
// It's a security measure to prevent automation or bots from registering or accessing accounts



*/

// The token used by the API server for authentication (from api-server.js)
const SECRET_TOKEN = 'my-secret-token';

test.only('GET /secure-data requires valid token', async ({ request }) => {
    // This test demonstrates authentication using the Auth header
    // We'll test three scenarios: no token, invalid token, valid token

    //Test 1: No Authentication - Let's pretend, this endpoint houses america's nuclear launch codes that will destroy world
    console.log('Test 1: No Authentication - attempting to access secure data without a token');
    let response = await request.get('http://localhost:3000/secure-data');

    //We expect a 401 unauthorized token
    expect(response.status()).toBe(401);

    // Check the error message
    const responseBody = await response.json();
    console.log(responseBody);
    expect(responseBody.error).toContain('Unauthorized');

    //Test 2: Invalid Auth token
    console.log('Test 2: Invalid Authentication - using an incorrect token');
    let response2 = await request.get('http://localhost:3000/secure-data', {
        headers: { 'Authorization': 'Bearer right-token' }
    });
    let response20000 = await request.get('http://localhost:3000/secure-data', {
        headers: { 'X-API-Key': 'your_api_key_12345' }
    });

    // //We expect a 403 forbidden response (we authenticated but don't have access)
    expect(response2.status()).toBe(403);

    // // Check the error message
    const responseBody2 = await response2.json();
    console.log(responseBody2);
    expect(responseBody2.error).toContain('Forbidden');

    //Test 3: Valid Auth token
    console.log('Test 3: Valid Authentication - using the correct token');
    let response3 = await request.get('http://localhost:3000/bankingPage', {
        headers: { 'Authorization': `Bearer abcd` }
    });

    // We expect a successful response
    expect(response3.status()).toBe(200);

    // Check the response content
    const secureData = await response3.json();
    console.log(secureData);
    expect(secureData.message).toContain('This is secure data');

    // Verify we get user context in the response
    expect(secureData.user).toBeDefined();
    expect(secureData.user.roles).toContain('admin');


    console.log('All authentication tests passed successfully!');
});