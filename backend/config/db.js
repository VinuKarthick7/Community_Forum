const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google DNS — fixes SRV lookup failures on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10s to select a server
      socketTimeoutMS: 45000,          // close idle sockets after 45s
    });
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
