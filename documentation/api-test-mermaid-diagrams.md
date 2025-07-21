# API Testing Mermaid Diagrams

This file contains Mermaid versions of the API test diagrams, for better visualization in VS Code with the Mermaid extension.

## Test Snippet #1: GET /posts with filtering

```mermaid
sequenceDiagram
    participant Client as Playwright Test Client
    participant Server as API Server
    participant DB as In-Memory DB

    Client->>Server: GET /posts?userId=1
    Server->>DB: Filter posts where userId=1
    DB-->>Server: Filtered posts
    Server-->>Client: [<br/>  {id:1, userId:1, ...},<br/>  {id:3, userId:1, ...},<br/>  {id:7, userId:1, ...}<br/>]

    Note over Client: ASSERTIONS:<br/>✓ Status 200<br/>✓ All posts have userId=1<br/>✓ At least 2 posts returned
```

## Test Snippet #2: POST /posts with validation failure

```mermaid
sequenceDiagram
    participant Client as Playwright Test Client
    participant Server as API Server

    Client->>Server: POST /posts<br/>{<br/>  userId: 1,<br/>  body: "This post body is fine"<br/>  (title missing)<br/>}
    Note over Server: ✗ Validation fails:<br/>Title is required
    Server-->>Client: {<br/>  error: "Missing required fields"<br/>}<br/>Status: 400

    Note over Client: ASSERTIONS:<br/>✓ Status 400<br/>✓ Error message mentions missing fields
```

## Test Snippet #3: Bearer Token Authentication

```mermaid
sequenceDiagram
    participant Client as Playwright Test Client
    participant Server as API Server

    Client->>Server: GET /secure-data<br/>(No token)
    Server-->>Client: Status: 401 (Unauthorized)

    Client->>Server: GET /secure-data<br/>Authorization: Bearer wrong-token
    Server-->>Client: Status: 403 (Forbidden)

    Client->>Server: GET /secure-data<br/>Authorization: Bearer my-secret-token
    Server-->>Client: Status: 200 OK<br/>{ message: "This is secure data..." }

    Note over Client: ASSERTIONS:<br/>✓ No token: 401<br/>✓ Wrong token: 403<br/>✓ Valid token: 200<br/>✓ Success message contains "access granted"
```

## Test Snippet #4: Authentication Methods

```mermaid
sequenceDiagram
    participant Client as Playwright Test Client
    participant Server as API Server

    Note over Client,Server: Basic Authentication
    Client->>Server: GET /basic-auth-endpoint<br/>Authorization: Basic dGVzdHVzZXI6cGFzc3dvcmQxMjM=<br/>(testuser:password123)
    Note over Server: ✓ Decode & validate credentials
    Server-->>Client: Status: 200<br/>{<br/>  message: "Successfully authenticated",<br/>  user: { username: "testuser", ... }<br/>}
    Note over Client: BASIC AUTH ASSERTIONS:<br/>✓ Status 200<br/>✓ Auth success<br/>✓ User data

    Note over Client,Server: API Key Authentication
    Client->>Server: GET /api-key-endpoint<br/>X-API-Key: api-key-12345
    Note over Server: ✓ API key is valid<br/>✓ Set user context based on key
    Server-->>Client: Status: 200<br/>{<br/>  message: "Successfully authenticated",<br/>  user: { userId: 1, role: "user" }<br/>}
    Note over Client: API KEY AUTH ASSERTIONS:<br/>✓ Status 200<br/>✓ Auth success<br/>✓ User details
```

## Test Snippet #5: Token Expiry and Refresh

```mermaid
sequenceDiagram
    participant Client as Playwright Test Client
    participant Server as API Server

    Client->>Server: GET /secure-data<br/>Authorization: Bearer valid-token
    Server-->>Client: Status: 200 OK<br/>(Access granted)
    
    Note over Client: TokenManager expires token<br/>(Set expiry timestamp to past)
    
    Client->>Server: GET /secure-data<br/>(With expired token)
    Note over Client: Detect expired token and auto-refresh
    
    Client->>Server: POST /refresh-token<br/>{ refresh_token: "refresh-..." }
    Server-->>Client: Status: 200<br/>{<br/>  access_token: "new-token",<br/>  expires_in: 3600<br/>}
    
    Note over Client: ASSERTIONS:<br/>✓ Initial token works<br/>✓ After expiry, system automatically refreshes token<br/>✓ New token works for secured endpoints
```

## Test Snippet #6: Role-Based Access Control (RBAC)

```mermaid
sequenceDiagram
    participant UserClient as Playwright Test Client (user role)
    participant UserProfile as /user-profile endpoint
    participant AdminOnly as /admin-only endpoint

    UserClient->>UserProfile: GET /user-profile<br/>Bearer token (user role)
    UserProfile-->>UserClient: Status: 200 OK<br/>(Basic profile)

    UserClient->>AdminOnly: GET /admin-only<br/>Bearer token (user role)
    AdminOnly-->>UserClient: Status: 403<br/>(Forbidden: Requires admin role)

    Note over UserClient: TEST SCENARIO (user role):<br/>✓ Can access basic user endpoints<br/>✓ Cannot access admin endpoints (403)
```

```mermaid
sequenceDiagram
    participant AdminClient as Playwright Test Client (admin role)
    participant UserProfile as /user-profile endpoint
    participant AdminOnly as /admin-only endpoint

    AdminClient->>UserProfile: GET /user-profile<br/>Bearer token (admin role)
    UserProfile-->>AdminClient: Status: 200 OK<br/>(Basic profile)

    AdminClient->>AdminOnly: GET /admin-only<br/>Bearer token (admin role)
    AdminOnly-->>AdminClient: Status: 200 OK<br/>(Admin data returned)

    Note over AdminClient: TEST SCENARIO (admin role):<br/>✓ Can access basic user endpoints<br/>✓ Can also access admin endpoints (200)
```

## Test Snippet #7: Security Best Practices

```mermaid
sequenceDiagram
    participant Client as Playwright Test Client
    participant Server as API Server

    Note over Client,Server: Brute Force Protection
    Client->>Server: Attempt 1: Invalid login
    Client->>Server: Attempt 2: Invalid login
    Client->>Server: Attempt 3: Invalid login
    Client->>Server: Attempt 4: Invalid login
    Client->>Server: Attempt 5: Invalid login
    Note over Server: Rate limit triggered<br/>after threshold
    Client->>Server: Attempt 6: Invalid login
    Server-->>Client: Status: 429<br/>{<br/>  error: "Too many requests",<br/>  retry_after: 30<br/>}

    Note over Client: SECURITY ASSERTIONS:<br/>✓ Rate limiting works after multiple failed attempts<br/>✓ 429 status returned with retry information
```

```mermaid
sequenceDiagram
    participant Client as Playwright Test Client
    participant Update as Update Profile Endpoint
    participant CSRF as CSRF Token Endpoint

    Note over Client,Update: CSRF Protection
    Client->>Update: POST /update-profile<br/>(Without CSRF token)
    Note over Update: Reject request without CSRF token
    Update-->>Client: Status: 403<br/>{ error: "Missing CSRF token" }

    Client->>CSRF: GET /csrf-token
    CSRF-->>Client: { csrf_token: "abc123" }

    Client->>Update: POST /update-profile<br/>X-CSRF-Token: "abc123"
    Note over Update: Accept request with valid CSRF token
    Update-->>Client: Status: 200<br/>{ success: true }

    Note over Client: SECURITY ASSERTIONS:<br/>✓ Requests without CSRF token are rejected<br/>✓ Valid CSRF token allows the operation
```

## Test Snippet #8: Real-World API Scenarios

```mermaid
sequenceDiagram
    participant Client as Playwright Test Client
    participant Server as API Server
    participant DB as In-Memory DB

    Client->>Server: GET /posts/8
    Server->>DB: Retrieve post #8<br/>(title: null)
    DB-->>Server: Post data
    Server-->>Client: Status: 200<br/>{<br/>  id: 8,<br/>  title: null,<br/>  ...<br/>}

    Client->>Server: PUT /posts/8<br/>{<br/>  title: null,<br/>  ...<br/>}
    Note over Server: ✗ Validation fails:<br/>title cannot be null
    Server-->>Client: Status: 400<br/>{ error: "Validation Error" }

    Note over Client: ASSERTIONS:<br/>✓ GET succeeds even with bad data<br/>✓ PUT with bad data fails validation
```

## Test Snippet #9: Token Lifecycle Management

```mermaid
sequenceDiagram
    participant Client as Playwright Test Client
    participant Login as /login endpoint
    participant UserStore as User Store
    participant Secure as /secure-data endpoint
    participant Refresh as /refresh-token endpoint

    Client->>Login: POST /login<br/>{ username: "testuser", password: "password123" }
    Login->>UserStore: Validate credentials
    UserStore-->>Login: ✓ Credentials valid
    Note over Login: Generate tokens
    Login-->>Client: Status: 200<br/>{<br/>  access_token: "my-secret-token",<br/>  refresh_token: "refresh-token-123",<br/>  expires_in: 3600<br/>}

    Client->>Secure: GET /secure-data<br/>Authorization: Bearer my-secret-token
    Note over Secure: ✓ Token valid
    Secure-->>Client: Status: 200<br/>(Protected data)

    Client->>Refresh: POST /refresh-token<br/>{ refresh_token: "refresh-token-123" }
    Note over Refresh: ✓ Refresh token valid<br/>Generate new access token
    Refresh-->>Client: Status: 200<br/>{<br/>  access_token: "new-token",<br/>  expires_in: 3600<br/>}

    Note over Client: ASSERTIONS:<br/>✓ Login returns tokens<br/>✓ Access token works for protected endpoint<br/>✓ Refresh token can be exchanged for new access token
```

## Test Snippet #10: Authentication Fixtures Pattern

```mermaid
sequenceDiagram
    participant Tests as Test Files
    participant Fixtures as Playwright Fixtures
    participant Server as API Server

    Note over Tests,Fixtures: Define Authentication Fixtures
    Note over Fixtures: authToken = 'my-secret-token'
    
    Note over Fixtures: authAPI = {<br/>  get(url) {<br/>    return request.get(url, {<br/>      headers: {<br/>        Authorization: 'Bearer token'<br/>      }<br/>    })<br/>  }<br/>}

    Tests->>Server: test('User profile', async ({ authAPI }) => {<br/>  const response = await authAPI.get('/user-profile');<br/>});
    Server-->>Tests: Status: 200<br/>(User profile data)

    Note over Tests: ADVANTAGES OF FIXTURES:<br/>✓ Centralized auth logic<br/>✓ Cleaner test code<br/>✓ Easier maintenance when auth requirements change<br/>✓ Role-specific fixtures (user vs admin)
``` 