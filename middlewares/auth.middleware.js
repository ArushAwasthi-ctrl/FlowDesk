const { User } = require("../models/users.models.js");
const APIError = require("../utils/api-error.js");
const { APIResponse } = require("../utils/api-response.js");
const { asyncHandler } = require("../utils/async-handler.js");
const jwt = require("jsonwebtoken");

const AccessTokenValidation = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new APIError(401, "Unauthorized access");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
    if (!user) {
      throw new APIError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new APIError(401, "Invalid Token Access");
  }
});
module.exports = {AccessTokenValidation}