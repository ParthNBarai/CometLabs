var jwt = require('jsonwebtoken');
const fetchuser = require('./fetchuser')
require("dotenv/config");

const checkAdmin = async (req, res, next) => {

    try {
        if (!req.user.isAdmin) {
            return res.status(200).json({
                success: 0,
                message: "Inaccesible privilege"
            });
        }
        next();
    } catch (error) {
        res.status(401).send({ success: false, error: "authenticate using a Valid token" })
    }
}


module.exports = checkAdmin;