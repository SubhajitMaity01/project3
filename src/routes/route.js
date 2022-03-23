const express = require('express');
const router = express.Router();
const InternrModel= require("../models/internModel.js")
const InternController= require("../controllers/internController")
const CollegeController= require("../controllers/collegeController")


//First API -: To create a college
router.post("/colleges", CollegeController.createCollege)

//Second API -: To create a document for intern
router.post("/interns", InternController.createIntern)

//Third API -: To return the college details for requested college
router.get("/collegeDetails", CollegeController.collegeDetails)


module.exports = router;