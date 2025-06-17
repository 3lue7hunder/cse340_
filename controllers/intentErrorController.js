const intentionalErrorCon = {};

intentionalErrorCon.causeError = async function(req, res, next) {
    let errorNum = 1/0
    console.log(errorNum);
    throw new Error("Intentional error occured.")

    res.render("./", {title: "Intentional Error"})
}

module.exports = intentionalErrorCon;