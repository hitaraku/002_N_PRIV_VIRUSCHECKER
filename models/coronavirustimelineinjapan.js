var mongoose = require("mongoose");

var CoronavirustimelineinjapanSchema = new mongoose.Schema({
    cornavirusoverallinjapan: Object,
    gotDate: Date,
});

module.exports = mongoose.model("Coronavirustimelineinjapan", CoronavirustimelineinjapanSchema);