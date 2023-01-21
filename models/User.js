const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type : String,
        required : true,
        min : 1,
    },
    email: {
        type : String,
        required : true,
        unique : true,
        min : 5,
    },
    password: {
        type : String,
        required : true,
        min : 8,

    },
    profilePicture : {
        type: String,
        default : '',
    },
    coverPicture : {
        type: String,
        default : '',

    },
    followers : {
        type : Array,
        default: [],
    },
    following: {
        type : Array,
        default: [],
    },
    isAdmin: {
        type : Boolean, 
        default : false,
    },
    token: {
        type: Array,
        default: [],
    }
});

//Creating the model using the above schema
userModel = mongoose.model("User", userSchema);
module.exports = userModel;