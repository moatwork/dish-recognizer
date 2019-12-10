//
// Photo analysis function using Azure Cognitive Service Vision API
// Ben Coleman, Aug 2018
//
const http = require('./simple-http.js');

const VISION_API_KEY = process.env.VISION_API_KEY;
//const VISION_API_REGION = process.env.VISION_API_REGION || "westeurope"
const VISION_API_ENDPOINT = `https://dish1.cognitiveservices.azure.com/customvision/v3.0/Prediction/28d8ff9b-1770-4b47-ac91-e24128a6b36d/classify/iterations/Iteration1/url?projectId=28d8ff9b-1770-4b47-ac91-e24128a6b36d&publishedName=Iteration1`;

module.exports = function (context, blobTrigger) {
  context.log("### New photo uploaded, starting analysis...");

  // Call cognitive service vision API
  // Post simple JSON object with the url of the image and put the key in the headers
  http.postJSON(
    VISION_API_ENDPOINT, 
    { 'url': context.bindingData.uri }, 
    { 'Prediction-Key': VISION_API_KEY },
    {'Content-Type': "application/json"}
  )
  .then(resp => {
    context.log("### Cognitive API called successfully");
    context.log("Results:");
    results.predictions.forEach(predictedResult => {
      context.log(`\t ${predictedResult.tagName}: ${(predictedResult.probability * 100.0).toFixed(2)}%`);
    });
    context.log("### That looks a bit like: "+resp.predictions.text);
    context.log("### Id: "+JSON.stringify(resp.id));

    // We want to inject the original image URL into our result object
    // Mutate the object and insert extra properties used by viewer app
    resp.srcUrl = context.bindingData.uri;
    resp.timestamp = new Date().getTime();
    resp.dateTime = new Date().toISOString();

    // Saving result to blob is very easy with Functions, we just assign the output variable
    // We need to convert the resp back to JSON string
    context.bindings.outputBlob = JSON.stringify(resp);
    context.done();
    context.log("### Function completed");
  })
  .catch(err => {
    // Error and general badness happened
    context.log("### Error! Cognitive API call failed!");
    context.log(VISION_API_ENDPOINT);
    context.log(context.bindingData.uri);
    context.log(err.message || "");
    context.done();    
  })
};