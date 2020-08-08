var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var voteSchema = new Schema({
  userId : String,
  userPicture : { type : String , required: false },
  userName : String,
  questionId : String,
  socialPresence : Boolean,
  structure : Boolean,
  timestamp : { type : Date, default: Date.now },
  vote : String
});

var Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
