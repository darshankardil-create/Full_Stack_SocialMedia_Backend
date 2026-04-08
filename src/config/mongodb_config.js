import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.mongoUrl);
    console.log("Successfully connected Mongodb");
  } catch (error) {
    console.log("Failed to connect Mongodb", error);
    process.exit(1)
  }
}
