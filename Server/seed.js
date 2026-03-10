const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Assignment = require("./models/Assignment");
const data = require("./CipherSqlStudio-assignment.json");

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Assignment.deleteMany({});
    console.log("Cleared old assignments");

    await Assignment.insertMany(data);
    console.log(`${data.length} assignments inserted!`);

    mongoose.disconnect();
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();