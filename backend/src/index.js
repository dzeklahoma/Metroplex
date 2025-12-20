import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import tripsRoutes from "./routes/trips.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/trips", tripsRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on ${PORT}`));
