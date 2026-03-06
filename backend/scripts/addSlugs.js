/**
 * One-time migration script: stamps a `slug` field onto every Book document.
 *
 * For the 8 books that match the mock data (matched by ISBN), we assign the
 * exact mock slug (bk1 – bk8) so that existing frontend URLs like /books/bk4
 * continue to work with the backend immediately.
 *
 * Any other books in the database get a slug auto-generated from their title.
 *
 * Usage:
 *   cd backend
 *   node scripts/addSlugs.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Book = require("../models/Book");

// -------------------------------------------------------------------
// Mock-data ISBN → slug mapping
// Matches the frontend's mockData.ts books exactly.
// -------------------------------------------------------------------
const ISBN_TO_SLUG = {
  "978-0465050659": "bk1",   // The Design of Everyday Things
  "978-0062316097": "bk2",   // Sapiens
  "978-0132350884": "bk3",   // Clean Code
  "978-0374533557": "bk4",   // Thinking, Fast and Slow
  "978-0743273565": "bk5",   // The Great Gatsby
  "978-0553380163": "bk6",   // A Brief History of Time
  "978-0140449334": "bk7",   // Meditations
  "978-0262033848": "bk8",   // Introduction to Algorithms
};

// -------------------------------------------------------------------
// Converts a book title into a URL-safe slug
// e.g. "Clean Code" → "clean-code"
// -------------------------------------------------------------------
function titleToSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")  // remove special chars
    .replace(/\s+/g, "-")           // spaces → hyphens
    .replace(/-+/g, "-");           // collapse multiple hyphens
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  const books = await Book.find({});
  console.log(`Found ${books.length} book(s) in the database.\n`);

  let updated = 0;
  let skipped = 0;

  for (const book of books) {
    // Skip if slug already set
    if (book.slug) {
      console.log(`⏭  Already has slug "${book.slug}" — ${book.title}`);
      skipped++;
      continue;
    }

    // Prefer the mock slug matched by ISBN; fall back to title slug
    const slug = ISBN_TO_SLUG[book.isbn] || titleToSlug(book.title);

    try {
      await Book.updateOne({ _id: book._id }, { $set: { slug } });
      console.log(`✅ ${book.title}\n   ISBN: ${book.isbn}\n   Slug: ${slug}\n`);
      updated++;
    } catch (err) {
      if (err.code === 11000) {
        // Slug collision — append part of the ObjectId to make it unique
        const fallback = `${slug}-${book._id.toString().slice(-4)}`;
        await Book.updateOne({ _id: book._id }, { $set: { slug: fallback } });
        console.log(`⚠️  Collision for "${slug}" → used "${fallback}" for ${book.title}\n`);
        updated++;
      } else {
        console.error(`❌ Failed for ${book.title}:`, err.message);
      }
    }
  }

  console.log("─────────────────────────────────");
  console.log(`Done. Updated: ${updated}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
