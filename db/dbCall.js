const mongoose = require("mongoose");
const dbCall = async function () {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Db connected");
  } catch (error) {
    console.log(`Error while connecting with db ${error}`);
  }
};

module.exports = dbCall;
