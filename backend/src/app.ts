import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import tripsRoutes from "./routes/trips.routes";
import activitiesRoutes from "./routes/activities.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Metroplex API", health: "/health" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
