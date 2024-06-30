const express = require("express");
const stepCounterController = require("../controllers/stepCounterController");

const router = express.Router();

// Endpoint to update step count
router.post("/updateStepCount", stepCounterController.updateStepCount);

// Endpoint to get step count history by date range
router.get("/getStepCountHistory", stepCounterController.getStepCountHistory);

module.exports = router;