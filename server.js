const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

const { port, DB } = require("./config.js");
const AppError = require("./utils/appError.js");
const globleErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes.js");
const nearByUsersRouter = require("./routes/nearByUsers.js");
const app = express();

//1. GLOBAL MIDDLEWARE
// Use CORS middleware
app.use(cors());

//Serving static files
app.use(express.static(path.join(__dirname, "public")));

//Development logging
if (process.env.NODE_ENV === "development") {
  //MIDDLEWARE
  app.use(morgan("dev"));
}

//Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/newbyusers", nearByUsersRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globleErrorHandler);
mongoose
  .connect(DB)
  .then(() => {
    console.log("DB connection successful!");
    app.listen(port, () => {
      console.log(`App running on port ${port}...`);
    });
  })
  .catch((err) => console.log(err));
