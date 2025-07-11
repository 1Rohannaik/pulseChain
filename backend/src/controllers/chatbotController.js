const axios = require("axios");
const jwt = require("jsonwebtoken");

const handleChat = async (req, res) => {
  // ✅ 1. Support cookie *or* Authorization header
  const authHeader = req.headers.authorization;
  const token =
    req.cookies.jwt ||
    (authHeader?.startsWith("Bearer ") && authHeader.split(" ")[1]);

  if (!token) {
    return res.status(401).json({ error: "Please login to use this service" });
  }

  try {
    // 2. Verify JWT
    jwt.verify(token, process.env.JWT_SECRET);

    // 3. Validate question
    const { question } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Valid question required" });
    }

    // 4. Filter only medical questions
    if (!isMedicalQuestion(question)) {
      return res.json({
        answer:
          "As a medical assistant, I can only discuss health-related topics.",
      });
    }

    // 5. Call OpenRouter API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",
        messages: [
          {
            role: "system",
            content: `You are Dr. MedAI. Strict rules:
            1. Only answer medical questions
            2. Never diagnose or prescribe
            3. Always recommend doctor consultation
            4. For non-medical: "I specialize only in medical topics"`,
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            req.headers.origin || "https://pulsechain.onrender.com",
          "X-Title": "Medical-Chat-Service",
        },
        timeout: 10000,
      }
    );

    const answer = response?.data?.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error("Invalid response from AI service");
    }

    return res.json({ answer });
  } catch (error) {
    console.error("Chat error:", error);

    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .clearCookie("jwt")
        .json({ error: "Session expired. Please login again." });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: "AI service error",
        details:
          error.response.data.error?.message ||
          `Model error: ${error.response.data.error?.type}`,
      });
    }

    return res.status(500).json({
      error: "Medical service unavailable",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ✅ Utility to detect medical relevance
function isMedicalQuestion(text) {
  if (typeof text !== "string") return false;

  const medicalTerms = [
    "pain",
    "symptom",
    "diagnos",
    "treat",
    "medic",
    "disease",
    "illness",
    "health",
    "doctor",
    "hospital",
    "pharma",
    "clinic",
    "patient",
    "therapy",
    "vaccine",
    "infection",
    "blood",
    "heart",
    "lung",
    "brain",
    "cancer",
    "diabetes",
    "pressure",
    "allergy",
    "asthma",
    "arthritis",
    "fever",
    "headache",
    "cough",
    "rash",
    "injury",
    "fracture",
    "pregnancy",
    "mental",
    "depression",
    "anxiety",
  ];

  const question = text.toLowerCase();
  return medicalTerms.some((term) => question.includes(term));
}

module.exports = { handleChat };
