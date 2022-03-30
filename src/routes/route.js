const express = require('express');
const router = express.Router();
const BookController= require("../controllers/bookController")
const UserController= require("../controllers/userController")
const ReviewController= require("../controllers/reviewController")
const {authentication , authorisation} = require("../middlewares/auth")

//First API -: To register a user by POST method
router.post("/register", UserController.createUser)

//Second API -: To login a user by POST method
router.post("/login" , UserController.loginUser)

//Third API-: To create a book for a user by POST method
router.post("/books" , authentication , authorisation , BookController.createBook)

//Fourth API -: To get books by inputs provided in query params using GET method
router.get("/books" , authentication , BookController.getBooks)

//Fifth API -: To get books by book id provided in path params using GET method
router.get("/books/:bookId" , authentication , BookController.getBookById)

//Sixth API -: To update a book document by bookId (recieved from path params) using PUT method
router.put("/books/:bookId" , authentication , authorisation , BookController.updateBook)

//Seventh API -: To delete a book document by bookId (recieved from path params) using DELETE method
router.delete("/books/:bookId" , authentication , authorisation , BookController.deleteBook)

//Eight API -: To create a review for a book(take book id in path params) in reviews collection using POST method
router.post("/books/:bookId/review" , ReviewController.createReview)

//Ninth API -: To update a review for a book(take book id & review id in path params) using PUT method
router.put("/books/:bookId/review/:reviewId" , ReviewController.updateReview)

//Tenth API -: To delete a review for a book(take book id & review id in path params) using DELETE method
router.delete("/books/:bookId/review/:reviewId" , ReviewController.deleteReview)

module.exports = router;