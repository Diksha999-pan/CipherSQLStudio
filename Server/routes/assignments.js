const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");

// fetch all assignments (for listing page)
router.get("/", async (req, res) => {
  try {
    // Only send what the listing page needs, not full sampleTables data
    const assignments = await Assignment.find(
      {},
      "title description question createdAt"
    );
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  fetch one assignment with full data (for attempt page)
router.get("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: "Not found" });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;