const mongoose = require("mongoose");

const CoronavirusrumorsSchema = new mongoose.Schema({
    cornavirusrumors: Object,
    gotDate: Date,
});

module.exports = mongoose.model("Coronavirusrumors", CoronavirusrumorsSchema);