const express = require("express");
const router = express.Router();
const { pool } = require("../config/postgres");

const BLOCKED_KEYWORDS = ["DROP", "DELETE", "TRUNCATE", "ALTER", "INSERT", "UPDATE", "CREATE", "GRANT", "REVOKE"];

// strips comments and checks for multiple statements
const validateQuery = (query) => {
  // remove single-line comments
  let cleaned = query.replace(/--.*$/gm, "");
  // remove block comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, "");
  cleaned = cleaned.trim();

  if (!cleaned) return { ok: false, reason: "Query is empty" };

  // block dangerous keywords
  const upper = cleaned.toUpperCase();
  const found = BLOCKED_KEYWORDS.find(k => upper.includes(k));
  if (found) return { ok: false, reason: `'${found}' is not allowed. Only SELECT queries are permitted.` };

  // block multiple statements (semicolon in the middle)
  const withoutTrailing = cleaned.replace(/;$/, "");
  if (withoutTrailing.includes(";")) {
    return { ok: false, reason: "Only one SQL statement is allowed at a time." };
  }

  return { ok: true, cleaned };
};

const friendlyError = (pgError) => {
  const msg = pgError.message || "";
  if (msg.includes("does not exist")) return `Table or column not found: ${msg.split('"')[1] || "unknown"}`;
  if (msg.includes("syntax error")) return `SQL syntax error near: ${pgError.position ? `position ${pgError.position}` : "check your query"}`;
  if (msg.includes("permission denied")) return "Permission denied for this operation.";
  if (msg.includes("statement timeout")) return "Query took too long and was cancelled (5s limit).";
  return msg;
};

// POST /api/query/run
router.post("/run", async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query must be a non-empty string." });
  }

  const validation = validateQuery(query);
  if (!validation.ok) {
    return res.status(400).json({ error: validation.reason });
  }

  try {
    // cap results at 100 rows using subquery wrapper
    const limited = `SELECT * FROM (${validation.cleaned.replace(/;$/, "")}) AS __result LIMIT 100`;
    const result = await pool.query(limited);
    res.json({
      rows: result.rows,
      rowCount: result.rowCount,
      capped: result.rowCount === 100
    });
  } catch (err) {
    res.status(400).json({ error: friendlyError(err) });
  }
});

module.exports = router;
