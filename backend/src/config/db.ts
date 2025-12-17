// src/config/db.ts
import mongoose from "mongoose";
import env from "./env";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${env.MONGO_URI.split('@')[1]?.split('?')[0] || 'MongoDB'}`);
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
};
