const User = require("../models/userModel");
const cron = require("node-cron");

const calculateTotalPoints = async (user) => {
  const healthScore = user.healthScore[user.healthScore.length - 1];
  const totalPoints =
    healthScore.mealPoint +
    healthScore.workoutPoint +
    healthScore.fastingPoint +
    healthScore.weightlossPoint +
    healthScore.stepcountPoint;
  healthScore.totalPoints = totalPoints;
  await user.save();
};

const fastingPlanPoints = async (req, res) => {
  try {
    const { hoursUsed, hoursMax, userId } = req.body;
    const user = await User.findById(userId);
    const currentUserHealthScore =
      user.healthScore[user.healthScore.length - 1];

    let fastingPoint = 0;

    if (hoursUsed < hoursMax) {
      fastingPoint = 3;
    } else {
      fastingPoint = 5;
    }

    currentUserHealthScore.fastingPoint = fastingPoint;

    // const newHealthScore = {
    //   dateGenerated: new Date(),
    //   fastingPoint
    // };

    // user.healthScore.push(newHealthScore);
    await user.save();
    const healthScore = user.healthScore;

    calculateTotalPoints(user);

    return res.json({ success: true, healthScore });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Internal server error" });
  }
};

const mealplanPoints = async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  const currentUserHealthScore = user.healthScore[user.healthScore.length - 1];
  try {
    currentUserHealthScore.mealPoint = 30;
    await user.save();
    const healthScore = user.healthScore;
    calculateTotalPoints(user);
    return res.json({ success: true, healthScore });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "internal server error" });
  }
};

const workoutPoints = async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  const currentUserHealthScore = user.healthScore[user.healthScore.length - 1];
  try {
    currentUserHealthScore.workoutPoint = 5;
    await user.save();
    const healthScore = user.healthScore;
    calculateTotalPoints(user);
    return res.json({ success: true, healthScore });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "internal server error" });
  }
};

const weightlossPoints = async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  const currentUserHealthScore = user.healthScore[user.healthScore.length - 1];
  try {
    currentUserHealthScore.weightlossPoint = 5;
    await user.save();
    const healthScore = user.healthScore;
    calculateTotalPoints(user);
    return res.json({ success: true, healthScore });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "internal server error" });
  }
};

const stepcountPoints = async (req, res) => {
  const { countsCompleted, userId } = req.body;
  const user = await User.findById(userId);
  const currentUserHealthScore = user.healthScore[user.healthScore.length - 1];
  try {
    if (countsCompleted < 1000) {
      currentUserHealthScore.stepcountPoint = 0;
    } else if (countsCompleted > 1000 && countsCompleted < 2000) {
      currentUserHealthScore.stepcountPoint = 1;
    } else if (countsCompleted > 2000 && countsCompleted < 3000) {
      currentUserHealthScore.stepcountPoint = 2;
    } else if (countsCompleted > 3000 && countsCompleted < 4000) {
      currentUserHealthScore.stepcountPoint = 3;
    } else if (countsCompleted > 4000 && countsCompleted < 5000) {
      currentUserHealthScore.stepcountPoint = 4;
    } else if (countsCompleted > 5000 && countsCompleted < 6000) {
      currentUserHealthScore.stepcountPoint = 5;
    } else if (countsCompleted > 6000 && countsCompleted < 7000) {
      currentUserHealthScore.stepcountPoint = 6;
    } else if (countsCompleted > 7000 && countsCompleted < 8000) {
      currentUserHealthScore.stepcountPoint = 7;
    } else if (countsCompleted > 8000 && countsCompleted < 9000) {
      currentUserHealthScore.stepcountPoint = 8;
    } else if (countsCompleted > 9000 && countsCompleted < 10000) {
      currentUserHealthScore.stepcountPoint = 9;
    } else if (countsCompleted > 10000) {
      currentUserHealthScore.stepcountPoint = 10;
    }
    await user.save();
    const healthScore = user.healthScore;
    calculateTotalPoints(user);
    return res.json({ success: true, healthScore });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "internal server error" });
  }
};

const createHealthScoreEntry = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const latestHealthScoreEntry =
      user.healthScore[user.healthScore.length - 1];
    const updatedHealthScore1 = user.healthScore;

    if (latestHealthScoreEntry) {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      if (latestHealthScoreEntry.dateGenerated > twentyFourHoursAgo) {
        return res.json({
          success: true,
          updatedHealthScore1,
        });
      }
    }

    const newHealthScoreEntry = {
      dateGenerated: new Date(),
      mealPoint: 0,
      workoutPoint: 0,
      fastingPoint: 0,
      weightLossPoint: 0,
      stepcountPoint: 0,
    };

    user.healthScore.push(newHealthScoreEntry);
    await user.save();
    const updatedHealthScore = user.healthScore;

    return res.json({ success: true, updatedHealthScore });
  } catch (error) {
    console.error("Error adding health score entries:", error);
  }
};

cron.schedule("0 0 * * *", createHealthScoreEntry);

module.exports = {
  fastingPlanPoints,
  createHealthScoreEntry,
  mealplanPoints,
  stepcountPoints,
  workoutPoints,
  weightlossPoints,
};
