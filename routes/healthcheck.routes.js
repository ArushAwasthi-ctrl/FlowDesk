const { Router } = require("express");
const {
  HandleHealthCheck,
} = require("../controllers/healthcheck.controllers.js");
const router = Router();

router.route("/").get(HandleHealthCheck);

module.exports = router;
