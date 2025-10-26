// ---------- controller -> it contains all callback function and their functionality ----------------

const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings})
};


module.exports.renderNewForm = (req, res) => {
  // console.log(req.user); //-------------------- printing user related info ----------------------
  res.render("listings/new.ejs")
};


module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
     .populate({
        path: "reviews", 
        populate: {
          path: "author",
        },
      })
      .populate("owner"); // -------- Listing is a model ---------
      
  if(!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings"); // ✅ stop execution here
  }
  res.render("listings/show.ejs", { listing });
}


module.exports.createListing = async(req, res) => {

    let response = await geocodingClient
      .forwardGeocode({
      query: req.body.listing.location,  // ---------- use for accessing user location's coordinates --------------- 
      limit: 1,
    })
      .send(); 
      

    // let {title, description, image, price, country, location} = req.body;

    // if(!req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for listing")
    // }  
    
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new  Listing(req.body.listing);

    //   if(!newListing.title) {
    //     throw new ExpressError(400, "Title is missing!")
    //   }
    // 
    //   if(!newListing.description) {
    //     throw new ExpressError(400, "Description is missing!")
    //   }
    // 
    //   if(!newListing.location) {
    //     throw new ExpressError(400, "Location is missing!")
    //   }

    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = response.body.features[0].geometry;  //----- it stores location coordinated -------

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings")
};


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings"); // ✅ stop execution here
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit.ejs",{ listing , originalImageUrl})
};


module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing }); // ------------ {...req.body.listing } is deconstructing -------------
    
    if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url , filename};
    await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


//----------- deleting ------------

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings")
};