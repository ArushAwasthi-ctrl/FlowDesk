const { APIResponse } = require("../utils/api-response.js");
const { asyncHandler } = require("../utils/async-handler.js");
const HandleHealthCheck = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new APIResponse(200, { message: "Health Check Server is Running" }));
});
// try {
//   res
//     .status(200)
//     .json(
//       new APIResponse(200, { message: "Health Check Server is Running" }),
//     );
// } catch (error) {
//   console.log("Error from Controllers/healthcheck", error);
// }

module.exports = { HandleHealthCheck };
