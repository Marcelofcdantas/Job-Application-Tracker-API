# 🚀 Job Application Tracker API

Backend API for tracking job applications, built with Node.js, TypeScript, Express, MySQL, and Sequelize.

---

## 📌 Features

- User authentication (JWT)
- CRUD for job applications
- Secure password hashing
- RESTful API

---

## 🛠 Tech Stack

- Node.js
- TypeScript
- Express
- MySQL
- Sequelize
- JWT Authentication

---

## 📡 Endpoints

### Auth
- POST /auth/register
- POST /auth/login

### Applications
- GET /applications
- POST /applications

---

## ⚙️ Setup

```bash
npm install
```

Create .env:

```bash
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
JWT_SECRET=
```

Run:
```bash
npm run dev
```
