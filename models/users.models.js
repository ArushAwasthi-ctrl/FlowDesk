const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomBytes, createHash } = require("node:crypto");


const userSchema = new mongoose.Schema(
  {
    avatar: {
      type: {
        url: String,
        localStorage: String,
      },
      default: {
        url: `https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.vecteezy.com%2Ffree-png%2Favatar&psig=AOvVaw1v0hWYTzswF71XsAmeSJOu&ust=1757797868050000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCJjn_sqR1I8DFQAAAAAdAAAAABAE`,
        localStorage: ``,
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password already defined"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};
userSchema.methods.createAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
};
userSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
};
userSchema.methods.createTemporaryToken = function () {
  const unhashedToken = randomBytes(16).toString("hex");
  const hashedToken = createHash("sha256")
    .update(unhashedToken)
    .digest("hex");

    const tokenExpiry = Date.now() +(20*60*1000);
    return {unhashedToken , hashedToken, tokenExpiry}
};

const User = mongoose.model("User", userSchema);

module.exports = { User};
