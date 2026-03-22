const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction'); // Assuming Transaction model exists as per prompt
const { hasActiveTransaction } = require('../utils/transactionUtils');

exports.checkoutBook = async (req, res) => {
  try {
    const { user_id, book_id } = req.body;

    if (!user_id || !book_id) {
      return res.status(400).json({ message: "user_id and book_id are required" });
    }

    // 1. Check if user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Check if book exists and available_copies > 0
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(book_id)) {
      return res.status(404).json({ message: "Book not found (invalid ID)" });
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(404).json({ message: "User not found (invalid ID)" });
    }

    const book = await Book.findById(book_id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.availableCopies !== undefined) {
      // Use the actual schema field `availableCopies` (from previous file inspection) if applicable,
      // but the prompt says available_copies > 0. Let's gracefully support both.
      if (book.availableCopies <= 0) {
        return res.status(400).json({ message: "Book is not available for checkout" });
      }
    } else if (book.available_copies !== undefined && book.available_copies <= 0) {
      return res.status(400).json({ message: "Book is not available for checkout" });
    }

    // 3. Prevent user from checking out the same book again if already issued and not returned
    const isActive = await hasActiveTransaction(user_id, book_id);
    if (isActive) {
      return res.status(400).json({ message: "You have already checked out this book and not returned it" });
    }

    // 4. Check if user is restricted (trust_score < 50 -> allow only 1 active book)
    // First, count active books for user
    const activeBooksCount = await Transaction.countDocuments({
      $or: [{ user: user_id }, { user_id: user_id }],
      status: "issued"
    });

    if (user.trust_score < 50 && activeBooksCount >= 1) {
      return res.status(403).json({ message: "Trust score is below 50. You can only have 1 active book checked out at a time." });
    }

    // 5. Create new transaction
    const checkoutDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const newTransaction = new Transaction({
      user_id,
      book_id,
      checkout_date: checkoutDate,
      due_date: dueDate,
      status: "issued"
    });
    // Add alternatives for mongoose schema references
    newTransaction.user = user_id;
    newTransaction.book = book_id;

    await newTransaction.save();

    // 6. Decrease book available copies
    if (book.availableCopies !== undefined) {
      book.availableCopies -= 1;
    }
    if (book.available_copies !== undefined) {
      book.available_copies -= 1;
    }
    await book.save();

    // 7. Increase user books taken count
    if (user.books_taken_count !== undefined) {
      user.books_taken_count += 1;
    } else {
      // In case the schema uses books_taken_count but wasn't populated yet, or as per prompt
      user.books_taken_count = (user.books_taken_count || 0) + 1;
    }
    await user.save();

    return res.status(201).json({
      message: "Book checked out successfully",
      transaction: newTransaction
    });

  } catch (error) {
    console.error("Error in checkoutBook:", error);
    return res.status(500).json({ message: "Server error during checkout", error: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ message: "transaction_id is required" });
    }

    // 1. Find transaction
    const transaction = await Transaction.findById(transaction_id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status !== "issued") {
      return res.status(400).json({ message: "This transaction is not in 'issued' status" });
    }

    // 2. Load User and Book
    const user = await User.findById(transaction.user_id || transaction.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const book = await Book.findById(transaction.book_id || transaction.book);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // 3. Update return dates and check overdue
    const returnDate = new Date();
    const dueDate = new Date(transaction.due_date);
    
    transaction.return_date = returnDate;
    
    let timeDiff = returnDate.getTime() - dueDate.getTime();
    let daysLate = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    let trustScoreChange = 0;

    if (returnDate > dueDate) {
      // Mark as overdue
      transaction.status = "overdue";
      
      if (daysLate > 7) {
        trustScoreChange = -10;
      } else {
        trustScoreChange = -5;
      }
    } else {
      transaction.status = "returned";
      trustScoreChange = 10;
    }

    await transaction.save();

    // 4. Increase book available copies
    if (book.availableCopies !== undefined) {
      book.availableCopies += 1;
    }
    if (book.available_copies !== undefined) {
      book.available_copies += 1;
    }
    await book.save();

    // 5. Update user trust score
    if (user.trust_score !== undefined) {
      user.trust_score += trustScoreChange;
    } else {
      user.trust_score = 100 + trustScoreChange; // Defaulting standard to 100 if undefined
    }
    await user.save();

    return res.status(200).json({
      message: "Book returned successfully",
      transaction: transaction,
      trust_score: user.trust_score
    });

  } catch (error) {
    console.error("Error in returnBook:", error);
    return res.status(500).json({ message: "Server error during return", error: error.message });
  }
};

exports.getActiveBooks = async (req, res) => {
  try {
    const { user_id } = req.params;

    const activeBooks = await Transaction.find({
      $or: [{ user: user_id }, { user_id: user_id }],
      status: "issued"
    }).populate({
      path: "book_id", // Fallback path if schema uses book_id directly
      select: "title author",
      strictPopulate: false
    }).populate({
      path: "book", // Standard reference path
      select: "title author",
      strictPopulate: false
    });

    return res.status(200).json(activeBooks);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching active books", error: error.message });
  }
};

exports.reserveBook = async (req, res) => {
  try {
    const { user_id, book_id } = req.body;

    if (!user_id || !book_id) {
      return res.status(400).json({ message: "user_id and book_id are required" });
    }

    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(book_id)) {
      return res.status(404).json({ message: "Book not found (invalid ID)" });
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(404).json({ message: "User not found (invalid ID)" });
    }

    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const book = await Book.findById(book_id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Check if book has available copies (if it does, they should checkout, not reserve)
    if ((book.availableCopies !== undefined && book.availableCopies > 0) ||
        (book.available_copies !== undefined && book.available_copies > 0)) {
      return res.status(400).json({ message: "Book is available for checkout, no need to reserve" });
    }

    // Check if already reserved or issued
    const existingTransaction = await Transaction.findOne({
      $or: [{ user: user_id, book: book_id }, { user_id: user_id, book_id: book_id }],
      $or: [{ status: "reserved" }, { status: "issued" }]
    });
    if (existingTransaction) {
      return res.status(400).json({ message: "You have already checked out or reserved this book" });
    }

    const newTransaction = new Transaction({
      user_id,
      book_id,
      user: user_id,
      book: book_id,
      checkout_date: new Date(),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // arbitrary due date
      status: "reserved"
    });

    await newTransaction.save();

    return res.status(201).json({
      message: "Book reserved successfully",
      transaction: newTransaction
    });

  } catch (error) {
    console.error("Error in reserveBook:", error);
    return res.status(500).json({ message: "Server error during reserve", error: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate({
        path: "user_id",
        select: "name email identifier university_id department role",
        strictPopulate: false
      })
      .populate({
        path: "user",
        select: "name email identifier university_id department role",
        strictPopulate: false
      })
      .populate({
        path: "book_id",
        select: "title author isbn coverImage",
        strictPopulate: false
      })
      .populate({
        path: "book",
        select: "title author isbn coverImage",
        strictPopulate: false
      })
      .sort({ checkout_date: -1 });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error in getAllTransactions:", error);
    return res.status(500).json({ message: "Server error fetching transactions", error: error.message });
  }
};
