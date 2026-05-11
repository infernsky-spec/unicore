# EduBridge — University Management System
### Developed by NexaVision Technologies

---

## Quick Start

### Step 1 — Prerequisites
- **Node.js v18+** → https://nodejs.org
- **MongoDB Community** → https://www.mongodb.com/try/download/community
- **VS Code** → https://code.visualstudio.com

### Step 2 — Install dependencies
Open VS Code terminal (Ctrl+`) and run:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 3 — Start MongoDB
Make sure MongoDB is running:
- **Windows**: MongoDB runs as a Windows Service automatically after install
- **Mac**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### Step 4 — Seed the database
```bash
cd backend
npm run seed
```

### Step 5 — Start both servers (TWO terminals)
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev
```

### Step 6 — Open in browser
http://localhost:5173

---

## Login Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edubridge.edu | Admin@123 |
| Teacher | teacher@edubridge.edu | Teacher@123 |
| Student | student@edubridge.edu | Student@123 |
| Parent | parent@edubridge.edu | Parent@123 |
| Course Rep | courserep@edubridge.edu | CourseRep@123 |

---

## Add AI (Optional)
Edit `backend/.env` and add your API keys:
```
ANTHROPIC_API_KEY=sk-ant-...   # Get from console.anthropic.com
OPENAI_API_KEY=sk-...          # Get from platform.openai.com
```
Without keys, the AI assistant runs in smart demo mode.

---

## Enable Google/Apple OAuth (Optional)
The login buttons are present in the UI. To enable:
1. Create a Google OAuth app at console.cloud.google.com
2. Add your Google Client ID to the frontend
3. Implement the OAuth callback flow (see docs/EduBridge_Product_Overview.html)

---

## Documentation
Open `docs/EduBridge_Product_Overview.html` in any browser for the full product guide with screenshots, setup instructions, and copyright information.

---

© 2024 NexaVision Technologies. All rights reserved.
