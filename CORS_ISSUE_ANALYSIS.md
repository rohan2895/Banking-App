# 🔴 CORS Issue Analysis - Accounts 401 Error

## Problem Identified

The 401 error when creating an account is likely caused by **missing CORS annotations** in the AccountController, even though CORS is configured in the API Gateway.

---

## Root Cause

### API Gateway Configuration: ✅ Present

```yaml
# api-gateway/application.yml
globalcors:
  corsConfigurations:
    "[/**]":
      allowedOrigins: "*"
      allowedMethods: "*"
      allowedHeaders: "*"
```

### AccountController Configuration: ❌ Missing

```java
@RestController
// ← Missing @CrossOrigin annotation!
public class AccountController {

  @PostMapping("/accounts")
  public Account open(Authentication auth, ...) { ... }
}
```

---

## How CORS Preflight Works

When the frontend sends a POST request with the `Authorization` header:

```
1. Browser automatically sends:
   OPTIONS /accounts HTTP/1.1
   (This is the CORS preflight request)

2. Server should respond with:
   HTTP/1.1 200 OK
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, OPTIONS
   Access-Control-Allow-Headers: Authorization, Content-Type

3. Browser then sends actual POST request:
   POST /accounts HTTP/1.1
   Authorization: Bearer {token}
   Content-Type: application/json
```

**If preflight fails, the browser blocks the actual request!**

---

## Why This Causes 401

1. ❌ OPTIONS request arrives at AccountController
2. ❌ No method handles OPTIONS (no @CrossOrigin)
3. ❌ Spring returns 401 or fails CORS check
4. ❌ Browser blocks the actual POST
5. ❌ Frontend receives 401 error

---

## The Fix

### Option 1: Add @CrossOrigin to Controller

```java
package dev.bank.account.web;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;

@RestController
@CrossOrigin(
  origins = "*",
  allowedHeaders = "*",
  methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)
public class AccountController {
  // ... existing code ...
}
```

### Option 2: Add @CrossOrigin to Specific Methods

```java
@PostMapping("/accounts")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public Account open(Authentication auth, @RequestParam(defaultValue = "SAVINGS") String type) {
  var acc = Account.builder()
    .ownerEmail(auth.getName())
    .type(type)
    .balance(new BigDecimal("1000.00"))
    .build();
  return repo.save(acc);
}

@GetMapping("/accounts")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public List<Account> myAccounts(Authentication auth) {
  return repo.findByOwnerEmail(auth.getName());
}
```

### Option 3: Global CORS Configuration (Best Practice)

Create a `CorsConfig` class:

```java
package dev.bank.account.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
      .allowedOrigins("*")
      .allowedMethods("*")
      .allowedHeaders("*")
      .maxAge(3600);
  }
}
```

---

## Recommended Fix

**Best approach**: Use Option 3 (Global CORS Configuration) because:

- ✅ Applies to all endpoints
- ✅ Centralized configuration
- ✅ No annotation clutter
- ✅ Easy to modify later
- ✅ Follows Spring best practices

---

## Files That Need Changes

### Backend Files to Update:

1. **AccountService** (`account-service/src/main/java/dev/bank/account/web/AccountController.java`)

   - Add `@CrossOrigin` annotation

2. **AuthService** (same service that handles `/auth/login`)

   - Verify CORS is properly configured

3. **TransactionService** (same service that handles `/transactions`)
   - Add CORS configuration if missing

---

## Verification Steps

After applying the fix:

1. **Restart the account-service**:

   ```bash
   # Kill the existing process and restart
   mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8082"
   ```

2. **Test in browser**:

   - Open DevTools (F12)
   - Go to Network tab
   - Try to create an account
   - Look for the OPTIONS preflight request
   - It should return 200 OK

3. **Expected behavior**:
   - OPTIONS request → 200 OK
   - POST request → 200 OK (with account data)
   - Success message displayed

---

## Quick Implementation

To quickly test, add this to AccountController.java:

```java
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin("*")  // ← Add this line
public class AccountController {
  // ... existing code ...
}
```

---

## Summary

| Issue                  | Status        | Fix                 |
| ---------------------- | ------------- | ------------------- |
| API Gateway CORS       | ✅ Configured | No change needed    |
| AccountController CORS | ❌ Missing    | Add @CrossOrigin    |
| Browser Preflight      | ❌ Failing    | Will work after fix |
| 401 Error              | ❌ Current    | Should resolve      |

**After adding @CrossOrigin: 401 error should disappear!**
