# 🚀 IPS Tech Community Forum

A full-stack MERN (MongoDB, Express, React, Node.js) community forum platform for structured technical discussions, knowledge sharing, and Q&A.

## ✨ Features

### Core Functionality
- ✅ **User Authentication** - Secure JWT-based register/login system
- ✅ **Role-Based Access** - Student and Admin roles with different permissions
- ✅ **Post Management** - Create, read, update, delete (CRUD) posts
- ✅ **Comment System** - Add comments and replies to posts
- ✅ **Upvote System** - Toggle upvotes on posts
- ✅ **Category Management** - Organize posts by categories
- ✅ **Tag System** - Tag posts with keywords for better discovery
- ✅ **Search Functionality** - Full-text search across posts
- ✅ **User Dashboard** - Personal stats and post management
- ✅ **Admin Panel** - Moderation tools for admins

### Technical Features
- Responsive Dark Theme UI
- JWT Token Authentication
- Password Hashing with bcrypt
- MongoDB with Mongoose ODM
- RESTful API Architecture
- React Context for State Management
- Pagination for Posts
- Protected Routes
- Error Handling

---

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

### Creating an Admin User

To access admin features, manually update a user in MongoDB:

```javascript
// MongoDB Shell or MongoDB Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Then login with that account to access the Admin Panel.

---

## 📁 Project Structure

```
community_forum/
├── backend/                # Node.js/Express backend
│   ├── config/            # Database configuration
│   ├── controllers/       # Request handlers
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── commentController.js
│   │   └── postController.js
│   ├── middlewares/       # Auth & validation middleware
│   │   └── auth.js
│   ├── models/            # Mongoose schemas
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   └── Category.js
│   ├── routes/            # API route definitions
│   │   ├── auth.js
│   │   ├── categories.js
│   │   ├── comments.js
│   │   └── posts.js
│   ├── .env               # Environment variables
│   ├── server.js          # Express app entry point
│   ├── seed.js            # Database seeding script
│   └── package.json
│
├── frontend/              # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/          # Axios configuration
│   │   │   └── axios.js
│   │   ├── components/   # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── PostCard.jsx
│   │   ├── context/      # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/        # Route pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── PostDetail.jsx
│   │   │   ├── CreatePost.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── App.jsx       # Main app with routes
│   │   ├── App.css
│   │   ├── index.css     # Global styles
│   │   └── main.jsx      # Entry point
│   ├── .env              # Frontend environment variables
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml     # MongoDB Docker setup
├── SETUP_GUIDE.md        # Detailed setup instructions
└── README.md             # This file
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Posts
- `GET /api/posts` - Get all posts (with search, filter, pagination)
- `GET /api/posts/:id` - Get single post with comments
- `POST /api/posts` - Create post (protected)
- `PUT /api/posts/:id` - Update post (protected, owner/admin)
- `DELETE /api/posts/:id` - Delete post (protected, owner/admin)
- `POST /api/posts/:id/upvote` - Toggle upvote (protected)

### Comments
- `POST /api/comments` - Add comment (protected)
- `DELETE /api/comments/:id` - Delete comment (protected, owner/admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (protected, admin)
- `DELETE /api/categories/:id` - Delete category (protected, admin)

---

## 🧪 Testing

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

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

## 🛡️ Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ Role-based authorization
- ✅ Input validation
- ✅ CORS configuration
- ✅ Error handling

---

## 🐛 Troubleshooting

### Backend won't start
- **Error**: `EADDRINUSE` → Port 5000 is in use, change PORT in .env
- **Error**: `querySrv ENOTFOUND` → MongoDB not running or wrong URI
- **Solution**: Check MongoDB is running and .env is configured correctly

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend/.env
- Check browser console for CORS errors

### Can't login after registration
- Ensure backend connected to database
- Check JWT_SECRET is set in backend/.env
- Clear browser localStorage and try again

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

---

## 🗺️ Roadmap (Future Enhancements)

- [ ] AI-powered smart search
- [ ] Duplicate question detection
- [ ] User leaderboard and badges
- [ ] Email notifications
- [ ] Real-time chat/messaging
- [ ] File attachments in posts
- [ ] Code syntax highlighting
- [ ] Markdown support
- [ ] User profile pages
- [ ] Follow users/topics
- [ ] Report system

---

## 📄 License

MIT License - Feel free to use this project for learning or production.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Built with ❤️ for the IPS Tech Community**
