const { Router } = require("express");
const {
  registerUser,
  loginUser,
  verifyEmail,
  logoutUser,
  currentUser,
  reSendEmail,
} = require("../controllers/auth.controllers.js");
const { validate } = require("../middlewares/validator-middleware.js");
const {
  userRegisterValidator,
  userLoginValidator,
} = require("../validators/index.js");
const { resolveObjectURL } = require("buffer");
// this is used to validate AccessToken
const { AccessTokenValidation } = require("../middlewares/auth.middleware.js");
const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router
  .route("/login")
  .post(userLoginValidator(), validate, loginUser);
router.route("/verify-email/:token").get(verifyEmail);
router.route("/logout").get(AccessTokenValidation, logoutUser);
router.route("/current-user").get(AccessTokenValidation, currentUser);
router
  .route("/resend-email-verification")
  .post(AccessTokenValidation, reSendEmail);
module.exports = router;
