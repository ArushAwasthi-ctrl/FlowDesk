let express = require("express");
let cors = require("cors");
let app = express();
let cookieparser = require('cookie-parser');
// basic config

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("/public"));
app.use(cookieparser());

// cors config
app.use(cors());

// routers importing
const healthcheckRoute = require("./routes/healthcheck.routes");
const authRoute = require('./routes/auth.routes.js')

app.use("/api/v1/healthcheck/", healthcheckRoute);
app.use("/api/v1/auth",authRoute)



app.get("/", (req, res) => {
  res.send("Home page");
});

module.exports = app;
