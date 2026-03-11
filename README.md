# Auth7

A **plug-and-play authentication system for Node.js and Express**.

Auth7 provides a secure, flexible authentication solution with **JWT sessions, refresh tokens, email verification, password reset, and extensible user schemas**.

Built with **security, scalability, and developer experience in mind**.

---

## 🔗 Links

* 🌐 **Portfolio:** https://vinaydev.in
* 📦 **GitHub Repository:** https://github.com/codes4vinay/auth7
* 📘 **Documentation:** https://vkprojects.us.cc/

---

## ✨ Features

* Cookie-based **JWT authentication**
* **Access & Refresh tokens**
* **Email verification** (Dev mode + SMTP support)
* **Password reset system**
* **Session invalidation**
* **Custom user schema support**
* **Plugin-style architecture**
* **Rate-limit ready**
* Secure password hashing with **bcrypt**
* Built-in **token expiry enforcement**

---

# 📦 Installation

```bash
npm install auth7-kit
```

For local development:

```bash
npm install ../auth7
```

---

# 🚀 Quick Start

## 1️⃣ Setup Express App

```javascript
import express from "express";
import cookieParser from "cookie-parser";
import auth from "auth7-kit";

const app = express();

app.use(express.json());
app.use(cookieParser());
```

---

## 2️⃣ Initialize Auth

```javascript
await auth.init({
  dbURI: "mongodb://127.0.0.1:27017/mydb",
  jwtSecret: "my-secret-key",
  appUrl: "http://localhost:4000",

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

## 3️⃣ Mount Authentication Routes

```javascript
app.use("/auth", auth.routes());
```

---

## 4️⃣ Protect Routes

```javascript
app.get("/profile", auth.protect(), (req, res) => {
  res.json({
    user: req.user
  });
});
```

---

## 5️⃣ Start Server

```javascript
app.listen(4000, () => {
  console.log("Server running on port 4000");
});
```

---

# 🔐 Authentication Flow

### Register

```
POST /auth/register
```

Creates an unverified user and sends a verification link.

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

* **access_token** (15 minutes)
* **refresh_token** (7 days)

Authentication lifecycle:

```
User Login
   │
   ▼
Server issues:
Access Token (15m)
Refresh Token (7d)
   │
   ▼
Client requests API
   │
   ▼
Access Token Valid → allow
   │
   ▼
Access Token Expired
   │
   ▼
Client calls /refresh
   │
   ▼
Refresh Token Valid
   │
   ▼
Server issues new Access Token
```

---

### Refresh Token

```
POST /auth/refresh
```

Issues a new access token using a valid refresh token.

---

### Logout

```
POST /auth/logout
```

Clears cookies and invalidates the session.

---

# 🔁 Password Reset

### Request Password Reset

```
POST /auth/forgot-password
```

Sends a reset link if the account exists.

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

All active sessions are revoked after password reset.

---

# 📧 Email System

## Development Mode

If SMTP is not configured, verification and reset links are printed in the terminal.

Example output:

```
📧 DEV MAIL
http://localhost:4000/auth/verify?token=xxxx
```

---

## Production Mode (SMTP)

Provide SMTP configuration:

```javascript
await auth.init({
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  smtpUser: "your@gmail.com",
  smtpPass: "app-password",
  smtpFrom: "Auth System <your@gmail.com>"
});
```

---

# 👤 Custom User Schema

Extend the user model easily:

```javascript
customSchema: {
  phone: String,
  address: String,
  dob: Date
}
```

These fields will be stored automatically during registration.

---

# 🛡 Security Features

* **HttpOnly cookies**
* **JWT issuer validation**
* **Password hashing (bcrypt)**
* **Refresh token storage**
* **Session revocation**
* **Token expiry enforcement**
* **Rate limit ready**

---

# 📚 API Reference

| Method | Route                 | Description            |
| ------ | --------------------- | ---------------------- |
| POST   | /auth/register        | Register user          |
| POST   | /auth/login           | Login                  |
| GET    | /auth/verify          | Verify email           |
| POST   | /auth/refresh         | Refresh token          |
| POST   | /auth/logout          | Logout                 |
| POST   | /auth/forgot-password | Request password reset |
| POST   | /auth/reset-password  | Reset password         |

---

# ⚙ Configuration Options

| Option       | Required | Description               |
| ------------ | -------- | ------------------------- |
| dbURI        | ✅        | MongoDB connection string |
| jwtSecret    | ✅        | JWT secret key            |
| appUrl       | ✅        | Base application URL      |
| customSchema | ❌        | Extend user model         |
| smtpHost     | ❌        | SMTP host                 |
| smtpPort     | ❌        | SMTP port                 |
| smtpUser     | ❌        | SMTP username             |
| smtpPass     | ❌        | SMTP password             |
| smtpFrom     | ❌        | Sender email              |

---

# 🛣 Roadmap

Planned improvements:

* User profile update
* Email change with re-verification
* Advanced rate limiting
* Refresh token rotation
* Role-based access control
* Redis session support

---

# 🤝 Contributing

Contributions are welcome.

```
fork repository
git clone
npm install
npm run dev
```

---

# 📜 License

MIT License

---

# 👨‍💻 Author

**Vinay Kumar**

Portfolio: https://vinaydev.in

---

# ⭐ Support

If you find this project useful, please give it a **star ⭐ on GitHub**.

https://github.com/codes4vinay/auth7
