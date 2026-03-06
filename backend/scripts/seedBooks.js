/**
 * Seed script: inserts the 8 books from the frontend mock data into MongoDB.
 * Each book gets a slug matching the mock ID (bk1–bk8) so that
 * existing frontend URLs like /books/bk4 work immediately.
 *
 * Usage (run once):
 *   cd backend
 *   node scripts/seedBooks.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Book = require("../models/Book");

const BOOKS = [
  {
    slug: "bk1",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    isbn: "978-0465050659",
    category: "technology",
    description:
      "A classic exploration of how design serves as the communication between object and user, and how to optimize that conduit of communication in order to make the experience of using the object pleasurable.",
    totalCopies: 5,
    availableCopies: 2,
    publishedYear: 2013,
  },
  {
    slug: "bk2",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "978-0062316097",
    category: "history",
    description:
      "A groundbreaking narrative of humanity's creation and evolution that explores how biology and history have defined us.",
    totalCopies: 8,
    availableCopies: 0,
    publishedYear: 2011,
  },
  {
    slug: "bk3",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "technology",
    description:
      "A handbook of agile software craftsmanship. Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
    totalCopies: 6,
    availableCopies: 3,
    publishedYear: 2008,
  },
  {
    slug: "bk4",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    isbn: "978-0374533557",
    category: "psychology",
    description:
      "An exploration of the two systems that drive the way we think—System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.",
    totalCopies: 4,
    availableCopies: 1,
    publishedYear: 2011,
  },
  {
    slug: "bk5",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0743273565",
    category: "fiction",
    description:
      "The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
    totalCopies: 10,
    availableCopies: 7,
    publishedYear: 1925,
  },
  {
    slug: "bk6",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "978-0553380163",
    category: "science",
    description:
      "A landmark volume in science writing that explores questions about the universe's origin and fate.",
    totalCopies: 3,
    availableCopies: 0,
    publishedYear: 1988,
  },
  {
    slug: "bk7",
    title: "Meditations",
    author: "Marcus Aurelius",
    isbn: "978-0140449334",
    category: "philosophy",
    description:
      "The private thoughts of the world's most powerful man, giving advice on everything from living in the world to coping with adversity.",
    totalCopies: 4,
    availableCopies: 2,
    publishedYear: 180,
  },
  {
    slug: "bk8",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "978-0262033848",
    category: "mathematics",
    description:
      "The leading textbook on algorithms, comprehensive and accessible to all levels of readers.",
    totalCopies: 7,
    availableCopies: 4,
    publishedYear: 2009,
  },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  let inserted = 0;
  let skipped = 0;

  for (const bookData of BOOKS) {
    const exists = await Book.findOne({ isbn: bookData.isbn }).lean();
    if (exists) {
      // Update slug if missing
      if (!exists.slug) {
        await Book.updateOne({ _id: exists._id }, { $set: { slug: bookData.slug } });
        console.log(`🔄 Updated slug for existing book: "${bookData.title}" → ${bookData.slug}`);
        inserted++;
      } else {
        console.log(`⏭  Already exists: "${bookData.title}" (slug: ${exists.slug})`);
        skipped++;
      }
      continue;
    }

    await Book.create(bookData);
    console.log(`✅ Inserted: "${bookData.title}" (slug: ${bookData.slug})`);
    inserted++;
  }

  console.log("\n─────────────────────────────────");
  console.log(`Done. Inserted/updated: ${inserted}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
