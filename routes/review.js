const express = require("express")
const router = express.Router({mergeParams: true}); // ------------ mergeParams: true  Child router inherits params like :id from the parent.

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js"); // requiring Review model
const Listing = require("../models/listing.js"); // requiring Listing model

const {validateReview, isLoggedIn, isReviewAuther} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");



//------------------------------------------ Reviews -------------------------------------------------------
//------------------ creating Post review route --------------------------

router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));


//--------- Deleting Review Route -----------

router.delete("/:reviewId",isLoggedIn ,isReviewAuther , wrapAsync(reviewController.destroyReview));

module.exports = router;