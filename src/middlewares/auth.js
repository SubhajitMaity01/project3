const jwt = require("jsonwebtoken")
const BookModel = require("../models/bookModel")

//Creating Authentication feature for our books API
const authentication = async function (req, res, next) {
    try {
        //Checking if "x-api-key" is present in request header or not
        let token = req.headers["x-api-key"];
        if (!token) {
            return res.status(400).send({ status: false, message: "You need to login to perform this task" })
        }

        //Checking if token is valid or not
        let decodedtoken = jwt.verify(token, "Secret-Key-given-by-us-to-secure-our-token")
        if (!decodedtoken){
            return res.status(401).send({ status: false, message: "Token is invalid" })
        }
        
        //Checking if token expired or not
        let expiration = decodedtoken.exp
        let tokenExtend = Math.floor(Date.now() / 1000) 
        console.log(tokenExtend - expiration)
        if (expiration < tokenExtend){
            return res.status(401).send({ status: false, message: "Token expired" })
        }

        next();
    }
    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message })
    }
}
//======================================================================================================//

//Creating authorisation feature - so a user can create, update & delete his books only
const authorisation = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        let decodedtoken = jwt.verify(token, "Secret-Key-given-by-us-to-secure-our-token")
    
        //Checking if book Id is present in params or not
        let toBeupdatedBookId = req.params.bookId
        //If present
        if (toBeupdatedBookId) {
            let updatingUserId = await BookModel.findOne({ _id: toBeupdatedBookId }).select({ userId: 1, _id: 0 })
            let User_Id = updatingUserId.userId
            let id = decodedtoken.userId
            if (id != User_Id){
                return res.status(403).send({ status: false, message: "You are not authorised to perform this task" })
            }
        }
        //If not present then we will check if user Id is present in our req.body
        else {
            let toBeCreatedBookByUserId = req.body.userId
            let id = decodedtoken.userId
            if (id != toBeCreatedBookByUserId ) {
                return res.status(403).send({status : false , message : "You are not authorise to perform this task"})
            }
        }
        next()
    }
    //Exceptional error handling
    catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message })
    }
}

//Exporting the above authentication & authorisation functions
module.exports = {authentication , authorisation}