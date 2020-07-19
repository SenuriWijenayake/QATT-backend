var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var UESRawSchema = new Schema({
  userId : String,
  allAnswers : { type : Array , "default" : [] }
});

var UESRaw = mongoose.model('UESRaw', UESRawSchema);

module.exports = UESRaw;
