const Review = require("../models/Review");
const Book = require("../models/Book");

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
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.bookId)) {
      return res.json([]);
    }
    const reviews = await Review.find({ bookId: req.params.bookId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Submit a review for a book
// @route POST /api/reviews/book/:bookId
// @access Private
const addReview = async (req, res) => {
  try {
    const { rating, content } = req.body;
    const bookId = req.params.bookId;

    if (!rating || !content) {
      return res.status(400).json({ message: "Rating and content are required." });
    }

    // Check book exists
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(404).json({ message: "Book not found (invalid ID)" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    // One review per user per book (unique index will also catch this)
    const existing = await Review.findOne({ bookId, userId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this book." });
    }

    const review = await Review.create({
      bookId,
      userId: req.user._id,
      userName: req.user.fullName,
      rating,
      content,
    });

    res.status(201).json(review);
  } catch (error) {
    // Duplicate key from the unique compound index
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
