const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accCont = {};

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}
/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagementView(req, res) {
    let nav = await utilities.getNav();
    res.render("account/account-management", {
        title: "Account Management",
        nav,
        errors: null,
    });
};

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password} = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'ve registered ${account_firstname}! Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
    res.clearCookie("jwt");
    delete res.locals.accountData;
    res.locals.loggedin = 0;
    
    req.flash("notice", "You have been logged out.")
    res.redirect("/");
    return;
}

/* ****************************************
 *  Build update view
 * ************************************ */
async function buildUpdate(req, res, next) {
    let nav = await utilities.getNav();
    const accountDetails = await accountModel.getAccountById(req.params.accountId);
    const { account_id, account_firstname, account_lastname, account_email } = accountDetails;
    res.render("account/update", {
        title: "Update",
        nav,
        errors: null,
        account_id,
        account_firstname,
        account_lastname,
        account_email
    });
};

/* ****************************************
 *  Process account update request
 * ************************************ */
async function updateAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    const regResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
    if (regResult) {
        req.flash("notice", `Successfully updated ${account_firstname}'s account.`)

        const accountData = await accountModel.getAccountById(account_id);
        delete accountData.account_password;
        res.locals.accountData.account_firstname = accountData.account_firstname;

        utilities.updateCookie(accountData, res);

        res.status(201).render("account/account-management", {
            title: "Management",
            nav,
            errors: null,
        });
    } else {
        req.flash("notice", "Sorry, the update failed")
        res.status(501).render("account/update", {
            title: "Update",
            nav,
            errors: null,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
        });
    }
};

/* ****************************************
 *  Process password update request
 * ************************************ */
async function updatePassword(req, res) {
    let nav = await utilities.getNav();
    const { account_id, account_password } = req.body;

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error updating your password.')
        res.status(500).render("account/update", {
            title: "Update",
            nav,
            errors: null,
        })
    }

    const regResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (regResult) {
        req.flash("notice", "Successfully updated password.");
        res.status(201).render("account/account-management", {
            title: "Manage",
            nav,
            errors: null,
        });
    } else {
        req.flash("notice", "Password update failed.");
        res.status(501).render("account/update", {
            title: "Update",
            nav,
            errors: null,
        });
    }
}



// Week 6 stuff
/* ****************************************
 *  Process password update request
 * ************************************ */
async function buildUserManageView(req, res, next) {
    let nav = await utilities.getNav()

    const userSelect = await utilities.buildUserList();

    res.render("./account/management", {
        title: "Manage Users",
        nav,
        errors: null,
        userSelect,
    });
}

async function buildAddUser (req, res, next) {
    let nav = await utilities.getNav();

    res.render("account/add-user", {
        title: "Add New User",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Process Added User Registration
* *************************************** */
async function registerNewUser(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password, account_type } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/add-user", {
            title: "Add New User",
            nav,
            errors: null,
        })
    }

    const regResult = await accountModel.addUser(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword,
        account_type
    )

    if (regResult) {
        req.flash(
            "notice",
            `Successfully registered ${account_firstname}.`
        )
        const userSelect = await utilities.buildUserList();
        res.status(201).render("account/management", {
            title: "Manage Users",
            nav,
            errors: null,
            userSelect,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/add-user", {
            title: "Add User",
            nav,
            errors: null,
        })
    }
}

/* ***************************
 *  Return Account As JSON
 * ************************** */
accCont.getAccountJSON = async (req, res, next) => {
    const account_id = parseInt(req.params.account_id);
    const accData = await accountModel.getAccountById(account_id);
    if (accData[0].account_id) {
        return res.json(accData)
    } else {
        next(new Error("No Data Returned"))
    }
}

/* ***************************
 *  Build Delete Account View
 * ************************** */
async function buildDeleteUser (req, res, next) {
  const account_id = parseInt(req.params.account_id);
  let nav = await utilities.getNav();
  const userData = (await accountModel.getAccountById(account_id));
  const userName = `${userData.account_firstname} ${userData.account_lastname}`;

  res.render("./account/delete-confirm", {
    title: "Delete " + userName,
    nav,
    errors: null,
    account_id: userData.account_id,
    account_firstname: userData.account_firstname,
    account_lastname: userData.account_lastname,
    account_email: userData.account_email,
    account_type: userData.account_type,
  });
};

/* ***************************
 *  Delete User
 * ************************** */
async function deleteUser (req, res, next) {
  const nav = await utilities.getNav();

  const {account_id, account_firstname, account_lastname, account_email, account_type} = req.body;

  const response = await accountModel.deleteAccount(account_id);

  const userName = `${account_firstname} ${account_lastname}`

  if (response) {
    req.flash("notice", `${userName} deleted successfully.`);
    res.redirect("/account/");
  } else {
    req.flash("notice", "Sorry, the delete failed.");
    res.status(501).render("account/management/delete-confirm", {
      title: "Delete " + userName,
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
      account_type,
    });
  }
};

/* ***************************
 *  Build Edit User View
 * ************************** */
async function buildEditUser (req, res, next) {
  const account_id = parseInt(req.params.account_id);
  let nav = await utilities.getNav();
  const userData = (await accountModel.getAccountById(account_id))
  // const classificationSelect = await utilities.buildClassificationList(itemData.classification_id); // Included lesson code, doesn't work
  const userName = `${userData.account_firstname} ${userData.account_lastname}`;

  res.render("./account/edit-user", {
    title: "Edit " + userName,
    nav,
    errors: null,
    account_id: userData.account_id,
    account_firstname: userData.account_firstname,
    account_lastname: userData.account_lastname,
    account_email: userData.account_email,
  });
};

/* ****************************************
 *  Process account update request from manager
 * ************************************ */
async function updateUserAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_id, account_firstname, account_lastname, account_email, account_type } = req.body;
    const regResult = await accountModel.updateUserAccount(account_id, account_firstname, account_lastname, account_email, account_type);
    if (regResult) {
        req.flash("notice", `Successfully updated ${account_firstname}'s account.`)

        res.status(201).render("account/account-management", {
            title: "Management",
            nav,
            errors: null,
        });
    } else {
        req.flash("notice", "Sorry, the update failed")
        res.status(501).render("account/edit-user", {
            title: "Update",
            nav,
            errors: null,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
        });
    }
};


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagementView, accountLogout, updateAccount, buildUpdate, updatePassword, buildUserManageView, buildAddUser, registerNewUser, buildDeleteUser, deleteUser, buildEditUser, updateUserAccount }