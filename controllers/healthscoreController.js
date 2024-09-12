const User = require("../models/userModel");
const cron = require("node-cron");

// const createOrUpdateHealthScoreEntry = async (user) => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0); // Set the time to midnight to compare only the date

//   // Get the latest health score entry
//   let latestHealthScoreEntry = user.healthScore[user.healthScore.length - 1];

//   // If there's no entry for today, create a new one
//   if (!latestHealthScoreEntry || new Date(latestHealthScoreEntry.dateGenerated).setHours(0, 0, 0, 0) !== today.getTime()) {
//     const newHealthScoreEntry = {
//       dateGenerated: new Date(),
//       mealPoint: 0,
//       workoutPoint: 0,
//       fastingPoint: 0,
//       weightlossPoint: 0,
//       stepcountPoint: 0,
//       totalPoints: 0,
//     };
//     user.healthScore.push(newHealthScoreEntry);
//     latestHealthScoreEntry = newHealthScoreEntry;
//   }

//   return latestHealthScoreEntry;
// };

const createOrUpdateHealthScoreEntry = async (user) => {
  try {
    // Always create a new entry for testing
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to midnight to compare only the date

    let latestHealthScoreEntry = user.healthScore[user.healthScore.length - 1];

    if (
      !latestHealthScoreEntry ||
      new Date(latestHealthScoreEntry.dateGenerated).setHours(0, 0, 0, 0) !==
        today.getTime()
    ) {
      const newHealthScoreEntry = {
        dateGenerated: new Date(),
        mealPoint: 0,
        workoutPoint: 0,
        fastingPoint: 0,
        weightlossPoint: 0,
        stepcountPoint: 0,
      };
      user.healthScore.push(newHealthScoreEntry);
      await user.save();
    }
    let newLatestHealthScoreEntry = user.healthScore[user.healthScore.length - 1];
    return newLatestHealthScoreEntry;
  } catch (error) {
    console.error(
      `Error creating health score entry for user ${user._id}:`,
      error
    );
  }
};

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
    // const currentUserHealthScore =
    //   user.healthScore[user.healthScore.length - 1];
    const currentUserHealthScore = await createOrUpdateHealthScoreEntry(user);

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
  // const currentUserHealthScore = user.healthScore[user.healthScore.length - 1];
  const currentUserHealthScore = await createOrUpdateHealthScoreEntry(user);
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
  // const currentUserHealthScore = user.healthScore[user.healthScore.length - 1];
  const currentUserHealthScore = await createOrUpdateHealthScoreEntry(user);
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
  // const currentUserHealthScore = user.healthScore[user.healthScore.length - 1];
  const currentUserHealthScore = await createOrUpdateHealthScoreEntry(user);
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
  try {
    const { countsCompleted, userId } = req.body;
    const user = await User.findById(userId);
    // const currentUserHealthScore =
    //   user.healthScore[user.healthScore.length - 1];
    const currentUserHealthScore = await createOrUpdateHealthScoreEntry(user);
    let stepcountPoint = 0;
    if (countsCompleted < 1000) {
      stepcountPoint = 0;
    } else if (countsCompleted >= 1000 && countsCompleted < 2000) {
      stepcountPoint = 1;
    } else if (countsCompleted >= 2000 && countsCompleted < 3000) {
      stepcountPoint = 2;
    } else if (countsCompleted >= 3000 && countsCompleted < 4000) {
      stepcountPoint = 3;
    } else if (countsCompleted >= 4000 && countsCompleted < 5000) {
      stepcountPoint = 4;
    } else if (countsCompleted >= 5000 && countsCompleted < 6000) {
      stepcountPoint = 5;
    } else if (countsCompleted >= 6000 && countsCompleted < 7000) {
      stepcountPoint = 6;
    } else if (countsCompleted >= 7000 && countsCompleted < 8000) {
      stepcountPoint = 7;
    } else if (countsCompleted >= 8000 && countsCompleted < 9000) {
      stepcountPoint = 8;
    } else if (countsCompleted >= 9000 && countsCompleted < 10000) {
      stepcountPoint = 9;
    } else if (countsCompleted >= 10000) {
      stepcountPoint = 10;
    }
    currentUserHealthScore.stepcountPoint = stepcountPoint;
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

const calculateHealthScore = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // Define the maximum total points per entry
    const maxTotalPoints = 55;

    // Calculate the total points and the maximum possible points
    let totalPoints = 0;
    let totalMaxPoints = 0;
    let grade;

    user.healthScore.forEach(scoreEntry => {
      totalPoints += scoreEntry.totalPoints;
      totalMaxPoints += maxTotalPoints;
    });

    // Calculate the health score percentage
    const healthScorePercentage = (totalPoints / totalMaxPoints) * 100;
    if(healthScorePercentage >= 70) {
      grade = "A"
    }
    else if(healthScorePercentage < 70 && healthScorePercentage >= 60) {
      grade = "B"
    }
    else if(healthScorePercentage < 60 && healthScorePercentage >= 50) {
      grade = "C"
    }
    else if(healthScorePercentage < 50 && healthScorePercentage >= 40) {
      grade = "D"
    }
    else {
      grade = "E"
    }

    // Send the result back in the response
    return res.json({
      success: true,
      healthScorePercentage: healthScorePercentage.toFixed(2), // Round to two decimal places
      totalPoints,
      totalMaxPoints,
      grade
    });
  } catch (error) {
    console.error("Error calculating health score:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

cron.schedule("0 0 * * *", async () => {
  console.log("Cron job started at 8:00 AM");
  try {
    const users = await User.find();
    users.forEach((user) => {
      createOrUpdateHealthScoreEntry(user);
    });
    console.log("Cron job completed.");
  } catch (error) {
    console.error("Error during cron job execution:", error);
  }
});

module.exports = {
  fastingPlanPoints,
  calculateHealthScore,
  mealplanPoints,
  stepcountPoints,
  workoutPoints,
  weightlossPoints,
};
