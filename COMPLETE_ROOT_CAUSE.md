# 🎯 COMPLETE ROOT CAUSE ANALYSIS - 401 Error on POST /accounts

## Issue Summary

- **GET /accounts** → ✅ 200 OK (Works!)
- **POST /accounts** → ❌ 401 Unauthorized (Fails!)

Both requests have valid JWT token, but POST fails while GET succeeds.

---

## Root Cause: The Missing CORS Configuration

### The Real Issue

When a browser makes a POST request with custom headers (like `Authorization`), it **first sends an OPTIONS preflight request**:

```
OPTIONS /accounts HTTP/1.1
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Authorization, Content-Type
```

**The API Gateway's CORS configuration doesn't properly handle OPTIONS requests from the account-service.**

Even though we added `@CrossOrigin("*")` to AccountController, the **CORS preflight fails on the API Gateway level**, causing the browser to never send the actual POST request.

---

## Evidence from Logs

### Test 1: GET Request (Preflight not needed)

```
GET /accounts HTTP/1.1
Authorization: Bearer {token}
→ 200 OK  ✅
```

### Test 2: POST Request (Preflight needed)

```
OPTIONS /accounts HTTP/1.1  ← Browser's automatic preflight
(Returns something other than 200)

→ Browser doesn't send actual POST request
→ 401 Unauthorized ❌
```

---

## Why Only POST Fails?

- **GET requests**: No preflight needed, so JWT filter works fine
- **POST requests**: Preflight needed, but CORS is misconfigured on gateway
- **Preflight fails**: OPTIONS request returns 401 or fails CORS check
- **Browser blocks POST**: Even though credentials are valid

---

## The Problem Chain

```
1. Browser wants to POST with Authorization header
    ↓
2. Browser sends OPTIONS preflight (automatic)
    ↓
3. OPTIONS goes to API Gateway
    ↓
4. Gateway routes OPTIONS to account-service
    ↓
5. No handler for OPTIONS (Spring Security blocks it)
    ↓
6. OPTIONS returns 401 or fails
    ↓
7. Browser receives failed preflight
    ↓
8. Browser refuses to send actual POST
    ↓
9. Frontend sees 401 error
```

---

## The Fix

### Current API Gateway Configuration (INCOMPLETE):

```yaml
globalcors:
  corsConfigurations:
    "[/**]":
      allowedOrigins: "*"
      allowedMethods: "*"
      allowedHeaders: "*"
```

**Problem**: This is configured, but the preflight response headers might not be properly forwarded OR the account-service doesn't allow OPTIONS.

### Current Account Service Security (PROBLEMATIC):

```java
@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
  http.csrf(csrf -> csrf.disable())
      .authorizeHttpRequests(a -> a
        .requestMatchers("/actuator/**").permitAll()
        .anyRequest().authenticated()  // ← OPTIONS also requires auth!
      )
      .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)
      .httpBasic(Customizer.withDefaults());  // ← Adds HTTP Basic!
  return http.build();
}
```

**Issues**:

1. ✅ JWT filter is added (.addFilterBefore)
2. ❌ But then .httpBasic() is also added
3. ❌ OPTIONS requests might be caught by authentication check
4. ❌ No explicit CORS bean configuration

### Solution: Update Account Service SecurityConfig

```java
@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
  http.csrf(csrf -> csrf.disable())
      .cors(Customizer.withDefaults())  // ← Add CORS support
      .authorizeHttpRequests(a -> a
        .requestMatchers("/actuator/**").permitAll()
        .anyRequest().authenticated()
      )
      .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)
      .httpBasic(Customizer.withDefaults());
  return http.build();
}

@Bean
CorsConfigurationSource corsConfigurationSource() {
  CorsConfiguration configuration = new CorsConfiguration();
  configuration.setAllowedOrigins(List.of("*"));
  configuration.setAllowedMethods(List.of("*"));
  configuration.setAllowedHeaders(List.of("*"));
  configuration.setAllowCredentials(false);

  UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
  source.registerCorsConfiguration("/**", configuration);
  return source;
}
```

Or add to pom.xml for auto-configuration:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<!-- Already included, so check if CORS auto-config is enabled -->
```

---

## Files That Need Changes

### 1. Account Service (`backend/account-service/src/main/java/dev/bank/account/security/SecurityConfig.java`)

**Add**:

- Import: `import org.springframework.web.cors.CorsConfigurationSource;`
- Add `.cors(Customizer.withDefaults())` in the chain
- Add `@Bean CorsConfigurationSource` method

### 2. Transaction Service (`backend/transaction-service/src/main/java/dev/bank/tx/security/SecurityConfig.java`)

**Same changes** - add CORS support

### 3. Account Controller (Already done)

- Already has `@CrossOrigin("*")` annotation ✅

---

## Complete Fix for Account Service SecurityConfig

```java
package dev.bank.account.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {
  private final JwtFilter jwt;

  public SecurityConfig(JwtFilter jwt) {
    this.jwt = jwt;
  }

  @Bean
  SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(Customizer.withDefaults())  // ← ADD THIS
        .authorizeHttpRequests(a -> a
          .requestMatchers("/actuator/**").permitAll()
          .anyRequest().authenticated()
        )
        .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)
        .httpBasic(Customizer.withDefaults());
    return http.build();
  }

  @Bean  // ← ADD THIS METHOD
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("*"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(false);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
```

---

## Same Fix for Transaction Service

Apply the identical changes to:

```
backend/transaction-service/src/main/java/dev/bank/tx/security/SecurityConfig.java
```

---

## Testing After Fix

```bash
# Restart account-service and transaction-service

# Test preflight (OPTIONS):
curl -X OPTIONS http://localhost:4000/accounts \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should return 200 OK with CORS headers

# Test actual POST:
curl -X POST http://localhost:4000/accounts \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -v

# Should return 200 OK with created account
```

---

## Why This Wasn't Obvious

1. ✅ GET works because no preflight needed
2. ❌ POST fails at preflight stage (OPTIONS)
3. ✅ Frontend error shows 401 (from failed preflight)
4. ❌ Confusing because actual authentication is fine
5. ✅ Real issue is CORS preflight handling

---

## Summary

| Aspect          | Issue                      |
| --------------- | -------------------------- |
| JWT Filter      | ✅ Configured correctly    |
| GET /accounts   | ✅ Works (no preflight)    |
| POST /accounts  | ❌ Fails (preflight issue) |
| Security Config | ❌ Missing CORS bean       |
| CORS Annotation | ✅ Present on controller   |
| Missing Import  | `CorsConfigurationSource`  |

**Action**: Add `@Bean CorsConfigurationSource` method to SecurityConfig in both account-service and transaction-service.
