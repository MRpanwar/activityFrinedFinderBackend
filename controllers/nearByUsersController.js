const User = require("../models/userModel.js");
const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/appError.js");
const { googleApiKey } = require("./../config.js");

const getDistanceBetweenUser = async (origins, destinations, userData) => {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=INDIA+${origins}&destinations=INDIA+${destinations}&sensor=false&key=${googleApiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error("Distance api is not working");
    const distanceBetween = data?.rows?.[0]?.elements?.[0];
    const distanceData = {
      //origin_addresses: data?.origin_addresses?.[0],
      //destination_addresses: data?.destination_addresses?.[0],
      distance: distanceBetween?.distance?.text,
      duration: distanceBetween?.duration?.text,
      id: userData._id.valueOf(),
      name: userData.name,
      photo: userData.photo,
      activity: userData.activity,
      connectReq: false,
      connected: false,
    };
    return distanceData;
  } catch (err) {
    console.log("ERROR", err.message);
  }
};

exports.getNearByUsers = catchAsync(async (req, res, next) => {
  const userid = req.user._id;
  const userActivity = req.user.activity;
  const userArray = await User.aggregate([
    {
      $match: {
        activity: {
          $in: userActivity,
        },
        _id: {
          $ne: userid,
        },
      },
    },
    { $limit: 10 },
  ]);

  const diatancePromises = userArray.map(
    async (user) =>
      await getDistanceBetweenUser(req.user.pincode, user.pincode, user)
  );

  Promise.all(diatancePromises)
    .then(function (results) {
      const shortResultByDistanceASC = results.sort(
        (a, b) => a.distance.split(" ")[0] - b.distance.split(" ")[0]
      );
      //console.log(shortResultByDistanceASC);
      res.status(200).json({
        status: "success",
        data: {
          results: shortResultByDistanceASC,
        },
      });
    })
    .catch((err) =>
      res.status(500).json({
        status: "error",
      })
    );
});
