const collegeModel = require("../models/collegeModel")
const internModel = require("../models/internModel")

const isValid = function (value) {
    if (typeof (value) === undefined || typeof (value) === null) { return false }
    if (typeof (value).trim().length == 0) { return false }
    if (typeof (value) === "string" && (value).trim().length > 0) { return true }
}

const createCollege = async (req, res) => {
    try {
        let data = req.body
        if (Object.keys(data) == 0) {
        return res.status(400).send({ status: false, message: "No data provided" })
        }
        const { name, fullName, logoLink} = data

        if (!isValid(name)) {
             return res.status(400).send({ status: false, message: "name is required" })
             }
        if (!isValid(fullName)) { 
            return res.status(400).send({ status: false, message: "fullName is required" }) 
        }
        if (!isValid(logoLink)) { 
            return res.status(400).send({ status: false, message: "logoLink is required" })
         }
        
        let uniqueName = await collegeModel.findOne({name : data.name})
        if (uniqueName) {
            return res.status(400).send({status: false , message: "name already exists"})
        }
        let collegeData = await collegeModel.create(data)
        return res.status(201).send({status: true , data: collegeData })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({status: false , message: error.message })
   }
}

const collegeDetails = async (req,res) => {
   try {
    const Name = req.query.collegeName
    if(!Name) {
        return res.status(400).send({status: false , message:"Enter college name for filter"})
    }
    const colleges = await collegeModel.findOne({$and : [{name : Name} , {isDeleted: false}]}).select({id : 1})
    if (!colleges) {
    return res.status(404).send({ status: false , message: "No such college found" })
    }
    const interns = await internModel.find({collegeId : colleges}).select({id:1 ,name:1 , email:1, mobile:1}) 
   
    const finalCollege = await collegeModel.find({name : Name}).select({name: 1 , fullName:1, logoLink:1, _id:0})

    const Obj = {
        name: finalCollege[0].name ,
        fullName: finalCollege[0].fullName ,
        logoLink: finalCollege[0].logoLink ,
        interests: interns
    }
     return res.status(200).send({ status: true  , data : Obj})
}
   catch (error) {
    console.log(error)
    return res.status(500).send({status: false , message: error.message })
}
}

module.exports.createCollege=createCollege
module.exports.collegeDetails = collegeDetails