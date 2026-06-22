const Review = require("../models/Review");
const Book = require("../models/Book");
const mongoose = require("mongoose");

// Helper: check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// -------------------------------------------------------------------
// Resolves a bookId param that may be either a MongoDB ObjectId string
// OR a slug like "bk4" / "clean-code".
// Returns the resolved ObjectId string, or throws a structured error.
// -------------------------------------------------------------------
async function resolveBookId(param) {
  if (isValidObjectId(param)) {
    // Looks like an ObjectId — use as-is (still 404s cleanly if not found)
    return param;
  }
  // Not an ObjectId → treat as slug
  const book = await Book.findOne({ slug: param.toLowerCase() }).select("_id").lean();
  if (!book) {
    const err = new Error(`No book found with slug "${param}"`);
    err.statusCode = 404;
    throw err;
  }
  return book._id;
}

// @desc  Get all reviews for the Community feed (with optional ?category= filter)
// @route GET /api/reviews
// @access Public
const getAllReviews = async (req, res) => {
  try {
    const { category } = req.query;

    // Build a base query — we'll filter by book category if provided
    let bookFilter = {};
    if (category && category !== "All") {
      const matchingBooks = await Book.find({
        category: { $regex: new RegExp(`^${category}$`, "i") },
      }).select("_id");
      const bookIds = matchingBooks.map((b) => b._id);
      bookFilter = { bookId: { $in: bookIds } };
    }

    const reviews = await Review.find(bookFilter)
      .sort({ createdAt: -1 })
      .populate("bookId", "title category")
      .lean();

    // Shape the response to match what the frontend expects
    const shaped = reviews.map((r) => ({
      _id: r._id,
      bookId: r.bookId?._id,
      bookTitle: r.bookId?.title || "Unknown Book",
      bookCategory: r.bookId?.category || "",
      userName: r.userName,
      userId: r.userId,
      rating: r.rating,
      content: r.content,
      likes: r.likes,
      createdAt: r.createdAt,
    }));

    res.json(shaped);
  } catch (error) {
    console.error("getAllReviews error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get reviews for a specific book
// @route GET /api/reviews/book/:bookId
// @access Public
const getReviewsByBook = async (req, res) => {
  try {
    const resolvedBookId = await resolveBookId(req.params.bookId);

    const reviews = await Review.find({ bookId: resolvedBookId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(reviews);
  } catch (error) {
    console.error("getReviewsByBook error:", error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc  Submit a review for a book
// @route POST /api/reviews/book/:bookId
// @access Private
const addReview = async (req, res) => {
  try {
    const { rating, content } = req.body;

    if (!rating || !content) {
      return res.status(400).json({ message: "Rating and content are required." });
    }

    // Resolve slug or ObjectId → actual book _id
    let resolvedBookId;
    try {
      resolvedBookId = await resolveBookId(req.params.bookId);
    } catch (err) {
      return res.status(err.statusCode || 400).json({ message: err.message });
    }

    // Verify book exists (also catches the case where ObjectId is valid but no doc)
    const book = await Book.findById(resolvedBookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    // One review per user per book (unique index will also catch this)
    const existing = await Review.findOne({ bookId: resolvedBookId, userId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this book." });
    }

    const review = await Review.create({
      bookId: resolvedBookId,
      userId: req.user._id,
      userName: req.user.fullName,
      rating,
      content,
    });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this book." });
    }
    console.error("addReview error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get distinct book categories that have at least one review (for filter pills)
// @route GET /api/reviews/categories
// @access Public
const getReviewCategories = async (req, res) => {
  try {
    // Find all unique bookIds that have reviews
    const bookIds = await Review.distinct("bookId");
    const books = await Book.find({ _id: { $in: bookIds } }).select("category").lean();
    const categories = [...new Set(books.map((b) => b.category).filter(Boolean))].sort();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllReviews, getReviewsByBook, addReview, getReviewCategories };
