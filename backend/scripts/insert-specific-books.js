require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("../models/Book");

const booksData = [
  {
    _id: new mongoose.Types.ObjectId("69ab09f08306e514c18ac580"),
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0743273565",
    category: "fiction",
    description: "The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
    totalCopies: 10,
    availableCopies: 7,
    publishedYear: 1925,
    slug: "bk5",
    createdAt: new Date("2026-03-06T17:08:00.519+00:00"),
    updatedAt: new Date("2026-03-06T17:08:00.519+00:00"),
    __v: 0
  },
  {
    _id: new mongoose.Types.ObjectId("69ab09f08306e514c18ac57d"),
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    isbn: "978-0374533557",
    category: "psychology",
    description: "An exploration of the two systems that drive the way we think—System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.",
    totalCopies: 4,
    availableCopies: 1,
    publishedYear: 2011,
    slug: "bk4",
    createdAt: new Date("2026-03-06T17:08:00.400+00:00"),
    updatedAt: new Date("2026-03-22T09:29:07.413+00:00"),
    __v: 0
  },
  {
    _id: new mongoose.Types.ObjectId("69ab09f08306e514c18ac586"),
    title: "Meditations",
    author: "Marcus Aurelius",
    isbn: "978-0140449334",
    category: "philosophy",
    description: "The private thoughts of the world's most powerful man, giving advice on everything from living in the world to coping with adversity.",
    totalCopies: 4,
    availableCopies: 2,
    publishedYear: 180,
    slug: "bk7",
    createdAt: new Date("2026-03-06T17:08:00.722+00:00"),
    updatedAt: new Date("2026-03-06T17:08:00.722+00:00"),
    __v: 0
  }
];

async function insertBooks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB:", mongoose.connection.db.databaseName);

    for (const book of booksData) {
      // Use findOneAndUpdate with upsert to avoid duplicate key errors on _id, isbn, or slug
      const result = await Book.findOneAndUpdate(
        { _id: book._id },
        { $set: book },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`Successfully upserted: ${result.title}`);
    }

    console.log("All requested books have been inserted/updated in the database.");
  } catch (error) {
    console.error("Error inserting books:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from DB");
  }
}

insertBooks();
