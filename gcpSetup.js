var fs = require("fs");

/**************************
* make googleapifile 
**************************/
var dir = './secret';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

fs.writeFile(process.env.GOOGLE_APPLICATION_CREDENTIALS,process.env.GOOGLE_APPLICATION_CREDENTIALS_FILE, function(err){
  if(err) {
    console.log(err);
  } else {
    console.log("success");
  }
});

