const invModel = require("../models/inventory-model")
const accModel = require("../models/account-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  console.log(data)
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the single vehicle view HTML
* ************************************ */
Util.buildSingleListing = async function(data) {
  let listing = ''
  if(data) {
    listing = `
    <section class="vehicle-info">
      <div class="vehicle-image">
        <img src="../../${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
      </div>
      <div class="vehicle-description">
        <h2>${data.inv_make} ${data.inv_model} Details</h2>
        <ul>
          <li><strong>Price: ${Number.parseFloat(data.inv_price).toLocaleString("en-US", {style:"currency", currency:"USD"})} </strong></li>
          <li><strong>Description:</strong> ${data.inv_description}</li>
          <li><strong>Color:</strong> ${data.inv_color}</li>
          <li><strong>Miles:</strong> ${data.inv_miles.toLocaleString("en-US", {style: "decimal"})}</li>
        </ul>
      </div>
    </section>`
  } else {
    listing = `<p>No matching vehicles found.</p>`
  }

  return listing
}

/* ***************************
 *  Build Classification Select List on Form
 * ************************** */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if ( classification_id != null && row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      })
  } else {
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
* Check Authorization Middleware
**************************************** */
Util.checkAuthorization = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        if (accountData.account_type == "Employee" || accountData.account_type == "Admin") {
          next()
        } else {
          req.flash("notice", "You do not have permission to access this.")
          return res.redirect("/account/login")
        }
      }
    )
  } else {
    req.flash("notice", "You do not have permission to access this.")
    return res.redirect("/account/login")
  }
}


/* ****************************************
* Update Browser Cookie
**************************************** */
Util.updateCookie = (accountData, res) => {
  const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });
  if (process.env.NODE_ENV === "development") {
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
  } else {
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 3600 * 1000,
    });
  }
}



// Week 6 stuff

/* ****************************************
* Check Admin Authorization Middleware
**************************************** */
Util.checkAdminAuthorization = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        if (accountData.account_type == "Admin") {
          next()
        } else {
          req.flash("notice", "You do not have permission to access this.")
          return res.redirect("/account/login")
        }
      }
    )
  } else {
    req.flash("notice", "You do not have permission to access this.")
    return res.redirect("/account/login")
  }
}

/* ***************************
 *  Build User Select List on Form
 * ************************** */
Util.buildUserList = async function (account_id = null) {
    let data = await accModel.getAccounts()
    // let accountList =
    //   '<select name="account_id" id="accountList" required>'
    // accountList += "<option value=''>Choose an Account</option>"
    // data.rows.forEach((row) => {
    //   accountList += '<option value="' + row.account_id + '"'
    //   if ( account_id != null && row.account_id == account_id
    //   ) {
    //     accountList += " selected "
    //   }
    //   accountList += ">" + row.account_firstname + " " + row.account_lastname + " - " + row.account_type + " " + "</option>"
    // })
    // accountList += "</select>"
    // return accountList

    let dataTable = '<table id="inventoryDisplay">'
    dataTable += '<thead>'; 
    dataTable += '<tr><th>Account Name</th><th>Type</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
    dataTable += '</thead>';
    dataTable += '<tbody>';
    data.rows.forEach((row) => {  
      dataTable += `<tr><td>${row.account_firstname} ${row.account_lastname}</td>`;
      dataTable += `<td>${row.account_type}</td>` 
      dataTable += `<td><a href='/account/management/edit/${row.account_id}' title='Click to update'>Modify</a></td>`; 
      dataTable += `<td><a href='/account/management/delete/${row.account_id}' title='Click to delete'>Delete</a></td></tr>`; 
    })
    dataTable += '</tbody>'; 
    dataTable +='</table>'
    return dataTable
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util