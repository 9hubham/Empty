require('dotenv').config();
const mongoose = require("mongoose");

// Get MongoDB URI from environment variables
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/eliste8digitalDatabase";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB successfully");
    console.log(`📍 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connection: ${mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}`);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    
    if (mongoURI.includes('mongodb+srv')) {
      console.log("💡 MongoDB Atlas connection failed. Check:");
      console.log("   - Internet connection");
      console.log("   - Username and password in connection string");
      console.log("   - IP whitelist in MongoDB Atlas");
    } else {
      console.log("💡 Local MongoDB connection failed. Make sure MongoDB is running on localhost:27017");
    }
    
    process.exit(1);
  }
};

module.exports = connectToMongo;