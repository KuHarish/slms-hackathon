require("dotenv").config({ override: true });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bookRoutes = require("./routes/bookRoutes");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const notificationRoutes = require("./routes/notificationRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const bookRequestRoutes = require("./routes/bookRequestRoutes");

app.use("/api/books", bookRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/book-requests", bookRequestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", transactionRoutes);


app.get("/", (req, res) => {
  res.send("API Working");
});

// Periodic task to expire reservations
const Transaction = require("./models/Transaction");
const TokenTransaction = require("./models/TokenTransaction");
const Book = require("./models/Book");
const { createInternalNotification } = require("./controllers/notificationController");

setInterval(async () => {
  try {
    const expiredTransactions = await Transaction.find({
      status: "reserved",
      reservation_expiry: { $lt: new Date() }
    });

    for (const tx of expiredTransactions) {
      tx.status = "cancelled";
      await tx.save();

      const user_id = tx.user || tx.user_id;

      // Deduct 10 tokens penalty
      const User = require("./models/User");
      const user = await User.findById(user_id);
      if (user) {
        if (user.tokens !== undefined) {
          user.tokens = Math.max(0, user.tokens - 10);
        }
        await user.save();
        
        await TokenTransaction.create({
          user: user._id,
          type: 'spent',
          amount: 10,
          reason: `Reservation expired`
        });

        await createInternalNotification(
          user._id,
          "Reservation Expired",
          `Your 1-hour reservation window expired. A 10 token penalty was deducted.`,
          "error"
        );
      }

      // Process queue for this book
      const book = await Book.findById(tx.book || tx.book_id);
      if (book) {
        const queuedTx = await Transaction.findOne({
          $or: [{ book: book._id }, { book_id: book._id }],
          status: "queued"
        }).sort({ createdAt: 1 });

        if (queuedTx) {
          queuedTx.status = "reserved";
          queuedTx.reservation_expiry = new Date(Date.now() + 60 * 60 * 1000);
          await queuedTx.save();

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
  } catch (err) {
    console.error("Error checking expired reservations:", err);
  }
}, 60000); // Check every minute

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});