require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("./models/Book");

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        
        const id = "69ab09ef8306e514c18ac574";
        const book = await Book.findById(id);
        if (book) {
            console.log("Found book with findById!", book.title);
        } else {
            console.log("Book.findById returned null for ID:", id);
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
};

run();
