const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const internSchema = new mongoose.Schema({
    name:{
        type: String,
        required: "name is required",
        trim: true
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
    collegeId:{
        type: ObjectId,
        ref: "college",
        required: "College Id is required"
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
},{ timestamps: true })

module.exports = mongoose.model('intern', internSchema)