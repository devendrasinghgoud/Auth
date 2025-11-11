import Transport from "winston-transport";
import Log from "../models/Log.js";

// Custom transport class to store logs in MongoDB
class MongoDBTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  async log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    try {
      // Save log to MongoDB
      await Log.create({
        level: info.level,
        message: info.message,
        meta: info.meta || {},
      });
    } catch (err) {
      console.error("Failed to save log to DB:", err.message);
    }

    callback();
  }
}

export default MongoDBTransport;
