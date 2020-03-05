/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
const projectId = 'n-priv-viruschecker';
const location = 'global';
const text = '英国（含北爱尔兰）';
var fs = require('fs');

var dir = './secrett';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

fs.writeFile("./secrett/googleapi.json",process.env.GOOGLE_APPLICATION_CREDENTIALS_FILE, function(err){
  if(err) {
    console.log(err);
  } else {
    console.log("success");
  }
});

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
    }
  } catch (error) {
    console.error("error : " + error.details);
  }
}

translateText('zh', 'ja-JP', '瑞士');

console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);

// const translate = require('@vitalets/google-translate-api');

// translate('英国（含北爱尔兰）', {from: 'zh-CN', to: 'en'}).then(res => function(callback) {
//     console.log(res.text);
//     //=> I speak English
//     // console.log(res.from.language.iso);
//     // //=> nl
// }).catch(err => {
//     console.error(err);
// });
// 