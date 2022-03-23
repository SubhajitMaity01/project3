const internModel = require("../models/internModel")

const isValid = function (value) {
    if (typeof (value) === undefined || typeof (value) === null) { return false }
    if (typeof (value).trim().length == 0) { return false }
    if (typeof (value) === "string" && (value).trim().length > 0) { return true }
}

const createIntern = async (req, res) => {
    try {
        let data = req.body
        if (Object.keys(data) == 0) {
        return res.status(400).send({ status: false, message: "No data provided" })
        }
        const { name, email, mobile} = data

        if (!isValid(name)) {
             return res.status(400).send({ status: false, message: "name is required" })
             }
        if (!isValid(email)) { 
            return res.status(400).send({ status: false, message: "email is required" }) 
        }
        if (!isValid(mobile)) { 
            return res.status(400).send({ status: false, message: "mobile is required" })
         }
        
        let uniqueEmail = await internModel.findOne({email : data.email})
        if (uniqueEmail) {
            return res.status(400).send({status: false , message: "email already exists"})
        }

        let Email = data.email
        let validateEmail = function (Email) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(Email);
        }
        if (!validateEmail(Email)){
        return res.status(400).send({status: false , message: "Please enter a valid email"})
        }

        let uniqueMobile = await internModel.findOne({mobile : data.mobile})
        if (uniqueMobile) {
            return res.status(400).send({status: false , message: "mobile already exists"})
        }

        let Mobile = data.mobile
        let validateMobile = function (Mobile) {
            return /^([+]\d{2})?\d{10}$/.test(Mobile)
        }
        if (!validateMobile(Mobile)){
        return res.status(400).send({status: false , message: "Please enter a valid mobile"})
        }

        let internData = await internModel.create(data)
        return res.status(201).send({status: true , data: internData })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}
module.exports.createIntern = createIntern

