# 🌐 Live Website :
# https://fullstactsocialmediafrontendversal.vercel.app

# Frontend repository:
## https://github.com/darshankardil-create/fullstactsocialmediafrontendversal

# Backend repository

# 📁 Backend Directory Structure

```bash
.
├── src
│   ├── config
│   │   └── mongodb_config.js      # MongoDB connection setup
│   ├── middleware
│   │   └── ratelimit.js           # Rate limiting (Upstash Redis)
│   ├── controller.js              # Business logic (Auth, Users, Posts)
│   ├── routes.js                  # API routes
│   └── Schema.js                  # Mongoose schemas & JWT logic
└── server.js                      # Entry point (Express + Socket.IO)
```

---

# ⚙️ Core Architecture

## 🧩 Server (`server.js`)

* Express app initialization
* MongoDB connection
* Middleware:

  * CORS (restricted origins)
  * JSON parsing
  * Request logging
  * Rate limiting
* Routes mounted at: `/express`
* Socket.IO setup for real-time features

---

## 🗄️ Database (`mongodb_config.js`)

* Connects using `mongoose`
* Uses `process.env.mongoUrl`
* Exits app on failure

---

## 🧠 Schemas (`Schema.js`)

### 👤 User

* Fields: `Name`, `UserName (unique)`, `Password`
* Features:

  * Password hashing (bcrypt)
  * Password compare method
  * JWT token generation

### 📝 Posts

* Fields:

  * `TextPost`, `Imgurl`
  * `UserName`, `Name`
  * `CommentsonPost` (array of comments/likes)
* Supports:

  * Comments
  * Likes / Unlike

---

## 🎮 Controllers (`controller.js`)

### 🔐 Auth

* `sendtokenforsignup` → Signup + JWT
* `login` → Login + JWT
* `verifytoken` → Verify JWT

### 👤 User

* `Userinfodoc` → Get user (without password)
* `deleteac` → Delete account (with password check)

### 📝 Posts

* `getallpost` → Paginated posts (offset + limit)
* `getonlymypost` → User-specific posts

---

## 🌐 Routes (`routes.js`)

Base: `/express`

| Method | Endpoint                     | Description    |
| ------ | ---------------------------- | -------------- |
| POST   | `/sendtokenforsignin`        | Signup         |
| POST   | `/login`                     | Login          |
| GET    | `/verifytoken`               | Verify JWT     |
| GET    | `/Userinfodoc/:id`           | Get user info  |
| GET    | `/getallpost/:offset/:limit` | Get posts      |
| GET    | `/getonlymypost/:userid`     | User posts     |
| DELETE | `/deleteac/:userid`          | Delete account |

---

## 🚦 Rate Limiting (`ratelimit.js`)

* Upstash Redis based
* Limit: **20 requests / 10 seconds**
* Applied on all `/express` routes

---

# 🔌 Socket.IO – Real-Time System

## 🟢 Connection

```js
io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);
});
```

---

# 📡 Client → Server (Listeners)

## 📝 Create Post

**Event:** `post message`

```js
socket.on("post message", async (data) => {})
```

**Payload:**

```json
{
  "messageforpost": "Text content",
  "imgurl": ["img1"],
  "Username": "user123",
  "name": "Darshan"
}
```

---

## 💬 Comment / Like

**Event:** `comment`

```js
socket.on("comment", async (data) => {})
```

**Payload:**

```json
{
  "postid": "post_id",
  "commentobj": {
    "comment": "Nice!",
    "name": "Darshan",
    "username": "user123",
    "time": "Date",
    "like": false
  }
}
```

👉 `like: true` → Like
👉 `like: false` → Comment

---

## ❌ Unlike

**Event:** `unlike`

```js
socket.on("unlike", async (data) => {})
```

**Payload:**

```json
{
  "postid": "post_id",
  "commentobj": {
    "username": "user123",
    "like": true
  }
}
```

---

# 📤 Server → Client (Emitters)

## ✅ Post Status

```js
socket.emit("Status", {
  status: "successfull",
  message: "Post created successfully"
});
```

---

## 💬 Comment / Like Status

```js
socket.emit("commentStatus", {
  status: "successfull",
  message: "Successfully comment send"
});
```

```js
socket.emit("commentStatus", {
  status: "successfull",
  message: "Successfully liked the post"
});
```

---

## ❌ Unlike Status

```js
socket.emit("unlikeStatus", {
  status: "successfull",
  message: "Successfully unlike"
});
```

---

# ⚡ Flow Summary

* Client → `post message` → DB save → `Status`
* Client → `comment` → DB update → `commentStatus`
* Client → `unlike` → DB update → `unlikeStatus`

---

# 🔐 Security Highlights

* Password hashing (**bcrypt**)
* JWT authentication
* Rate limiting (anti-spam)
* CORS restricted origins
* Password excluded from responses

---

## 👨‍💻 Author

**Darshan Kardile**
