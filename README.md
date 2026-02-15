# Auth7 Kit 

A authentication system for Node.js and Express.

Built with security, scalability, and flexibility in mind.

---

## ✨ Features

- Cookie-based JWT authentication
- Access & Refresh tokens
- Email verification (Dev mode + SMTP support)
- Password reset system
- Session invalidation
- Custom user schema support
- Plugin-style architecture
- Rate-limit ready

---

## 📦 Installation

```bash
npm install auth7-kit
```

Or for local development:

```bash
npm install ../auth7-kit
```

---

##  Quick Start

### 1️⃣ Setup Express App

```js
import express from "express";
import cookieParser from "cookie-parser";
import auth from "auth7-kit";

const app = express();

app.use(express.json());
app.use(cookieParser());
```

---

### 2️⃣ Initialize Auth

```js
await auth.init({
  dbURI: "mongodb://127.0.0.1:27017/mydb",
  jwtSecret: "my-secret-key",
  appUrl: "http://localhost:4000",

  // Optional custom fields
  customSchema: {
    name: {
      type: String,
      required: true
    },
    age: Number,
    gender: String
  }
});
```

---

### 3️⃣ Mount Routes

```js
app.use("/auth", auth.routes());
```

---

### 4️⃣ Protected Route Example

```js
app.get("/profile", auth.protect(), (req, res) => {
  res.json({
    user: req.user
  });
});
```

---

### 5️⃣ Start Server

```js
app.listen(4000, () => {
  console.log("Server running on port 4000");
});
```

---

## 🔐 Authentication Flow

### Register

```
POST /auth/register
```

Creates an unverified user and prints verification link in dev mode.

---

### Verify Email

```
GET /auth/verify?token=xxxx
```

Activates the account.

---

### Login

```
POST /auth/login
```

Sets cookies:

- access_token (15 min)
- refresh_token (7 days)

---

### Refresh Token

```
POST /auth/refresh
```

Issues a new access token.

---

### Logout

```
POST /auth/logout
```

Clears cookies and revokes session.

---

## 🔁 Password Reset

### Request Reset

```
POST /auth/forgot-password
```

---

### Reset Password

```
POST /auth/reset-password
```

Request Body:

```json
{
  "token": "xxxx",
  "newPassword": "123456"
}
```

All active sessions are revoked after reset.

---

## 📧 Email System

### Development Mode (Default)

If SMTP is not configured, verification and reset links are printed in terminal.

Example:

```
📧 DEV MAIL
http://localhost:4000/auth/verify?token=xxxx
```

---

### Production Mode (SMTP)

Provide SMTP configuration:

```js
await auth.init({
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  smtpUser: "your@gmail.com",
  smtpPass: "app-password",
  smtpFrom: "Auth System <your@gmail.com>"
});
```

---

## 👤 Custom User Schema

Extend the user model easily:

```js
customSchema: {
  phone: String,
  address: String,
  dob: Date
}
```

These fields are saved automatically during registration.

---

## 🛡 Security

- HttpOnly cookies
- JWT issuer validation
- Password hashing (bcrypt)
- Refresh token storage
- Session revocation
- Token expiry enforcement

---

## 📚 API Reference

| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login |
| GET | /auth/verify | Verify email |
| POST | /auth/refresh | Refresh token |
| POST | /auth/logout | Logout |
| POST | /auth/forgot-password | Forgot password |
| POST | /auth/reset-password | Reset password |

---

## ⚙ Configuration Options

| Option | Required | Description |
|--------|----------|-------------|
| dbURI | ✅ | MongoDB connection string |
| jwtSecret | ✅ | JWT secret key |
| appUrl | ✅ | Base app URL |
| customSchema | ❌ | Extra user fields |
| smtpHost | ❌ | SMTP host |
| smtpPort | ❌ | SMTP port |
| smtpUser | ❌ | SMTP username |
| smtpPass | ❌ | SMTP password |
| smtpFrom | ❌ | Sender address |

---

## 🛣 Roadmap

Planned features:

- User profile update
- Change email with re-verification
- Advanced rate limiting
- Refresh token rotation
- Role-based access control
- Redis session support

---

## 🤝 Contributing

Pull requests are welcome.

```bash
git fork
git clone
npm install
npm run dev
```

---

## 📜 License

MIT License

---

## 👨‍💻 Author

Vinay Kumar

---

## ⭐ Support

If you find this project useful, please give it a star ⭐ on GitHub.
