const express = require("express");
const router = express.Router();

const Book = require("../models/Book");

router.post("/", async (req, res) => {
    try {
        const book = await Book.create(req.body);
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
});

//Get All Books
router.get("/", async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
});

module.exports = router;