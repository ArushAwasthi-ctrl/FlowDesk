
const { validationResult } = require("express-validator");
const APIError = require("../utils/api-error");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) =>
    extractedErrors.push({
      [err.path]: err.msg,
    }),
  );
  throw new APIError(422, "Data by user is not Validated", extractedErrors);
};
module.exports = {validate};
