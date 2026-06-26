const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      default: "general",
    },
    description: {
      type: String,
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: true,
    },
    publishedYear: {
      type: Number,
    },
    coverImage: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,   // allows multiple docs with no slug during migration
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);