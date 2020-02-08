var express       = require("express"), 
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
    fs             = require("fs");
    // fileUpload = require('express-fileupload');
    // seedDB        = require("./seeds");
    
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
* Mongoose Connection
**************************/
// Get content from file
var contents = fs.readFileSync("./secret/password.json");
// Define to JSON type
var jsonContent = JSON.parse(contents);
var connecturl = jsonContent.mongoose_connection;
mongoose.connect(connecturl);

/**************************
* Configure for API, css, ejs...
**************************/
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

/**************************
* Configure For Routes
**************************/
app.use("/", indexRoutes);
// app.use("/shopowners", shopownerRoutes);
// app.use("/opportunitys", opportunityRoutes);

/**************************
* Configure For Listen (HTTP)
**************************/
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Coronaviurs start!!");
});


/**************************
* Get Data From CoronaVirus
**************************/