const mongoose = require("mongoose");
const crypto = require("crypto");
const emailValidator = require("email-validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: emailValidator.validate,
    },
  },
  location: {
    type: String,
    enum: ["north","west","others"]
  },
  occupation: {
    type: String,
  },
  faith: {
    type: String,
    enum: ["christian", "muslim", "african native", "others"],
  },
  currentWeight: {
    type: Number,
  },
  targetWeightLoss: {
    type: Number,
  },
  targetedBodyParts: {
    type: String,
    enum: ["belly", "waist", "face", "thighs", "arms"],
  },
  favouriteMeals: {
    type: [String],
  },
  healthIssues: {
    type: [String],
  },
  excerciseFrequency: {
    type: String,
  },
  dailyWaterIntake: {
    type: String,
  },
  healthScore: {
    type: Number,
  },
  healthPlan: {
    type: String,
    enum: ["lose weight", "maintain weight"],
  },
  updatePortionSize: {
    type: Boolean,
    default: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  role: {
    type: String,
    enum: ["user", "coach", "lead-coach", "admin"],
    default: "user",
  },
  coach: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  mealData: [
    {
      dateGenerated: { type: Date, default: Date.now },
      mealPlans: { type: Object },
    },
  ],
  smoothiesData: [
    {
      dateGenerated: { type: Date, default: Date.now },
      smoothiesPlans: { type: Object },
    },
  ],
  healthScore: [
    {
      dateGenerated: { type: Date, default: Date.now },
      mealPoint: { type: Number, default: 0 },
      workoutPoint: { type: Number, default: 0 },
      fastingPoint: { type: Number, default: 0 },
      weightlossPoint: { type: Number, default: 0 },
      stepcountPoint: {
        type: Number,
        default: 0,
        stepCountHistory: [
          {
            steps: { type: Number, required: true },
            date: { type: Date, default: Date.now },
          },
        ],
      },
      totalPoints: { type: Number, default: 0 },
    },
  ],
  paystack_ref: {
    type: String,
  },
  amountDonated: {
    type: Number,
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  planName: {
    type: String,
  },
  timeSubscribed: {
    type: Date,
  },
  trialStartDate: {
    type: Date,
  },
  passwordConfirm: {
    type: String,
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Add another pre-save hook to initialize the healthScore for new users
userSchema.pre("save", function(next) {
  // Check if it's a new user
  if (this.isNew) {
    // Initialize healthScore array with default values
    this.healthScore = [{
      mealPoint: 0,
      workoutPoint: 0,
      fastingPoint: 0,
      weightlossPoint: 0,
      stepcountPoint: {
        stepCountHistory: [],
        stepcountPoint: 0,
      },
      totalPoints: 0,
    }];
  }
  // Proceed to the next middleware
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
