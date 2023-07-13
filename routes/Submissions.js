require("dotenv/config");
const express = require('express')
const router = express.Router();
var request = require('request');
const fetchuser = require('../middleware/fetchuser')
const sendMail = require('./Email')
var accessToken = process.env.Problems_token;
var endpoint = process.env.SphereEngineURL;

router.use(fetchuser)

router.post('/add', async (req, res) => {
    try {

        const problemId = req.body.problemId
        var submissionData = {
            problemId: 116992,
            compilerId: 10,
            source: `public class Main {
                static void myMethod() {
                  System.out.println("I just got executed!");
                }
              
                public static void main(String[] args) {
                  myMethod();
                }
              }`
        }
        // send request
        request({
            url: endpoint + '/submissions?access_token=' + accessToken,
            method: 'POST',
            form: submissionData
        }, async function (error, response, body) {
            // console.log(response.body)
            if (error) {
                console.log('Connection problem');
            }

            // process response
            if (response) {
                if (response.statusCode === 201) {
                    const newResponse = JSON.parse(response.body)
                    // console.log(JSON.parse(response.body)); // submission data in JSON
                    fetchSubmissions(req,res,newResponse.id)
                    // return res.status(200).json({
                    //     success: 1,
                    //     message: "Submitted Successfully",
                    //     submssionNumber: response.body.id
                    // });

                } else {
                    if (response.statusCode === 401) {
                        console.log('Invalid access token');
                    } else if (response.statusCode === 402) {
                        console.log('Unable to create submission');
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

async function fetchSubmissions(req,res,id) {
    try {
        var flag = false;
        var submissionsIds = id;
        // console.log(submissionsIds)
        // send request
        request({
            url: endpoint + '/submissions?ids=' + submissionsIds + '&access_token=' + accessToken,
            method: 'GET'
        }, function (error, response, body) {

            if (error) {
                console.log('Connection problem');
            }

            // process response
            if (response) {
                if (response.statusCode === 200) {
                    const newResponse = JSON.parse(response.body)
                    // console.log(JSON.parse(response.body)); // list of submissions in JSON
                    // console.log(newResponse.items[0])
                    // console.log(newResponse.items[0].executing)
                    if (!newResponse.items[0].executing) {
                        // console.log("Stopping")
                        sendMail(newResponse.items[0].result.status.name)
                        res.status(200).json({
                            success: 1,
                            message: "Executed Successfully",
                            submssionData: newResponse.items[0].result.status.name
                        });
                        flag = true
                    }
                } else {
                    if (response.statusCode === 401) {
                        console.log('Invalid access token');
                    } else if (response.statusCode === 400) {
                        var body = JSON.parse(response.body);
                        console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                    }
                }
                // console.log(flag)
                if (!flag) {
                    setTimeout(function () { fetchSubmissions(req,res,id) }, 5000)
                }
            }
        });
    } catch (err) {
        console.error(err)
        console.log(err.message)
        res.status(400).json({ message: err.message });
    }
    // return false;
}

module.exports = router