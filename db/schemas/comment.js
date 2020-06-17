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
  replies : { type : Boolean , required: false, "default" : false },
  isReply : { type : Boolean , "default" : false },
  parentComment : { type : String, required: false },
  upVotes : { type : Number , required: true, "default" : 0 },
  downVotes : { type : Number , required: true, "default" : 0 },
  totalVotes : { type : Number , required: true, "default" : 0 }
});

var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
