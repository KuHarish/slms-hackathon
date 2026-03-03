const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    // ── Currently borrowed books (ObjectIds of Book documents) ──────────────
    booksBorrowed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],

    // ── Books the user has fully read/returned ───────────────────────────────
    booksRead: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],

    // ── Due / overdue book records ───────────────────────────────────────────
    dueBooks: [{
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        dueDate: { type: Date },
        isOverdue: { type: Boolean, default: false }
    }],

    // ── Reading history (lightweight log entries) ────────────────────────────
    readingHistory: [{
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        borrowedAt: { type: Date },
        returnedAt: { type: Date },
        status: { type: String, enum: ['active', 'returned', 'overdue'], default: 'active' }
    }],

    // ── Aggregated counters (kept in sync for fast dashboard reads) ──────────
    totalBorrowedCount: {
        type: Number,
        default: 0
    },
    overdueBooksCount: {
        type: Number,
        default: 0
    },

    // ── Reward tokens ────────────────────────────────────────────────────────
    tokens: {
        type: Number,
        default: 0
    },

    // ── Misc user fields ─────────────────────────────────────────────────────
    fineAmount: {
        type: Number,
        default: 0
    },
    lastBorrowDate: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profileImage: {
        type: String,
        default: ''
    },
    lastLogin: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);