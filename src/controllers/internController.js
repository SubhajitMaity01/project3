const internModel = require("../models/internModel")
const collegeModel = require("../models/collegeModel")
const res = require("express/lib/response")


const intern = async function (req, res) {
    try {
    let input = req.body
    let email = input.email

    if (!Object.keys(input).length > 0) return res.status(400).send({ error: "Please enter some data" })

    if (!input.name) return res.status(400).send({ error: "please enter name" })


    if (!input.email) return res.status(400).send({ error: "please enter email" })

    if (!input.mobile) return res.status(400).send({ error: "please enter valid mobile number" })

    if (!input.collegeId) return res.status(400).send({ error: "please enter College Id" })

    let college = req.body.collegeId
    let collegeId = await collegeModel.findById(college)

    let x = await collegeModel.findOne({ _id: collegeId, isDeleted: false })
    if (!x) {
        res.status(404).send({ msg: "college not found" })
    }
    if (!collegeId) return res.status(400).send("please provide valid collegeId")

    const emailAlreadyUsed = await internModel.findOne({email})

    if(emailAlreadyUsed) return res.status(400).send({status: false, msg: "email already registered"})


    let data = await internModel.create(input)
    res.status(400).send({ status: true, msg: data })
}
catch (err) {
    console.log(err)
    res.status(500).send({ msg: err.message })
}
}

const collegeDetails = async function(req,res){
    const data = req.query

    if(!data) return res.status(400).send({error:"enter some data for filter"})

    const interns = await internModel.find(data).find({ isDeleted: false}).populate("collegeId")

    if (!interns) return res.status(404).send({ error: "No such data found" })

    res.status(200).send({})
}

module.exports.intern = intern

module.exports.collegeDetails = collegeDetails