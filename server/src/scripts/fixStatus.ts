import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/your_database_name";

async function runFix() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database not connected");
    }
    const result = await db.collection("users").updateMany(
      { status: { $in: ["active", "inactive"] } }, 
      [
        {
          $set: {
            status: { $toUpper: "$status" },
          },
        },
      ]
    );

    console.log("Modified documents:", result.modifiedCount);

    await mongoose.disconnect();
    console.log("Done! 👍");
  } catch (err) {
    console.error(err);
  }
}

runFix();
