const BookModel = require("../models/bookModel")
const UserModel = require("../models/userModel")
const ReviewModel = require("../models/reviewModel")

const isValid = function (value) {
    if (typeof (value) === undefined || typeof (value) === null) { return false }
    if (typeof (value) === "string" && (value).trim().length > 0) { return true }
}

const createBook = async (req, res) => {
    try {
        let data = req.body
        if (Object.keys(data) == 0) {
        return res.status(400).send({ status: false, message: "No data provided" })
        }
        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt} = data

        if (!isValid(title)) {
             return res.status(400).send({ status: false, message: "title is required" })
             }

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
         let UserId = data.userId
        let validateUserId = function (UserId) {
            return /^[a-f\d]{24}$/.test(UserId)
        }
        if (!validateUserId(UserId)){
        return res.status(400).send({status: false , message: `${UserId} is not valid type user Id`})
        }
        
         let UserExists = await UserModel.findOne({_id : data.userId})
        if (!UserExists) {
            return res.status(400).send({status: false , message: "No such user exists with this id"})
        }

        if (!isValid(ISBN)) { 
            return res.status(400).send({ status: false, message: "ISBN is required" })
         }
        let isbn = data.ISBN
        let validateISBN = function (isbn) {
            return /^(\d{13})?$/.test(isbn)
        }
        if (!validateISBN(isbn)){
        return res.status(400).send({status: false , message: "Please enter a 13 digit valid ISBN"})
        }
        let uniqueISBN = await BookModel.findOne({ISBN : data.ISBN})
        if (uniqueISBN) {
            return res.status(400).send({status: false , message: "ISBN already exists"})
        }
        if (!isValid(category)) { 
            return res.status(400).send({ status: false, message: "category is required" })
         }
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
         let ReleasedAt = data.releasedAt
        let validateReleasedAt = function (ReleasedAt) {
            return /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(ReleasedAt)
        }
        if (!validateReleasedAt(ReleasedAt)){
        return res.status(400).send({status: false , message: "Please enter releasedAt in a valid format i.e. YYYY-MM-DD"})
        }
    
        let bookData = await BookModel.create(data)
        return res.status(201).send({status: true , message: "Your book is successfully created", data: bookData })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}

const getBooks = async (req , res) => {
    try {
        const filterQuery = {isDeleted: false , deletedAt: null}
        const queryParams = req.query
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
        
        const books = await BookModel.find({$and : [filterQuery]}).sort({title:1}).select({_id:1, title:1, excerpt:1, userId:1, category:1,releasedAt:1, reviews:1})
        if (Array.isArray(books) && books.length == 0) {
            return res.status(404).send({ status: false, msg: "No books found" })
        }
        return res.status(200).send({ status: true, message: "Books list" , data: books });
        } 
    }
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
       return res.status(200).send({status: true, message: "Book list with reviews" , data: Obj})
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}

const updateBook = async (req , res) => {
    try {
        let book_Id = req.params.bookId
        //Validate: The bookId is valid or not.
        let Book = await BookModel.findById(book_Id)
        if (!Book) return res.status(404).send({ status: false, message: "Book does not exists" })

        //Validate: If the bookId exists (must have isDeleted false)
        let is_Deleted = Book.isDeleted
        if (is_Deleted == true) return res.status(404).send({ status: false, message: "Book is already deleted" })

        //Updates a book by changing these values 
        let Title = req.body.title
        let Excerpt = req.body.excerpt
        let ReleasedAt = req.body.releasedAt
        let isbn = req.body.ISBN

        let uniqueTitle = await BookModel.findOne({title : Title})
        if (uniqueTitle) {
          return res.status(400).send({status: false , message: "title already exists"})
             }

        let uniqueISBN = await BookModel.findOne({ISBN : isbn})
        if (uniqueISBN) {
            return res.status(400).send({status: false , message: "ISBN already exists"})
        }
        let updatedBook = await BookModel.findOneAndUpdate({ _id: book_Id },
            {
                $set: {
                    title: Title , excerpt: Excerpt , releasedAt: ReleasedAt , ISBN: isbn
                }
            }, { new: true })
        //Sending the updated response
        return res.status(200).send({ status: true, message: "Your Book details have been successfully updated", data: updatedBook })
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).send({ status: false, message: error.message })
    }
}

const deleteBook = async (req, res) =>  {
    try {
        let book_Id = req.params.bookId
        //Validate: The bookId is valid or not.
        let Book = await BookModel.findById(book_Id)
        if (!Book) return res.status(404).send({ status: false, message: "Book does not exists" })

        //Validate: If the bookId exists (must have isDeleted false)
        let is_Deleted = Book.isDeleted
        if (is_Deleted == true) return res.status(404).send({ status: false, message: "Book is already deleted" })

        let deletedBook = await BookModel.findOneAndUpdate({ _id: book_Id },
            {
                $set: {
                   isDeleted: true , deletedAt: new Date()
                }
            }, { new: true })
        let deleteReviews = await ReviewModel.updateMany({ _id: book_Id },
            {
                $set: {
                   isDeleted: true , deletedAt: new Date()
                }
            }, { new: true })
        //Sending the deleted response
        return res.status(200).send({ status: true, message: "Your Book details have been successfully deleted", data: deletedBook })
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).send({ status: false, message: error.message })
    }
}



module.exports.createBook = createBook
module.exports.getBooks = getBooks
module.exports.updateBook = updateBook
module.exports.deleteBook = deleteBook
module.exports.getBookById = getBookById

