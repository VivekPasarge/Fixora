
const { GoogleGenAI } = require("@google/genai");

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from backend .env");
  }

  return new GoogleGenAI({
    apiKey,
  });
};

module.exports = getGeminiClient;
