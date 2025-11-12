import winston from "winston";
import MongoDBTransport from "./dbTransport.js";
import path from "path";
import fs from "fs";

// Ensure logs folder exists
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Log format (simple + timestamp)
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    //  Store only ERROR logs (very small, readable)
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 100 * 1024, // 100 KB per file
      maxFiles: 5, // keep only 5 files
      tailable: true, // keeps the newest logs
    }),

    //  Store INFO and WARN logs (small size)
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      level: "info",
      maxsize: 150 * 1024, // 150 KB per file
      maxFiles: 3,
      tailable: true,
    }),

    // 🗄️ Optional: MongoDB Transport (stores only 50 latest errors)
    new MongoDBTransport(),
  ],
});

export default logger;
