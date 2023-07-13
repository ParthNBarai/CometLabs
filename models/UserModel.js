const mongoose = require("mongoose");
// console.log(user-icon)
const userSchema = mongoose.Schema({
  
    email:{
        type : String,
        required:true,
        unique:true
    },
    password: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true
    }
});



module.exports = mongoose.model('customer', userSchema);