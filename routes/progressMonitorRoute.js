const express = require("express");
const myProgressMonitorController = require("../controllers/myProgressMonitorController");

const router = express.Router();

router.get("/:userId", myProgressMonitorController.myProgressMonitor);

module.exports = router;