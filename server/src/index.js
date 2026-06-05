import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";

dotenv.config();

const port = process.env.PORT || 8080;

connectDatabase().then(() => {
  const server = app.listen(port, () => {
    console.log(`WiseBook API listening on ${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Stop the old backend process or choose another PORT in server/.env.`);
      process.exit(1);
    }

    throw error;
  });
}).catch((error) => {
  console.error("WiseBook API failed to start:", error.message);
  process.exit(1);
});
