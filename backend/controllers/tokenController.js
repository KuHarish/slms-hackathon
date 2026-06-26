const TokenTransaction = require('../models/TokenTransaction');

exports.getTokenHistory = async (req, res) => {
    try {
        const { user_id } = req.params;
        const history = await TokenTransaction.find({ user: user_id }).sort({ createdAt: -1 });
        return res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching token history:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
