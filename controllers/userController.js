const User = require("../models/userModel");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const paystack = require("paystack-api")(process.env.TEST_SECRET);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = async (req, res, next) => {
  try {
    if (req.body.password || req.body.passwordConfirm) {
      throw new Error(
        "This route is not for password updates. Please use /updateMyPassword."
      );
    }

    const filteredByBody = filterObj(req.body, "name", "email");
    if (req.file) filteredByBody.photo = req.file.filename;

    const updateUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredByBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: updateUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet implemented, please use /signup instead",
  });
};

exports.addLocation = async (req, res) => {
  const { id, state } = req.body;
  const user = await User.findById(id);
  let location = ""
  const westernStates =
    "lagos" || "ogun" || "ondo" || "osun" || "oyo" || "ekiti";
  const northernStates =
    "adamawa" ||
    "borno" ||
    "bauchi" ||
    "gombe" ||
    "taraba" ||
    "jigawa" ||
    "kaduna" ||
    "kano" ||
    "katsina" ||
    "kebbi" ||
    "sokoto" ||
    "zamfara" ||
    "benue" ||
    "kogi" ||
    "kwara" ||
    "nasawara" ||
    "niger" ||
    "plateau" ||
    "abuja";
    try {
      if (state.toLowerCase() === "lagos" || state.toLowerCase() === "ogun" || state.toLowerCase() === "ondo" || state.toLowerCase() === "osun" || state.toLowerCase() === "oyo" || state.toLowerCase() === "ekiti") {
        location = "west";
        console.log(location)
      } 
      else if (state.toLowerCase() === "adamawa" || state.toLowerCase() === "borno" || state.toLowerCase() === "bauchi" || state.toLowerCase() === "gombe" || state.toLowerCase() === "taraba" || state.toLowerCase() === "jigawa" || state.toLowerCase() === "kaduna" || state.toLowerCase() === "kano" || state.toLowerCase() === "katsina" || state.toLowerCase() === "kebbi" || state.toLowerCase() === "sokoto" || state.toLowerCase() === "zamfara" || state.toLowerCase() === "benue" || state.toLowerCase() === "kogi" || state.toLowerCase() === "kwara" || state.toLowerCase() === "nasarawa" || state.toLowerCase() === "niger" || state.toLowerCase() === "plateau" || state.toLowerCase() === "abuja") {
        location = "north";
        console.log(location)
      }
      else{
        location = "others"
      }
      console.log(location)
      user.location = location
      await user.save()
      res.status(200).json({
        status: "success",
        data: {
          user,
        },
      }); 
    } catch (error) {
      res.status(401).json({
        status: "false",
        error
      })
    }
};