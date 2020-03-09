var express     = require("express"),
    router      = express.Router(),
    https       = require("https"),
    middleware  = require("../middleware"),
    fs                = require("fs");
    // passport    = require("passport"),
    // assistant   = require("../middleware/watson_assistant"),
    // User        = require("../models/user");
   
// For payjp 
const payjp = require('payjp')('sk_test_9ecbcce9de8ff31e81709695');

/*************************
* Configure for Route
**************************/
router.get("/", middleware.isLoggedIn, function(req, res) {
    res.render("pays/index"); 
});

router.post('/paied', middleware.isLoggedIn, (req, res) => {
    // console.log("req.body.payjp_token : " + req.body.payjp_token);
    payjp.charges.create({
      card: req.body.payjp_token,
      amount: 1000,
      currency: 'jpy',
      // tenant: "ten_xxx" // PAY.JP Platformでは必須
    }).then(console.log).catch(console.error);
    res.render("pays/paied");
});

module.exports = router;