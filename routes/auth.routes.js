const { Router } = require("express");
const { registerUser , loginUser ,verifyEmail } = require("../controllers/auth.controllers.js");
const { validate } = require("../middlewares/validator-middleware.js");
const { userRegisterValidator ,userLoginValidator } = require("../validators/index.js");
const { resolveObjectURL } = require("buffer");
const router = Router();

router.route("/register").post(userRegisterValidator() , validate , registerUser);
router.route("/login").post(userLoginValidator() , validate , loginUser);
 router.route("/verify-email/:token").get(verifyEmail);

module.exports = router;
