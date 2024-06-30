const express = require("express")
const taskController = require("../controllers/taskController");

const router = express.Router()

router.post("/createTask", taskController.createTask)
router.get("/getAllTasks", taskController.getAllTasks)
router.get("/getUserTasks/:userId", taskController.getUserTasks)
router.put("/updateTask/:taskId", taskController.updateTask)
router.delete("/deleteTask/:taskId", taskController.deleteTask)

module.exports = router;