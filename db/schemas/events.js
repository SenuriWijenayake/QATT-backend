var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var eventSchema = new Schema({
  userId : String,
  timestamp : { type : Date, default: Date.now }
});

var Event = mongoose.model('Event', eventSchema);

module.exports = Event;
