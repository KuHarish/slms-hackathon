require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || "mongodb://KuHarish:_Vergil13@ac-bnb56fk-shard-00-00.lyoxivp.mongodb.net:27017,ac-bnb56fk-shard-00-01.lyoxivp.mongodb.net:27017,ac-bnb56fk-shard-00-02.lyoxivp.mongodb.net:27017/slms_db?ssl=true&replicaSet=atlas-erh7c5-shard-0&authSource=admin&appName=Cluster1";

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function randomizeUserStats(email, role) {
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log(`User with email ${email} not found.`);
            return;
        }

        // Verify role
        if (user.role !== role) {
            console.log(`User ${email} is found, but has role '${user.role}' instead of '${role}'. Updating anyway.`);
        }

        user.totalBorrowedCount = getRandomInt(5, 50);
        user.overdueBooksCount = getRandomInt(0, 10);
        user.tokens = getRandomInt(100, 5000);
        user.fineAmount = getRandomInt(0, 500);
        
        await user.save();
        
        console.log(`Successfully updated ${email}:`);
        console.log(`  - Total Borrowed: ${user.totalBorrowedCount}`);
        console.log(`  - Overdue Books: ${user.overdueBooksCount}`);
        console.log(`  - Tokens: ${user.tokens}`);
        console.log(`  - Fine Amount: ${user.fineAmount}`);
    } catch (err) {
        console.error(`Error updating ${email}:`, err);
    }
}

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.\n");

        await randomizeUserStats('dravid@gmail.com', 'user');
        console.log('-----------------------------------');
        await randomizeUserStats('david@gmail.com', 'admin');

    } catch (err) {
        console.error("Database connection error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB.");
    }
}

run();
