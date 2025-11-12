# Frontend React Project - Quick Reference Guide

## 📁 Project Structure

```
frontend-react/
├── src/
│   ├── App.jsx                 ✅ Main app with routing
│   ├── main.jsx                (Entry point)
│   ├── styles.css              (Global styles)
│   ├── auth/
│   │   └── AuthContext.jsx     ✅ Authentication context
│   └── pages/
│       ├── Login.jsx           ✅ Login/Register page
│       ├── Dashboard.jsx       ✅ Welcome page
│       ├── Accounts.jsx        ✅ Account management
│       └── Transfers.jsx       ✅ Money transfers (FIXED)
├── package.json                ✅ Dependencies
├── vite.config.js              ✅ Vite config
└── index.html                  ✅ HTML entry point
```

---

## 🔧 Component Summary

### **AuthContext.jsx** ✅ Excellent

- Manages authentication state
- Handles login/register/logout
- Persists token in localStorage
- Provides useAuth hook

**Key Functions**:

- `login(email, password)` - Authenticate user
- `register(name, email, password)` - Create new account
- `logout()` - Clear auth state

---

### **App.jsx** ✅ Excellent

- Main app component with React Router
- Protected routes component
- Navigation bar
- Loading state handling

**Routes**:

- `/` → Redirect to dashboard
- `/login` → Login/Register page (public)
- `/dashboard` → Welcome (protected)
- `/accounts` → Account management (protected)
- `/transfers` → Money transfers (protected)

---

### **Login.jsx** ✅ Excellent

- Dual mode (login/register)
- Form with email/password validation
- Error handling with try-catch
- Loading state during submission

**Features**:

- Pre-filled demo credentials
- Mode toggle button
- Disabled button during submission
- Error display

---

### **Dashboard.jsx** ✅ Good

- Simple welcome page
- Shows logged-in user info
- No complex logic needed

---

### **Accounts.jsx** ✅ Excellent

- Fetch accounts from API
- Open new account
- Safe JSON parsing
- Loading states
- Error handling
- Refresh button
- User email display

**Features**:

- `toJsonSafe()` helper function
- Token validation
- Proper error messages with HTTP status
- Empty state message
- Memoized auth header

---

### **Transfers.jsx** ✅ Fixed & Excellent

- Transfer money between accounts
- Input validation
- Error handling
- Loading states
- Form reset on success

**New Features**:

- ✅ Validates all inputs (required, different accounts, positive amount)
- ✅ Safe JSON parsing
- ✅ Busy state prevents double submission
- ✅ Token validation
- ✅ User email display
- ✅ Form clears after success
- ✅ Descriptive error messages
- ✅ Proper input types (number)

---

## 🚀 Environment Setup

### Start Development Server:

```bash
cd frontend-react
npm install
npm run dev
```

Server runs on: `http://localhost:5173`

### Build for Production:

```bash
npm run build
npm run preview
```

---

## 🔑 Key Features

### ✅ Error Handling Pattern

Used consistently across all pages:

```jsx
try {
  // API call or logic
  const res = await fetch(...);
  const data = await toJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || "Failed");
  // Success logic
} catch (ex) {
  setErr(ex.message);
} finally {
  setBusy(false);
}
```

### ✅ Loading States

```jsx
const [busy, setBusy] = React.useState(false); // For submission
const [loading, setLoading] = React.useState(true); // For fetch

// Disable inputs and show feedback
<button disabled={busy}>{busy ? "Processing..." : "Submit"}</button>;
```

### ✅ Token Management

```jsx
const { token, user } = useAuth();

// In header:
headers: {
  Authorization: `Bearer ${token}`;
}

// Validate:
if (!token) throw new Error("Not logged in");
```

---

## 🔐 Security Features

| Feature          | Implementation                                  |
| ---------------- | ----------------------------------------------- |
| Authentication   | JWT token in Authorization header               |
| Token Storage    | localStorage with "bank.auth" key               |
| Protected Routes | Redirect to login if no user                    |
| Input Validation | Client-side validation before API               |
| Error Handling   | Graceful error display                          |
| Type Safety      | Input type attributes (email, password, number) |

---

## 📊 API Endpoints Used

| Method | Endpoint         | Purpose            |
| ------ | ---------------- | ------------------ |
| POST   | `/auth/login`    | User login         |
| POST   | `/auth/register` | User registration  |
| GET    | `/accounts`      | List user accounts |
| POST   | `/accounts`      | Create new account |
| POST   | `/transactions`  | Record transfer    |

---

## 🎯 Common Issues & Solutions

### Issue: "Failed to load accounts (401)"

**Solution**: Token expired or invalid. Logout and login again.

### Issue: "Not logged in. Please login again."

**Solution**: Session ended. Click logout and login.

### Issue: "From and To accounts cannot be the same."

**Solution**: Select different source and destination accounts.

### Issue: "All fields are required."

**Solution**: Fill in all form fields.

### Issue: "Amount must be greater than 0."

**Solution**: Enter a positive amount.

---

## 📝 Testing Commands

### Test Login:

1. Go to `http://localhost:5173/login`
2. Use demo credentials: `rohan@bank.dev` / `Pass@123`
3. Should redirect to dashboard

### Test Accounts:

1. Navigate to Accounts page
2. Click "Open new account"
3. Should see success message
4. Account should appear in list

### Test Transfers:

1. Navigate to Transfers page
2. Enter valid account IDs and amount
3. Click "Transfer"
4. Should see success message with transaction ID

---

## 🐛 Debugging Tips

1. **Check Browser Console** - Look for JS errors
2. **Check Network Tab** - Verify API calls and responses
3. **Check localStorage** - View auth token with: `localStorage.getItem('bank.auth')`
4. **Redux DevTools** - Not used, but could add for complex state

---

## ✨ Best Practices Applied

- ✅ Proper error boundaries and try-catch blocks
- ✅ Loading states for user feedback
- ✅ Input validation before API calls
- ✅ Safe JSON parsing
- ✅ Token validation before protected requests
- ✅ Form reset on successful submission
- ✅ Disabled buttons during processing
- ✅ Descriptive error messages
- ✅ Helper functions for reusable logic
- ✅ Proper React hooks usage

---

## 📚 Technology Stack

- **React**: 19.0.0 - UI library
- **React Router**: 6.27.0 - Client-side routing
- **Vite**: 5.4.0 - Build tool and dev server
- **Node.js**: 18+ (for development)

---

**Last Updated**: November 12, 2025
**Status**: ✅ All Components Analyzed & Tested
