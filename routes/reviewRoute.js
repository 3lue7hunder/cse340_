// Needed Resources 
const express = require("express")
const router = new express.Router() 
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities")
const reviewValidate = require('../utilities/review-validation')

// Route to view user's reviews (main reviews page)
router.get("/", 
  utilities.checkLogin, 
  utilities.handleErrors(reviewController.buildUserReviews))

// Route to view user's reviews (alternative path)
router.get("/my-reviews", 
  utilities.checkLogin, 
  utilities.handleErrors(reviewController.buildUserReviews))

// Route to build add review view
router.get("/add/:inv_id", 
  utilities.checkLogin, 
  utilities.handleErrors(reviewController.buildAddReview))

// Route to process add review
router.post("/add", 
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.addReview))

// Route to build edit review view
router.get("/edit/:review_id", 
  utilities.checkLogin, 
  utilities.handleErrors(reviewController.buildEditReview))

// Route to process edit review
router.post("/update", 
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData, // Use same validation as add
  utilities.handleErrors(reviewController.updateReview))

// Route to build delete review view
router.get("/delete/:review_id", 
  utilities.checkLogin, 
  utilities.handleErrors(reviewController.buildDeleteReview))

// Route to process delete review
router.post("/delete", 
  utilities.checkLogin,
  utilities.handleErrors(reviewController.deleteReview))

// Admin Routes
// Route to view admin reviews management (Admin only)
router.get("/admin", 
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(reviewController.buildAdminReviews))

// Route to toggle review approval (Admin only)
router.post("/toggle-approval", 
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(reviewController.toggleApproval))

module.exports = router