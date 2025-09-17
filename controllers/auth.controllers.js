const { User } = require("../models/users.models.js");
const { APIResponse } = require("../utils/api-response.js");
const { asyncHandler } = require("../utils/async-handler.js");
const APIError = require("../utils/api-error.js");
const { createHash } = require("crypto");
const {
  sendEmail,
  EmailVerificationMailGenContent,
  generateResetPasswordEmail,
} = require("../utils/mailgen");

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
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`,
    ),
  });

  // Fetch user without sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new APIError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(
      new APIResponse(
        201,
        { user: createdUser },
        "User registered successfully and a verification email has been sent.",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new APIError(400, "Missing Data from user during login");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new APIError(400, "User does not exist");
  }
  const validatePassword =  await user.isPasswordCorrect(password);
  if (!validatePassword) {
    throw new APIError(400, "Invalid password");
  }
  const validatedEmail = user.isEmailVerified;
  if (!validatedEmail) {
    throw new APIError(400, "Email not verified yet");
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new APIResponse(
        200,
        {
          user: loggedInUser,
          refreshToken: refreshToken,
          accessToken: accessToken,
        },
        "User loggedIn Successfully",
      ),
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token: unhashedToken } = req.params; // dynamic param from link

  if (!unhashedToken) {
    throw new APIError(400, "Email Verification Token is absent");
  }

  // Hash the received token
  const hashedToken = createHash("sha256").update(unhashedToken).digest("hex");

  // Find user with this token and check expiry
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() }, // still valid
  }).select("-password -refreshToken");

  if (!user) {
    throw new APIError(400, "Token is invalid or expired");
  }

  // Mark user as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new APIResponse(200, {
      user:user
    }, "Email verified successfully ")
  );
});

module.exports = { registerUser, loginUser , verifyEmail };
