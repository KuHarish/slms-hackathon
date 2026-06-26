const mongoose = require("mongoose");

const tokenTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['earned', 'spent'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("TokenTransaction", tokenTransactionSchema);
