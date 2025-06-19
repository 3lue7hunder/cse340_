const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const reviewModel = require("../models/review-model")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  let nav = await utilities.getNav()
  
  try {
    // Get vehicles with review stats
    const data = await invModel.getInventoryByClassificationIdWithReviews(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let className = data[0]?.classification_name || "Unknown"
    
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      errors: null,
    })
  } catch (error) {
    console.error("buildByClassificationId error:", error)
    next(error)
  }
}

/* ***************************
 *  Build inventory by inventory ID
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  // ✅ Fixed parameter name to match route definition
  const inv_id = req.params.inventoryId
  let nav = await utilities.getNav()

  try {
    // Get vehicle data with review stats
    const data = await invModel.getInventoryWithReviewStats(inv_id)

    // Add this check
    if (!data) {
      req.flash("notice", "Sorry, the requested vehicle was not found.")
      return res.status(404).redirect("/inv")
    }

    // Get reviews for this vehicle
    const reviews = await reviewModel.getReviewsByInvId(inv_id)

    // Check if user is logged in and hasn't reviewed this vehicle yet
    let canReview = false
    let userHasReviewed = false

    if (res.locals.loggedin) {
      const account_id = res.locals.accountData.account_id
      const existingReview = await reviewModel.checkExistingReview(inv_id, account_id)
      userHasReviewed = !!existingReview
      canReview = !userHasReviewed
    }

    const grid = await utilities.buildVehicleDetailGrid(data)
    let vehicleName = `${data.inv_make} ${data.inv_model}`

    res.render("./inventory/listing", {
      title: vehicleName,
      nav,
      grid,
      reviews,
      canReview,
      userHasReviewed,
      inv_id,
      avgRating: parseFloat(data.avg_rating || 0).toFixed(1),
      reviewCount: data.review_count || 0,
      errors: null,
    })
  } catch (error) {
    console.error("buildByInventoryId error:", error)
    next(error)
  }
}

/* ***************************
 *  Build Management View
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()

  const classificationSelect = await utilities.buildClassificationList();

  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    classificationSelect,
  })
}

/* ***************************
 *  Build Add Classification View
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();

  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Add Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;

  const response = await invModel.addClassification(classification_name);

  let nav = await utilities.getNav();
  if (response) {
    req.flash("notice", `The ${classification_name} classification was successfully added.`);
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classification_name,
      errors: null,
    });
  } else {
    req.flash("notice", `Failed to add ${classification_name}`);
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      classification_name,
      errors: null,
    });
  }
};

/* ***************************
 *  Build Add Inventory View
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classifications = await utilities.buildClassificationList();

  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classifications,
    errors: null,
  });
};

/* ***************************
 *  Add Inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classifications = await utilities.buildClassificationList();

  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;

  const response = invModel.addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);

  if (response) {
    req.flash("notice", `${inv_year} ${inv_make} ${inv_model} was added successfully.`)
    
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", `Failed to add ${inv_year} ${inv_make} ${inv_model}`)
    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classifications,
      errors: null,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
}

/* ***************************
 *  Build Edit Inventory View
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventory_id);
  let nav = await utilities.getNav();
  const itemData = (await invModel.getInventoryByInventoryId(inventory_id))[0]
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  let classifications = await utilities.buildClassificationList(itemData.classification_id);

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classifications,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
};

/* ***************************
 *  Update Inventory Item
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const nav = await utilities.getNav();

  const {inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id,} = req.body;

  const response = await invModel.updateInventory(inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);

  if (response) {
    const itemName = response.inv_make + " " + response.inv_model;
    req.flash("notice", `${itemName} updated successfully.`);
    res.redirect("/inv/");
  } else {
    const classifications = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/editInventory", {
      title: "Edit " + itemName,
      nav,
      errors: null,
      classifications,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

/* ***************************
 *  Build Delete Inventory View
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventory_id);
  let nav = await utilities.getNav();
  const itemData = (await invModel.getInventoryByInventoryId(inventory_id))[0]
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  });
};

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const nav = await utilities.getNav();

  const {inv_id, inv_make, inv_model, inv_year, inv_price} = req.body;

  const response = await invModel.deleteInventory(inv_id);

  const itemName = `${inv_make} ${inv_model}`

  if (response) {
    req.flash("notice", `${itemName} deleted successfully.`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the delete failed.");
    res.status(501).render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
    });
  }
};

module.exports = invCont