
const express = require("express");
const { rateLimit } = require("express-rate-limit");

const router = express.Router();

// Authentication middleware
const { protect } = require("../middleware/authMiddleware");

// Chatbot controller
const { chatWithFixi } = require("../controllers/chatbotController");

// Limit chatbot requests
const chatbotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages. Please try again after some time.",
  },
});

// Fixi chatbot endpoint
router.post(
  "/chat",
  protect,
  chatbotLimiter,
  chatWithFixi
);

module.exports = router;
