const express = require("express");
const router = express.Router();
const {
  getAllReviews,
  getReviewsByBook,
  addReview,
  getReviewCategories,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Community feed — all reviews (optional ?category= query)
router.get("/", getAllReviews);

// Distinct categories that have reviews (for filter chips)
router.get("/categories", getReviewCategories);

// Reviews scoped to one book
router.route("/book/:bookId")
  .get(getReviewsByBook)
  .post(protect, addReview);

module.exports = router;
