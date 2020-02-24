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
    // User           = require("./models/user"),
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
const fbAppId = process.env.FACEBOOK_APP_ID;
const fbAppSecret = process.env.FACEBOOK_APP_SECRET;
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/'
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }
));

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
    
var indexRoutes         = require("./routes/index");

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
app.use(passport.initialize());
app.use(passport.session());

/**************************
* Configure For Routes
**************************/
app.use("/", indexRoutes);
// app.use("/shopowners", shopownerRoutes);
// app.use("/opportunitys", opportunityRoutes);

// Define routes.
app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });
  
//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.send('what???', 404);
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
