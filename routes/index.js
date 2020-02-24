var express     = require("express"),
    router      = express.Router(),
    passport    = require("passport"),
    Coronavirustimeline = require("../models/coronavirustimeline");
    // passport    = require("passport"),
    // assistant   = require("../middleware/watson_assistant"),
    // User        = require("../models/user");
    
// // Index Route
// router.get("/", function(req, res){
//     res.render("landing");
// });
/*************************
* Configure for Route
**************************/
router.get("/", function(req, res){
    // For show all opportunitys
    Coronavirustimeline.findOne({}).sort({ gotDate: 'desc'}).exec(function(err, latestCoronavirustimeline){
        if(err) {
            console.log(err);
        } else {
            // console.log( latestCoronavirustimeline.cornavirusoverall.results);
            res.render("landing", {coronavirustimelines: latestCoronavirustimeline.cornavirusoverall.results, gotDate: latestCoronavirustimeline.gotDate});
        }
   });
});

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


module.exports = router;