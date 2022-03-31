const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema({
    bookId: {
        type: ObjectId, 
        required: "Book Id is required", 
        ref: 'Books'
        },
    reviewedBy: {
        type: String, 
        required: "reviewed by is required",
        default:  "Guest" //`Guest${Math.floor(Math.random() * 1000000)}`
    },
    reviewedAt: {
        type: Date, 
        required: "reviewed at is required",
        default: new Date()
    },
    rating: {
        type: Number,
        min: 1,
        max: 5, 
        required: "rating is required"
    },
    review: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
    
},{ timestamps: true })

module.exports = mongoose.model('Reviews', reviewSchema)