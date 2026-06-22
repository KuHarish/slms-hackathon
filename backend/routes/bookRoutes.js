const express = require("express");
const router = express.Router();
const { getAllBooks, getBookById, createBook, updateBook, getBookBySlug } = require("../controllers/bookController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/")
  .get(getAllBooks)
  .post(protect, admin, createBook);

// Slug lookup — must be before /:id so "slug" isn't cast as an ObjectId
router.get("/slug/:slug", getBookBySlug);

router.route("/:id")
  .get(getBookById)
  .put(protect, admin, updateBook);

module.exports = router;