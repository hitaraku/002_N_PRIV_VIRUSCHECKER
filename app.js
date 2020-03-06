/**************************
* Configure For Express and the others.
**************************/
const express       = require("express"), 
    app           = express(), 
    bodyParser    = require("body-parser"), 
    mongoose      = require("mongoose"),
    flash         = require("connect-flash"),
    sitemap = require('express-sitemap'),
    methodOverride = require("method-override"),
    User           = require("./models/user"),
    Coronavirustimeline     = require("./models/coronavirustimeline"),
    Coronavirustimelineinjapan = require("./models/coronavirustimelineinjapan"),
    Wptimeline                 = require("./models/wptimeline"),
    dateFormat  = require('dateformat'),
    https             = require("https"),
    fs                = require("fs"),
    csv               = require("csv"),
    middleware  = require("./middleware/index.js"),
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
      
// schedule get wordpress from web to store mongodb
cron.schedule('0 * * * *', () => {
    // Get Date from china goverment about Coronavirus
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
                        console.log("Got store cornavirus to database error : " + err);
                    } else {
                        console.log("success store cornavirus to database");
                        // store dictionary to mongodatabase
                        middleware.namedic();
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
    
    // For get json from Wordpress
    var url = "https://virus.evelinks.org/wp-json/wp/v2/posts"
    var wpPostUrlJson = url /* + "?_fields=author,id,excerpt,title,link" */;
    https.get(wpPostUrlJson, function(res){
        var body = '';
        var dateTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Tokyo"});

        res.on('data', function(chunk){
            body += chunk;
        });
    
        res.on('end', function(){
            try {
                var wpResponse = JSON.parse(body); 
                var newWptimeline = {
                    wpPostsAll: wpResponse,
                    gotDate: dateTime,
                }
                Wptimeline.remove({}, function(err) { 
                    if(err) {
                        console.log("remove wp collection : " + err);
                    } else {
                        console.log('collection removed') 
                    }
                });
                // create a new shopuser and save to DB.
                Wptimeline.create(newWptimeline, function(err, newlyCreated){
                    if(err) {
                        console.log("Got store wordpress to database error : " + err);
                    } else {
                        console.log("success store wordpress article title to database");
                    }
                });
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
        profileFields: ['id', 'emails', 'displayName', 'photos']
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
              email: email,
              profile: profile.photos
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
* Configure For Redirect (HTTPS)
**************************/
app.get('*',function(req, res,next){
  if(req.headers['x-forwarded-proto']!='https') {
        // res.redirect('https://mypreferreddomain.com'+req.url);
      if(req.hostname == 'viruschecker.tokyo') {
        res.redirect(`https://www.${req.hostname}${req.url}`);
      } else {
        res.redirect(`https://${req.hostname}${req.url}`);
        console.log("req.hostname : " + req.hostname);
        console.log("req.url : " + req.url);
      }
  } else {
    if(req.hostname == 'viruschecker.tokyo') {
        res.redirect(`https://www.${req.hostname}${req.url}`);
    }
    next(); /* Continue to other routes if we're not redirecting */  
  }
});

/**************************
* Require For Route
**************************/
// requiring routes
// var shopownerRoutes     = require("./routes/shopowner"),
//     opportunityRoutes   = require("./routes/opportunity"),
//     indexRoutes         = require("./routes/index");
    
var indexRoutes         = require("./routes/index"),
    payRoutes         = require("./routes/pay"),
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
app.use("/pays", payRoutes);
app.use("/users", userRoutes);
// app.use("/shopowners", shopownerRoutes);
// app.use("/opportunitys", opportunityRoutes);

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.render("notfound");
});

/**************************
* Redirect Not Found Page
**************************/
app.get("*", function(req, res) {
    res.render("404"); 
});


/**************************
* Configure For Routes
**************************/
// sitemap({
//   http: 'https',
// //   url: 'www.viruschecker.tokyo',
//   url: '3d54c828380540d6855b9a29eadce06d.vfs.cloud9.ap-northeast-1.amazonaws.com',
//   generate: app,
//   route: {
//     '/': {
//       lastmod: '2020-03-01',
//       changefreq: 'always',
//       priority: 1.0,
//       alternatepages: [
//       {
//         rel: 'alternate',
//         hreflang: 'ja',
//         // href: 'https://www.viruschecker.tokyo/'
//         href: 'https://3d54c828380540d6855b9a29eadce06d.vfs.cloud9.ap-northeast-1.amazonaws.com'
//       }]
//     },
//   },
// }).toFile();

// sitemap({
//     map: {
//         '/foo': ['get'],
//         '/foo2': ['get','post'],
//         '/admin': ['get'],
//         '/backdoor': [],
//     },
//     route: {
//         '/foo': {
//             lastmod: '2014-06-20',
//             changefreq: 'always',
//             priority: 1.0,
//         },
//         '/admin': {
//             disallow: true,
//         },
//         '/backdoor': {
//             hide: true,
//         },
//     },
// }).XMLtoFile();

/**************************
* Configure For Listen (HTTPS)
**************************/
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Coronaviurs start!!");
});

/**************************
* CSV Parser For store japanese people coronaviurus situation.
**************************/
// fs.createReadStream(__dirname + '/public/test3.csv').pipe(csv.parse({columns: true}, function(err, data) {
//     if(err) {
//         console.log("error csvStream: " + err);
//     } else {
//         var dateTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Tokyo"});
//         var fbData = JSON.parse(JSON.stringify(data));
//         var newCoronavirustimelineinjapan = {
//             cornavirusoverallinjapan: fbData,
//             gotDate: dateTime,
//         }        
//         // create a new shopuser and save to DB.
//         Coronavirustimelineinjapan.create(newCoronavirustimelineinjapan, function(err, newlyCreated){
//             if(err) {
//                 console.log(err);
//             } else {
//                 console.log("success store cornavirus to database");
//             }
//         });
//     }
// }));
