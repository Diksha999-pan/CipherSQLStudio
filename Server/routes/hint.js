const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { question, query } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const prompt = `You are a SQL tutor. Given this SQL question: "${question}" 
    and the student's current attempt: "${query || 'nothing written yet'}", 
    give a short hint (2-3 sentences max). Never give the full solution.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    const hint = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!hint) return res.status(500).json({ error: "Could not generate hint" });

    res.json({ hint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;