const express = require("express");
const router = express.Router();
const { getAllBooks, getBookById, createBook, updateBook } = require("../controllers/bookController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/")
  .get(getAllBooks)
  .post(protect, admin, createBook);

router.route("/:id")
  .get(getBookById)
  .put(protect, admin, updateBook);

module.exports = router;