require("dotenv/config");
const express = require('express')
const router = express.Router();
var request = require('request');
const fetchuser = require('../middleware/fetchuser')
const checkAdmin = require('../middleware/admincheck')
const QuestionSchema = require('../models/QuestionModel')
var accessToken = process.env.Problems_token;
var endpoint = process.env.SphereEngineURL;

//Middleware to check admin
router.use(fetchuser, checkAdmin)

//Route for problem add by admin : /api/v1/problem/add
router.post('/add', async (req, res) => {
    try {
        var problemData = {
            name: req.body.name,
            masterjudgeId: 1001,
            body: req.body.description
        };

        // send request
        request({
            url: endpoint + '/problems?access_token=' + accessToken,
            method: 'POST',
            form: problemData
        }, async function (error, response, body) {

            if (error) {
                console.log('Connection problem');
            }

            // process response
            if (response) {
                // console.log(response)
                if (response.statusCode === 201) {
                    const newResponse = JSON.parse(response.body)
                    // console.log(newResponse)
                    // console.log(JSON.parse(response.body)); // problem data in JSON
                    const newProblem = new QuestionSchema({
                        name: req.body.name,
                        body: req.body.description,
                        code: newResponse.code,
                        problemId: newResponse.id,
                    })

                    const saved = await newProblem.save();
                    // console.log(saved)
                    return res.status(200).json({
                        success: 1,
                        message: "Problem creation Successful",
                        code: newResponse.code,
                        problemId: newResponse.id
                    });
                } else {
                    if (response.statusCode === 401) {
                        console.log('Invalid access token');
                    } else if (response.statusCode === 400) {
                        var body = JSON.parse(response.body);
                        console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                    }
                    res.status(400).json('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                }
            }
        });
    } catch (err) {
        console.error(err)
        console.log(err.message)
        res.status(400).json({ message: err.message });
    }
})

//Route for problem update by admin : /api/v1/problem/update
router.put('/update', async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(200).json({
                success: 0,
                message: "Inaccesible privilege"
            });
        }
        var problemId = req.body.problemId;
        const findProblem = await QuestionSchema.findOne({ problemId: problemId })
        // console.log(findProblem)
        var problemData = {
            name: req.body.name ? req.body.name : findProblem.name,
            body: req.body.description ? req.body.description : findProblem.body
        };

        // send request
        request({
            url: endpoint + '/problems/' + problemId + '?access_token=' + accessToken,
            method: 'PUT',
            form: problemData
        }, async function (error, response, body) {
            // console.log(error)
            if (error) {
                console.log('Connection problem');
            }

            // process response
            if (response) {
                if (response.statusCode === 200) {
                    console.log('Problem updated');

                    const updateProblem = await QuestionSchema.updateOne(findProblem, {
                        $set: {
                            name: req.body.name ? req.body.name : findProblem.name,
                            body: req.body.description ? req.body.description : findProblem.body
                        }
                    })

                    // console.log(updateProblem);
                    return res.status(200).json({
                        success: 1,
                        message: "Problem updation Successful",
                        code: findProblem.code,
                        problemId: findProblem.problemId
                    });
                } else {
                    if (response.statusCode === 401) {
                        console.log('Invalid access token');
                    } else if (response.statusCode === 403) {
                        console.log('Access denied');
                    } else if (response.statusCode === 404) {
                        console.log('Problem does not exist');
                    } else if (response.statusCode === 400) {
                        var body = JSON.parse(response.body);
                        console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                    }

                    res.status(400).json('Error code: ' + body.error_code + ', details available in the message: ' + body.message)

                }
            }
        });
    } catch (err) {
        console.error(err)
        console.log(err.message)
        res.status(400).json({ message: err.message });
    }
})

//Route for problem delete by admin : /api/v1/problem/delete
router.delete('/delete', async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(200).json({
                success: 0,
                message: "Inaccesible privilege"
            });
        }
        var problemId = req.body.problemId;
        // console.log(findProblem)

        // send request
        request({
            url: endpoint + '/problems/' + problemId + '?access_token=' + accessToken,
            method: 'DELETE'
        }, async function (error, response, body) {

            if (error) {
                console.log('Connection problem');
            }

            // process response
            if (response) {
                if (response.statusCode === 200) {
                    console.log('Problem deleted');

                    const deleteProblem = await QuestionSchema.deleteOne({ problemId: req.body.problemId })
                    // console.log(deleteProblem)
                    return res.status(200).json({
                        success: 1,
                        message: "Problem deletion Successful",
                    });
                } else {
                    if (response.statusCode === 401) {
                        console.log('Invalid access token');
                    } else if (response.statusCode === 403) {
                        console.log('Access denied');
                    } else if (response.statusCode === 404) {
                        console.log('Problem not found');
                    }
                    res.status(400).json('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                }
            }
        });
    } catch (err) {
        console.error(err)
        console.log(err.message)
        res.status(400).json({ message: err.message });
    }
})

module.exports = router