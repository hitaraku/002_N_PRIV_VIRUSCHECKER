var express     = require("express"),
    router      = express.Router(),
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
            console.log( latestCoronavirustimeline.cornavirusoverall.results);
            res.render("landing", {coronavirustimelines: latestCoronavirustimeline.cornavirusoverall.results, gotDate: latestCoronavirustimeline.gotDate});
        }
   });
});



module.exports = router;