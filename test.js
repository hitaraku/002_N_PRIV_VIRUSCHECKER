/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
const projectId = 'n-priv-viruschecker';
const location = 'global';
const text = '英国（含北爱尔兰）';

// Imports the Google Cloud Translation library
const {TranslationServiceClient} = require('@google-cloud/translate');

// Instantiates a client
const translationClient = new TranslationServiceClient();
async function translateText() {
  // Construct request
  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: 'text/plain', // mime types: text/plain, text/html
    sourceLanguageCode: 'zh',
    targetLanguageCode: 'ja-JP',
  };

  try {
    // Run request
    const [response] = await translationClient.translateText(request);

    for (const translation of response.translations) {
      console.log(`Translation: ${translation.translatedText}`);
    }
  } catch (error) {
    console.error(error.details);
  }
}

translateText();

