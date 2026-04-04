# pincode_analyzer# 📮 PIN Code Directory Application

A full-stack web application to search, explore, and manage Indian PIN codes with cascading filters, real-time search, analytics dashboard, and supplier features.

## 🚀 Live Demo
[Add your deployed URL here]

## ✨ Features

### Core Features
- **Cascading Filters** - State → District → Taluk with instant updates
- **Real-time Search** - Debounced search with auto-suggestions
- **Data Table** - Sortable, paginated table (10/20/50/100 rows)
- **PIN Code Details** - Complete information with map view
- **Dashboard Analytics** - Stats cards, bar charts, pie charts
- **Export Data** - Download filtered data as CSV
- **Dark Mode** - Light/Dark theme toggle
- **Responsive Design** - Mobile, tablet, desktop friendly

### User Features
- 🔍 Nearby PIN Code Finder
- ⭐ Save Favorites
- 📜 Recently Viewed History
- 🗺️ Interactive Map Integration
- 📱 PWA Support

### Supplier Features
- 📦 Serviceable PIN Code Checker
- 💰 Shipping Rate Calculator
- 📊 Search Trend Analytics
- 🔑 API Key Management

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| State Management | React Query, Context API |
| Charts | Recharts |
| Maps | Leaflet |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, Bcrypt |
| Security | Helmet, CORS, Rate Limit |

## 📁 Project Structure
pincode-directory-app/
├── backend/
│ ├── models/
│ │ ├── Pincode.js
│ │ └── User.js
│ ├── routes/
│ │ ├── states.js
│ │ ├── districts.js
│ │ ├── taluks.js
│ │ ├── pincodes.js
│ │ ├── search.js
│ │ ├── stats.js
│ │ └── export.js
│ ├── controllers/
│ ├── middleware/
│ ├── server.js
│ └── package.json
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── hooks/
│ │ ├── services/
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── index.html
│ └── package.json
└── README.md

text

## 🚀 Installation

### Prerequisites
- Node.js v16+
- MongoDB Atlas account

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/pincode-directory-app.git
cd pincode-directory-app
Step 2: Backend Setup
bash
cd backend
npm install
npm install express mongoose cors dotenv helmet morgan compression bcryptjs jsonwebtoken express-rate-limit
npm install -D nodemon
Step 3: Frontend Setup
bash
cd ../frontend
npm install
npm install axios react-router-dom react-query react-hot-toast recharts react-select leaflet react-leaflet lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
Step 4: Environment Variables
Backend (.env)

env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pincodedb
JWT_SECRET=your_super_secret_key
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
Frontend (.env)

env
VITE_API_URL=http://localhost:5000/api
🗄️ MongoDB Indexes
Run in MongoDB Compass or shell:

javascript
db.pincodes.createIndex({ state: 1 })
db.pincodes.createIndex({ district: 1 })
db.pincodes.createIndex({ taluk: 1 })
db.pincodes.createIndex({ pincode: 1 })
db.pincodes.createIndex({ state: 1, district: 1 })
db.pincodes.createIndex({ state: 1, district: 1, taluk: 1 })
🏃 Running the Application
Terminal 1 - Backend
bash
cd backend
npm run dev
# Runs on http://localhost:5000
Terminal 2 - Frontend
bash
cd frontend
npm run dev
# Runs on http://localhost:5173