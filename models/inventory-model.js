const pool = require("../database/")

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )

    return data.rows

  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get a single inventory item and inventory_name by inventory_id
 * ************************** */
async function getInventoryByInventoryId(inventory_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
        JOIN public.classification AS c
        ON i.classification_id = c.classification_id
        WHERE inv_id = $1`,
        [inventory_id]
    )

    return data.rows

  } catch(error) {
    console.error("getInventoryByInventoryId error" + error)
  }
}

/* ***************************
 *  Add Classification
 * ************************** */
async function addClassification(classification_name) {
  const sql = `INSERT INTO public.classification (classification_name)
  VALUES ($1)`;

  try {
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    return error.message;
  }
}

/* ***************************
 *  Get Classifications for Select on Form
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* ***************************
 *  Add a vehicle
 * ************************** */
async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  const sql = `INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
  VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

  try {
    return await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id]);
  } catch (error) {
    return error.message;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const sql = "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_year = $3, inv_description = $4, inv_image = $5, inv_thumbnail = $6, inv_price = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
  }
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    new Error("Delete Inventory Error");
  }
}

/* ***************************
 *  Get inventory with review stats
 * ************************** */
async function getInventoryWithReviewStats(inv_id) {
  try {
    const sql = `SELECT i.*, 
                 COALESCE(AVG(r.review_rating), 0) as avg_rating,
                 COUNT(r.review_id) as review_count
                 FROM inventory i 
                 LEFT JOIN review r ON i.inv_id = r.inv_id AND r.review_approved = true
                 WHERE i.inv_id = $1
                 GROUP BY i.inv_id`
    const data = await pool.query(sql, [inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryWithReviewStats error " + error)
    throw error
  }
}

/* ***************************
 *  Get all inventory with review stats for classification
 * ************************** */
async function getInventoryByClassificationIdWithReviews(classification_id) {
  try {
    const sql = `SELECT i.*, 
                 COALESCE(AVG(r.review_rating), 0) as avg_rating,
                 COUNT(r.review_id) as review_count
                 FROM inventory i 
                 LEFT JOIN review r ON i.inv_id = r.inv_id AND r.review_approved = true
                 WHERE i.classification_id = $1
                 GROUP BY i.inv_id
                 ORDER BY i.inv_make, i.inv_model`
    const data = await pool.query(sql, [classification_id])
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationIdWithReviews error " + error)
    throw error
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByInventoryId,
  addClassification,
  addInventory,
  updateInventory,
  deleteInventory,
  getInventoryWithReviewStats,
  getInventoryByClassificationIdWithReviews
}