const utilities = require("../utilities")
const { body, validationResult } = require("express-validator")
const { registerAccount } = require("../models/account-model")
const accountModel = require("../models/account-model")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
 validate.registrationRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min:1 })
            .withMessage("Please provide a first name."), // on error, this message is sent.

        // same as above but lastname
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min:2 })
            .withMessage("Please provide a last name."), //same as above but for last

        // valid email is required and can't already exist in DB
        body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (!!emailExists){
                throw new Error("Email already exists. Please log in or use different email")
            }
        }),

        // pwd required and must be strong
        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password doesn't meet requirements"),
    ]
 }

 /*  **********************************
  *  Login Data Validation Rules
  * ********************************* */
 validate.loginRules = () => {
    return [
        body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (!emailExists){
                throw new Error("No account registered with this email")
            }
        }),

        // pwd required and must be strong
        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password doesn't meet requirements"),
    ]
 }

  /*  **********************************
  *  Update Data Validation Rules
  * ********************************* */
 validate.updateRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min:1 })
            .withMessage("Please provide a first name."), // on error, this message is sent.

        // same as above but lastname
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min:2 })
            .withMessage("Please provide a last name."), //same as above but for last

        // valid email is required and can't already exist in DB
        body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required.")
        .custom(async (account_email, { req }) => {
            const emailExists = await accountModel.checkExistingEmail(account_email, req.body.old_email)
            if (emailExists){
                throw new Error("Email already exists. Please log in or use different email")
            }
        }),
    ]
 }

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.updatePasswordRules = () => {
    return [
        // pwd required and must be strong
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password doesn't meet requirements"),
    ]
}

 /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email
        })
        return
    }
    next()
}

 /* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        })
        return
    }
    next()
}

 /* ******************************
 * Check data and return errors or continue to update
 * ***************************** */
validate.checkUpdateData =  async (req, res, next) => {
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/update", {
            errors,
            title: "Update",
            nav,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

 /* ******************************
 * Check data and return errors or continue to update password
 * ***************************** */
validate.checkUpdatePasswordData = async (req, res, next) => {
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/update", {
            errors,
            title: "Update",
            nav,
            account_id,
            account_firstname,
            account_lastname,
            account_email
        })
        return
    }
    next()
}


// Week 6 stuff
validate.checkManageRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email, account_type } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/add-user", {
            errors,
            title: "Add User",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            account_type,
        })
        return
    }
    next()
}

 /* ******************************
 * Check data and return errors or continue to update
 * ***************************** */
validate.checkUpdateDataManage =  async (req, res, next) => {
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/edit-user", {
            errors,
            title: "Edit" + account_firstname + " " + account_lastname,
            nav,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}


module.exports = validate