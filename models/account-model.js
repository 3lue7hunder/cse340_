const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email, excludedEmail = null){
    try {
        if(excludedEmail) {
            const sql = "SELECT * FROM account WHERE account_email = $1 AND account_email != $2"
            const email = await pool.query(sql, [account_email, excludedEmail])
            return email.rowCount
        }
        else {
            const sql = "SELECT * FROM account WHERE account_email = $1"
            const email = await pool.query(sql, [account_email])
            return email.rowCount
        }
    } catch (error) {
        return error.message
    }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
            [account_email]);
            return result.rows[0];
    } catch (error) {
        return new Error("No matching email was found");
    }
}

/* *****************************
* Return account data using id
* ***************************** */
async function getAccountById(account_id) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
            [account_id]);
            return result.rows[0];
    } catch (error) {
        return new Error("No matching account was found");
    }
}

/* *****************************
* Send query to update account
* ***************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
    try {
        const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4";
        const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
        return result;
    } catch(error) {
        return new Error("Update failed. Please try again.");
    }
}

/* *****************************
* Send query to update password
* ***************************** */
async function updatePassword(account_id, hashed_password) {
    try {
        const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2";
        const result = await pool.query(sql, [hashed_password, account_id]);
        return result;
    } catch(error) {
        return new Error("Password Update Failed. Please try again.");
    }
}





// Week 6 stuff

/* ***************************
 *  Get Users for Select on Form
 * ************************** */
async function getAccounts() {
  return await pool.query('SELECT * FROM public.account ORDER BY account_id');
}

/* ***************************
 *  Get Users for Select on Form
 * ************************** */
async function getAccountByType(account_type) {
    const sql = "SELECT * FROM public.account WHERE account_type = $1";
    const result = await pool.query(sql, [account_type]);
    return result
}

/* ***************************
 *  Add a User from Manager View
 * ************************** */
async function addUser(account_firstname, account_lastname, account_email, account_password, account_type){
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, $5) RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password, account_type])
    } catch (error) {
        return error.message
    }
}

/* ***************************
 *  Delete Account
 * ************************** */
async function deleteAccount(account_id) {
  try {
    const sql = 'DELETE FROM account WHERE account_id = $1';
    const data = await pool.query(sql, [account_id]);
    return data;
  } catch (error) {
    new Error("Delete User Error");
  }
};

/* *****************************
* Send query to update account from manager
* ***************************** */
async function updateUserAccount(account_id, account_firstname, account_lastname, account_email, account_type) {
    try {
        const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3, account_type = $4 WHERE account_id = $5";
        const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_type, account_id]);
        return result;
    } catch(error) {
        return new Error("Update failed. Please try again.");
    }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword, getAccountByType, addUser, getAccounts, deleteAccount, updateUserAccount }