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
    booksBorrowed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
    totalBorrowedCount: {
        type: Number,
        default: 0
    },
    overdueBooksCount: {
        type: Number,
        default: 0
    },
    tokens: {
        type: Number,
        default: 0
    },
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