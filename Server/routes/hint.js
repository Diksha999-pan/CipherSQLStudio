const express = require("express");
const router = express.Router();

// tracks hint requests per session to soft rate-limit
const hintLog = new Map();

const buildPrompt = (question, tableSchemas, userQuery) => {
  const schemaText = tableSchemas
    .map(t => `Table "${t.tableName}": columns are ${t.columns.map(c => `${c.columnName} (${c.dataType})`).join(", ")}`)
    .join("\n");

  return `You are a SQL teaching assistant. Your job is to guide students with hints — never give them the complete solution or write the query for them.

Assignment question: "${question}"

Available tables:
${schemaText}

Student's current query attempt:
${userQuery && userQuery.trim() && userQuery.trim() !== "-- write your SQL query here"
  ? userQuery
  : "(student hasn't written anything yet)"}

Give a short, focused hint (2-3 sentences max). 
- Point them in the right direction (which clause to use, which table to look at)
- Do NOT write any SQL code
- Do NOT reveal the full answer
- If they haven't started, tell them which SQL clause to begin with`;
};

// POST /api/hint
router.post("/", async (req, res) => {
  const { question, query, tableSchemas } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required." });
  }

  // soft rate limit — 5 hints per minute per IP
  const ip = req.ip;
  const now = Date.now();
  const log = hintLog.get(ip) || [];
  const recent = log.filter(t => now - t < 60000); // last 60s

  if (recent.length >= 5) {
    return res.status(429).json({ error: "Too many hint requests. Wait a moment before trying again." });
  }

  hintLog.set(ip, [...recent, now]);

  const prompt = buildPrompt(question, tableSchemas || [], query || "");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 120, temperature: 0.4 }
        })
      }
    );

    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data));
    const hint = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!hint) {
      console.error("Gemini response:", JSON.stringify(data));
      return res.status(500).json({ error: "Could not generate a hint. Try again." });
    }

    res.json({ hint: hint.trim() });
  } catch (err) {
    res.status(500).json({ error: "Hint service unavailable: " + err.message });
  }
});

module.exports = router;