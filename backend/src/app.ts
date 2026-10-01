import express from "express";
import cors from "cors";
import { env } from "./config/env";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

export default app;
