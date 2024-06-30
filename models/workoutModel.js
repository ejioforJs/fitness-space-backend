const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  medicalHistory: {
    type: ["diastasisRecti", "kneeAndJointPains"],
    required: true,
  },
  difficultyLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  workoutFrequency: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  suggestedWorkouts: [
    {
      category: {
        type: String,
        enum: [
          "easyBeginner",
          "general",
          "upperBody",
          "lowerBodyAndThigh",
          "armsShouldersChest",
          "glutesLegWorkout",
          "bellyFat",
          "advancedWorkout",
        ],
        default: "easyBeginner",
        required: true,
      },
      videoUrls: {
        type: [String],
      },
      description: {
        type: String,
      },
      duration: {
        type: Number,
        default: 30,
      },
      lastSuggestedDate: {
        type: Date,
        default: null,
      },
    },
  ],
  workoutHistory: [
    {
      workout: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workout",
      },
      dateWatched: {
        type: Date,
        default: Date.now,
      },
      completedWorkout: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

const Workout = mongoose.model("Workout", workoutSchema);

module.exports = Workout;
