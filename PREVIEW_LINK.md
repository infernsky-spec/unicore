# 🔗 UniCore Preview & Deployment Links

This document provides the links and methods to launch or share the UniCore system.

## 1. 🚀 One-Click Launch (Local)
To launch the system on your machine immediately:
1.  Open the project folder.
2.  Double-click **`Launch_UniCore.bat`**.
3.  The system will boot both servers and open `http://localhost:5173` automatically.

---

## 2. ⚡ Instant Public Preview (No Deployment Needed)
If you want to give another user a link to preview your **locally running** system:

1.  Run the system using `Launch_UniCore.bat`.
2.  Open a new terminal and run:
    ```bash
    npx localtunnel --port 5173
    ```
3.  Copy the URL provided (e.g., `https://funny-cats-jump.loca.lt`) and send it to your user.
    *Note: This link will work as long as your terminal remains open.*

---

## 3. 🌐 Permanent Public Deployment
For a permanent link that others can use anytime:

### **Frontend (Vercel)**
1.  Push your code to GitHub.
2.  Go to [Vercel](https://vercel.com) and import the `frontend` folder.
3.  Vercel will provide a permanent `https://...vercel.app` link.

### **Backend (Render)**
1.  Import the `backend` folder to [Render](https://render.com).
2.  Set the `MONGO_URI` environment variable to a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud database.
3.  Update the `CLIENT_URL` in your backend `.env` to your Vercel link.

---

## 🎨 Design Hub
For a professional overview of all deployment options, open:
👉 **`UniCore_Gateway.html`** in your browser.

---
*Powered by NexaVision Technologies*
