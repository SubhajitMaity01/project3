const jwt = require("jsonwebtoken")
const BookModel = require("../models/bookModel")

const authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        if (!token) {
            return res.status(400).send({ status: false, message: "login is required" })
        }
        let decodedtoken = jwt.verify(token, "Secret-Key-given-by-us-to-secure-our-token")
        if (!decodedtoken){
            return res.status(401).send({ status: false, message: "token is invalid" })
        } 
        next();
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message })
    }
}

const authorisation = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        let decodedtoken = jwt.verify(token, "Secret-Key-given-by-us-to-secure-our-token")

        let toBeupdatedBookId = req.params.bookId
        if (toBeupdatedBookId) {
            let updatingUserId = await BookModel.findOne({ _id: toBeupdatedBookId }).select({ userId: 1, _id: 0 })
            let User_Id = updatingUserId.userId
            let id = decodedtoken.userId
            if (id != User_Id){
                return res.status(403).send({ status: false, message: "You are not authorised to perform this task" })
            }
        }
        else {
            let toBeCreatedBookByUserId = req.body.userId
            let id = decodedtoken.userId
            if (id != toBeCreatedBookByUserId ) {
                return res.status(403).send({status : false , message : "You are not authorise to perform this task"})
            }
        }
        next()
    }

    catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message })
    }
}


module.exports = {authentication , authorisation}