const Book = require("../models/Book");

// -------------------------------------------------------------------
// Helper: "Clean Code" → "clean-code"
// -------------------------------------------------------------------
function titleToSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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
      slug: customSlug,
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
      availableCopies: totalCopies,
      publishedYear,
      coverImage,
      slug: customSlug || titleToSlug(title),
    });

    res.status(201).json(book);
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get a single book by its slug (e.g. "bk4" or "clean-code")
// @route   GET /api/books/slug/:slug
// @access  Public
const getBookBySlug = async (req, res) => {
  try {
    const book = await Book.findOne({ slug: req.params.slug.toLowerCase() });
    if (!book) {
      return res.status(404).json({ message: `No book found with slug "${req.params.slug}"` });
    }
    res.json(book);
  } catch (error) {
    console.error("getBookBySlug error:", error);
    res.status(500).json({ message: error.message });
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
  createBook,
  getBookBySlug,
  updateBook,
};
