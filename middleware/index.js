var Coronavirustimeline = require("../models/coronavirustimeline"),
    Countrydictionary = require("../models/countrydictionary");

// For Middleware Array    
var middlewareObj = {}
    

/**
 * This Section is translate and mongoose store function *
**/
const projectId = 'n-priv-viruschecker';
const location = 'global';

// Imports the Google Cloud Translation library
const {TranslationServiceClient} = require('@google-cloud/translate');

// Instantiates a client
const translationClient = new TranslationServiceClient();
async function translateText(sourceString, targetString, textString) {

    // Construct request
    const request = {
        parent: `projects/${projectId}/locations/${location}`,
        contents: [textString],
        mimeType: 'text/plain', // mime types: text/plain, text/html
        sourceLanguageCode: sourceString,
        targetLanguageCode: targetString,
    };

  try {
    // Run request
    const [response] = await translationClient.translateText(request);

    for (const translation of response.translations) {
      console.log(`Translation: ${translation.translatedText}`);
                                
      if(targetString == "ja-JP") {
        // For date
        var dateTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Tokyo"});
                            
        var newCountrydictionary = {
            chinese: textString,
            japanese: translation.translatedText,
            // english: String,
            // spanish: String,
            gotDate: dateTime,
        };       

        // create a new Countrydictionary to DB.
        Countrydictionary.create(newCountrydictionary, function(err, newlyCreated){
            if(err) {
                console.log("error create translate jp-JP: " + err);
            } else {
                console.log("success store dictionary to database :" + newlyCreated);
            }
        });
      } else if(targetString == "en") {
          const filter = { chinese: textString };
          const update = { english: translation.translatedText };
          console.log("textString : " + textString);
          console.log("english translation.translatedText : " + translation.translatedText);
          Countrydictionary.findOneAndUpdate(filter, update).exec(function(err, a){
                if(err) {
                    console.log("error create translate en: " + err);
                } else {
                    // none
                }
              });
      } else if(targetString == "es") {
          const filter = { chinese: textString };
          const update = { spanish: translation.translatedText };
          console.log("textString : " + textString);
          console.log("spanish translation.translatedText : " + translation.translatedText);
          Countrydictionary.findOneAndUpdate(filter, update).exec(function(err, a){
                if(err) {
                    console.log("error create translate es: " + err);
                } else {
                    // none
                }
              });
      }
    }
  } catch (error) {
    console.error(error.details);
  }
}

/**
 * Middle ware for dictionary *
**/
middlewareObj.namedic = function(req, res, next) {
        // For get all coronaCountryname
    Coronavirustimeline.findOne({}).sort({ gotDate: 'desc'}).exec(function(err, latestCoronavirustimeline){
        if(err) {
            console.log(err);
        } else {
            /*
            * This Result is from china goverment data
            */
            var coronavirustimelines = latestCoronavirustimeline.cornavirusoverall.results;
            var gotDate = latestCoronavirustimeline.gotDate;
            
            var arrayCorona = [];
            coronavirustimelines.forEach(function(coronavirustimeline, i){
                arrayCorona.push(coronavirustimeline.countryName);
            });
            // 重複を削除したリスト
            var repeatDeleteArray = arrayCorona.filter(function (x, i, self) {
                return self.indexOf(x) === i;
            });
            
            /*
            * This Result is from My Mongo database.
            */
            Countrydictionary.find({}).exec(function(err, latestCountrydictionarys) {
                if(err) {
                    console.log(err);
                } else {
                    var mongoDicArray = [];
                    for(let i = 0; i < latestCountrydictionarys.length; i++) {
                        mongoDicArray.push(latestCountrydictionarys[i].chinese);
                    }
                    console.log(mongoDicArray);
                    
                    // Find alrady stored dictionary
                    for(let i = 0; i < repeatDeleteArray.length; i++) {
                        const found = mongoDicArray.find(element => element == repeatDeleteArray[i]);
                        if(found != undefined) {
                            // none
                            // console.log("found : " + found);
                        } else {
                            console.log("not found : " + repeatDeleteArray[i]);
                            
                            /*
                            * not find string store to mongo database
                            */
                         
                            // For Create JP
                            translateText('zh-CN', 'ja-JP', repeatDeleteArray[i]);

                            // For English
                            translateText('zh-CN', 'en', repeatDeleteArray[i]);
            
                            // For Spanish
                            translateText('zh-CN', 'es', repeatDeleteArray[i]);
                        }
                    }
                }
            });
        }
    });
}

middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "ログインしてください。");
    res.redirect("/login");
}
// var middlewareObj = {}

// middlewareObj.isLoggedIn = function(req, res, next) {
//     if(req.isAuthenticated()) {
//         return next();
//     }
//     req.flash("error", "ログインしてください。");
//     res.redirect("/login");
// }

module.exports = middlewareObj;
