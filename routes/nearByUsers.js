const express = require("express");
const nearByUsers = require("./../controllers/nearByUsersController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.get("/getusers", authController.protect, nearByUsers.getNearByUsers);

module.exports = router;
