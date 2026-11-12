const getOpenRouterConfig = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing from backend .env");
  }

  return {
    apiKey,
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    baseURL: "https://openrouter.ai/api/v1/chat/completions",
  };
};

module.exports = getOpenRouterConfig;