let dotenv = require("dotenv").config();
const { error } = require("console");
let app = require("./app.js");
let dbCall = require("./db/dbCall.js");
let PORT = process.env.PORT || 9999;

dbCall()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error in then catch database", error);
  });
