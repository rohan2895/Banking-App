# Banking App (Java 21) — Local-first Monorepo

**Frontend:** React 19 + Vite  
**Backend:** Spring Boot 3.4.4 microservices (Java 21), Spring Cloud Gateway, JWT (HMAC), PostgreSQL 16 + Flyway migrations

## Modules

- `frontend-react/` — React app (Login/Register, Dashboard, Accounts, Transfers)
- `backend/` — Maven multi-module:
  - `api-gateway` (port 4000) — routes + CORS
  - `auth-service` (port 8081) — register/login → JWT, BCrypt password hashing
  - `account-service` (port 8082) — JWT-protected accounts
  - `transaction-service` (port 8083) — JWT-protected transfers

## Technical Stack

- **Java:** OpenJDK 21
- **Spring Boot:** 3.4.4
- **Database:** PostgreSQL 16.10 with Flyway 11.0.0 migrations
- **Authentication:** JWT (HMAC) with BCrypt password encoding
- **Validation:** Spring Validation Framework (JSR-303)
- **Frontend:** React 19 + Vite (dev server on port 5173)

## Key Features & Improvements

### Security Enhancements ✅

- **Spring Dependency Injection:** PasswordEncoder injected as Spring Bean (singleton pattern)
- **CORS Restriction:** Limited to `http://localhost:5173` (frontend origin only)
- **Input Validation:** Automatic validation with `@Valid` and `@Validated` annotations
- **Secure Error Messages:** Generic responses prevent user enumeration attacks
- **BCrypt Hashing:** Industry-standard password encoding with configurable strength

### Database & ORM ✅

- **PostgreSQL 16:** Upgraded from H2 in-memory database
- **Flyway 11.0.0:** Database schema versioning and migrations
- **Hibernate Integration:** Automatic schema management with update mode
- **Liquibase-Free:** Clean SQL migration scripts without framework overhead

### Code Quality ✅

- **Dependency Injection:** All beans managed by Spring container
- **Request Validation:** Automatic validation of all API inputs
- **Centralized Configuration:** Flyway and Hibernate config in `application.yml`
- **Best Practices:** Follows Spring framework conventions and SOLID principles

---

## Quick Start

### Prerequisites
- JDK 21+
- Maven 3.9+
- PostgreSQL 16+ (or Docker)
- Node.js 18+ (for frontend)

### 1. Start PostgreSQL (Docker)
```bash
cd backend
docker compose up -d
```
Verify: `docker ps` should show `postgres:16` running on `0.0.0.0:5432`

### 2. Build & Run Backend Services
```bash
cd backend
mvn clean package -DskipTests
```

**In separate terminals:**
```bash
# Terminal 1: API Gateway (port 4000)
cd api-gateway && mvn spring-boot:run

# Terminal 2: Auth Service (port 8081)
cd ../auth-service && mvn spring-boot:run

# Terminal 3: Account Service (port 8082)
cd ../account-service && mvn spring-boot:run

# Terminal 4: Transaction Service (port 8083)
cd ../transaction-service && mvn spring-boot:run
```

### 3. Frontend (React + Vite)
```bash
cd frontend-react
npm install
echo "VITE_API_URL=http://localhost:4000" > .env
npm run dev
# Opens http://localhost:5173
```

### 4. Test the Flow
```bash
# Register user
curl -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass@123"
  }'

# Login (get JWT token)
curl -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email": "john@example.com", "password": "SecurePass@123"}'

# Copy the token from response, then:
TOKEN="eyJhbGc..."

# Get accounts (requires JWT)
curl http://localhost:4000/accounts \
  -H "Authorization: Bearer $TOKEN"

# Create account
curl -X POST http://localhost:4000/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"type": "SAVINGS"}'

# Transfer funds
curl -X POST http://localhost:4000/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"fromAccountId": 1, "toAccountId": 2, "amount": 100.50}'
```

---

## Configuration

### Database (PostgreSQL)
**File:** `backend/docker-compose.yml`
```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: bank
      POSTGRES_USER: bank
      POSTGRES_PASSWORD: bank
    ports:
      - "5432:5432"
```

### Flyway Migrations
Migrations are automatically executed on application startup.

**Files:**
- `auth-service/src/main/resources/db/migration/V1__init.sql`
- `account-service/src/main/resources/db/migration/V1__init.sql`
- `transaction-service/src/main/resources/db/migration/V1__init.sql`

**Adding a new migration:**
1. Create: `src/main/resources/db/migration/V{N}__description.sql`
2. Example: `V2__add_users_index.sql`
3. Deploy: Restart the service (Flyway auto-runs)

### Application Configuration
**File:** `backend/{service}/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/bank
    username: bank
    password: bank
  flyway:
    enabled: true
    locations: classpath:db/migration
    validateOnMigrate: false  # Allow schema evolution
  jpa:
    hibernate:
      ddl-auto: update  # Auto-update schema on startup
```

### CORS Configuration
**File:** `backend/auth-service/src/main/java/dev/bank/auth/web/AuthController.java`

```java
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/auth")
public class AuthController { ... }
```

**Why localhost:5173?** Vite dev server runs on port 5173 by default.

---

## Troubleshooting

### ❌ CORS Error: "Invalid CORS request"
**Symptom:** Browser console shows JSON parse error from frontend
**Fix:** Verify `@CrossOrigin` matches frontend URL (should be `http://localhost:5173`)

### ❌ PostgreSQL Connection Refused
**Symptom:** Services fail to start with "Connection refused on localhost:5432"
**Fix:**
```bash
docker compose ps                    # Check if postgres is running
docker compose up -d                 # Start if stopped
docker compose logs postgres         # View postgres logs
```

### ❌ Flyway Migration Failed
**Symptom:** "Migration V1__init.sql failed"
**Fix:**
```bash
cd auth-service
mvn flyway:info                      # View migration status
mvn flyway:repair                    # Mark as success if file was manually applied
```

### ❌ Port Already in Use
**Symptom:** "Address already in use :8081"
**Fix:**
```bash
lsof -i :8081                       # Find process
kill -9 <PID>                       # Kill process
# OR change port in application.yml:
# server:
#   port: 8091
```

### ❌ npm install fails (frontend)
**Fix:**
```bash
cd frontend-react
rm -rf node_modules package-lock.json
npm install                         # Clean install
```

---

## Architecture Overview

### Auth Service (Port 8081)
- **Endpoint:** `/auth/register`, `/auth/login`
- **Security:** CORS restricted, input validation, generic error messages
- **Encoding:** BCrypt (strength: 10)
- **Tokens:** JWT HMAC-signed, session-based validity
- **Database:** PostgreSQL with Flyway migrations

### Account Service (Port 8082)
- **Endpoint:** `/accounts` (CRUD operations)
- **Auth:** JWT required on all endpoints
- **Persistence:** JPA/Hibernate → PostgreSQL
- **Schema:** Auto-updated via Hibernate DDL

### Transaction Service (Port 8083)
- **Endpoint:** `/transactions` (create transfers, view history)
- **Auth:** JWT required
- **Validation:** Source/destination accounts, balance checks

### API Gateway (Port 4000)
- **Routing:** Distributes requests to microservices
- **CORS:** Centralized handling
- **Scalability:** Ready for load balancing

---

## Development Notes

### Password Hashing
Passwords are **never stored in plaintext**. During registration:
1. Frontend sends plaintext password (over HTTPS in production)
2. AuthController receives it
3. `BCryptPasswordEncoder` hashes with random salt
4. Only hash is stored in database

Verification (login):
1. User submits password
2. `BCryptPasswordEncoder.matches(plaintext, hash)` compares
3. If match: JWT token issued

### JWT Token Structure
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI...
         [header].[payload].[signature]
```
- **Header:** Algorithm (HS256)
- **Payload:** User data, email, issued time
- **Signature:** HMAC-SHA256 with app secret

### Dependency Injection Pattern
Example from `AuthController.java`:
```java
@RestController
public class AuthController {
    private final UserRepo users;
    private final JwtService jwt;
    private final PasswordEncoder encoder;  // Injected bean, not new BCryptPasswordEncoder()
    
    public AuthController(UserRepo users, JwtService jwt, PasswordEncoder encoder) {
        this.users = users;
        this.jwt = jwt;
        this.encoder = encoder;
    }
}
```

**Benefit:** Single `PasswordEncoder` bean managed by Spring, not recreated per request.

---

## Future Phases

- **Phase 2:** Event sourcing for transaction consistency
- **Phase 3:** OAuth2, 2FA, rate limiting
- **Phase 4:** Kubernetes manifests, cloud deployment
- **Phase 5:** Real-time updates with WebSockets

## Quick start

### Backend (requires JDK 21, Maven 3.9+)

```bash
cd backend
mvn -q -DskipTests package

# in separate terminals:
cd api-gateway && mvn spring-boot:run
cd ../auth-service && mvn spring-boot:run
cd ../account-service && mvn spring-boot:run
cd ../transaction-service && mvn spring-boot:run
```

### Frontend

```bash
cd ../frontend-react
npm i
echo "VITE_API_URL=http://localhost:4000" > .env
npm run dev   # http://localhost:5173
```

### Try it (through gateway)

```bash
# Register user
curl -s http://localhost:4000/auth/register -H 'Content-Type: application/json'   -d '{"name":"Rohan","email":"rohan@bank.dev","password":"Pass@123"}'

# Login -> copy token
curl -s http://localhost:4000/auth/login -H 'Content-Type: application/json'   -d '{"email":"rohan@bank.dev","password":"Pass@123"}'

# Accounts (JWT required)
TOKEN=...
curl -s http://localhost:4000/accounts -H "Authorization: Bearer $TOKEN"
curl -s -X POST http://localhost:4000/accounts -H "Authorization: Bearer $TOKEN"

# Transfer
curl -s -X POST http://localhost:4000/transactions -H "Content-Type: application/json"   -H "Authorization: Bearer $TOKEN"   -d '{"fromAccountId":1,"toAccountId":2,"amount":250}'
```

> **Note:** Phase 1 is intentionally simple (H2 memory DBs). In Phase 2 we’ll swap to Postgres + Flyway and wire real balance updates with transactions/outbox.
