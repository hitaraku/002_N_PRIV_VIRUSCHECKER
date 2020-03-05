const mongoose = require("mongoose");

const CoronavirustimelineSchema = new mongoose.Schema({
    cornavirusoverall: Object,
    gotDate: Date,
});

module.exports = mongoose.model("Coronavirustimeline", CoronavirustimelineSchema);