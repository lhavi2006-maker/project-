const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from backend/.env');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error.message.includes('bad auth') || error.codeName === 'Unauthorized') {
      console.error(
        'MongoDB authentication failed. Reset the Atlas database user password, update backend/.env, and make sure the username is the database user (not your Atlas login email).'
      );
    } else {
      console.error(`MongoDB connection error: ${error.message}`);
    }
    process.exit(1);
  }
};

module.exports = connectDB;
