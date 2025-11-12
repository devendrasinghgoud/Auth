import Transport from "winston-transport";
import Log from "../models/Log.js";

class MongoDBTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  async log(info, callback) {
    setImmediate(() => this.emit("logged", info));

    try {
      // Clean log level (remove color codes like \x1B[31merror\x1B[39m)
      const cleanLevel = info.level.replace(/\x1B\[\d+m/g, "");

      // Save log entry to MongoDB
      await Log.create({
        level: cleanLevel,
        message: info.message,
        meta: info.meta || {},
      });

      // Keep only latest 50 error logs
      const errorCount = await Log.countDocuments({ level: "error" });
      if (errorCount > 50) {
        const excess = errorCount - 50;
        const oldest = await Log.find({ level: "error" })
          .sort({ createdAt: 1 }) // oldest first
          .limit(excess)
          .select("_id");

        const ids = oldest.map((log) => log._id);
        await Log.deleteMany({ _id: { $in: ids } });
      }
    } catch (err) {
      console.error("Failed to save log to DB:", err.message);
    }

    callback();
  }
}

export default MongoDBTransport;
