require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

const MONGO_URI = process.env.MONGO_URI || "mongodb://KuHarish:_Vergil13@ac-bnb56fk-shard-00-00.lyoxivp.mongodb.net:27017,ac-bnb56fk-shard-00-01.lyoxivp.mongodb.net:27017,ac-bnb56fk-shard-00-02.lyoxivp.mongodb.net:27017/slms_db?ssl=true&replicaSet=atlas-erh7c5-shard-0&authSource=admin&appName=Cluster1";

async function addBorrows() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.\n");

        const users = ['dravid@gmail.com', 'david@gmail.com'];
        
        for (const email of users) {
            const user = await User.findOne({ email });
            if (!user) {
                console.log(`User ${email} not found!`);
                continue;
            }

            // Find a random available book that the user hasn't already checked out active
            const activeTransactions = await Transaction.find({ user: user._id, status: 'issued' });
            const activeBookIds = activeTransactions.map(t => t.book.toString());

            const availableBook = await Book.findOne({ 
                _id: { $nin: activeBookIds }
            });

            if (!availableBook) {
                console.log(`No available book found for ${email}`);
                continue;
            }

            // Create a transaction
            const checkoutDate = new Date();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);

            const newTx = new Transaction({
                user_id: user._id,
                book_id: availableBook._id,
                user: user._id,
                book: availableBook._id,
                checkout_date: checkoutDate,
                due_date: dueDate,
                status: "issued"
            });
            await newTx.save();

            // Decrease available copies if schema supports it
            if (availableBook.availableCopies !== undefined && availableBook.availableCopies > 0) {
                availableBook.availableCopies -= 1;
            } else if (availableBook.available_copies !== undefined && availableBook.available_copies > 0) {
                availableBook.available_copies -= 1;
            }
            await availableBook.save();

            // Push into user.booksBorrowed and user.readingHistory
            if (!user.booksBorrowed.includes(availableBook._id)) {
                user.booksBorrowed.push(availableBook._id);
            }
            
            user.readingHistory.push({
                bookId: availableBook._id,
                borrowedAt: checkoutDate,
                status: 'active'
            });

            await user.save();

            console.log(`Issued '${availableBook.title}' to ${email}`);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected.");
    }
}

addBorrows();
