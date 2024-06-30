const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    required: true,
  },
  completed: {
    type: String,
  },
  steps: {
    count: {
      type: Number,
      default: 0,
    },
    target: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  fasting: {
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    timeZone: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  workout: {
    completed: {
      type: Boolean,
      default: false,
    },
    categories: [
      {
        title: {
          type: String,
          required: true,
        },
        workoutUrl: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  meal: {
    completed: {
      type: Boolean,
      default: false,
    },
    categories: [
      {
        meal: {
          type: String,
          required: true,
        },
        alternative: {
          type: String,
        },
        title: {
          type: String,
          required: true,
        },
        optionals: {
          type: String,
        },
      },
    ],
  },
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
