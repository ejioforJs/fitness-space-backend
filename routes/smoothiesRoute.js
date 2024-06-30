const express = require("express")
const smoothiesController = require("../controllers/smoothiesController");

const router = express.Router()

router.get("/getUserSmoothies/:userId", smoothiesController.getUserSmoothies)
router.post("/getDateSmoothie",smoothiesController.getSmoothieByDate)

module.exports = router