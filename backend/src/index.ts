import express from "express";
import cors from "cors";
import "dotenv/config";
import { clientInfoMiddleware } from "./midllewares/clientInfo";
import domainsRouter from "./routes/domains.routes";
import { testConnection } from "./config/database/db.test";

const app = express();

app.use(cors());
app.use(express.json());
app.use(clientInfoMiddleware);



app.use("/api/v1", domainsRouter);

app.get("api/v1/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Test database connection endpoint
app.get("/api/v1/test-db", async (_req, res) => {
  const isConnected = await testConnection();
  if (isConnected) {
    res.json({ status: "Database connected successfully!" });
  } else {
    res.status(500).json({ status: "Failed to connect to database" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});