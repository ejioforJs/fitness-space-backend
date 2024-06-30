const baseMealsData = require("../data/baseMealData.json");
const pairings = require("../data/pairings.json");
const yorubaMeals = require("../data/yorubaMealData.json");
const hausaMeals = require("../data/hausaMealData.json");
const healthIssueAvoidanceList = require("../data/healthIssuesList.json");
const User = require("../models/userModel");
const { isUserInTrialPeriod } = require("../utils/trialUtils");
const portionController = require("./portionSizeController");

const snacksWithoutUlcer = [
  "Boiled groundnuts",
  "Home made popcorn without sugar",
  "Almond nuts",
  "2 fingers of medium size banana",
  "A fistful of groundnuts",
  "Watermelon",
  "Apple",
  "Oranges",
  "Mango",
  "Guava",
  "Cream crackers",
  "Cucumber",
  "1 cooked egg",
  "Half avocado",
  "Pineapple",
  "African star apple (agbalumo, udara)",
  "A cup of homemade smoothies with a variety of fruits and vegetables",
  "Roast or air-dried plantain chips",
  "Roast or air-dried potatoes",
  "A handful of nuts and seeds (e.g., almonds, cashews)",
];

const snacksWithUlcer = [
  "2 fingers of medium size banana",
  "A fistful of groundnuts",
  "Watermelon",
  "Apple",
  "Mango",
  "Guava",
  "Cream crackers",
  "Cucumber",
  "1 cooked egg",
  "Half avocado",
  "African star apple (agbalumo, udara)",
  "Roast or air-dried plantain chips",
  "Roast or air-dried potatoes",
  "A handful of nuts and seeds (e.g., almonds, cashews)",
];

const isTimePassed = (lastDate, days) => {
  const timeInMilliseconds = days * 24 * 60 * 60 * 1000;
  const currentTime = new Date();
  return currentTime - lastDate >= timeInMilliseconds;
};

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomItemFromArray = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const getUserMeals = async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  const mealPlans = [];
  try {
    // if (isUserInTrialPeriod(user)) {
    //   await generatingMeal(req, res, user, mealPlans);
    //   res.status(200).send({
    //     status: true,
    //     message: "Access granted during trial period",
    //     data: mealPlans,
    //   });
    // } else {
    // if (user.isSubscribed) {
    await generatingMeal(req, res, user, mealPlans);
    res.status(200).send({
      status: true,
      message: "Access granted",
      data: mealPlans,
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

const generatingMeal = async (req, res, user, mealPlans) => {
  const userWeight = user.currentWeight;
  const userFavorites = user.favouriteMeals;
  const userHealthIssues = user.healthIssues;
  const ethnicMeals =
    user.location === "west"
      ? yorubaMeals
      : user.location === "north"
      ? hausaMeals
      : baseMealsData;

  const lastMealData =
    user.mealData.length > 0 ? user.mealData[user.mealData.length - 1] : null;

  if (lastMealData && !isTimePassed(lastMealData.dateGenerated, 30)) {
    // If within 30 days, return the previous set of meal plans
    return mealPlans.push(lastMealData.mealPlans);
  }

  const numFavoriteMeals = Math.ceil(0.35 * 30);
  let currentDate = new Date();

  for (let i = 0; i < 30; i++) {
    const getRandomBaseMealAndPairing = () => {
      const baseMeals = i <= 12 ? ethnicMeals : baseMealsData;
      const baseMealNames = Object.keys(baseMeals);
      const pairingsNames = Object.keys(pairings);

      const generateRandomMealPairing = () => {
        if (i < numFavoriteMeals && numFavoriteMeals.length > 0) {
          const randomBaseMealName = getRandomItemFromArray(userFavorites);
          const baseMeal = baseMeals[randomBaseMealName];
          const availablePairings = baseMeal.Pairings.slice();
          const selectedPairings = [];
          let totalCalories = baseMeal.CalorieContent;

          if (userWeight < 80) {
            while (availablePairings.length > 0 && totalCalories <= 600) {
              const randomPairingIndex = getRandomNumber(
                0,
                availablePairings.length - 1
              );
              const randomPairingName = availablePairings[randomPairingIndex];
              const pairingsData = pairingsNames.filter((name) =>
                name.toLowerCase().includes(randomPairingName.toLowerCase())
              );
              const randomPairingMealName =
                getRandomItemFromArray(pairingsData);
              const randomPairing = pairings[randomPairingMealName];

              if (totalCalories + randomPairing.CalorieContent <= 600) {
                selectedPairings.push(randomPairing);
                totalCalories += randomPairing.CalorieContent;
                availablePairings.splice(randomPairingIndex, 1);
              } else {
                return { baseMeal, selectedPairings };
              }
            }
          } else {
            while (availablePairings.length > 0 && totalCalories <= 520) {
              const randomPairingIndex = getRandomNumber(
                0,
                availablePairings.length - 1
              );
              const randomPairingName = availablePairings[randomPairingIndex];
              const pairingsData = pairingsNames.filter((name) =>
                name.toLowerCase().includes(randomPairingName.toLowerCase())
              );
              const randomPairingMealName =
                getRandomItemFromArray(pairingsData);
              const randomPairing = pairings[randomPairingMealName];

              if (totalCalories + randomPairing.CalorieContent <= 520) {
                selectedPairings.push(randomPairing);
                totalCalories += randomPairing.CalorieContent;
                availablePairings.splice(randomPairingIndex, 1);
              } else {
                return { baseMeal, selectedPairings };
              }
            }
          }

          return { baseMeal, selectedPairings };
        } else {
          const randomBaseMealName = getRandomItemFromArray(baseMealNames);
          const baseMeal = baseMeals[randomBaseMealName];
          const availablePairings = baseMeal.Pairings.slice();
          const selectedPairings = [];
          let totalCalories = baseMeal.CalorieContent;

          if (userWeight < 80) {
            while (availablePairings.length > 0 && totalCalories <= 600) {
              const randomPairingIndex = getRandomNumber(
                0,
                availablePairings.length - 1
              );
              const randomPairingName = availablePairings[randomPairingIndex];
              const pairingsData = pairingsNames.filter((name) =>
                name.toLowerCase().includes(randomPairingName.toLowerCase())
              );
              const randomPairingMealName =
                getRandomItemFromArray(pairingsData);
              const randomPairing = pairings[randomPairingMealName];

              if (totalCalories + randomPairing.CalorieContent <= 600) {
                selectedPairings.push(randomPairing);
                totalCalories += randomPairing.CalorieContent;
                availablePairings.splice(randomPairingIndex, 1);
              } else {
                return { baseMeal, selectedPairings };
              }
            }
          } else {
            while (availablePairings.length > 0 && totalCalories <= 520) {
              const randomPairingIndex = getRandomNumber(
                0,
                availablePairings.length - 1
              );
              const randomPairingName = availablePairings[randomPairingIndex];
              const pairingsData = pairingsNames.filter((name) =>
                name.toLowerCase().includes(randomPairingName.toLowerCase())
              );
              const randomPairingMealName =
                getRandomItemFromArray(pairingsData);
              const randomPairing = pairings[randomPairingMealName];

              if (totalCalories + randomPairing.CalorieContent <= 520) {
                selectedPairings.push(randomPairing);
                totalCalories += randomPairing.CalorieContent;
                availablePairings.splice(randomPairingIndex, 1);
              } else {
                return { baseMeal, selectedPairings };
              }
            }
          }
          return { baseMeal, selectedPairings };
        }
      };

      let { baseMeal, selectedPairings } = generateRandomMealPairing();

      while (
        shouldAvoidMeal(baseMeal.name, userHealthIssues) ||
        selectedPairings.some((pairing) =>
          shouldAvoidMeal(pairing.name, userHealthIssues)
        )
      ) {
        ({ baseMeal, selectedPairings } = generateRandomMealPairing());
      }
      if (baseMeal.serving_size) {
        const unitOfMeasurement = baseMeal.serving_size.unitOfMeasurement;
        const portionMeal = portionController.getPortionSize(
          userWeight,
          userHealthIssues,
          unitOfMeasurement
        );
        baseMeal.serving_size.portionSizes = portionMeal;
      }
      return { baseMeal, selectedPairings };
    };

    const shouldAvoidMeal = (mealName, userHealthIssues) => {
      const issuesToAvoid = userHealthIssues.flatMap(
        (issue) => healthIssueAvoidanceList[issue.toLowerCase()] || []
      );

      return issuesToAvoid.includes(mealName.toLowerCase());
    };

    const getRandomSnack = (array) => {
      const randomIndex = Math.floor(Math.random() * array.length);
      return array[randomIndex];
    };

    // Generate meal plan
    const { baseMeal: meal1Base, selectedPairings: meal1Pairing } =
      getRandomBaseMealAndPairing();
    const { baseMeal: meal2Base, selectedPairings: meal2Pairing } =
      getRandomBaseMealAndPairing();
    const getSnack1 = getRandomSnack(
      userHealthIssues.includes("ulcer") ? snacksWithUlcer : snacksWithoutUlcer
    );
    const getSnack2 = getRandomSnack(
      userHealthIssues.includes("ulcer") ? snacksWithUlcer : snacksWithoutUlcer
    );

    const mealDate1 = new Date(currentDate);
    // const mealDate2 = new Date(currentDate);
    mealDate1.setDate(mealDate1.getDate() + i); // Increment date for the next meal

    mealPlans.push([
      {
        basemeal: meal1Base,
        pairings: meal1Pairing,
        snack1: getSnack1,
      },
      {
        basemeal: meal2Base,
        pairings: meal2Pairing,
        snack2: getSnack2,
      },
      { date: mealDate1 },
    ]);
  }

  const newMealData = {
    dateGenerated: new Date(),
    mealPlans,
  };

  user.mealData.push(newMealData);
  await user.save();
};

const getMealByDate = async (req, res) => {
  const { date, id } = req.body;
  console.log(date)
  const parsedDate = new Date(date)
  try {
    const user = await User.findById(id);
    let dateMeal = [];
    for (let meal of user.mealData) {
      for (let mealPlan of meal.mealPlans) {
        let mealplandate = new Date(mealPlan[2].date)
        if (parsedDate.toDateString() === mealplandate.toDateString()) {
          dateMeal = mealPlan;
        }
      }
    }
    console.log(dateMeal)
    res.status(201).send({
      status: "success",
      data: dateMeal
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: "error",
      message: "Internal server error"
    })
  }
};

module.exports = { getUserMeals,getMealByDate };
