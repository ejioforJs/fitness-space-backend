const jwt = require("jsonwebtoken");

function createToken(user, statusCode, res) {
  const token = jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  return res.status(statusCode).json({
    status: "success",
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    token,
  });
}

module.exports = createToken;
