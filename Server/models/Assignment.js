const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true }, // "Easy", "Medium", "Hard"
    question: { type: String, required: true },
    sampleTables: [
      {
        tableName: String,
        columns: [
          {
            columnName: String,
            dataType: String, // "INTEGER", "TEXT", etc.
          },
        ],
        rows: [mongoose.Schema.Types.Mixed], // flexible row data
      },
    ],
    expectedOutput: {
      type: { type: String }, 
      value: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
