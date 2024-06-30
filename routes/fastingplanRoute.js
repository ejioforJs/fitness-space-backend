const express = require("express")
const fastingplanController = require("../controllers/fastingplanController");

const router = express.Router()

router.get("/getfastingplan/:userId", fastingplanController.determineFastingPlan)
router.post("/hoursIntoFast", fastingplanController.hoursIntoFast)

module.exports = router