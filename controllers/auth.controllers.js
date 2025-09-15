const { User } = require("../models/users.models.js");
const { APIResponse } = require("../utils/api-response.js");
const { asyncHandler } = require("../utils/async-handler.js");
const APIError = require("../utils/api-error.js");
const { sendEmail , EmailVerificationMailGenContent ,generateResetPasswordEmail} = require("../utils/mailgen");

const generateAccessTokenAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.createAccessToken();
    const refreshToken = user.createRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new APIError(
      500,
      "Something went wrong while generating Access Token",
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new APIError(409, "User with email or username already exists", []);
  }

  // Create user
  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
    role, // include role if needed
  });

  // Generate email verification token
  const { unhashedToken, hashedToken, tokenExpiry } =
    user.createTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // Send verification email
  await sendEmail({
    email: user.email,
    subject: "Please verify your email",
    mailGenContent: EmailVerificationMailGenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`
    ),
  });

  // Fetch user without sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    throw new APIError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(
    new APIResponse(
      201,
      { user: createdUser },
      "User registered successfully and a verification email has been sent."
    )
  );
});


module.exports = {registerUser};