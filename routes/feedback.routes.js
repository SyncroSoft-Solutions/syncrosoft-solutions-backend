import express from "express";
import Feedback from "../models/Feedback.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// 🛡️ Rate limiter: Allow 1 submission per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1,
  message: { error: "Too many requests. Please wait before submitting again." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 📥 GET /api/feedback - Fetch all feedbacks
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("❌ Error fetching feedbacks:", err);
    res.status(500).json({ error: "Failed to fetch feedbacks." });
  }
});

// 📤 POST /api/feedback - Submit new feedback
router.post("/", limiter, async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const message = req.body.message?.trim();

    if (!name || !message) {
      return res.status(400).json({ error: "Name and message are required." });
    }

    const newFeedback = await Feedback.create({ name, message });

    res.status(201).json({
      _id: newFeedback._id,
      name: newFeedback.name,
      message: newFeedback.message,
      createdAt: newFeedback.createdAt,
    });
  } catch (err) {
    console.error("❌ Error saving feedback:", err);
    res.status(500).json({ error: "Failed to save feedback." });
  }
});

export default router;
