const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const internSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (email) {
                return /^[a-zA-Z0-9+_.-]+@[a-zA-Z.-]+$/.test(email)
            },
            message: "enter valid email address",

        }
    },
    mobile:{
        type:String,
        required: true,
        unique:true,
        validate: {
            validator: function (mobile) {
                return /^([+]\d{2})?\d{10}$/.test(mobile)
            },
            message: "enter valid Mobile Number",

        }
    },
    collegeId:{
        type: ObjectId,
        ref: "college"
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
},{ timestamps: true })

module.exports = mongoose.model('intern', internSchema)