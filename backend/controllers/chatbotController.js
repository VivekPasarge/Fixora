
const getOpenRouterConfig = require("../config/openrouter");

const FIXI_INSTRUCTIONS = `
You are Fixi, the friendly virtual assistant for Fixora, a home services booking platform.

Your responsibilities:
1. Help customers understand how Fixora works.
2. Explain services such as plumbing, electrical work, cleaning, painting, carpentry, AC repair and appliance repair.
3. Guide customers through booking a service.
4. Explain booking statuses, payments and technician tracking.
5. Answer questions clearly using simple English.

Rules:
- Keep answers short, clear and helpful.
- Never claim that a booking has been created or modified.
- Never claim to know a technician's live location or booking details.
- Do not invent prices, availability, OTPs or payment information.
- If a customer needs help with an actual booking, guide them to the My Bookings section.
- If you do not know something, say so honestly.
- You are Fixora's assistant, not a general-purpose chatbot.
`;

const chatWithFixi = async (req, res) => {
  try {
    // Only customers can use Fixi.
    if (String(req.user?.role || "").toLowerCase() !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can use Fixi.",
      });
    }

    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    const config = getOpenRouterConfig();

    // Keep only the last 10 valid conversation messages.
    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              ["user", "assistant"].includes(item.role) &&
              typeof item.content === "string"
          )
          .slice(-10)
          .map((item) => ({
            role: item.role,
            content: item.content.slice(0, 2000),
          }))
      : [];

    const messages = [
      {
        role: "system",
        content: FIXI_INSTRUCTIONS,
      },
      ...safeHistory,
      {
        role: "user",
        content: message.trim().slice(0, 2000),
      },
    ];

    const response = await fetch(config.baseURL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.APP_URL || "https://fixora-4cdg.vercel.app",
        "X-Title": "Fixora Fixi",
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: 400,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "OpenRouter error:",
        response.status,
        data?.error?.message || "Unknown provider error"
      );

      return res.status(response.status === 429 ? 503 : 502).json({
        success: false,
        message:
          response.status === 429
            ? "Fixi is temporarily busy. Please try again later."
            : "Fixi could not respond right now. Please try again.",
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply || typeof reply !== "string") {
      return res.status(502).json({
        success: false,
        message: "Fixi received an empty response. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      reply: reply.trim(),
    });
  } catch (error) {
    console.error("Fixi chatbot error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

module.exports = { chatWithFixi };
