const smoothiesDataNonUlcer = require("../data/smoothieData.json");
const smoothiesDataUlcer = require("../data/smoothieDataUlcer.json");
const healthIssueAvoidanceList = require("../data/healthIssuesList.json");
const User = require("../models/userModel");
const { isUserInTrialPeriod } = require("../utils/trialUtils");

const isTimePassed = (lastDate, days) => {
  const timeInMilliseconds = days * 24 * 60 * 60 * 1000;
  const currentTime = new Date();
  return currentTime - lastDate >= timeInMilliseconds;
};

const getRandomItemFromArray = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const getUserSmoothies = async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  const smoothiesPlans = [];
  try {
    // if (isUserInTrialPeriod(user)) {
    //   await gettingUserSmoothies(req, res, user, smoothiesPlans);
    //   res.status(200).send({
    //     status: true,
    //     message: "Access granted during trial period",
    //     data: smoothiesPlans,
    //   });
    // } else {
      // if (user.isSubscribed) {
        await gettingUserSmoothies(req,res,user, smoothiesPlans)
        res.status(200).send({
          status: true,
          message: "Access granted",
          data: smoothiesPlans,
        });
      // } else {
      //   res.status(401).send({
      //     status: false,
      //     message:
      //       "Access denied. Please subscribe to access premium features.",
      //   });
      // }
    // }
  } catch (error) {
    console.error("Error generating meal plans:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

// const gettingUserSmoothies = async (req,res,user, smoothiesPlans) => {
//   const userHealthIssues = user.healthIssues;
//     const lastSmoothiesData =
//       user.smoothiesData.length > 0 ? user.smoothiesData[user.smoothiesData.length-1] : null;
//     if (
//       lastSmoothiesData &&
//       !isTimePassed(lastSmoothiesData.dateGenerated, 30)
//     ) {
//           return smoothiesPlans.push(lastSmoothiesData.smoothiesPlans)
//     }

//     for (let i = 0; i < 4; i++) {
//       const getRandomSmoothie = (smoothiesData) => {
//         const smoothieKeys = Object.keys(smoothiesData);

//         if (smoothieKeys.length > 0) {
//           const randomSmoothieKey = getRandomItemFromArray(smoothieKeys);

//           if (randomSmoothieKey) {
//             return smoothiesData[randomSmoothieKey];
//           } else {
//             console.error("No smoothie data found for the random key.");
//             return null;
//           }
//         } else {
//           console.error("No smoothie keys available.");
//           return null;
//         }
//       };

//       const weightLossDrink = getRandomSmoothie(
//         userHealthIssues.includes("ulcer")
//           ? smoothiesDataUlcer
//           : smoothiesDataNonUlcer
//       );
//       smoothiesPlans.push({ weightLossDrink, dateGenerated: new Date() });
//     }

//     const newSmoothiesData = {
//       dateGenerated: new Date(),
//       smoothiesPlans,
//     };

//     user.smoothiesData.push(newSmoothiesData);
//     await user.save();
// }

const gettingUserSmoothies = async (req,res,user, smoothiesPlans) => {
  const userHealthIssues = user.healthIssues;
  const lastSmoothiesData =
    user.smoothiesData.length > 0 ? user.smoothiesData[user.smoothiesData.length - 1] : null;

  if (lastSmoothiesData && !isTimePassed(lastSmoothiesData.dateGenerated, 30)) {
    return smoothiesPlans.push(lastSmoothiesData.smoothiesPlans);
  }

  const currentDate = new Date();
  const numWeeks = 4;
  const daysInWeek = 7;
  const daysBetweenSmoothies = daysInWeek;

  for (let i = 0; i < numWeeks; i++) {
    const dateGenerated = new Date(currentDate);
    dateGenerated.setDate(dateGenerated.getDate() + (i * daysBetweenSmoothies));

    const getRandomSmoothie = (smoothiesData) => {
      const smoothieKeys = Object.keys(smoothiesData);

      if (smoothieKeys.length > 0) {
        const randomSmoothieKey = getRandomItemFromArray(smoothieKeys);

        if (randomSmoothieKey) {
          return smoothiesData[randomSmoothieKey];
        } else {
          console.error("No smoothie data found for the random key.");
          return null;
        }
      } else {
        console.error("No smoothie keys available.");
        return null;
      }
    };

    const weightLossDrink = getRandomSmoothie(
      userHealthIssues.includes("ulcer") ? smoothiesDataUlcer : smoothiesDataNonUlcer
    );

    smoothiesPlans.push({ weightLossDrink, dateGenerated });
  }

  const newSmoothiesData = {
    dateGenerated: new Date(),
    smoothiesPlans,
  };

  user.smoothiesData.push(newSmoothiesData);
  await user.save();
}

const getSmoothieByDate = async(req,res) => {
  const { date, id } = req.body;
  const parsedDate = new Date(date)
  const dateInMilliseconds = parsedDate.getTime() 
  try {
    const user = await User.findById(id);
    let dateSmoothie = [];
    for (let smoothie of user.smoothiesData){
      for (let smoothiePlan of smoothie.smoothiesPlans){
        let smoothiePlanDate = new Date(smoothiePlan.dateGenerated)
        let smoothieDateInMilliseconds = smoothiePlanDate.getTime()
        let millisecondsDifference = dateInMilliseconds - smoothieDateInMilliseconds
        let dayDifference = Math.floor(
          millisecondsDifference / (1000 * 60 * 60 * 24)
        );
        if(dayDifference >= 0 && dayDifference < 7){
          dateSmoothie.push(smoothiePlan)
        }
      }
    }
    res.status(201).send({
      status: "success",
      data: dateSmoothie
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: "error",
      message: "Internal server error"
    })
  }
}

module.exports = {getUserSmoothies,getSmoothieByDate}