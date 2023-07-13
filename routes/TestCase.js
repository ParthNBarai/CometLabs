require("dotenv/config");
const express = require('express')
const router = express.Router();
var request = require('request');
const fetchuser = require('../middleware/fetchuser')
const checkAdmin = require('../middleware/admincheck')
const TestcaseSchema = require('../models/TestcaseModel')
var accessToken = process.env.Problems_token;
var endpoint = process.env.SphereEngineURL;

//Middleware to check admin
router.use(fetchuser, checkAdmin)


//Route for adding testcase by admin : /api/v1/testcase/add
router.post('/add', async (req, res) => {
    try {
        var problemId = req.body.problemId;
        var testcaseData = {
            input: req.body.input,
            output: req.body.output,
            timelimit: req.body.timelimit,
            judgeId: 1
        };

        // send request
        request({
            url: endpoint + '/problems/' + problemId + '/testcases?access_token=' + accessToken,
            method: 'POST',
            form: testcaseData
        }, async function (error, response, body) {

            if (error) {
                console.log('Connection problem');
            }

            // process response
            if (response) {
                if (response.statusCode === 201) {
                    const newResponse = JSON.parse(response.body)
                    // console.log(JSON.parse(response.body)); // testcase data in JSON

                    const newTestcase = new TestcaseSchema({
                        input: req.body.input,
                        output: req.body.output,
                        timeLimit: req.body.timelimit,
                        problemId: req.body.problemId,
                        testNumber: newResponse.number,
                    })

                    const saved = await newTestcase.save();
                    // console.log(saved)

                    // console.log(updateProblem)
                    return res.status(200).json({
                        success: 1,
                        message: "Problem creation Successful",
                        testNumber: newResponse.number
                    });
                }
                else {
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
                    else {
                        res.status(400).json('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                    }
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