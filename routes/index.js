var express     = require("express"),
    router      = express.Router(),
    https       = require("https"),
    fs                = require("fs"),
    passport    = require("passport"),
    Wptimeline = require("../models/wptimeline"),
    Coronavirustimeline = require("../models/coronavirustimeline"),
    Countrydictionary = require("../models/countrydictionary"),
    Coronavirustimelineinjapan = require("../models/coronavirustimelineinjapan");
    // passport    = require("passport"),
    // assistant   = require("../middleware/watson_assistant"),
    // User        = require("../models/user");

/*************************
* Configure for Route
**************************/
router.get("/", function(req, res){
    // For show all opportunitys
    Coronavirustimeline.findOne({}).sort({ gotDate: 'desc'}).exec(function(err, latestCoronavirustimeline){
        if(err) {
            console.log(err);
        } else {
            Wptimeline.findOne({}).sort({ gotDate: 'desc'}).exec(function(err, latestWptimeline){ 
                if(err) {
                    console.err("Wptimeline err: " + err);
                } else {
                    Countrydictionary.find({}).exec(function(err, latestCountrydictionarys) {
                        if(err) {
                            console.log(err);
                        } else {
                            res.render("landing", {
                                wptimelines: latestWptimeline.wpPostsAll, 
                                coronavirustimelines: latestCoronavirustimeline.cornavirusoverall.results, 
                                countrydictionarys: latestCountrydictionarys,
                                gotDate: latestCoronavirustimeline.gotDate
                            });
                        }
                    });
                }
            });
            // res.render("landing", {coronavirustimelines: latestCoronavirustimeline.cornavirusoverall.results, gotDate: latestCoronavirustimeline.gotDate});
        }
    });
});

// In Japan
router.get("/japan", function(req, res){
    // For show all opportunitys
    Coronavirustimelineinjapan.findOne({}).sort({ gotDate: 'desc'}).exec(function(err, latestCoronavirustimeline){
        if(err) {
            console.log(err);
        } else {
            // console.log( "array: " + latestCoronavirustimeline.cornavirusoverallinjapan);
            res.render("japan", {coronavirustimelinesinjapan: latestCoronavirustimeline.cornavirusoverallinjapan, gotDate: latestCoronavirustimeline.gotDate});
            // console.log( latestCoronavirustimeline.cornavirusoverall.results);
        }
   });
});

// For Sitemap
// router.get('/sitemap.xml', (req, res) => {
//   res.set('Content-Type', 'text/xml');
//   res.send( fs.readFileSync(require('path').resolve(__dirname, '../sitemap.xml'), "utf8"));
// });

/* login route */
// router.get('/login',
//   function(req, res){
//     res.render('login');
//   });

// router.get('/login/facebook',
//   passport.authenticate('facebook'));

// router.get('/return', 
//   passport.authenticate('facebook', { failureRedirect: '/login' }),
//   function(req, res) {
//     res.redirect('/');
//   });

// router.get('/profile',
//   require('connect-ensure-login').ensureLoggedIn(),
//   function(req, res){
//     res.render('profile', { user: req.user });
//   });

// Define routes.
router.get('/login', function(req, res){
    res.render('login');
});

router.get('/login/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
  })
);

router.get('/return', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
  res.redirect('/pays');
});

router.get('/profile', require('connect-ensure-login').ensureLoggedIn(), function(req, res){
  res.render('profile', { user: req.user });
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/pays');
});

module.exports = router;