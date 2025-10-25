if(process.env.NODE_ENV != "production"){
   require('dotenv').config();
} 


const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

// ------------------ use for authentication ---------------------

const passport = require("passport"); 
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//----------------- routes ------------------

const listingRouter = require("./routes/listing.js");
const reviewPouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// use ejs-locals for all ejs templates:
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public"))) // ----------- use to access static files --------------


const store =  MongoStore.create({
   mongoUrl: dbUrl,
   crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, // -- refresh ---
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", error);
});


const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //---------------session expire data--------------
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // ----------------------- use to prevent cross-site scripting (XSS) attack ------------------
  }
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//-------------------using connect-flash ----------------

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; //---------- info regarding current user who's session is going on -----------------
  next();
})


// 
// app.get("/", (req, res) => {
//  res.send("Hii, I am Root");
// });



// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({ //------------- user creation ----------------
//     email: "student@gmail.com",
//     username: "delta-student"
//   });
// 
//   let registeredUser = await User.register(fakeUser, "helloworld"); // ------------- helloworld is a password ----------------
//   res.send(registeredUser);
// });


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewPouter);
app.use("/", userRouter);


// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });



// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });
// 
//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });


// ------------- sending standard res if no route Found --------------

app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});



//-------------- Error handling -----------
app.use((err, req, res, next) => {
  let {statusCode=500, message="Something went wrong!"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message })
})


app.listen(8080, (req,res) => {
    console.log("server is working at: 8080")
})