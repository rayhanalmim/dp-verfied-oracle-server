import app from "./app";
import mongoose from "mongoose";
import config from "./config";
import { logger } from "./services/loggerService";

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodbUri);
    logger.info(`Connected to MongoDB at ${config.mongodbUri}`);
    
    // Start server
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

main();