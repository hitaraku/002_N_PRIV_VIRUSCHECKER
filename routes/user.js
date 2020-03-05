var express     = require("express"),
    router      = express.Router(),
    User   = require("../models/user"),
    mongoose = require("mongoose"),
    dateFormat = require('dateformat');

/**************************
* Configure for Route
**************************/
router.get("/", require('connect-ensure-login').ensureLoggedIn(), function(req, res){
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