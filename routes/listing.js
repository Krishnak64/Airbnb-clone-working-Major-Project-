const express = require("express")
const router = express.Router(); // --------- creating Router ----------

const wrapAsync = require("../utils/wrapAsync.js"); //------------------- use for validation -------------

const Listing = require("../models/listing.js"); // requiring Listing model
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js")
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});



router.route("/")       // ------- all takes same route -----------------
    //------------------ Index Routing --------------
    .get(wrapAsync(listingController.index))

    // ---------------- creating new Route ---------------------
    .post( isLoggedIn , upload.single('listing[image][url]'), validateListing, wrapAsync (listingController.createListing)
     );



//------------------------- New Route -------------------------------

router.get("/new",isLoggedIn, listingController.renderNewForm);


router.route("/:id")       // ------- all takes same route -----------------
     // ----------- Show Route -----------
    .get(wrapAsync(listingController.showListing))

    //--------------------Update Route --------------------------- 
    .put(
       isLoggedIn, 
       isOwner, 
       upload.single('listing[image][url]'), 
       validateListing, 
       wrapAsync(listingController.updateListing)
     )
     // ---------------------------------- Delete Route ----------------------------------------
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)
     );

//---------------- Edit Route -----------------

router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;