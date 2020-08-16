var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var notificationSchema = new Schema({
  userId : String,
  type : String,
  content : String,
  timestamp : { type : Date, default: Date.now }
});

var Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
