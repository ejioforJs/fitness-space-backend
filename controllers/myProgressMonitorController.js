const User = require("../models/userModel");

// Import other controller functions
const {
  createHealthScoreEntry,
  fastingPlanPoints,
  mealplanPoints,
  stepcountPoints,
  workoutPoints,
  weightlossPoints,
} = require("./healthscoreController");

// Helper function to calculate cumulative progress over a date range
const calculateCumulativeProgress = (user, startDate, endDate) => {
  const healthScoreInRange = user.healthScore.filter(
    (entry) =>
      entry.dateGenerated >= startDate && entry.dateGenerated <= endDate
  );

  const activityTypes = [
    "workoutPoint",
    "fastingPoint",
    "mealPoint",
    "weightlossPoint",
    "stepcountPoint",
  ];

  const totalPoints = activityTypes.reduce((acc, activityType) => {
    acc[activityType] = healthScoreInRange.reduce(
      (sum, entry) => sum + entry[activityType],
      0
    );
    return acc;
  }, {});

  return totalPoints;
};

const calculatePercentageCompletion = (user, totalPossiblePoints) => {
  const percentageCompletion =
    (calculateCumulativeProgress(user) / totalPossiblePoints) * 100;

  return percentageCompletion;
};

const getGradeMessage = (percentage, totalUsers, userRank) => {
  if (percentage >= 90) {
    return `Awesome! You scored ${percentage.toFixed(
      2
    )}%. You are among the top 10% of users this month. Keep up the excellent work!`;
  } else if (percentage >= 70) {
    return `Great job! You scored ${percentage.toFixed(
      2
    )}%. You are in the top 30% of users this month. Keep pushing for even better results!`;
  } else if (percentage >= 50) {
    return `Good work! You scored ${percentage.toFixed(
      2
    )}%. You are in the top 50% of users this month. Keep it up!`;
  } else if (percentage >= 30) {
    return `Not bad! You scored ${percentage.toFixed(
      2
    )}%. You are in the top 70% of users this month. Keep making progress!`;
  } else {
    return `Keep going! You scored ${percentage.toFixed(
      2
    )}%. You are among the top ${((userRank / totalUsers) * 100).toFixed(
      2
    )}% of users this month. Keep working towards your goals!`;
  }
};

// Main controller function
const myProgressMonitor = async (req, res) => {
  try {
    const { userId, startDate, endDate, interval } = req.body;

    if (!userId || !startDate || !endDate || !interval) { 
      return res
        .status(400)
        .json({ success: false, message: "Missing required parameters" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Calculate total points for each activity
    const activityTypes = [
      "workoutPoint",
      "fastingPoint",
      "mealPoint",
      "weightlossPoint",
      "stepcountPoint",
    ];

    const totalPoints = activityTypes.reduce((acc, activityType) => {
      acc[activityType] = user.healthScore.reduce(
        (sum, entry) => sum + entry[activityType],
        0
      );
      return acc;
    }, {});

    // Define maximum possible points for each activity
    const maxWorkoutPoints = 5;
    const maxFastingPoints = 5;
    const maxMealPoints = 30;
    const maxWeightLossPoints = 5;
    const maxStepCountPoints = 10;

    // Calculate total possible points
    const totalPossiblePoints =
      maxWorkoutPoints +
      maxFastingPoints +
      maxMealPoints +
      maxWeightLossPoints +
      maxStepCountPoints;

    // Calculate percentage completion
    const percentageCompletion =
      ((totalPoints.workoutPoint +
        totalPoints.fastingPoint +
        totalPoints.mealPoint +
        totalPoints.weightlossPoint +
        totalPoints.stepcountPoint) /
        totalPossiblePoints) *
      100;

    // Calculate progress for the specified interval
    let intervalStartDate;
    if (interval === "week") {
      intervalStartDate = new Date(endDate);
      intervalStartDate.setDate(intervalStartDate.getDate() - 7);
    } else if (interval === "month") {
      intervalStartDate = new Date(endDate);
      intervalStartDate.setDate(intervalStartDate.getDate() - 30);
    } else {
      intervalStartDate = new Date(startDate);
    }

    const intervalEndDate = new Date(endDate);

    const intervalScore = calculateCumulativeProgress(
      user,
      intervalStartDate,
      intervalEndDate
    );

    const intervalPercentage =
      (calculateCumulativeProgress(user, intervalStartDate, intervalEndDate) /
        totalPossiblePoints) *
      100;

    // Compare with the previous month
    const today = new Date();
    const lastMonthStartDate = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastMonthEndDate = new Date(today.getFullYear(), today.getMonth(), 0);

    const lastMonthScore = calculateCumulativeProgress(
      user,
      lastMonthStartDate,
      lastMonthEndDate
    );

    // Compare with other users
    const allUsers = await User.find();
    const currentUserRank =
      allUsers
        .filter((otherUser) => otherUser._id !== userId)
        .map((otherUser) => ({
          userId: otherUser._id,
          percentage: calculatePercentageCompletion(otherUser),
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .findIndex((ranking) => ranking.userId === userId) + 1;

    const gradeMessage = getGradeMessage(
      percentageCompletion,
      allUsers.length,
      currentUserRank
    );

    return res.json({
      success: true,
      healthScoreInRange: user.healthScore,
      percentageCompletion,
      intervalScore,
      intervalPercentage,
      lastMonthScore,
      gradeMessage,
    });
  } catch (error) {
    console.error("Error getting health score in range:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  myProgressMonitor,
};