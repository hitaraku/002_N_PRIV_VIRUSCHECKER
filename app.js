/**************************
* Configure For Express and the others.
**************************/
const express       = require("express"), 
    app           = express(), 
    bodyParser    = require("body-parser"), 
    mongoose      = require("mongoose"),
    flash         = require("connect-flash"),
    // passport      = require("passport"),
    // LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User           = require("./models/user"),
    // ShopOwner      = require("./models/shopowner"),
    // Category1      = require("./models/category1"),
    // Category2      = require("./models/category2"),
    // Opportunity      = require("./models/opportunity"),
    // Assistant      = require("./middleware/watson_assistant"),
    Coronavirustimeline     = require("./models/coronavirustimeline"),
    // Coronavirusrumors       = require("./models/coronavirusrumors"),
    dateFormat  = require('dateformat'),
    https            = require("https"),
    fs             = require("fs"),
    cron = require('node-cron'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;
    // fileUpload = require('express-fileupload');
    // seedDB        = require("./seeds");
    
/**************************
* Mongoose Connection
**************************/
// Get content from file
var connecturl;
if(process.env.MONGO_SECRET) {
    connecturl = process.env.MONGO_SECRET;
} else {
    var contents = fs.readFileSync("./secret/password.json");
    var jsonContent = JSON.parse(contents);
    connecturl = jsonContent.mongoose_connection;
}

// connect use connectUrl
mongoose.connect(connecturl, function(err, db){
    if(err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
        process.exit(1);
    } else {
        console.log('Connected to Server successfully!');
    }
});

/**************************
* Get coronavirus data from DXY-2019-nCoV-Crawler
**************************/
const url           = 'https://lab.isaaclin.cn/nCoV/',
      areaUrl   = url + 'api/area';

// schedule get coronavirus from web to store mongodb
cron.schedule('0 0 */1 * * *', () => {
    https.get(areaUrl, function(res){
        var body = '';
        var dateTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Tokyo"});
    
        res.on('data', function(chunk){
            body += chunk;
        });
    
        res.on('end', function(){
            try {
                var fbResponse = JSON.parse(body);
                var newCoronavirustimeline = {
                    cornavirusoverall: fbResponse,
                    gotDate: dateTime,
                }
                // create a new shopuser and save to DB.
                Coronavirustimeline.create(newCoronavirustimeline, function(err, newlyCreated){
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("success store cornavirus to database");
                    }
                });
                console.log("Got a response: ", fbResponse.picture);
            } catch (e) {
                console.log("Error Got a HTML : ", e);
            }
        });
    }).on('error', function(e){
          console.log("Got an error: ", e);
    });
});

/**************************
* Configure Facebook Passport 
**************************/
// for SSL enable callbackURL
app.enable("trust proxy");

passport.use(
  new FacebookStrategy(
    {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: '/return',
        profileFields: ['id', 'emails', 'displayName']
    },
    (accessToken, refreshToken, profile, done) => {
      if (!profile) {
        return done(null, false);
      }
      
      // TODO DELETE
      console.log(profile);

      User.findOne({ facebookId: profile.id })
        .then(existingUser => {
          if (existingUser) {
            done(null, existingUser);
          } else {
            var notfoundemail = "";
            if (!profile.emails || !profile.emails[0].value || !profile._json.email) {
                notfoundemail = "notfound";
            }
            let email = profile.emails[0].value || profile._json.email || notfoundemail;
            new User({
              displayName: profile.displayName,
              facebookId: profile.id,
              email: email
            })
              .save()
              .then(user => done(null, user));
          }
        })
        .catch(err => done(err, null));
    }
  )
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/**************************
* UploadFile 'express-fileupload'
**************************/
// default options
// app.use(fileUpload());

/**************************
* Require For Route
**************************/
// requiring routes
// var shopownerRoutes     = require("./routes/shopowner"),
//     opportunityRoutes   = require("./routes/opportunity"),
//     indexRoutes         = require("./routes/index");
    
var indexRoutes         = require("./routes/index"),
    userRoutes          = require("./routes/user");

/**************************
* Configure for API, css, ejs...
**************************/
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

/**************************
* Initialize Passport and restore authentication state, if any, 
* from the session
**************************/
app.use(require("express-session")({
    secret: "Once again Rusty again",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// configuser for currentuser
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

/**************************
* Configure For Routes
**************************/
app.use("/", indexRoutes);
app.use("/users", userRoutes);
// app.use("/opportunitys", opportunityRoutes);

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.render("notfound");
});

/**************************
* Configure For Listen (HTTP)
**************************/
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Coronaviurs start!!");
});

/**************************
* Get Data From CoronaVirus
**************************/
