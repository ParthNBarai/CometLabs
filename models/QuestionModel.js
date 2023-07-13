const mongoose = require("mongoose");
// console.log(user-icon)
const QuestionSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required:true
    },
    problemId: {
        type: Number,
        required:true
    },
});



module.exports = mongoose.model('questions', QuestionSchema);