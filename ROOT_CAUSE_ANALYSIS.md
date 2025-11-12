# 🔴 Root Cause Analysis - 401 Error on POST /accounts

## 🎯 Issue Found!

**GET /accounts → 200 OK ✅**  
**POST /accounts → 401 Unauthorized ❌**

---

## Problem Analysis

### Test Results

```
GET http://localhost:4000/accounts
Authorization: Bearer {valid-jwt-token}
Response: 200 OK, []

POST http://localhost:4000/accounts
Authorization: Bearer {valid-jwt-token}
Content-Type: application/json
Response: 401 Unauthorized
```

---

## Root Cause

The **POST /accounts endpoint is not configured for JWT authentication**. It's expecting **HTTP Basic Authentication** instead!

**Evidence from response**:

```
WWW-Authenticate: Basic realm="Realm"  ← Server asking for Basic auth!
```

---

## Why This Happens

### GET /accounts - Works ✅

- Uses `Authentication` parameter from Spring Security
- Spring automatically extracts JWT from Bearer token
- Works because GET request is properly authenticated

### POST /accounts - Fails ❌

- Same endpoint, but POST method
- Spring is applying **Basic Authentication** instead of JWT
- Likely missing proper method-level security configuration

---

## The Issue in AccountController

### Current Code (Line 36-39):

```java
@PostMapping("/accounts")
public Account open(Authentication auth, @RequestParam(defaultValue = "SAVINGS") String type) {
  var acc = Account.builder()...
  return repo.save(acc);
}
```

**Problem**: No HTTP method restriction configured!

- GET works with JWT
- POST defaults to Basic Auth
- This suggests security config is incomplete

---

## Solution

### Root Issue: Security Configuration

The **`@EnableWebSecurity` and `SecurityFilterChain` configuration** is not properly set up to handle POST requests with JWT.

### Where to Look

You likely have a `SecurityConfig.java` or similar in `account-service`:

```bash
find . -name "SecurityConfig.java"
find . -name "*Security*.java"
```

### What's Likely Wrong

The security configuration probably:

1. ✅ Allows GET /accounts
2. ❌ Doesn't allow POST /accounts with JWT
3. ❌ Falls back to Basic Auth for POST
4. ❌ Requires different filter for POST

---

## Fix Required

### In your Security Configuration:

```java
// WRONG - Current behavior:
http
  .authorizeHttpRequests(auth -> auth
    .requestMatchers(HttpMethod.GET, "/accounts").authenticated()
    // Missing: POST configuration!
  );

// CORRECT - Should be:
http
  .authorizeHttpRequests(auth -> auth
    .requestMatchers("/accounts").authenticated()  // Applies to all methods
    .anyRequest().authenticated()
  );
```

---

## Why CORS Annotation Wasn't Enough

Even though we added:

```java
@CrossOrigin("*")
public class AccountController {
  ...
}
```

This only handles **CORS preflight (OPTIONS)**. It doesn't fix the **authentication issue** for POST.

The real problem is **security filtering**, not CORS.

---

## Verification

### Test with valid token:

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan@bank.dev","password":"Pass@123"}' | jq -r '.token')

# This works (200 OK):
curl -X GET http://localhost:4000/accounts \
  -H "Authorization: Bearer $TOKEN"

# This fails (401 Unauthorized):
curl -X POST http://localhost:4000/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Output shows POST returns 401 while GET returns 200**

---

## Next Step

Find the `SecurityConfig.java` or security configuration in account-service and update it to allow JWT authentication for POST requests.

The configuration should look similar to:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .cors(Customizer.withDefaults())
      .csrf(csrf -> csrf.disable())
      .authorizeHttpRequests(auth -> auth
        .requestMatchers(HttpMethod.OPTIONS).permitAll()
        .requestMatchers("/accounts/**").authenticated()  // ← Add this
        .anyRequest().authenticated()
      )
      .httpBasic(Customizer.withDefaults());  // ← Remove this or handle properly

    return http.build();
  }
}
```

---

## Summary

| Method         | Status    | Issue                         |
| -------------- | --------- | ----------------------------- |
| GET /accounts  | ✅ 200 OK | JWT works                     |
| POST /accounts | ❌ 401    | Security config issue         |
| Issue Type     | -         | Misconfigured Spring Security |
| Root Cause     | -         | POST not configured for JWT   |

**The 401 error is NOT about missing headers or CORS.**  
**It's about incorrect security filter configuration for POST requests.**

---

## Files to Check

1. Find security configuration in account-service:

   ```bash
   find backend/account-service -name "*Security*.java"
   find backend/account-service -name "*Config*.java"
   ```

2. Look for JWT filter configuration:

   ```bash
   grep -r "JwtAuthenticationFilter\|SecurityFilterChain\|@EnableWebSecurity" backend/account-service/src
   ```

3. Check auth-service for reference:
   ```bash
   grep -r "authorizeHttpRequests\|requestMatchers" backend/auth-service/src
   ```
