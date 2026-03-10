const express = require("express");
const router = express.Router();
const { pool } = require("../config/postgres");

// list of dangerous keywords we block for safety
const blockedKeywords = ["DROP", "DELETE", "TRUNCATE", "ALTER", "INSERT", "UPDATE", "CREATE"];

const isSafe = (query) => {
  const upper = query.toUpperCase();
  return !blockedKeywords.some(k => upper.includes(k));
};

// POST /api/query/run
router.post("/run", async (req, res) => {
  const { query, assignmentId } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Query cannot be empty" });
  }

  if (!isSafe(query)) {
    return res.status(400).json({ error: "Query contains blocked keywords. Only SELECT queries are allowed." });
  }

  try {
    const result = await pool.query(query);
    res.json({ rows: result.rows });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;