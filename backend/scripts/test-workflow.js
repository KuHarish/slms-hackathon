require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const { checkoutBook, returnBook } = require('../controllers/transactionController');

const MONGO_URI = process.env.MONGO_URI || "mongodb://KuHarish:_Vergil13@ac-bnb56fk-shard-00-00.lyoxivp.mongodb.net:27017,ac-bnb56fk-shard-00-01.lyoxivp.mongodb.net:27017,ac-bnb56fk-shard-00-02.lyoxivp.mongodb.net:27017/slms_db?ssl=true&replicaSet=atlas-erh7c5-shard-0&authSource=admin&appName=Cluster1";

async function testWorkflow() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for Testing Workflow.\n");

        const user = await User.findOne({ email: "dravid@gmail.com" });
        const book = await Book.findOne({ bookId: "BK0001" });

        if (!user || !book) {
            console.error("Required test data (user or book) not found");
            return;
        }

        console.log(`--- Test 1: Checkout Book ---`);
        const reqCheckout = { body: { user_id: user._id, book_id: "BK0001" } };
        let transactionId = null;
        
        const resCheckout = {
            status: (code) => ({
                json: (data) => {
                    console.log(`Checkout Response [${code}]:`, data.message);
                    if (data.transaction) transactionId = data.transaction._id;
                    return data;
                }
            })
        };

        await checkoutBook(reqCheckout, resCheckout);

        if (!transactionId) {
            console.log("Failed to get transaction ID, maybe book is already checked out. Proceeding to return test if possible.");
            const Transaction = require('../models/Transaction');
            const existingTx = await Transaction.findOne({ user_id: user._id, book_id: book._id, status: 'issued' });
            if (existingTx) transactionId = existingTx._id;
        }

        if (transactionId) {
            console.log(`\n--- Test 2: Return Book ---`);
            const reqReturn = { body: { transaction_id: transactionId } };
            const resReturn = {
                status: (code) => ({
                    json: (data) => {
                        console.log(`Return Response [${code}]:`, data.message);
                        console.log("Trust Score after return:", data.trust_score);
                        return data;
                    }
                })
            };
            await returnBook(reqReturn, resReturn);
            
            console.log(`\n--- Test 3: Check Notifications ---`);
            const Notification = require('../models/Notification');
            const notifs = await Notification.find({ user: user._id }).sort({ createdAt: -1 }).limit(1);
            console.log("Latest Notification:", notifs[0]);

            console.log(`\n--- Test 4: Check Token History ---`);
            const TokenTransaction = require('../models/TokenTransaction');
            const tokenTx = await TokenTransaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(1);
            console.log("Latest Token Tx:", tokenTx[0]);
        }

        console.log("\nAll tests completed.");
    } catch (err) {
        console.error("Test Workflow Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

testWorkflow();
