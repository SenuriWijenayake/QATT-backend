var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var commentSchema = new Schema({
  userId : String,
  userPicture : String,
  userName : String,
  questionId : String,
  socialPresence : Boolean,
  structure : Boolean,
  timestamp : { type : Date, default: Date.now },
  order : Number,
  text : String,
  replies : { type : Array , required: false, "default" : [] }
});

var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
