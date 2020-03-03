var mongoose = require("mongoose");

var WptimelineSchema = new mongoose.Schema({
    wpPostsAll: Object,
    gotDate: Date,
});

module.exports = mongoose.model("Wptimeline", WptimelineSchema);