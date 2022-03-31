const BookModel = require("../models/bookModel")
const UserModel = require("../models/userModel")
const ReviewModel = require("../models/reviewModel")

//Creating a validation function
const isValid = function (value) {
    if (typeof (value) === undefined || typeof (value) === null) { return false }
    if (typeof (value) === "string" && (value).trim().length > 0) { return true }
}

//=============================================================================================================================================//

//Third API function(for creating a book document)
const createBook = async (req, res) => {
    try {
        //Checking if no data is present in request body
        let data = req.body
        if (Object.keys(data) == 0) {
        return res.status(400).send({ status: false, message: "Please provide some data to create a book document" })
        }

        //Checking if user has entered these mandatory fields or not
        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt} = data

        if (!isValid(title)) {
             return res.status(400).send({ status: false, message: "title is required" })
             }

        //Checking if title already exists (i.e. title is not unique)
        let uniqueTitle = await BookModel.findOne({title : data.title})
        if (uniqueTitle) {
          return res.status(400).send({status: false , message: "title already exists"})
             }
          
        if (!isValid(excerpt)) { 
            return res.status(400).send({ status: false, message: "excerpt is required" }) 
        }
        if (!isValid(userId)) { 
            return res.status(400).send({ status: false, message: "userId is required" })
         }

        //Checking if User Id is a valid type Object Id or not
        let UserId = data.userId
        let validateUserId = function (UserId) {
            return /^[a-f\d]{24}$/.test(UserId)
        }
        if (!validateUserId(UserId)){
        return res.status(400).send({status: false , message: `${UserId} is not valid type user Id`})
        }

        //Checking if user with this id exists in our collection or not
        let UserExists = await UserModel.findOne({_id : data.userId})
        if (!UserExists) {
            return res.status(400).send({status: false , message: "No such user exists with this id"})
        }

        if (!isValid(ISBN)) { 
            return res.status(400).send({ status: false, message: "ISBN is required" })
         }

         //Checking if ISBN is a 13 digit valid number or not
        let isbn = data.ISBN
        let validateISBN = function (isbn) {
            return /^(\d{13})?$/.test(isbn)
        }
        if (!validateISBN(isbn)){
        return res.status(400).send({status: false , message: "Please enter a 13 digit valid ISBN"})
        }

        ////Checking if ISBN already exists (i.e. ISBN is not unique)
        let uniqueISBN = await BookModel.findOne({ISBN : data.ISBN})
        if (uniqueISBN) {
            return res.status(400).send({status: false , message: "ISBN already exists"})
        }

        if (!isValid(category)) { 
            return res.status(400).send({ status: false, message: "category is required" })
         }

        //Subcategory is array of string so we can not check validation of it by *isValid* function
        if (subcategory) { 
            if (Array.isArray(subcategory)){
                data['subcategory'] = [...subcategory]
            }
            if (Object.prototype.toString.call(subcategory) === "[object String]"){
                data['subcategory'] = [subcategory]
            }
         }
         else {
             return res.status(400).send({status: false , message: "subactegory is required"})
         }

         if (!isValid(releasedAt)) { 
            return res.status(400).send({ status: false, message: "releasedAt is required" })
         }
        
        //Checking if that releasedAt is a valid date and in valid format or not
         let ReleasedAt = data.releasedAt
        let validateReleasedAt = function (ReleasedAt) {
            return /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(ReleasedAt)
        }
        if (!validateReleasedAt(ReleasedAt)){
        return res.status(400).send({status: false , message: "Please enter valid date in a valid format i.e. YYYY-MM-DD"})
        }

       //If all the validations passed , send a successfull response
        let bookData = await BookModel.create(data)
        return res.status(201).send({status: true , message: "Your book is successfully created", data: bookData })
    }

    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}
//========================================================================================================================================//

//Fourth API function (To fetch the book documents by taking some inputs in query params)
const getBooks = async (req , res) => {
    try {
        
        const filterQuery = {isDeleted: false , deletedAt: null}
        //Checking if any filter present in query params
        const queryParams = req.query
        //If any filter is present
        if (Object.keys(queryParams) != 0) {
        const {userId , category , subcategory} = queryParams
        let validateUserId = function (UserId) {
            return /^[a-f\d]{24}$/.test(UserId)
        }
        if (isValid(userId) && validateUserId(userId)) {
            filterQuery['userId'] = userId
            }

        if (isValid(category)) {
             filterQuery['category'] = category
          }
        
        if (isValid(subcategory)) {
            const  subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
            filterQuery['subcategory'] = {$all : subcatArr}
         }
        //Fetching books which have the above filters
        const books = await BookModel.find({$and : [filterQuery]}).sort({title:1}).select({_id:1, title:1, excerpt:1, userId:1, category:1,releasedAt:1, reviews:1})
        //If no such book found
        if (Array.isArray(books) && books.length == 0) {
            return res.status(404).send({ status: false, msg: "No books found" })
        }
        //Sending successful response (only data with above filters)
        return res.status(200).send({ status: true, message: "Books list" , data: books });

        } 
        //If no such filter present in query params then extract all data
        else {

         const books = await BookModel.find({filterQuery}).sort({title:1}).select({_id:1, title:1, excerpt:1, userId:1, category:1,releasedAt:1, reviews:1})
        //If no such book found
         if (Array.isArray(books) && books.length == 0) {
                return res.status(404).send({ status: false, msg: "No books found" })
            }
         //Sending successful response
            return res.status(200).send({ status: true, message: "Books list" , data: books });
        }
    }
    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}

const getBookById = async (req , res) => {
    try {
        let book_Id = req.params.bookId
        //Validate: The bookId is valid or not.
        let Book = await BookModel.findById(book_Id)
        if (!Book) {
        return res.status(404).send({ status: false, message: "Book does not exists" })
       }

       //Validate: If the bookId exists (must have isDeleted false)
       let is_Deleted = Book.isDeleted
       if (is_Deleted == true) {
           return res.status(404).send({ status: false, message: "Book does not exists" })
       }

       //Finding the reviews of that book with book Id
       let reviews1 = await ReviewModel.find({$and : [{bookId: book_Id} , {isDeleted: false}]})

       let Obj = {
        _id: Book._id ,
        title: Book.title,
        excerpt: Book.excerpt,
        userId: Book.userId,
        category: Book.category,
        subcategory: Book.subcategory,
        isDeleted: Book.isDeleted,
        reviews: Book.reviews,
        deletedAt: Book.deletedAt, 
        releasedAt: Book.releasedAt,
        createdAt: Book.createdAt,
        updatedAt: Book.updatedAt,
        reviewsData: reviews1
       }

       //Sending the response in the required format
       return res.status(200).send({status: true, message: "Book list with reviews" , data: Obj})

    }

    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}

//===================================================================================================================================//

//Sixth API function (For updating a book document by book_Id(recieved in path params))
const updateBook = async (req , res) => {
    try {
        let book_Id = req.params.bookId
        //Validate: The bookId is valid or not.
        let Book = await BookModel.findById(book_Id)
        if (!Book) return res.status(404).send({ status: false, message: "Book does not exists" })

        //Validate: If the bookId exists (must have isDeleted false)
        let is_Deleted = Book.isDeleted
        if (is_Deleted == true) return res.status(404).send({ status: false, message: "Book does not exists" })
        
        //Checking if no data is present in request body
        let data = req.body
        if (Object.keys(data) == 0) {
        return res.status(400).send({ status: false, message: "Please provide some data to update a book document" })
        }

        //Updates a book by changing these values 
        let Title = req.body.title
        let Excerpt = req.body.excerpt
        let ReleasedAt = req.body.releasedAt
        let isbn = req.body.ISBN
        
        //Checking if title is unique or not
        let uniqueTitle = await BookModel.findOne({title : Title})
        if (uniqueTitle) {
          return res.status(400).send({status: false , message: "title already exists"})
             }

        //Checking if ISBN is unique or not
        let uniqueISBN = await BookModel.findOne({ISBN : isbn})
        if (uniqueISBN) {
            return res.status(400).send({status: false , message: "ISBN already exists"})
        }

        //Updating a book document
        let updatedBook = await BookModel.findOneAndUpdate({ _id: book_Id },
            {
                $set: {
                    title: Title , excerpt: Excerpt , releasedAt: ReleasedAt , ISBN: isbn
                }
            }, { new: true })

        //Sending the updated response
        return res.status(200).send({ status: true, message: "Your Book details have been successfully updated", data: updatedBook })
    }

    //Exceptional error handling
    catch (error) {
        console.log(error.message)
        return res.status(500).send({ status: false, message: error.message })
    }
}

//========================================================================================================================================================//

//Seventh API function (For deleting a book document and also deleting its reviews as well)
const deleteBook = async (req, res) =>  {
    try {
        let book_Id = req.params.bookId
        //Validate: The bookId is valid or not.
        let Book = await BookModel.findById(book_Id)
        if (!Book) return res.status(404).send({ status: false, message: "Book does not exists" })

        //Validate: If the bookId exists (must have isDeleted false)
        let is_Deleted = Book.isDeleted
        if (is_Deleted == true) return res.status(404).send({ status: false, message: "Book is already deleted" })

        //Deleting a book document by its book_Id
        let deletedBook = await BookModel.findOneAndUpdate({ _id: book_Id },
            {
                $set: {
                   isDeleted: true , deletedAt: new Date()
                }
            }, { new: true })

        //Deleting reviews of that book by book_Id    
        let deleteReviews = await ReviewModel.updateMany({ _id: book_Id },
            {
                $set: {
                   isDeleted: true , deletedAt: new Date()
                }
            }, { new: true })

        //Sending the deleted book document in response
        return res.status(200).send({ status: true, message: "Your Book details have been successfully deleted", data: deletedBook })
    }

    //Exceptional error handling
    catch (error) {
        console.log(error.message)
        return res.status(500).send({ status: false, message: error.message })
    }
}

//Exporting all above functions
module.exports.createBook = createBook
module.exports.getBooks = getBooks
module.exports.updateBook = updateBook
module.exports.deleteBook = deleteBook
module.exports.getBookById = getBookById

