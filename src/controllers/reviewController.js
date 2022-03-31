const BookModel = require("../models/bookModel")
const UserModel = require("../models/userModel")
const ReviewModel = require("../models/reviewModel")

//Creating a validation function
const isValid = function (value) {
    if (typeof (value) === undefined || typeof (value) === null) { return false }
    if (typeof (value) === "string" && (value).trim().length > 0) { return true }
    if (typeof (value) === "number" && (value).toString().length > 0) { return true }
}

//===============================================================================================================================================================================================================//

//Eigth API function for creating a review for a book
const createReview = async (req , res) => {
    try {
        let book_Id = req.params.bookId
        //Validate: The bookId is valid or not.
        let Book = await BookModel.findById(book_Id)
        if (!Book) return res.status(404).send({ status: false, message: "Book does not exists" })

        //Validate: If the bookId exists (must have isDeleted false)
        let is_Deleted = Book.isDeleted
        if (is_Deleted == true) return res.status(404).send({ status: false, message: "Book does not exist" })
        
        //Checking if no data is present in req.body
        let data = req.body
        if (Object.keys(data) == 0) {
        return res.status(400).send({ status: false, message: "Please provide some data to create a review" })
        }
        
        const { bookId , reviewedBy , rating } = data

        if (!isValid(bookId)) {
            data['bookId'] = book_Id
             }
             let BookId = data.bookId
             let validateBookId = function (BookId) {
                 return /^[a-f\d]{24}$/.test(BookId)
             }
             if (!validateBookId(BookId)){
             return res.status(400).send({status: false , message: `${BookId} is not valid type user Id`})
             }

        let guestId = "Guest"
        if (!isValid(reviewedBy)) {
             data['reviewedBy'] = guestId
             } 
        
        if (!isValid(rating)) {
             return res.status(400).send({ status: false, message: "rating is required" })
             }         

        let validateRating = function (rating) {
                return /[1-5]$/.test(rating)
            }
            if (!validateRating(rating)){
            return res.status(400).send({status: false , message: "Rating should be between 1-5"})
            }

            let reviewData = await ReviewModel.create(data)

            //Updating review count of that book
            let bookData = await BookModel.findOneAndUpdate({ _id: book_Id },
                {
                    $inc: {
                        reviews: 1
                    }
                }, { new: true })

                //Find all the reviews of that book
                let reviews1 = await ReviewModel.find({$and : [{bookId: book_Id} , {isDeleted: false}]}).select({bookId: 1 , reviewedBy:1, reviewedAt:1,rating:1,review:1})
                
                let Obj = {
                    _id: bookData._id ,
                    title: bookData.title,
                    excerpt: bookData.excerpt,
                    userId: bookData.userId,
                    category: bookData.category,
                    subcategory: bookData.subcategory,
                    isDeleted: bookData.isDeleted,
                    reviews: bookData.reviews,
                    deletedAt: bookData.deletedAt, 
                    releasedAt: bookData.releasedAt,
                    createdAt: bookData.createdAt,
                    updatedAt: bookData.updatedAt,
                    reviewsData: reviews1
                   }
            //Sending a successful response of that book data with reviews as well
            return res.status(201).send({status: true , message: "Your review is successfully created", data: Obj })
         
    }
    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}

//=======================================================================================================================//

//Ninth API function for updating a review
const updateReview = async (req, res) =>  {
    try {
        let book_Id = req.params.bookId
        //Validate: The bookId is valid or not.
        let Book = await BookModel.findById(book_Id)
        if (!Book) return res.status(404).send({ status: false, message: "Book does not exists" })

        //Validate: If the bookId exists (must have isDeleted false)
        let is_Deleted = Book.isDeleted
        if (is_Deleted == true) return res.status(404).send({ status: false, message: "Book is already deleted" })

        let review_Id = req.params.reviewId
        //Validate: The reviewId is valid or not.
        let Review = await ReviewModel.findById(review_Id)
        if (!Review) return res.status(404).send({ status: false, message: "Review does not exists" })

        //Validate: If the reviewId exists (must have isDeleted false)
        let is_DeletedReview = Review.isDeleted
        if (is_DeletedReview == true) return res.status(404).send({ status: false, message: "Review is already deleted" })
    
        //Checking if no data is present in req.body
        let data = req.body
        if (Object.keys(data) == 0) {
        return res.status(400).send({ status: false, message: "No data provided" })
        }

        let {review, rating, reviewedBy} = req.body

        //Updating that review
            let updatedReview = await ReviewModel.findOneAndUpdate({ _id: review_Id },
                {
                    $set: {
                        review: review , rating: rating , reviewedBy: reviewedBy
                    }
                }, { new: true })
               
        //Sending the deleted response
        return res.status(200).send({ status: true, message: "Your Review details have been successfully updated", data: updatedReview })
    }
    //Exceptional error handling
    catch (error) {
        console.log(error.message)
        return res.status(500).send({ status: false, message: error.message })
    }
}

//=============================================================================================================================================================================//

//Tenth API function for deleting a review
const deleteReview = async (req, res) =>  {
    try {
        let book_Id = req.params.bookId
        //Validate: The bookId is valid or not.
        let Book = await BookModel.findById(book_Id)
        if (!Book) return res.status(404).send({ status: false, message: "Book does not exists" })

        //Validate: If the bookId exists (must have isDeleted false)
        let is_Deleted = Book.isDeleted
        if (is_Deleted == true) return res.status(404).send({ status: false, message: "Book is already deleted" })

        let review_Id = req.params.reviewId
        //Validate: The reviewId is valid or not.
        let Review = await ReviewModel.findById(review_Id)
        if (!Review) return res.status(404).send({ status: false, message: "Review does not exists" })

        //Validate: If the reviewId exists (must have isDeleted false)
        let is_DeletedReview = Review.isDeleted
        if (is_DeletedReview == true) return res.status(404).send({ status: false, message: "Review is already deleted" })

        //Deleting that review
        let deletedReview = await ReviewModel.findOneAndUpdate({ _id: review_Id },
            {
                $set: {
                   isDeleted: true , deletedAt: new Date()
                }
            }, { new: true })

            //Changing the review count of that book (decreasing a review becoz its deleted)
            let bookReview = await BookModel.findOneAndUpdate({ _id: book_Id },
                {
                    $inc: {
                        reviews: -1
                    }
                }, { new: true })
        //Sending the deleted response
        return res.status(200).send({ status: true, message: "Your Book details have been successfully deleted", data: deletedReview })
    }

    //Exceptional error handling
    catch (error) {
        console.log(error.message)
        return res.status(500).send({ status: false, message: error.message })
    }
}

//Exporting these functions
module.exports.createReview = createReview
module.exports.updateReview = updateReview
module.exports.deleteReview = deleteReview
