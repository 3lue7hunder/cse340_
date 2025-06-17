const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const intentErrCon = require("../controllers/intentErrorController");

router.use("/", utilities.handleErrors(async (req, res, next) => {
    throw new Error("Intentionally throwing exception through middleware")

    next();
}))

router.get("/", utilities.handleErrors(intentErrCon.causeError));

module.exports = router;