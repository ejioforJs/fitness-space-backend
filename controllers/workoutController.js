const fs = require("fs");
const path = require("path");
const Workout = require("../models/workoutModel");

const workoutDetailsPath = path.join(__dirname, "../data/workoutDetails.json");
const videoURLsPath = path.join(__dirname, "../data/videosURLs.json");

const workoutDetails = JSON.parse(fs.readFileSync(workoutDetailsPath, "utf-8"));
const videoURLs = JSON.parse(fs.readFileSync(videoURLsPath, "utf-8"));

const getWorkoutDetailsAndVideos = (category) => {
  const details = workoutDetails[category] || {};
  const videos = videoURLs[category] || [];

  return {
    category,
    description: details.description,
    focusAreas: details.focusAreas,
    difficultyLevel: details.difficultyLevel,
    duration: details.duration,
    videos,
  };
};

const getRandomElement = (array) =>
  array[Math.floor(Math.random() * array.length)];

const suggestWorkout = async (req, res) => {
  try {
    const { medicalHistory, selectedCategories, workoutFrequency } = req.body;
    let suggestedWorkouts = [];

    // Helper function to check if a video is watched recently
    const isVideoWatchedRecently = (videos, category) => {
      const today = new Date();
      const fourteenDaysAgo = new Date(today);
      fourteenDaysAgo.setDate(today.getDate() - 14);

      return (
        videos &&
        videos.some(
          (video) =>
            video.category === category &&
            video.watched &&
            new Date(video.lastSuggestedDate) > fourteenDaysAgo
        )
      );
    };

    // Function to get workout details and videos for a category
    const getWorkoutDetailsAndVideos = (category) => {
      const details = workoutDetails[category] || {};
      const videos = videoURLs[category] || [];

      return {
        category,
        description: details.description,
        focusAreas: details.focusAreas,
        difficultyLevel: details.difficultyLevel,
        duration: details.duration,
        videos,
      };
    };

    if (medicalHistory && medicalHistory.length > 0) {
      // Users with medical history
      medicalHistory.forEach((condition) => {
        if (workoutDetails[condition]) {
          const conditionWorkouts = getWorkoutDetailsAndVideos(condition);
          suggestedWorkouts.push(conditionWorkouts);
        }
      });
    } else {
      // Users without medical history
      let additionalWorkouts = [
        "easyBeginner",
        "general",
        "upperBody",
        "lowerBodyAndThigh",
        "armsShouldersChest",
        "glutesLegWorkout",
        "bellyFat",
        "advancedWorkout",
      ];

      if (selectedCategories && selectedCategories.length > 0) {
        // Exclude selected categories if any
        additionalWorkouts = additionalWorkouts.filter(
          (category) => !selectedCategories.includes(category)
        );

        // Add videos based on the number of selected categories
        if (selectedCategories.length === 1) {
          // User selected one category
          const selectedWorkout = getWorkoutDetailsAndVideos(
            selectedCategories[0]
          );
          suggestedWorkouts.push({ ...selectedWorkout, watched: false });

          const generalWorkout = getWorkoutDetailsAndVideos("general");
          suggestedWorkouts.push({ ...generalWorkout, watched: false });
        } else if (selectedCategories.length === 2) {
          // User selected two categories
          selectedCategories.forEach((category) => {
            const selectedWorkout = getWorkoutDetailsAndVideos(category);
            suggestedWorkouts.push({ ...selectedWorkout, watched: false });
          });

          const easyBeginnerWorkout =
            getWorkoutDetailsAndVideos("easyBeginner");
          suggestedWorkouts.push({ ...easyBeginnerWorkout, watched: false });
        } else if (selectedCategories.length === 3) {
          // User selected three categories
          selectedCategories.forEach((category) => {
            const selectedWorkout = getWorkoutDetailsAndVideos(category);
            suggestedWorkouts.push({ ...selectedWorkout, watched: false });
          });
        }
      } else {
        // Default suggestions based on workoutFrequency
        if (workoutFrequency === "beginner") {
          const easyBeginnerWorkout =
            getWorkoutDetailsAndVideos("easyBeginner");
          suggestedWorkouts.push({ ...easyBeginnerWorkout, watched: false });
        } else if (workoutFrequency === "intermediate") {
          // Suggestions from selected categories marked with a difficulty level of intermediate
          // Here you need to modify based on your data structure
          // Assuming workoutDetails[category].difficultyLevel exists and is set properly
          additionalWorkouts.forEach((category) => {
            const workout = getWorkoutDetailsAndVideos(category);
            if (workout.difficultyLevel === "intermediate") {
              suggestedWorkouts.push({ ...workout, watched: false });
            }
          });
        } else if (workoutFrequency === "advanced") {
          // Suggestions from advanced workout categories
          // Here you need to modify based on your data structure
          // Assuming workoutDetails[category].difficultyLevel exists and is set properly
          additionalWorkouts.forEach((category) => {
            const workout = getWorkoutDetailsAndVideos(category);
            if (workout.difficultyLevel === "advanced") {
              suggestedWorkouts.push({ ...workout, watched: false });
            }
          });
        }
      }
    }

    // Update lastSuggestedDate for each suggested workout
    const today = new Date();
    suggestedWorkouts = suggestedWorkouts.map((workout) => ({
      ...workout,
      lastSuggestedDate: today,
    }));

    // Filter out duplicates and limit to 3 workouts
    suggestedWorkouts = suggestedWorkouts
      .flat()
      .filter(
        (value, index, self) =>
          self.findIndex(
            (v) =>
              v.category === value.category &&
              !v.watched &&
              !isVideoWatchedRecently(suggestedWorkouts, value.category)
          ) === index
      )
      .slice(0, 3);

    // Create an object to store the selected video links per category
    const selectedVideos = {};

    // Iterate over suggestedWorkouts to select one video per category
    suggestedWorkouts.forEach((workout) => {
      if (!selectedVideos[workout.category]) {
        selectedVideos[workout.category] = {
          ...workout,
          watched: false,
        };
      }
    });

    // Convert selectedVideos object to an array
    const finalSuggestions = Object.values(selectedVideos);

    console.log("Suggested Workouts:", finalSuggestions);

    res.status(200).json({
      status: "success",
      suggestedWorkouts: finalSuggestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const getWorkoutHistory = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have user information in req.user

    // Fetch workout history for the user
    const workoutHistory = await Workout.find({ user: userId })
      .populate("workout")
      .exec();

    console.log("Workout History:", workoutHistory);

    res.status(200).json({
      status: "success",
      workoutHistory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

module.exports = {
  suggestWorkout,
  getWorkoutHistory,
};