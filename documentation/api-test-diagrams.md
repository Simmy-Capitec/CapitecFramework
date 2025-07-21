# API Testing Visual Guide

## Test Snippet #1: GET /posts with filtering
```
┌─────────────────┐         ┌──────────────────┐         ┌───────────────────┐
│                 │ GET     │                  │         │                   │
│  Playwright     ├────────►│  API Server      │─────────►  In-Memory DB     │
│  Test Client    │/posts?  │  /posts endpoint │         │  posts collection │
│                 │userId=1 │                  │         │                   │
└─────────┬───────┘         └──────────┬───────┘         └───────────────────┘
          │                            │                           │
          │                            │                           │
          │                            │ Filter posts              │
          │                            │ where userId=1            │
          │                            ◄───────────────────────────┘
          │                            │
          │         [                  │
          │           {id:1, userId:1, ...},
          │           {id:3, userId:1, ...}, 
          │           {id:7, userId:1, ...}
          │         ]                  │
          ◄────────────────────────────┘
          │
┌─────────▼───────┐
│ ASSERTIONS:     │
│ ✓ Status 200    │
│ ✓ All posts     │
│   have userId=1 │
│ ✓ At least 2    │
│   posts returned│
└─────────────────┘
```

## Test Snippet #2: POST /posts with validation failure
```
┌─────────────────┐         ┌──────────────────┐         
│                 │ POST    │                  │         
│  Playwright     ├────────►│  API Server      │
│  Test Client    │ /posts  │  Data Validation │
│                 │         │                  │
└─────────┬───────┘         └──────────┬───────┘         
          │                            │                           
          │ { userId:1,                │                           
          │   body:"This post body     │                          
          │   is fine" }               │ ✗ Validation fails:                         
          │   (title missing)          │ Title is required                    
          │                            │                   
          │         {                  │
          │           error: "Missing  │
          │           required fields" │ 
          │         }                  │
          │         Status: 400        │
          ◄────────────────────────────┘
          │
┌─────────▼───────┐
│ ASSERTIONS:     │
│ ✓ Status 400    │
│ ✓ Error message │
│   mentions      │
│   missing fields│
└─────────────────┘
```

## Test Snippet #3: Bearer Token Authentication
```
┌─────────────────┐         ┌───────────────────────┐         
│                 │ GET     │                       │         
│  Playwright     ├─────────► Case 1: No Token      │
│  Test Client    │/secure- │ Response: 401         │
│                 │data     │ (Unauthorized)        │
│                 │         └───────────────────────┘
│                 │         
│                 │         ┌───────────────────────┐
│                 │ GET     │                       │
│                 ├─────────► Case 2: Invalid Token │
│                 │/secure- │ "Bearer wrong-token"  │
│                 │data     │ Response: 403         │
│                 │         │ (Forbidden)           │
│                 │         └───────────────────────┘
│                 │         
│                 │         ┌───────────────────────┐
│                 │ GET     │                       │
│                 ├─────────► Case 3: Valid Token   │
│                 │/secure- │ "Bearer my-secret-token" │
│                 │data     │ Response: 200 OK      │
└─────────┬───────┘         └───────────────────────┘
          │
┌─────────▼───────┐
│ ASSERTIONS:     │
│ ✓ No token: 401 │
│ ✓ Wrong: 403    │
│ ✓ Valid: 200    │
│ ✓ Success msg   │
│   contains      │
│   "access granted"│
└─────────────────┘
```

## Test Snippet #4: Authentication Methods
```
┌─────────────────┐         ┌─────────────────────────┐         
│                 │ GET     │                         │         
│  Playwright     ├─────────► Header:                 │
│  Test Client    │/basic-  │ "Authorization: Basic   │
│                 │auth-    │  dGVzdHVzZXI6cGFzc3dvcmQxMjM=" │
│                 │endpoint │ (testuser:password123)  │
└─────────┬───────┘         └───────────┬─────────────┘         
          │                             │                           
          │                             │ ✓ Decode & validate                         
          │                             │   credentials                    
          │                             │                   
          │         {                   │
          │           message: "Successfully authenticated", │ 
          │           user: { username: "testuser", ... }    │
          │         }                   │
          │         Status: 200         │
          ◄─────────────────────────────┘
          │
┌─────────▼───────┐
│ BASIC AUTH:     │
│ ✓ Status 200    │
│ ✓ Auth success  │
│ ✓ User data     │
└─────────────────┘

┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│                 │ GET     │                      │         │                 │
│  Playwright     ├────────►│  API Server          │─────────►  API_KEYS store │
│  Test Client    │/api-key-│  apiKeyAuth          │         │  Lookup key     │
│                 │endpoint │  middleware          │         │                 │
└─────────┬───────┘         └──────────┬───────────┘         └────────┬────────┘
          │                            │                              │
          │ Header:                    │                              │
          │ "X-API-Key:                │ Check if API key             │
          │  api-key-12345"            │ exists & is valid            │
          │                            ◄──────────────────────────────┘
          │                            │
          │                            │ ✓ API key is valid
          │                            │ Set user context based on key
          │                            │
          │         {                  │
          │           message: "Successfully authenticated", │ 
          │           user: { userId: 1, role: "user" }      │ 
          │         }                  │
          │         Status: 200        │
          ◄────────────────────────────┘
          │
┌─────────▼───────┐
│ API KEY AUTH:   │
│ ✓ Status 200    │
│ ✓ Auth success  │
│ ✓ User details  │
└─────────────────┘
```

## Test Snippet #5: Token Expiry and Refresh
```
┌─────────────────┐         ┌───────────────────────┐         
│                 │ GET     │                       │         
│  Playwright     ├─────────► Step 1: Valid token   │
│  Test Client    │/secure- │ access succeeds       │
│                 │data     │ Response: 200 OK      │
│                 │         └───────────────────────┘
│                 │         
│                 │         ┌───────────────────────┐
│                 │         │                       │
│ TokenManager    │         │ Step 2: Simulate      │
│ expires token   │         │ token expiry by       │
│                 │         │ setting expiry        │
│                 │         │ timestamp to past     │
│                 │         └───────────────────────┘
│                 │         
│                 │         ┌───────────────────────┐
│                 │ GET     │                       │
│                 ├─────────► Step 3: Detect        │
│                 │/secure- │ expired token and     │
│                 │data     │ auto-refresh          │
└─────────┬───────┘         └───────────────────────┘
          │
          │
          │         ┌────────────────────────┐
          │ POST    │                        │
          ├────────►│  /refresh-token        │
          │         │  endpoint              │
          │         │                        │
          │         └──────────┬─────────────┘
          │                    │                           
          │ { refresh_token:   │                           
          │   "refresh-..." }  │ ✓ Issue new token               
          │                    │                   
          │                    │
          │         {          │
          │           access_token: "new-token", │ 
          │           expires_in: 3600│
          │         }          │
          │         Status: 200│
          ◄────────────────────┘
          │
┌─────────▼───────────────┐
│ ASSERTIONS:             │
│ ✓ Initial token works   │
│ ✓ After expiry, system  │
│   automatically refreshes│
│   token                 │
│ ✓ New token works for   │
│   secured endpoints     │
└─────────────────────────┘
```

## Test Snippet #6: Role-Based Access Control (RBAC)
```
┌─────────────────┐         ┌───────────────────────┐         
│                 │ GET     │                       │         
│  Playwright     ├─────────► /user-profile endpoint│
│  Test Client    │         │ Auth + any role OK    │
│  (user role)    │ Bearer  │ Response: 200 OK      │
│                 │ token   │ (Basic profile)       │
└─────────┬───────┘         └───────────────────────┘
          │                            
          │         ┌───────────────────────┐
          │ GET     │                       │
          ├─────────► /admin-only endpoint  │
          │         │ Auth + role check     │
          │ Bearer  │ Response: 403         │
          │ token   │ (Forbidden: Requires  │
          │         │  admin role)          │
└─────────┬───────┘ └───────────────────────┘
          │
┌─────────▼───────────────┐
│ TEST SCENARIO:          │
│ When using a "user" role│
│ token:                  │
│ ✓ Can access basic user │
│   endpoints             │
│ ✓ Cannot access admin   │
│   endpoints (403)       │
└─────────────────────────┘


┌─────────────────┐         ┌───────────────────────┐         
│                 │ GET     │                       │         
│  Playwright     ├─────────► /user-profile endpoint│
│  Test Client    │         │ Auth + any role OK    │
│  (admin role)   │ Bearer  │ Response: 200 OK      │
│                 │ token   │ (Basic profile)       │
└─────────┬───────┘         └───────────────────────┘
          │                            
          │         ┌───────────────────────┐
          │ GET     │                       │
          ├─────────► /admin-only endpoint  │
          │         │ Auth + role check     │
          │ Bearer  │ Response: 200 OK      │
          │ token   │ (Admin data returned) │
          │         │                       │
└─────────┬───────┘ └───────────────────────┘
          │
┌─────────▼───────────────┐
│ TEST SCENARIO:          │
│ When using an "admin"   │
│ role token:             │
│ ✓ Can access basic user │
│   endpoints             │
│ ✓ Can also access admin │
│   endpoints (200)       │
└─────────────────────────┘
```

## Test Snippet #7: Security Best Practices
```
┌─────────────────┐         ┌──────────────────────────┐         
│                 │ Multiple│                          │         
│  Playwright     ├────────►│  Brute force protection  │
│  Test Client    │ failed  │  Rate limiting           │
│                 │ logins  │                          │
└─────────┬───────┘         └──────────┬───────────────┘         
          │                            │                           
          │ Attempt 1: Invalid login   │                           
          ├───────────────────────────►│                          
          │ Attempt 2: Invalid login   │ Count failed                        
          ├───────────────────────────►│ attempts                  
          │ Attempt 3: Invalid login   │                  
          ├───────────────────────────►│                  
          │ Attempt 4: Invalid login   │
          ├───────────────────────────►│
          │ Attempt 5: Invalid login   │
          ├───────────────────────────►│
          │                            │ Rate limit triggered
          │ Attempt 6: Invalid login   │ after threshold
          ├───────────────────────────►│
          │                            │
          │         {                  │
          │           error: "Too many requests", │ 
          │           retry_after: 30  │
          │         }                  │
          │         Status: 429        │
          ◄────────────────────────────┘
          │
┌─────────▼───────────────┐
│ SECURITY ASSERTIONS:    │
│ ✓ Rate limiting works   │
│   after multiple failed │
│   attempts              │
│ ✓ 429 status returned   │
│   with retry information│
└─────────────────────────┘

┌─────────────────┐         ┌──────────────────────────┐         
│                 │ POST    │                          │         
│  Playwright     ├────────►│  CSRF protection check   │
│  Test Client    │/update- │                          │
│                 │profile  │                          │
└─────────┬───────┘         └──────────┬───────────────┘         
          │                            │                           
          │ Without CSRF token         │                           
          │                            │ Reject request without                         
          │                            │ CSRF token                    
          │                            │                   
          │         {                  │
          │           error: "Missing CSRF token" │ 
          │         }                  │
          │         Status: 403        │
          ◄────────────────────────────┘
          │
          │ GET     ┌──────────────────┐
          ├────────►│                  │
          │/csrf-   │  Get CSRF token  │
          │token    │                  │
          │         └────────┬─────────┘
          │                  │
          │  { csrf_token: "abc123" }  │
          ◄──────────────────┘
          │
          │ POST    ┌──────────────────────────┐
          ├────────►│                          │
          │/update- │  With valid CSRF token   │
          │profile  │  in header               │
          │         └──────────┬───────────────┘
          │                    │
          │ X-CSRF-Token: "abc123"  │
          │                    │ Accept request with
          │                    │ valid CSRF token
          │                    │
          │         {          │
          │           success: true │
          │         }          │
          │         Status: 200│
          ◄────────────────────┘
          │
┌─────────▼───────────────┐
│ SECURITY ASSERTIONS:    │
│ ✓ Requests without CSRF │
│   token are rejected    │
│ ✓ Valid CSRF token      │
│   allows the operation  │
└─────────────────────────┘
```

## Test Snippet #8: Real-World API Scenarios
```
┌─────────────────┐         ┌──────────────────────┐         ┌───────────────┐
│                 │ GET     │                      │         │               │
│  Playwright     ├────────►│  API Server          │─────────► In-Memory DB  │
│  Test Client    │ /posts/8│  Retrieve post #8    │         │ posts[8]      │
│                 │         │                      │         │ title: null   │
└─────────┬───────┘         └──────────┬───────────┘         └───────────────┘
          │                            │                           │
          │                            ◄───────────────────────────┘
          │                            │
          │        {                   │
          │          id: 8,            │
          │          title: null,      │ 
          │          ...               │
          │        }                   │
          │        Status: 200         │
          ◄────────────────────────────┘
          │
          │
          │         ┌──────────────────────┐         ┌───────────────┐
          │ PUT     │                      │         │               │
          ├────────►│  API Server          │         │ In-Memory DB  │
          │/posts/8 │  Data Validation     │         │ posts[8]      │
          │         │                      │         │               │
          │         └──────────┬───────────┘         └───────────────┘
          │                    │                           
          │ Payload:           │                           
          │ {                  │ ✗ Validation fails:
          │   title: null,     │ title cannot be null
          │   ...              │                   
          │ }                  │                   
          │                    │
          │         {          │
          │           error: "Validation Error" │ 
          │         }          │
          │         Status: 400│
          ◄────────────────────┘
          │
┌─────────▼───────┐
│ ASSERTIONS:     │
│ ✓ GET succeeds  │
│   even with bad │
│   data          │
│ ✓ PUT with bad  │
│   data fails    │
│   validation    │
└─────────────────┘
```

## Test Snippet #9: Token Lifecycle Management
```
┌─────────────────┐         ┌───────────────────────┐         ┌───────────────┐
│                 │ POST    │                       │         │               │
│  Playwright     ├────────►│  /login endpoint      │─────────►  User Store   │
│  Test Client    │ /login  │  Credential Check     │         │  Validate     │
│                 │         │                       │         │  credentials  │
└─────────┬───────┘         └──────────┬────────────┘         └───────┬───────┘
          │                            │                              │
          │ { username: "testuser",    │                              │
          │   password: "password123"} │                              │
          │                            ◄──────────────────────────────┘
          │                            │
          │                            │ ✓ Credentials valid
          │                            │ Generate tokens
          │                            │
          │         {                  │
          │           access_token: "my-secret-token", │ 
          │           refresh_token: "refresh-token-123", │ 
          │           expires_in: 3600 │
          │         }                  │
          │         Status: 200        │
          ◄────────────────────────────┘
          │
          │                            ┌─────────────────────────┐
          │ GET                        │                         │
          ├───────────────────────────►│ /secure-data endpoint   │
          │ Authorization:             │ Verify token            │
          │ "Bearer my-secret-token"   │                         │
          │                            └─────────┬───────────────┘
          │                                      │
          │                                      │ ✓ Token valid
          │                                      │
          │            Protected data            │
          │            Status: 200               │
          ◄──────────────────────────────────────┘
          │
          │                            ┌─────────────────────────┐
          │ POST                       │                         │
          ├───────────────────────────►│ /refresh-token endpoint │
          │ { refresh_token:           │ Check refresh token     │
          │   "refresh-token-123" }    │                         │
          │                            └─────────┬───────────────┘
          │                                      │
          │                                      │ ✓ Refresh token valid
          │                                      │ Generate new access token
          │                                      │
          │           { access_token: "new-token", │
          │             expires_in: 3600 }       │
          │           Status: 200               │
          ◄──────────────────────────────────────┘
          │
┌─────────▼───────────────┐
│ ASSERTIONS:             │
│ ✓ Login returns tokens  │
│ ✓ Access token works    │
│   for protected endpoint│
│ ✓ Refresh token can be  │
│   exchanged for new     │
│   access token          │
└─────────────────────────┘
```

## Test Snippet #10: Authentication Fixtures Pattern
```
┌─────────────────┐         ┌──────────────────────────┐         
│                 │         │                          │         
│  Playwright     │         │  Custom Fixtures         │
│  Test Framework │         │  (Auth Helpers)          │
│                 │         │                          │
└─────────┬───────┘         └──────────┬───────────────┘         
          │                            │                           
          │ Define fixture:            │                           
          │ authToken = 'my-secret-token' │                          
          │                            │                     
          │                            │                   
          │                            │
          │                            │
          │ Define fixture:            │
          │ authAPI = {                │
          │   get(url) {               │
          │     return request.get(url,│
          │       { headers: {         │
          │         Authorization:     │
          │         'Bearer token'     │
          │       }})                  │
          │   }                        │
          │ }                          │
          │                            │
┌─────────▼───────┐         ┌──────────▼──────────────┐
│ TEST WITH       │         │                         │
│ FIXTURES:       │         │ API Server              │
│                 │         │                         │
│ test('User      │         │                         │
│ profile',       │ GET     │                         │
│ async ({authAPI}│────────►│ /user-profile           │
│ => {            │         │                         │
│   const response│◄────────┘                         │
│   = await       │ 200 OK                            │
│   authAPI.get(  │                                   │
│   '/user-       │                                   │
│   profile');    │                                   │
│ });             │                                   │
└─────────────────┘         └─────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ADVANTAGES OF FIXTURES:                             │
│ ✓ Centralized auth logic                            │
│ ✓ Cleaner test code                                 │
│ ✓ Easier maintenance when auth requirements change  │
│ ✓ Role-specific fixtures (user vs admin)            │
└─────────────────────────────────────────────────────┘
``` 