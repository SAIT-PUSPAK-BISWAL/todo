const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
        throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
};

module.exports = connectDB;


