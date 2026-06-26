const BookRequest = require('../models/BookRequest');

exports.getRequests = async (req, res) => {
    try {
        const { user_id } = req.params;
        const requests = await BookRequest.find({ user: user_id }).sort({ createdAt: -1 });
        return res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching book requests:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.createRequest = async (req, res) => {
    try {
        const { user_id, title, author, reason } = req.body;
        if (!user_id || !title || !author || !reason) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const newRequest = new BookRequest({
            user: user_id,
            title,
            author,
            reason,
            status: 'pending'
        });
        
        await newRequest.save();
        return res.status(201).json(newRequest);
    } catch (error) {
        console.error("Error creating book request:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'
        
        const request = await BookRequest.findByIdAndUpdate(id, { status }, { new: true });
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Generate notification
        const { createInternalNotification } = require('./notificationController');
        if (status === 'approved' || status === 'rejected') {
            await createInternalNotification(
                request.user,
                `Book Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                `Your request for the book "${request.title}" has been ${status}.`,
                status === 'approved' ? 'success' : 'error'
            );
        }
        
        return res.status(200).json(request);
    } catch (error) {
        console.error("Error updating book request:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        const requests = await BookRequest.find()
            .populate({ path: 'user', select: 'name email' })
            .sort({ createdAt: -1 });
        return res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching all book requests:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
