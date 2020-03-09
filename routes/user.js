var express     = require("express"),
    router      = express.Router(),
    User   = require("../models/user"),
    mongoose = require("mongoose"),
    middleware  = require("../middleware"),
    dateFormat = require('dateformat');

/**************************
* Configure for Route
**************************/
router.get("/", middleware.isLoggedIn, function(req, res){
    // For show all cards
    User.find({}, function(err, allUsers){
        if(err) {
            console.log(err);
        } else {
            res.render("users/index", {users: allUsers});
        }
    });
});

module.exports = router;