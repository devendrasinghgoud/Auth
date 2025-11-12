import mongoose from "mongoose";
import dotenv from "dotenv";
import Logger from "../utils/logger.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    Logger.info(`MongoDB Connected: ${mongoose.connection.name}`);
  } catch (error) {
    Logger.error("MongoDB Connection Error", { message: error.message, stack: error.stack });
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    Logger.warn("MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    Logger.info("MongoDB reconnected");
  });

  mongoose.connection.on("error", (err) => {
    Logger.error("MongoDB connection error", { message: err.message });
  });
};

export default connectDB;
