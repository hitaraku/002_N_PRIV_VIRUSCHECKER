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
    Coronavirustimelineinjapan = require("./models/coronavirustimelineinjapan"),
    // Coronavirusrumors       = require("./models/coronavirusrumors"),
    dateFormat  = require('dateformat'),
    https             = require("https"),
    fs                = require("fs"),
    csv               = require("csv"),
    cron = require('node-cron');
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
console.log("connecturl: " + connecturl);

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
* CSV Parser
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
