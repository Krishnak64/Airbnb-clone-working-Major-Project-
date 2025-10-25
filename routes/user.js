const express = require("express")
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

// ---------------------- signup Route----------------------

router.route("/signup")
// ---------------------- signup ----------------------
  .get( userController.renderSignupForm)
  .post(wrapAsync(userController.signup)
   );


// ---------------------- login Route ----------------------

router.route("/login")
// ---------------------- login ----------------------
   .get(userController.renderLoginForm)
   .post(
    saveRedirectUrl, 
    passport.authenticate("local", 
    {failureRedirect: "/login", 
    failureFlash: true
  }),
    userController.login
);

//------------------------------- logout -----------------------------------

router.get("/logout", userController.logout);


module.exports = router;