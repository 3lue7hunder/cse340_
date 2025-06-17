const utilities = require("../utilities")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Classification Data Validation Rules
  * ********************************* */
validate.classificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min:1 })
            .isAlphanumeric()
            .withMessage("Please provide a valid classification name."), // on error, this message is sent.
    ]
};

 /* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}

/*  **********************************
*  Inventory Data Validation Rules
* ********************************* */
validate.inventoryRules = () => {
    return [
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min:3 })
            .withMessage("Please provide a valid make."), //on error, this message is sent

        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min:3 })
            .withMessage("Please provide a valid model."),

        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .isLength(4)
            .withMessage("Please provide a valid 4 digit Year."),

        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min:1 })
            .withMessage("Please provide a valid description."),

        body("inv_image")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min:1 })
            .withMessage("Please provide a valid image path."),

        body("inv_thumbnail")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min:1 })
            .withMessage("Please provide a valid thumbnail path."),

        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Please enter a valid number for the price."),

        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Please provide a valid number for the mileage."),

        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min:1 })
            .withMessage("Please provide a color."),

        body("classification_id")
            .trim()
            .escape()
            .notEmpty()
            .isInt()
            .isLength({ min:1 })
            .withMessage("Please provide a make."),
    ];
};

/*  **********************************
  *  Check data and return errors or continue to add vehicle
  * ********************************* */
 validate.checkInventoryData = async (req, res, next) => {
    let errors = []
    errors = validationResult(req)

    if (!errors.isEmpty()) {
        const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
        let classifications = await utilities.buildClassificationList(classification_id)
        let nav = await utilities.getNav()

        res.render("inventory/add-inventory", {
            errors,
            title: "Add Inventory",
            nav,
            classifications,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        })
        return
    }
    next()
}

/*  **********************************
  *  Check data and return errors or continue to update vehicle
  * ********************************* */
 validate.checkUpdateData = async (req, res, next) => {
    let errors = []
    errors = validationResult(req)

    if (!errors.isEmpty()) {
        const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id } = req.body
        let classifications = await utilities.buildClassificationList(classification_id)
        let nav = await utilities.getNav()

        res.render("inventory/edit-inventory", {
            errors,
            title: "Edit " + inv_make + " " + inv_model,
            nav,
            classifications,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            inv_id,
        })
        return
    }
    next()
}

module.exports = validate