const express = require('express');
const router = express.Router();
const InternrModel= require("../models/internModel.js")
const InternController= require("../controllers/internController")
const CollegeController= require("../controllers/collegeController")



router.post("/functionup/interns", InternController.intern)

router.post("/functionup/createcollege", CollegeController.createcollege)

router.get("/functionup/collegeDetails", InternController.collegeDetails)


module.exports = router;