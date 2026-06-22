require("dotenv").config();
const mongoose = require("mongoose");

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://..."); // read from env or assume standard if file has it
        console.log("Connected to DB");
        
        const db = mongoose.connection.db;
        const books = await db.collection("books").find({}).toArray();
        if (books.length > 0) {
            const first = books[0];
            console.log("First book title:", first.title);
            console.log("First book _id type:", typeof first._id);
            console.log("First book _id value:", first._id);
            console.log("Is ObjectId:", first._id instanceof mongoose.Types.ObjectId);
        } else {
            console.log("No books found in collection");
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
};

run();
