const express = require("express");
const workoutController = require("../controllers/workoutController");

const router = express.Router();

router.get("/sugested-workouts", workoutController.suggestWorkout);
router.get("/workout-history/:id", workoutController.getWorkoutHistory);

module.exports = router;
