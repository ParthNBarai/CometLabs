require("dotenv/config");
const express = require('express')
const router = express.Router();
const UserSchema = require("../models/UserModel")
const auth = require('../Authentication/GetBearerToken')
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign, verify } = require("jsonwebtoken");
const { JsonWebTokenError } = require("jsonwebtoken");
const { body, validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");

//Route for user signup : /api/v1/user/signup
router.post('/signup', [
    body('name', 'Name must be atleast 3 characters').isLength({ min: 3 }),
    body('password', 'Password must be atleast 8 characters').isLength({ min: 8 }),
    body('email', 'Enter a valid email').isEmail(),
], async (req, res) => {
    try {
        var valerr = validationResult(req);
        if (!valerr.isEmpty()) {
            // console.log(valerr.mapped())
            return res.status(401).json(valerr)
        }
        const salt = genSaltSync(10);
        req.body.password = hashSync(req.body.password, salt);

        const user = new UserSchema({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            isAdmin: req.body.isAdmin,
        });

        const saved = await user.save();
        if (saved) {
            user.password = undefined;
            const newUser = {
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin
            }
            const jsontoken = await auth.tokenGenerate(newUser);
            res.status(200).json({
                success: 1,
                message: "Successful signup",
                email: user.email,
                token: jsontoken,
            });
        }

    }
    catch (err) {
        console.error(err)
        console.log(err.message)
        res.status(400).json({ message: err.message });
    }

})

//Route for user login : /api/v1/user/login
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
], async (req, res) => {
    try {
        var valerr = validationResult(req);
        if (!valerr.isEmpty()) {
            // console.log(valerr.mapped())
            return res.status(401).json(valerr)
        }
        const user = { email: req.body.email };
        UserSchema.findOne(user)
            .exec()
            .then(async user => {
                // console.log(user)
                if (!user) {
                    return res.status(403).json({
                        error: {
                            message: "User Not Found, Kindly Register!"
                        }
                    })
                }

                else {
                    const result = compareSync(req.body.password, user.password);
                    if (result) {
                        user.password = undefined;
                        const newUser = {
                            email: user.email,
                            name: user.name,
                            isAdmin: user.isAdmin
                        }
                        // console.log(newUser)
                        const jsontoken = await auth.tokenGenerate(newUser);
                        return res.status(200).json({
                            success: 1,
                            message: "Successful login",
                            token: jsontoken
                        });
                    }
                    else {
                        // console.log(err.message)
                        return res.status(403).json({
                            error: {
                                message: "Username or Password Invalid!"
                            }
                        })
                    }

                }

            })

    }
    catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err.message });
    }
})

module.exports = router