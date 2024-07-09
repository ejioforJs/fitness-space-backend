const crypto = require("crypto");
const { promisify } = require("util");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const createToken = require("../utils/createToken");
const Email = require("../utils/email");
const PendingUser = require("../models/PendingUserModel");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config({ path: "./config.env" });

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

exports.signup = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, passwordConfirm } = req.body;
    const existingUser = await User.findOne({ email });
    const pendingUser = await PendingUser.findOne({ email });

    if (existingUser) {
      return res.status(401).json({
        status: "error",
        message: "A user with this email address already exists.",
      });
    }
    if (pendingUser) {
      return res.status(401).json({
        status: "error",
        message: "A otp code has already sent to this email address.",
      });
    }

    if (password !== passwordConfirm) {
      return res.status(401).json({
        status: "error",
        message: "Passwords do not match",
      });
    }

    const otpCode = generateOTP();

    const message = {
      from: process.env.EMAIL_FROM,
      // to: toUser.email // in production uncomment this
      to: email,
      subject: "Activate your account",
      html: `
              <h3> Welcome to Fitness Space!</h3>
              <p>We’re happy to have you join us on a journey to a better and lighter YOU. Your path to a healthier, happier you begins now!</p>
              <p>To unlock all features, please complete your registration with this code:<span style="color: #FF5733;"> ${otpCode} </span>(Expires in 5 minutes!).</p>
              <p>Thank you for choosing Fitness Space. We’re here to support you every step of the way!</p>
            `,
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.COMP_GMAIL,
        pass: process.env.COMP_PASSWORD,
      },
    });

    transporter.sendMail(message, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });

    const newPendingUser = new PendingUser({
      email,
      otpCode,
    });

    await newPendingUser.save();

    res.status(200).json({
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      password: password,
      message:
        "Enter the otp code sent to your email to continue.",
    });

    // const newUser = new User({
    //   name,
    //   email,
    //   phoneNumber,
    //   password: bcrypt.hashSync(password, 12),
    //   trialStartDate: new Date(),
    // });

    // const user = await newUser.save();

    // user.password = undefined;
    // user.passwordConfirm = undefined;

    // const url = `${req.protocol}://${req.get("host")}/me`;

    // await new Email(newUser, url).sendWelcomeEmail();
    // createToken(newUser, 201, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: `Internal server error`,
    });
  }
};

exports.otpVerify = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, otpCode } = req.body;
    console.log(name,email,phoneNumber,password,otpCode)
    const user = await PendingUser.findOne({ email });

    if(!user){
      return res.status(401).json({
        status: "error",
        message: "User does not exist in database"
      })
    }
    console.log(otpCode)
    console.log(user.otpCode)

    if (otpCode != user.otpCode) {
      return res.status(401).json({
        status: "error",
        message: "Invalid otp code",
      });
    }

    // if (user && user.expiresAt < Date.now()) {
    //   return res.status(401).json({
    //     status: "error",
    //     message: "OTP code has expired",
    //   });
    // }

    const newUser = new User({
      name,
      email,
      phoneNumber,
      password: bcrypt.hashSync(password, 12),
      trialStartDate: new Date(),
    });

    await newUser.save();
    await PendingUser.deleteOne({email})

    createToken(newUser, 201, res);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: `Internal server error`,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (user && bcrypt.compareSync(password, user.password)) {
      createToken(user, 200, res);
    } else {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: `Internal server error ${error}` });
  }
};

exports.logout = async (req, res) => {
  res.cookie("jwt", "loggedout", {
    expiresIn: Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "You are not logged in. Please log in to get access.",
      });
    }

    console.log("JWT Secret:", process.env.JWT_SECRET);
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET,
      (err, payload) => {
        if (err) {
          const message =
            err.name === "jwt.JsonWebTokenError" ? "Unauthorized" : err.message;
          return next(createError.Unauthorized(message));
        }
        req.payload = payload;
        next();
      }
    );

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    // console.log(`Token to Verify: ${decoded}`);

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: "failed",
        message: "The user account belonging to this token no longer exists.",
      });
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: "failed",
        message: "User recently changed password. Please log in again",
      });
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: `Internal server error ${error}` });
  }
};

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    }
  } catch (error) {
    console.error(error);
    return next();
  }
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next({
        message: "You do not have permission to perform this action!",
        status: 403,
      });
    }
    next();
  };

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next({
      message: "There is no user with that email!",
      status: 404,
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.hostname}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordResetEmail();

    res.status(200).json({ status: "success", message: "Token sent to email" });
  } catch (error) {
    console.error("Error sending email:", error);

    if (error instanceof SomeSpecificError) {
    }

    user.passwordResetToken = undefined;
    user.passwordExpiresToken = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      status: "error",
      message: "There was an error sending the email. Try again later!",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Token is invalid or expired.",
    });
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.password = bcrypt.hashSync(req.body.password, 12);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createToken(user, 200, res);

  console.log("Reset Token:", req.params.token);
  console.log("Request Body:", req.body);
};

exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next({
      message: "Your current password is wrong!",
      status: 401,
    });
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createToken(user);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};
