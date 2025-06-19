const utilities = require("../utilities/")
const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const { validationResult } = require("express-validator")

const reviewCont = {}

/* ***************************
 *  Build add review view
 * ************************** */
reviewCont.buildAddReview = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.params.inv_id)
  
  try {
    // ✅ FIXED: Use the correct function name that actually exists
    const dataArray = await invModel.getInventoryByInventoryId(inv_id)
    
    // ✅ FIXED: Handle the case where vehicle doesn't exist
    if (!dataArray || dataArray.length === 0) {
      req.flash("notice", "Sorry, the requested vehicle was not found.")
      return res.redirect("/inv/")
    }
    
    // ✅ FIXED: Get the first (and only) item from the array
    const data = dataArray[0]
    const vehicleName = `${data.inv_make} ${data.inv_model}`
    
    res.render("reviews/add-review", {
      title: `Add Review - ${vehicleName}`,
      nav,
      inv_id,
      vehicleName,
      vehicle: data, // ✅ ADDED: Pass vehicle data to template
      errors: null,
    })
  } catch (error) {
    console.error("buildAddReview error:", error)
    req.flash("notice", "Sorry, we encountered an error loading the review form.")
    res.redirect("/inv/")
  }
}

/* ***************************
 *  Process add review
 * ************************** */
reviewCont.addReview = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { inv_id, review_title, review_text, review_rating } = req.body
  const account_id = res.locals.accountData.account_id

  // Check for validation errors
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    // ✅ FIXED: Use correct function name
    const dataArray = await invModel.getInventoryByInventoryId(inv_id)
    const data = dataArray[0]
    const vehicleName = `${data.inv_make} ${data.inv_model}`
    
    res.render("reviews/add-review", {
      title: `Add Review - ${vehicleName}`,
      nav,
      inv_id,
      vehicleName,
      vehicle: data, // ✅ ADDED: Pass vehicle data
      errors,
      review_title,
      review_text,
      review_rating
    })
    return
  }

  try {
    // Check if user already reviewed this vehicle
    const existingReview = await reviewModel.checkExistingReview(inv_id, account_id)
    if (existingReview) {
      req.flash("notice", "You have already reviewed this vehicle. You can edit your existing review instead.")
      res.redirect(`/inv/detail/${inv_id}`)
      return
    }

    const reviewResult = await reviewModel.addReview(
      inv_id,
      account_id,
      review_title,
      review_text,
      parseInt(review_rating)
    )

    if (reviewResult) {
      req.flash("notice", "Your review has been added successfully!")
      res.redirect(`/inv/detail/${inv_id}`)
    } else {
      req.flash("notice", "Sorry, adding the review failed.")
      res.redirect(`/review/add/${inv_id}`)
    }
  } catch (error) {
    console.error("addReview error:", error)
    req.flash("notice", "Sorry, there was an error adding your review.")
    res.redirect(`/review/add/${inv_id}`)
  }
}

/* ***************************
 *  Build edit review view
 * ************************** */
reviewCont.buildEditReview = async function (req, res, next) {
  let nav = await utilities.getNav()
  const review_id = parseInt(req.params.review_id)
  
  try {
    const reviewData = await reviewModel.getReviewById(review_id)
    
    if (!reviewData) {
      req.flash("notice", "Review not found.")
      res.redirect("/account/")
      return
    }

    // Check if user owns this review or is admin
    const account_id = res.locals.accountData.account_id
    const account_type = res.locals.accountData.account_type
    
    if (reviewData.account_id !== account_id && account_type !== "Admin") {
      req.flash("notice", "You can only edit your own reviews.")
      res.redirect("/account/")
      return
    }

    const vehicleName = `${reviewData.inv_make} ${reviewData.inv_model}`
    
    res.render("reviews/edit-review", {
      title: `Edit Review - ${vehicleName}`,
      nav,
      reviewData,
      vehicleName,
      errors: null,
    })
  } catch (error) {
    console.error("buildEditReview error:", error)
    req.flash("notice", "Sorry, we encountered an error loading the review.")
    res.redirect("/account/")
  }
}

/* ***************************
 *  Process edit review
 * ************************** */
reviewCont.updateReview = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { review_id, review_title, review_text, review_rating } = req.body

  // Check for validation errors
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    const reviewData = await reviewModel.getReviewById(review_id)
    
    // Check authorization before proceeding
    const account_id = res.locals.accountData.account_id
    const account_type = res.locals.accountData.account_type
    
    if (reviewData.account_id !== account_id && account_type !== "Admin") {
      req.flash("notice", "You can only edit your own reviews.")
      res.redirect("/account/")
      return
    }
    
    const vehicleName = `${reviewData.inv_make} ${reviewData.inv_model}`
    
    res.render("reviews/edit-review", {
      title: `Edit Review - ${vehicleName}`,
      nav,
      reviewData: { ...reviewData, review_title, review_text, review_rating },
      vehicleName,
      errors,
    })
    return
  }

  try {
    // Add authorization check here too
    const reviewData = await reviewModel.getReviewById(review_id)
    const account_id = res.locals.accountData.account_id
    const account_type = res.locals.accountData.account_type
    
    if (reviewData.account_id !== account_id && account_type !== "Admin") {
      req.flash("notice", "You can only edit your own reviews.")
      res.redirect("/account/")
      return
    }

    const reviewResult = await reviewModel.updateReview(
      review_id,
      review_title,
      review_text,
      parseInt(review_rating)
    )

    if (reviewResult) {
      req.flash("notice", "Your review has been updated successfully!")
      res.redirect("/review/my-reviews")
    } else {
      req.flash("notice", "Sorry, updating the review failed.")
      res.redirect(`/review/edit/${review_id}`)
    }
  } catch (error) {
    console.error("updateReview error:", error)
    req.flash("notice", "Sorry, there was an error updating your review.")
    res.redirect(`/review/edit/${review_id}`)
  }
}

/* ***************************
 *  Build delete review view
 * ************************** */
reviewCont.buildDeleteReview = async function (req, res, next) {
  let nav = await utilities.getNav()
  const review_id = parseInt(req.params.review_id)
  
  try {
    const reviewData = await reviewModel.getReviewById(review_id)
    
    if (!reviewData) {
      req.flash("notice", "Review not found.")
      res.redirect("/account/")
      return
    }

    // Check if user owns this review or is admin
    const account_id = res.locals.accountData.account_id
    const account_type = res.locals.accountData.account_type
    
    if (reviewData.account_id !== account_id && account_type !== "Admin") {
      req.flash("notice", "You can only delete your own reviews.")
      res.redirect("/account/")
      return
    }

    const vehicleName = `${reviewData.inv_make} ${reviewData.inv_model}`
    
    res.render("reviews/delete-confirm", {
      title: `Delete Review - ${vehicleName}`,
      nav,
      reviewData,
      vehicleName,
      errors: null,
    })
  } catch (error) {
    console.error("buildDeleteReview error:", error)
    req.flash("notice", "Sorry, we encountered an error.")
    res.redirect("/account/")
  }
}

/* ***************************
 *  Process delete review
 * ************************** */
reviewCont.deleteReview = async function (req, res, next) {
  const { review_id } = req.body

  try {
    const deleteResult = await reviewModel.deleteReview(review_id)

    if (deleteResult) {
      req.flash("notice", "Your review has been deleted successfully!")
    } else {
      req.flash("notice", "Sorry, deleting the review failed.")
    }
    res.redirect("/review/my-reviews") // ✅ FIXED: Use consistent route
  } catch (error) {
    console.error("deleteReview error:", error)
    req.flash("notice", "Sorry, there was an error deleting your review.")
    res.redirect("/review/my-reviews") // ✅ FIXED: Use consistent route
  }
}

/* ***************************
 *  Build user reviews management view
 * ************************** */
reviewCont.buildUserReviews = async function (req, res, next) {
  let nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  
  try {
    const reviews = await reviewModel.getReviewsByAccountId(account_id)
    
    res.render("reviews/user-reviews", {
      title: "My Reviews",
      nav,
      reviews,
      errors: null,
    })
  } catch (error) {
    console.error("buildUserReviews error:", error)
    req.flash("notice", "Sorry, we encountered an error loading your reviews.")
    res.redirect("/account/")
  }
}

/* ***************************
 *  Build admin reviews management view
 * ************************** */
reviewCont.buildAdminReviews = async function (req, res, next) {
  let nav = await utilities.getNav()
  
  try {
    const reviews = await reviewModel.getAllReviews()
    
    res.render("reviews/admin-reviews", {
      title: "Review Management",
      nav,
      reviews,
      errors: null,
    })
  } catch (error) {
    console.error("buildAdminReviews error:", error)
    req.flash("notice", "Sorry, we encountered an error loading the reviews.")
    res.redirect("/account/")
  }
}

/* ***************************
 *  Toggle review approval
 * ************************** */
reviewCont.toggleApproval = async function (req, res, next) {
  const { review_id } = req.body

  try {
    const result = await reviewModel.toggleReviewApproval(review_id)
    const status = result.review_approved ? "approved" : "unapproved"
    req.flash("notice", `Review has been ${status}.`)
  } catch (error) {
    console.error("toggleApproval error:", error)
    req.flash("notice", "Sorry, there was an error updating the review status.")
  }
  
  res.redirect("/review/admin")
}

module.exports = reviewCont