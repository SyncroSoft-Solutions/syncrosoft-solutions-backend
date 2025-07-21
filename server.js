import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import cron from "node-cron";
import feedbackRoutes from "./routes/feedback.routes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;
const BACKEND_URL =
  process.env.NODE_ENV === "production" && process.env.BACKEND_URL
    ? process.env.BACKEND_URL
    : `http://localhost:${PORT}`;

// ✅ Updated allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://syncrosoft-solutions.vercel.app", // replace with your frontend domain
];

// 🛡️ CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Blocked CORS origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// 🔁 Self-ping every 14 minutes to prevent Render sleep
cron.schedule("*/14 * * * *", async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/`);
    console.log("🔁 Self-ping successful:", res.data);
  } catch (error) {
    console.error("❌ Self-ping failed:", error.message);
  }
});

// 🔧 Middleware
app.use(express.json());

// ✅ Routes
app.get("/", (req, res) => {
  res.send("✅ Syncrosoft API is running...");
});
app.use("/api/feedback", feedbackRoutes);

// 🚀 MongoDB + Server Start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at ${BACKEND_URL}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
