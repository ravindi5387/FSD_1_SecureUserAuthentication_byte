import app from "./app";
import { env } from "./config/env";
import { testDatabaseConnection } from "./config/db";

async function start() {
  try {
    await testDatabaseConnection();
    app.listen(env.port, "0.0.0.0", () => {
      console.log(`API running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
