var mongoose = require("mongoose");

var CountrydictionarySchema = new mongoose.Schema({
    chinese: String,
    japanese: String,
    english: String,
    spanish: String,
    gotDate: Date,
});

module.exports = mongoose.model("Countrydictionary", CountrydictionarySchema);