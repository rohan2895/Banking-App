# Banking App (Java 21) — Local-first Monorepo

**Frontend:** React 19 + Vite  
**Backend:** Spring Boot 3.3.x microservices (Java 21), Spring Cloud Gateway, JWT (HMAC), H2 (Phase 1)

## Modules
- `frontend-react/` — React app (Login/Register, Dashboard, Accounts, Transfers)
- `backend/` — Maven multi-module:
  - `api-gateway` (port 4000) — routes + CORS
  - `auth-service` (port 8081) — register/login → JWT
  - `account-service` (port 8082) — JWT-protected accounts
  - `transaction-service` (port 8083) — JWT-protected transfers

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
