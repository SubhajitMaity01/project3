const collegeModel = require("../models/collegeModel")

const createcollege = async function(req,res){

    const data = req.body

    // if(!Object.keys(data).lenght>0) return res.status(400).send({error:"give some data to create college"})

    if(!data.name) return res.status(400).send({error:"please enter name"})
    
    if(!data.fullName) return res.status(400).send({error:"please enter full name of college"})

    if(!data.logoLink) return res.status(400).send({error:"please enter logoLink"})
    
   
    
    let createCollege =await collegeModel.create(data)
    res.status(201).send({status:true, msg:createCollege})

}
module.exports.createcollege=createcollege