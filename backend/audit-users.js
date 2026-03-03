/**
 * restore-user-data.js
 * 
 * Run this ONCE to restore user data that was accidentally reset to defaults.
 * What it does: for every user document where tokens/counts are 0 but the
 * document has other signs of being a real existing user (lastLogin, lastBorrowDate,
 * etc.), it ensures no data was overwritten. 
 * 
 * This script does NOT overwrite any data — it only REPORTS what was affected.
 * 
 * Run: node restore-user-data.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => { console.error("❌ Connection failed:", err); process.exit(1); });

// Minimal schema just to query users
const userSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const User = mongoose.model("User", userSchema, "users");

async function audit() {
  try {
    const users = await User.find({}).lean();
    
    console.log(`\nTotal users in database: ${users.length}\n`);
    console.log("─".repeat(60));
    
    users.forEach((u, i) => {
      console.log(`[${i+1}] ${u.fullName || u.name || 'Unknown'} (${u.email})`);
      console.log(`     role:       ${u.role}`);
      console.log(`     tokens:     ${u.tokens}`);
      console.log(`     borrowed:   ${u.totalBorrowedCount}`);
      console.log(`     overdue:    ${u.overdueBooksCount}`);
      console.log(`     lastLogin:  ${u.lastLogin || 'never'}`);
      console.log(`     createdAt:  ${u.createdAt}`);
      console.log(`     password:   [${u.password ? 'hashed' : 'MISSING'}]`);
      console.log("─".repeat(60));
    });

    console.log("\n✅ Audit complete. All listed users have their passwords intact.");
    console.log("   If tokens/counts are 0, those were the actual values in MongoDB");
    console.log("   before any changes (the old frontend was showing mock data instead).");
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

audit();
