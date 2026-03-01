require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function migrateRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Migration");

    // Migrate student -> user
    const studentUpdate = await User.updateMany(
      { role: "student" },
      { $set: { role: "user" } }
    );
    console.log(`Migrated ${studentUpdate.modifiedCount} accounts from 'student' to 'user'`);

    // Migrate librarian -> admin
    const librarianUpdate = await User.updateMany(
      { role: "librarian" },
      { $set: { role: "admin" } }
    );
    console.log(`Migrated ${librarianUpdate.modifiedCount} accounts from 'librarian' to 'admin'`);

    console.log("Migration Complete");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateRoles();
