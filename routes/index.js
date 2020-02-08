var express     = require("express"),
    router      = express.Router();
    // passport    = require("passport"),
    // assistant   = require("../middleware/watson_assistant"),
    // User        = require("../models/user");
    
const mCovUrl = 'https://lab.isaaclin.cn/nCoV';


    
// Index Route
router.get("/", function(req, res){
    res.render("landing");
});

module.exports = router;