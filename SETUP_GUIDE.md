# IPS Tech Community Forum - Setup Guide

## 🚨 Current Status: **DATABASE CONNECTION NEEDED**

The project is fully built but needs a database connection to run.

---

## 🎯 Quick Fix - Choose ONE Option:

### **Option 1: MongoDB with Docker (RECOMMENDED - Easiest)**

If Docker is installed (already detected on your system):

```bash
# Start MongoDB using Docker Compose
docker-compose up -d

# Verify MongoDB is running
docker ps

# Backend .env is already configured for localhost MongoDB
```

### **Option 2: MongoDB Atlas (Cloud - Free Tier)**

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (Free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ips_forum?retryWrites=true&w=majority
   ```
   Replace `<username>` and `<password>` with your credentials

### **Option 3: Install MongoDB Locally**

**Windows:**
```bash
# Download MongoDB Community Server from:
# https://www.mongodb.com/try/download/community

# Install and start MongoDB service
# backend/.env is already configured for localhost
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

---

## 📦 Complete Setup Steps

### 1. **Setup Database** (Choose option above)

### 2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

### 3. **Seed Default Categories**
```bash
npm run seed
```

### 4. **Start Backend Server**
```bash
npm run dev
# Server will run on http://localhost:5000
```

### 5. **Install Frontend Dependencies** (New Terminal)
```bash
cd frontend
npm install
```

### 6. **Start Frontend Server**
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

---

## ✅ Testing the Application

1. Open http://localhost:5173
2. Register a new account
3. Create your first post
4. Test features:
   - ✅ Post creation
   - ✅ Comments
   - ✅ Upvotes
   - ✅ Search
   - ✅ Categories
   - ✅ Dashboard

### Create Admin User
To test admin features, create a user then manually update in MongoDB:
```javascript
// In MongoDB shell or Compass:
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

## 🐛 Troubleshooting

### Backend won't start
- **Error**: `querySrv ENOTFOUND` → MongoDB not running or wrong connection string
- **Error**: `EADDRINUSE` → Port 5000 already in use, change PORT in .env
- **Solution**: Verify database connection in `.env` file

### Frontend won't connect
- Check backend is running on port 5000
- Verify `frontend/.env` has `VITE_API_URL=http://localhost:5000/api`

### Can't login/register
- Ensure backend is connected to database
- Check browser console for errors
- Verify JWT_SECRET is set in backend/.env

---

## 📁 Project Structure

```
community_forum/
├── backend/
│   ├── config/        # Database configuration
│   ├── controllers/   # Request handlers
│   ├── middlewares/   # Auth & validation
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API endpoints
│   ├── .env           # Environment variables ⚙️
│   ├── server.js      # Entry point
│   └── seed.js        # Database seeding
├── frontend/
│   ├── src/
│   │   ├── api/       # Axios configuration
│   │   ├── components/# Reusable UI components
│   │   ├── context/   # Auth context
│   │   ├── pages/     # Route pages
│   │   └── App.jsx    # Main app component
│   └── .env           # Frontend config
└── docker-compose.yml # Docker MongoDB setup
```

---

## 🚀 Available NPM Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm run seed` - Seed default categories

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

## 🔐 Default Configuration

**Backend (.env):**
- PORT: 5000
- MONGO_URI: mongodb://localhost:27017/ips_forum
- JWT_SECRET: (already configured)

**Frontend (.env):**
- VITE_API_URL: http://localhost:5000/api

---

## 📝 Next Steps After Setup

1. ✅ **Database connected and running**
2. ✅ **Both servers running**
3. Create test accounts
4. Create admin user (manually in database)
5. Test all features
6. Deploy to production (optional)

---

## 🌐 Deployment (Optional)

**Frontend:**
- Vercel: `vercel deploy`
- Netlify: Connect GitHub repo

**Backend:**
- Render: Connect GitHub, add env vars
- Railway: `railway up`

**Database:**
- Use MongoDB Atlas for production

---

## 💡 Features Implemented

✅ User Authentication (Register/Login)
✅ Role-based Access (Student/Admin)
✅ Post CRUD Operations
✅ Comment System
✅ Upvote System
✅ Category Management
✅ Search Functionality (text search)
✅ Tag System
✅ User Dashboard
✅ Admin Panel
✅ Responsive Design
✅ JWT Authentication
✅ Password Hashing

---

## 📞 Need Help?

The application is **fully built** and ready to run. The only blocker is the database connection. Follow Option 1 (Docker) for the fastest setup!
