var mongoose = require("mongoose");

var CoronavirustimelineSchema = new mongoose.Schema({
    cornavirusoverall: Object,
    gotDate: Date,
});

module.exports = mongoose.model("Coronavirustimeline", CoronavirustimelineSchema);