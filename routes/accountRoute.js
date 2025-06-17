// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagementView));

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/registration", utilities.handleErrors(accountController.buildRegister));
router.post("/register", 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

// router.post('/register', utilities.handleErrors(accountController.registerAccount));

router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
);

router.get("/update/:accountId", utilities.handleErrors(accountController.buildUpdate));
router.post("/update", regValidate.updateRules(), regValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccount));
router.post("/update-password", regValidate.updatePasswordRules(), regValidate.checkUpdatePasswordData, utilities.handleErrors(accountController.updatePassword));

router.get("/logout", utilities.handleErrors(accountController.accountLogout));



// New Content week 6
router.get("/management", utilities.checkAdminAuthorization, utilities.handleErrors(accountController.buildUserManageView));

// User Add
router.get("/add-user", utilities.checkAdminAuthorization, utilities.handleErrors(accountController.buildAddUser))
router.post("/add-user", regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerNewUser))

// AJAX User
router.get("/management/getUsers:account_id", utilities.handleErrors(accountController.getUsersJSON))

// Update Item
router.get("/management/edit/:account_id", utilities.checkAdminAuthorization, utilities.handleErrors(accountController.buildEditUser));
router.post("/edit-user", regValidate.updateRules(), regValidate.checkUpdateDataManage, utilities.handleErrors(accountController.updateUserAccount));


// Delete Item
router.get("/management/delete/:account_id", utilities.checkAdminAuthorization, utilities.handleErrors(accountController.buildDeleteUser));
router.post("/delete-user/", utilities.handleErrors(accountController.deleteUser));

module.exports = router;