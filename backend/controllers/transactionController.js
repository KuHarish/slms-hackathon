const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction'); // Assuming Transaction model exists as per prompt
const TokenTransaction = require('../models/TokenTransaction');
const { hasActiveTransaction } = require('../utils/transactionUtils');
const { createInternalNotification } = require('./notificationController');

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
    
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(404).json({ message: "User not found (invalid ID)" });
    }

    let book = null;
    if (mongoose.Types.ObjectId.isValid(book_id)) {
      book = await Book.findById(book_id);
    }
    if (!book) {
      book = await Book.findOne({ bookId: book_id });
    }

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    const actualBookObjectId = book._id;

    const existingReservation = await Transaction.findOne({
      $or: [{ user: user_id }, { user_id: user_id }],
      $or: [{ book: actualBookObjectId }, { book_id: actualBookObjectId }],
      status: "reserved"
    });

    if (!existingReservation) {
      if (book.availableCopies !== undefined) {
        if (book.availableCopies <= 0) {
          return res.status(400).json({ message: "Book is not available for checkout" });
        }
      } else if (book.available_copies !== undefined && book.available_copies <= 0) {
        return res.status(400).json({ message: "Book is not available for checkout" });
      }
    }

    // 3. Prevent user from checking out the same book again if already issued and not returned
    const isActive = await hasActiveTransaction(user_id, actualBookObjectId);
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

    // 5. Create or update transaction
    const checkoutDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    let newTransaction;
    if (existingReservation) {
      existingReservation.status = "issued";
      existingReservation.checkout_date = checkoutDate;
      existingReservation.due_date = dueDate;
      existingReservation.reservation_expiry = undefined;
      await existingReservation.save();
      newTransaction = existingReservation;
    } else {
      newTransaction = new Transaction({
        user_id,
        book_id: actualBookObjectId,
        user: user_id,
        book: actualBookObjectId,
        checkout_date: checkoutDate,
        due_date: dueDate,
        status: "issued"
      });
      await newTransaction.save();

      // Decrease book available copies only if not previously reserved
      if (book.availableCopies !== undefined) {
        book.availableCopies -= 1;
      }
      if (book.available_copies !== undefined) {
        book.available_copies -= 1;
      }
      await book.save();
    }

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
    let fineAmount = 0;
    let tokensEarned = 0;

    if (returnDate > dueDate) {
      // Mark as returned but with a late fine
      transaction.status = "returned";
      
      if (daysLate > 7) {
        trustScoreChange = -10;
      } else {
        trustScoreChange = -5;
      }
      
      fineAmount = daysLate > 0 ? daysLate * 10 : 0;
      
      if (user.fineAmount !== undefined) user.fineAmount += fineAmount;
      if (user.overdueBooksCount !== undefined) user.overdueBooksCount += 1;
      
      await createInternalNotification(
        user._id, 
        "Book Returned Late", 
        `You returned "${book.title}" ${daysLate} days late. A fine of $${fineAmount} has been added.`,
        "error"
      );
    } else {
      transaction.status = "returned";
      trustScoreChange = 10;
      tokensEarned = 50; // Standard reward for on-time return
      
      if (user.tokens !== undefined) user.tokens += tokensEarned;
      
      // Create Token Transaction
      await TokenTransaction.create({
        user: user._id,
        type: 'earned',
        amount: tokensEarned,
        reason: `Returned "${book.title}" on time`
      });
      
      await createInternalNotification(
        user._id,
        "Tokens Earned!",
        `You earned ${tokensEarned} tokens for returning "${book.title}" on time!`,
        "success"
      );
    }

    await transaction.save();

    // 4. Process Reservation Queue
    const queuedTransaction = await Transaction.findOne({
      $or: [{ book: book._id }, { book_id: book._id }],
      status: "queued"
    }).sort({ createdAt: 1 });

    if (queuedTransaction) {
      queuedTransaction.status = "reserved";
      queuedTransaction.reservation_expiry = new Date(Date.now() + 60 * 60 * 1000);
      await queuedTransaction.save();

      await createInternalNotification(
        queuedTransaction.user || queuedTransaction.user_id,
        "Reserved Book Available",
        `Your reserved book "${book.title}" is now available! You have 1 hour to collect it.`,
        "success"
      );
      // We do not increment availableCopies because it goes straight to the reserved user
    } else {
      // 4. Increase book available copies
      if (book.availableCopies !== undefined) {
        book.availableCopies += 1;
      }
      if (book.available_copies !== undefined) {
        book.available_copies += 1;
      }
      await book.save();
    }

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

    // Check if already reserved, queued, or issued
    const existingTransaction = await Transaction.findOne({
      $or: [{ user: user_id, book: book_id }, { user_id: user_id, book_id: book_id }],
      status: { $in: ["reserved", "issued", "queued"] }
    });
    if (existingTransaction) {
      return res.status(400).json({ message: "You have already checked out, reserved, or queued this book" });
    }

    const available = (book.availableCopies !== undefined && book.availableCopies > 0) ||
                      (book.available_copies !== undefined && book.available_copies > 0);

    const status = available ? "reserved" : "queued";
    const reservation_expiry = available ? new Date(Date.now() + 60 * 60 * 1000) : undefined;

    const newTransaction = new Transaction({
      user_id,
      book_id,
      user: user_id,
      book: book_id,
      checkout_date: new Date(),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // arbitrary due date
      status,
      reservation_expiry
    });

    await newTransaction.save();

    if (available) {
      if (book.availableCopies !== undefined) book.availableCopies -= 1;
      if (book.available_copies !== undefined) book.available_copies -= 1;
      await book.save();
    }

    const { createInternalNotification } = require('./notificationController');
    await createInternalNotification(
      user_id,
      available ? `You have reserved "${book.title}". You have 1 hour to collect it.` : `You have joined the waitlist for "${book.title}". You will be notified when it becomes available.`,
      "reservation"
    );

    return res.status(201).json({
      message: available ? "Book reserved successfully. You have 1 hour to collect it." : "Joined reservation queue successfully.",
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

exports.getUserTransactions = async (req, res) => {
  try {
    const { user_id } = req.params;
    const transactions = await Transaction.find({
      $or: [{ user: user_id }, { user_id: user_id }]
    })
      .populate({
        path: "book_id",
        select: "title author isbn coverImage bookId",
        strictPopulate: false
      })
      .populate({
        path: "book",
        select: "title author isbn coverImage bookId",
        strictPopulate: false
      })
      .sort({ checkout_date: -1 });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error in getUserTransactions:", error);
    return res.status(500).json({ message: "Server error fetching user transactions", error: error.message });
  }
};

exports.getUserReservedBooks = async (req, res) => {
  try {
    const { user_id } = req.params;
    const transactions = await Transaction.find({
      $or: [{ user: user_id }, { user_id: user_id }],
      status: { $in: ["reserved", "queued"] }
    })
      .populate({
        path: "book_id",
        select: "title author isbn coverImage bookId",
        strictPopulate: false
      })
      .populate({
        path: "book",
        select: "title author isbn coverImage bookId",
        strictPopulate: false
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error in getUserReservedBooks:", error);
    return res.status(500).json({ message: "Server error fetching user reserved books", error: error.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const { transaction_id } = req.body;
    if (!transaction_id) return res.status(400).json({ message: "transaction_id is required" });

    const transaction = await Transaction.findById(transaction_id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    if (transaction.status !== "reserved" && transaction.status !== "queued") {
      return res.status(400).json({ message: "Only reserved or queued books can be cancelled" });
    }

    if (transaction.status === "reserved") {
      // Allow cancellation only if within 10 minutes of being reserved
      // reservation_expiry is exactly 1 hour from when it was reserved.
      const timeSinceReserved = Date.now() - (transaction.reservation_expiry.getTime() - 60 * 60 * 1000);
      if (timeSinceReserved > 10 * 60 * 1000) {
        return res.status(400).json({ message: "You can only cancel a reservation within the first 10 minutes." });
      }
    }

    const previousStatus = transaction.status;
    transaction.status = "cancelled";
    await transaction.save();

    if (previousStatus === "reserved") {
      // Process queue to pass the reservation to the next user, or increment inventory
      const book = await Book.findById(transaction.book || transaction.book_id);
      if (book) {
        const queuedTx = await Transaction.findOne({
          $or: [{ book: book._id }, { book_id: book._id }],
          status: "queued"
        }).sort({ createdAt: 1 });

        if (queuedTx) {
          queuedTx.status = "reserved";
          queuedTx.reservation_expiry = new Date(Date.now() + 60 * 60 * 1000);
          await queuedTx.save();

          const { createInternalNotification } = require('./notificationController');
          await createInternalNotification(
            queuedTx.user || queuedTx.user_id,
            "Reserved Book Available",
            `Your reserved book "${book.title}" is now available! You have 1 hour to collect it.`,
            "success"
          );
        } else {
          if (book.availableCopies !== undefined) book.availableCopies += 1;
          if (book.available_copies !== undefined) book.available_copies += 1;
          await book.save();
        }
      }
    }

    return res.status(200).json({ message: "Reservation cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    return res.status(500).json({ message: "Server error cancelling reservation", error: error.message });
  }
};
