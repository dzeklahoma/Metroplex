import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import tripsRoutes from "./routes/trips.routes";
import activitiesRoutes from "./routes/activities.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

export const app = express();

// Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

// Strict CORS
// Strict CORS (allow frontend + swagger UI on same host)
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

// dev convenience (Swagger runs from the same backend origin)
allowedOrigins.add("http://localhost:3001");
allowedOrigins.add("http://127.0.0.1:3001");

// optional: if you sometimes open frontend on different hosts/ports
allowedOrigins.add("http://localhost:5173");
allowedOrigins.add("http://127.0.0.1:5173");

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      const err: any = new Error("Not allowed by CORS");
      err.status = 403;
      return cb(err);
    },
    credentials: true,
  }),
);

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

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
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error(err);

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(status).json({ message });
});
