const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    title:{
        type: String,
        required: "title is required",
        enum: ["Mr" , "Miss" , "Mrs"]
    },
    name:{
        type: String,
        required: "name is required",
        trim: true
    },
    mobile:{
        type:String,
        required: "mobile is required",
        unique:true,
        validate: {
            validator: function (mobile) {
                return /^([+]\d{2})?\d{10}$/.test(mobile)
            },
            message: "PLease enter a valid Mobile Number",
        }
    },
    email:{
        type: String,
        required: "email is required",
        unique: true,
        validate: {
            validator: function (email) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
            },
            message: "PLease enter a valid email",
        }
    },
    password: {
        type: String,
        required: "password is required",
        validator: function (password) {
            return /^[a-zA-Z0-9]{8,15}$/.test(password);
        },
        message: "The length of password should be in between 8-15 characters",
    },
    address: {
        street: {
            type: String
        },
        city: {
            type: String
        },
        pincode: {
            type: String
        }
    }
    
},{ timestamps: true })

module.exports = mongoose.model('User', userSchema)