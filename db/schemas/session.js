var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var sessionSchema = new Schema({
  userId : String,
  startTime : { type : Date, required: false },
  endTime : { type : Date, required: false }
});

var Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
