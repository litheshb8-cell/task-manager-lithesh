const mongoose = require('mongoose');

let isConnectedToMongo = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';
  try {
    // Attempt connection with fast server selection timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1200,
    });
    isConnectedToMongo = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnectedToMongo = false;
    console.log(`[Database] MongoDB not detected (${error.message}).`);
    console.log(`[Database] Activated built-in persistent local storage engine.`);
  }
};

const getIsConnectedToMongo = () => isConnectedToMongo;

module.exports = { connectDB, getIsConnectedToMongo };
