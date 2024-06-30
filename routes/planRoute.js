const express = require("express");
const router = express.Router();

const planController = require("../controllers/planController");

router.get("/getPlans", planController.getPlans);
router.post("/createPlan", planController.createPlan);
router.post("/paystackWebhook", planController.addWebhook);

router.post("/initiatetransaction/:id", planController.initializeTrans)
router.post("/verifytransaction/:id", planController.verifyTrans)

module.exports = router