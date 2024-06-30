const express = require("express")
const mealsController = require("../controllers/mealsController");

const router = express.Router()

router.get("/getUserMeals/:userId", mealsController.getUserMeals)
router.post("/getDateMeal",mealsController.getMealByDate)

module.exports = router