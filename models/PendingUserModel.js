const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otpCode: {type: Number, required: true},
  expiresAt: { type: Date, default: Date.now, index: { expires: '5m' } }
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema)
module.exports = PendingUser;
