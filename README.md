# Logistics Engine V2.0 – Pincode Analyzer

![Dashboard Preview](file:///C:/Users/Patel%20Dhruvi/.gemini/antigravity/brain/f4b9b2b2-a4fb-4c8a-a20c-b39105e4fb31/section_1_metric_cards_1775373816618.png)

A high-fidelity, premium web application built for visualizing and analyzing India's postal network dataset. It provides real-time geospatial insights, logistics routing simulations, and highly interactive data dashboards to track over 150,000+ branch and delivery offices nationwide.

---

## 🌟 Key Features

* **Advanced Data Dashboard:** Real-time metrics powered by Recharts (Donut, Radar, and Area charts) wrapped in a stunning glassmorphic UI.
* **Geospatial Explore Mode:** Search and filter pincodes across States, Districts, and Taluks with live dropdown populating from MongoDB.
* **Intelligent Auto-Complete:** Search logs, caching, and instant suggestions for over a hundred thousand locations.
* **Delivery Routing Estimator:** Visual intra-state vs inter-state logistic simulation.
* **Integrated Contact System:** Form submissions connected smoothly via EmailJS.
* **Responsive Dark & Light Themes:** Toggleable global aesthetics with dynamic UI elements.

## 🛠 Tech Stack

* **Frontend:** React 19, Tailwind CSS (v4), Vite, Recharts, React Router, Lucide Icons
* **Backend:** Node.js, Express.js, Mongoose
* **Database:** MongoDB Atlas (Cloud NoSQL)
* **Email System:** EmailJS

---

## 🚀 Deployment Guide

This repository is strictly configured to be deployed as two separate web services. Follow these instructions carefully:

### 1. Deploying the Backend (API Server)
**Recommended Platform:** [Render](https://render.com) or [Railway](https://railway.app)

1. Create a new **Web Service** on Render.
2. Link your GitHub repository and point the **Root Directory** to `backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. **CRITICAL ENVIRONMENT VARIABLES:**
   * `MONGODB_URI` = your complete MongoDB Atlas connection string.
   * `PORT` = `5000`
   * `NODE_ENV` = `production`
6. Once deployed, copy your absolute backend URL.

Alternatively, for **Vercel** deployment, native `vercel.json` files have been automatically provided in the `backend` folder. Make sure your serverless entry points are correctly mapped!

### 2. Deploying the Frontend (React App)
**Recommended Platform:** [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

1. Create a new **Project** on Vercel.
2. Import your GitHub repository and point the **Root Directory** to `frontend`.
3. Vercel should auto-detect Vite. Leave Build/Install commands as default (`npm run build`).
4. **CRITICAL ENVIRONMENT VARIABLES:**
   * `VITE_API_URL` = Paste the backend completely qualified URL deployed from the previous step! (Ensure there is NO trailing slash, e.g. `https://your-backend-url.onrender.com/api`)
   * `VITE_EMAILJS_SERVICE_ID` = `service_vehl12p`
   * `VITE_EMAILJS_TEMPLATE_ID` = `service_vehl12p`
   * `VITE_EMAILJS_PUBLIC_KEY` = `QKFS18dSWKVZLrE8g`
5. The frontend ships with a configured `vercel.json` providing strict SPA rewrites so routing resolves correctly.

---

## 💻 Local Development Setup

To run everything locally simultaneously:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```
*(Server opens on `http://localhost:5000`)*

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*(Client opens on `http://localhost:5173`)*

*Ensure your local `.env` files mimic the necessary variables required for production mapping!*

---
© 2026 NEXUS OS — Built for precision intelligence.