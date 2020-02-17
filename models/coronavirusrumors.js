var mongoose = require("mongoose");

var CoronavirusrumorsSchema = new mongoose.Schema({
    cornavirusrumors: Object,
    gotDate: Date,
});

module.exports = mongoose.model("Coronavirusrumors", CoronavirusrumorsSchema);