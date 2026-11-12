
const OpenAI = require("openai");

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing from backend .env");
  }

  return new OpenAI({
    apiKey,
  });
};

module.exports = getOpenAIClient;
