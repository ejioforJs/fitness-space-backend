const Task = require("../models/TaskModel")

exports.createTask = async(req,res) => {
    try {
        const newTask = await Task.create(req.body);
        res.json({
            status: "success",
            message: "Task created successfully",
            newTask
        });
      } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Internal server error ${error}`,
          });
      }
}

exports.getAllTasks = async(req,res) => {
    try {
        const tasks = await Task.find();
        res.json({
            status: "success",
            message: "Tasks retrieved successfully",
            tasks
        });
      } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Internal server error ${error}`,
          });
      }
}

exports.getUserTasks = async(req,res) => {
    try {
        const userTasks = await Task.find({ user: req.params.userId });
        res.json({
            status: "success",
            message: "User tasks retrieved successfully",
            userTasks
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Internal server error ${error}`,
          });
    }
}

exports.updateTask = async(req,res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
          req.params.taskId,
          req.body,
          { new: true }
        );
        res.json({
            status: "success",
            message: "Task updated successfully",
            updatedTask
        });
      } catch (error) {
        res.status(500).json({
            status: "error",
            message: `Internal server error ${error}`,
          });
      }
}

exports.deleteTask = async (req, res) => {
    try {
      const deletedTask = await Task.findByIdAndDelete(req.params.taskId);
  
      if (!deletedTask) {
        return res.status(404).json({
          status: "error",
          message: "Task not found.",
        });
      }
      res.json({
        status: "success",
        message: "Task deleted successfully.",
        deletedTask,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: `Internal server error ${error}`,
      });
    }
  };