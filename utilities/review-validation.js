const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
const validate = {}

/*  **********************************
 *  Review Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    // Title is required and must be string
    body("review_title")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Review title is required and must be between 1 and 100 characters."),

    // Review text is required
    body("review_text")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review text is required and must be between 10 and 1000 characters."),

    // Rating is required and must be between 1 and 5
    body("review_rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5 stars."),
  ]
}

/* ******************************
 * Check data and return errors or continue to add review
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { inv_id, review_title, review_text, review_rating } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    try {
      // ✅ FIXED: Use the correct function name that matches your controller
      const dataArray = await invModel.getInventoryByInventoryId(inv_id)
      
      // ✅ FIXED: Handle the case where vehicle doesn't exist
      if (!dataArray || dataArray.length === 0) {
        req.flash("notice", "Sorry, the requested vehicle was not found.")
        return res.redirect("/inv/")
      }
      
      // ✅ FIXED: Get the first item from the array
      const data = dataArray[0]
      const vehicleName = `${data.inv_make} ${data.inv_model}`
      
      res.render("reviews/add-review", {
        errors,
        title: `Add Review - ${vehicleName}`,
        nav,
        inv_id,
        vehicleName,
        vehicle: data, // ✅ ADDED: Pass vehicle data to template
        review_title,
        review_text,
        review_rating
      })
    } catch (error) {
      console.error("Validation error:", error)
      req.flash("notice", "Sorry, there was an error processing your review.")
      res.redirect("/inv/")
    }
    return
  }
  next()
}

/* ******************************
 * Check data and return errors or continue to update review
 * ***************************** */
validate.checkUpdateReviewData = async (req, res, next) => {
  const { review_id, review_title, review_text, review_rating } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    try {
      const reviewData = await reviewModel.getReviewById(review_id)
      
      // ✅ ADDED: Check if review exists
      if (!reviewData) {
        req.flash("notice", "Review not found.")
        return res.redirect("/review/my-reviews")
      }
      
      const vehicleName = `${reviewData.inv_make} ${reviewData.inv_model}`
      
      res.render("reviews/edit-review", {
        errors,
        title: `Edit Review - ${vehicleName}`,
        nav,
        reviewData: { ...reviewData, review_title, review_text, review_rating },
        vehicleName
      })
    } catch (error) {
      console.error("Update validation error:", error)
      req.flash("notice", "Sorry, there was an error processing your review update.")
      res.redirect("/review/my-reviews")
    }
    return
  }
  next()
}

module.exports = validate