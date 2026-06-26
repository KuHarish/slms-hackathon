require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Book = require('../models/Book');

const MONGO_URI = process.env.MONGO_URI || "mongodb://KuHarish:_Vergil13@ac-bnb56fk-shard-00-00.lyoxivp.mongodb.net:27017,ac-bnb56fk-shard-00-01.lyoxivp.mongodb.net:27017,ac-bnb56fk-shard-00-02.lyoxivp.mongodb.net:27017/slms_db?ssl=true&replicaSet=atlas-erh7c5-shard-0&authSource=admin&appName=Cluster1";

async function generateBookIds() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.\n");

        const books = await Book.find({}).sort({ createdAt: 1 });
        let count = 1;
        let updatedCount = 0;

        for (const book of books) {
            if (!book.bookId) {
                // Generate bookId like BK0001
                book.bookId = `BK${String(count).padStart(4, '0')}`;
                await book.save();
                console.log(`Assigned ${book.bookId} to '${book.title}'`);
                updatedCount++;
            }
            count++;
        }

        console.log(`\nMigration complete. Updated ${updatedCount} books.`);
    } catch (err) {
        console.error("Error migrating book IDs:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

generateBookIds();
