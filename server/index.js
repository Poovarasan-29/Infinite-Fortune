const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./connectDatabase");
const bodyParser = require("body-parser");
const otpGenerateRouter = require("./routes/otpGenerateRouter");
const signupRouter = require("./routes/signupRouter");
const rechargeRequestRouter = require("./routes/rechargeRequestRouter");
const fetchDatasRouter = require("./routes/fetchDatasRouter");
const plansRouter = require("./routes/plansRouter");
const manageBalanceRouter = require("./routes/manageBalanceRouter");
const withdrawalRequestRouter = require("./routes/withdrawalRequestRouter");
const refreshCronJobByRouter = require("./refreshCronJobByRouter");
require("./cronJob");

connectDB();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

//Routes
app.use(otpGenerateRouter);
app.use(signupRouter);
app.use(rechargeRequestRouter);
app.use(fetchDatasRouter);
app.use(plansRouter);
app.use(manageBalanceRouter);
app.use(withdrawalRequestRouter);

// Referesh CronJob Router
app.use(refreshCronJobByRouter);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(3000, () => {
  console.log("Server Running...");
});
