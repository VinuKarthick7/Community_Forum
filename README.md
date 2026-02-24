#  ***IPS Tech Community Forum***

A full-stack MERN (MongoDB, Express, React, Node.js) community forum platform for structured technical discussions, knowledge sharing, and Q&A.

##  Features

### Core Functionality
-   **User Authentication** - Secure JWT-based register/login system
-   **Role-Based Access** - Student and Admin roles with different permissions
-   **Post Management** - Create, read, update, delete (CRUD) posts
-   **Comment System** - Add comments and replies to posts
-   **Upvote System** - Toggle upvotes on posts
-   **Category Management** - Organize posts by categories
-   **Tag System** - Tag posts with keywords for better discovery
-   **Search Functionality** - Full-text search across posts
-   **User Dashboard** - Personal stats and post management
-   **Admin Panel** - Moderation tools for admins


## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation OR Docker OR MongoDB Atlas account)

---

## 🛠️ Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd community_forum
```

### 2. Setup Database (Choose ONE option)

#### Option A: MongoDB with Docker (Recommended)
```bash
docker-compose up -d
```

#### Option B: MongoDB Atlas (Cloud - Free)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get connection string
3. Update `backend/.env` with your connection string

#### Option C: Local MongoDB
Install MongoDB Community Server for your OS

### 3. Backend Setup
```bash
cd backend
npm install
```

Edit `backend/.env` if needed (defaults to localhost MongoDB):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ips_forum
JWT_SECRET=ips_tech_forum_super_secret_key_2026
NODE_ENV=development
```

Seed default categories:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```
Backend runs on **http://localhost:5000**

### 4. Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

---

## 🎯 Usage

1. Open http://localhost:5173 in your browser
2. Register a new account
3. Create your first post
4. Explore features:
   - Search posts
   - Filter by category
   - Filter by tags
   - Upvote posts
   - Add comments
   - View your dashboard


## 🎨 Available Scripts

### Backend Scripts
```bash
npm start         # Start production server
npm run dev       # Start development server with nodemon
npm run seed      # Seed default categories
```

### Frontend Scripts
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## 🌐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ips_forum
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🐳 Docker Support

Start MongoDB using Docker Compose:
```bash
docker-compose up -d
```

Stop MongoDB:
```bash
docker-compose down
```

View MongoDB logs:
```bash
docker-compose logs -f mongodb
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `dist` folder
3. Set environment variable: `VITE_API_URL=<your-backend-url>`

### Backend Deployment (Render/Railway/Heroku)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables (PORT, MONGO_URI, JWT_SECRET)
4. Deploy

### Database (MongoDB Atlas)
Use MongoDB Atlas for production database

---



## 📚 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS** - Styling (no framework)




**Built with ❤️ for the IPS Tech Community**
