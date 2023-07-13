const mongoose = require("mongoose");
// console.log(user-icon)
const TestcaseSchema = mongoose.Schema({
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    },
    timeLimit: {
        type: Number,
        required:true
    },
    problemId: {
        type: Number,
        required:true
    },
    testNumber:{
        type: Number,
        required:true
    }
});



module.exports = mongoose.model('testcase', TestcaseSchema);