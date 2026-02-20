# Quick Start - After System Reset

## Start the Application

### Terminal 1: Backend Server
```bash
cd Backend
npm install express mongoose cors dotenv
node index.js
```
✓ Server running on http://localhost:6001

### Terminal 2: Frontend Application
```bash
cd Frontend
npm install
npm start
```
✓ App running on http://localhost:3000

```
# 🔑 Environment Configuration

**Ensure your backend/.env file contains the following keys:**
```bash
PORT=6001
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/
---
