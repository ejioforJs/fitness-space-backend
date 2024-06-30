const User = require("../models/userModel");

const updateStepCount = async (req, res) => {
  const { userId, stepCount } = req.body;

  try {
    // Update the user's current step count
    await User.findOneAndUpdate(
      { _id: userId },
      { $set: { "healthScore.$[].stepcountPoint": stepCount } }
    );

    // Add the step count to the history
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          "healthScore.$[].stepcountPoint.stepCountHistory": {
            steps: stepCount,
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    res.json({ success: true, message: "Step count updated successfully" });
  } catch (error) {
    console.error("Error updating step count:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getStepCountHistory = async (req, res) => {
  const { userId, startDate, endDate } = req.query;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Filter step count history by date range
    const stepCountHistoryInRange = user.healthScore
      .flatMap((entry) => entry.stepcountPoint.stepCountHistory)
      .filter(
        (entry) =>
          entry.date >= new Date(startDate) && entry.date <= new Date(endDate)
      );

    res.json({ success: true, stepCountHistory: stepCountHistoryInRange });
  } catch (error) {
    console.error("Error getting step count history:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  updateStepCount,
  getStepCountHistory,
};