const Book = require("../models/Book");

// @desc    Get all books
// @route   GET /api/books
// @access  Public (or Protected depending on setup)
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    console.log("getBookById called, id:", req.params.id);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Book not found (invalid ID)" });
    }
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new book
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      description,
      totalCopies,
      publishedYear,
      coverImage,
    } = req.body;

    // Validate required fields
    if (!title || !author || !isbn || totalCopies === undefined) {
      return res.status(400).json({
        message: "Please provide title, author, isbn, and totalCopies",
      });
    }

    // Check for existing book by ISBN
    const bookExists = await Book.findOne({ isbn });
    if (bookExists) {
      return res.status(400).json({ message: "Book with this ISBN already exists" });
    }

    // Creating the book
    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      description,
      totalCopies,
      availableCopies: totalCopies, // newly added books have all copies available
      publishedYear,
      coverImage,
    });

    res.status(201).json(book);
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if total copies changed
    if (req.body.totalCopies !== undefined && req.body.totalCopies !== book.totalCopies) {
      const difference = req.body.totalCopies - book.totalCopies;
      // Ensure available copies doesn't drop below 0
      req.body.availableCopies = Math.max(0, book.availableCopies + difference);
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
};
