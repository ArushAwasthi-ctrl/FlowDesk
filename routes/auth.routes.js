const { Router } = require("express");
const {registerUser} = require('../controllers/auth.controllers.js')
const router = Router();

router.route("/register").post(registerUser);

module.exports = router;
