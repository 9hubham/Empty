const mongoose = require("mongoose");

// Replace with your MongoDB connection string
const mongoURI = "mongodb://localhost:27017/eliste8digitalDatabase";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectToMongo;
