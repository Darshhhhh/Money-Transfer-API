import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import transferRoutes from "./routes/transfers.js";
import { errorHandler } from "./middleware/error.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

app.use("/auth", authRoutes);
app.use("/transfers", transferRoutes);

app.get("/health", (_, res) => res.json({ ok: true }));

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`API running on http://localhost:${process.env.PORT}`);
});
