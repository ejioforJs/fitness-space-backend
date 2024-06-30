const express = require("express")
const healthscoreController = require("../controllers/healthscoreController");

const router = express.Router()

router.post("/fastingplanPoint", healthscoreController.fastingPlanPoints)
router.post("/mealplanPoint/:userId", healthscoreController.mealplanPoints)
router.post("/stepcountPoint", healthscoreController.stepcountPoints)
router.post("/workoutPoint/:userId", healthscoreController.workoutPoints)
router.post("/weightlossPoint/:userId", healthscoreController.weightlossPoints)
router.get("/getHealthScore/:userId", healthscoreController.createHealthScoreEntry)

module.exports = router