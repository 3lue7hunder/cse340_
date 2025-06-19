const pool = require("../database/")

/* ***************************
 *  Get all reviews for a specific vehicle
 * ************************** */
async function getReviewsByInvId(inv_id) {
  try {
    const sql = `SELECT r.*, a.account_firstname, a.account_lastname 
                 FROM review r 
                 JOIN account a ON r.account_id = a.account_id 
                 WHERE r.inv_id = $1 AND r.review_approved = true 
                 ORDER BY r.review_date DESC`
    const data = await pool.query(sql, [inv_id])
    return data.rows
  } catch (error) {
    console.error("getReviewsByInvId error " + error)
    throw error
  }
}

/* ***************************
 *  Get review statistics for a vehicle
 * ************************** */
async function getReviewStats(inv_id) {
  try {
    const sql = `SELECT 
                   COUNT(*) as review_count,
                   AVG(review_rating) as avg_rating
                 FROM review 
                 WHERE inv_id = $1 AND review_approved = true`
    const data = await pool.query(sql, [inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("getReviewStats error " + error)
    throw error
  }
}

/* ***************************
 *  Add a new review
 * ************************** */
async function addReview(inv_id, account_id, review_title, review_text, review_rating) {
  try {
    const sql = `INSERT INTO review (inv_id, account_id, review_title, review_text, review_rating) 
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING *`
    const data = await pool.query(sql, [inv_id, account_id, review_title, review_text, review_rating])
    return data.rows[0]
  } catch (error) {
    console.error("addReview error " + error)
    throw error
  }
}

/* ***************************
 *  Get a review by ID
 * ************************** */
async function getReviewById(review_id) {
  try {
    const sql = `SELECT r.*, a.account_firstname, a.account_lastname, i.inv_make, i.inv_model 
                 FROM review r 
                 JOIN account a ON r.account_id = a.account_id 
                 JOIN inventory i ON r.inv_id = i.inv_id 
                 WHERE r.review_id = $1`
    const data = await pool.query(sql, [review_id])
    return data.rows[0]
  } catch (error) {
    console.error("getReviewById error " + error)
    throw error
  }
}

/* ***************************
 *  Update a review
 * ************************** */
async function updateReview(review_id, review_title, review_text, review_rating) {
  try {
    const sql = `UPDATE review 
                 SET review_title = $1, review_text = $2, review_rating = $3 
                 WHERE review_id = $4 
                 RETURNING *`
    const data = await pool.query(sql, [review_title, review_text, review_rating, review_id])
    return data.rows[0]
  } catch (error) {
    console.error("updateReview error " + error)
    throw error
  }
}

/* ***************************
 *  Delete a review
 * ************************** */
async function deleteReview(review_id) {
  try {
    const sql = `DELETE FROM review WHERE review_id = $1`
    const data = await pool.query(sql, [review_id])
    return data
  } catch (error) {
    console.error("deleteReview error " + error)
    throw error
  }
}

/* ***************************
 *  Get reviews by account ID
 * ************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `SELECT r.*, i.inv_make, i.inv_model, i.inv_year 
                 FROM review r 
                 JOIN inventory i ON r.inv_id = i.inv_id 
                 WHERE r.account_id = $1 
                 ORDER BY r.review_date DESC`
    const data = await pool.query(sql, [account_id])
    return data.rows
  } catch (error) {
    console.error("getReviewsByAccountId error " + error)
    throw error
  }
}

/* ***************************
 *  Check if user already reviewed this vehicle
 * ************************** */
async function checkExistingReview(inv_id, account_id) {
  try {
    const sql = `SELECT review_id FROM review WHERE inv_id = $1 AND account_id = $2`
    const data = await pool.query(sql, [inv_id, account_id])
    return data.rows[0]
  } catch (error) {
    console.error("checkExistingReview error " + error)
    throw error
  }
}

/* ***************************
 *  Get all reviews for admin management
 * ************************** */
async function getAllReviews() {
  try {
    const sql = `SELECT r.*, a.account_firstname, a.account_lastname, i.inv_make, i.inv_model, i.inv_year 
                 FROM review r 
                 JOIN account a ON r.account_id = a.account_id 
                 JOIN inventory i ON r.inv_id = i.inv_id 
                 ORDER BY r.review_date DESC`
    const data = await pool.query(sql)
    return data.rows
  } catch (error) {
    console.error("getAllReviews error " + error)
    throw error
  }
}

/* ***************************
 *  Toggle review approval status
 * ************************** */
async function toggleReviewApproval(review_id) {
  try {
    const sql = `UPDATE review 
                 SET review_approved = NOT review_approved 
                 WHERE review_id = $1 
                 RETURNING review_approved`
    const data = await pool.query(sql, [review_id])
    return data.rows[0]
  } catch (error) {
    console.error("toggleReviewApproval error " + error)
    throw error
  }
}

module.exports = {
  getReviewsByInvId,
  getReviewStats,
  addReview,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByAccountId,
  checkExistingReview,
  getAllReviews,
  toggleReviewApproval
}