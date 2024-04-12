const jwt = require("jsonwebtoken");
const util = require("util");

const User = require("./../models/userModel.js");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError.js");
const { jwtSecret } = require("./../config.js");

//Create JWT token
const signToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "7 days",
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const { name, photo, activity } = user;
  console.log(name, photo, activity);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      name,
      photo,
      activity,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, activity, pincode, gender } =
    req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    activity: activity.split(","),
    pincode,
    gender,
  });
  if (newUser) {
    return res.status(201).json({
      status: "success",
    });
  } else {
    res.status(500).json({
      status: "error",
    });
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1. Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  //2. Check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Incorrect email or password!", 401));
  }
  const correct = await user.correctPassowrd(password, user.password);
  if (!correct) {
    return next(new AppError("Incorrect email or password", 401));
  }
  //3. if everything ok, send token to client
  //console.log(user);
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //1. Getting token and check of it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //console.log(token);
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  //2. Verification token
  const jwtVerifyPromise = util.promisify(jwt.verify);
  const decoded = await jwtVerifyPromise(token, process.env.JWT_SECRET);
  //console.log(decoded);

  //3. Check if user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError("The user belonging to this token dose no longer exist.")
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});
