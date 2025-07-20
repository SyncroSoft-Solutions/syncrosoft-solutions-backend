import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import cron from "node-cron";
import feedbackRoutes from "./routes/feedback.routes.js";

dotenv.config();
const app = express();

const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("✅ Syncrosoft API is running...");
});

// ✅ Feedback Routes
app.use("/api/feedback", feedbackRoutes);

// ✅ Start server after DB connection
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ CRON job to ping server every 14 minutes
cron.schedule("*/14 * * * *", async () => {
  try {
    const res = await axios.get(`http://localhost:${PORT}/`);
    console.log("🔁 Self-ping successful:", res.data);
  } catch (error) {
    console.error("❌ Self-ping failed:", error.message);
  }
});
