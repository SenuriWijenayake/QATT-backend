var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var answerSchema = new Schema({
  userId : String,
  socialPresence : Boolean,
  structure: Boolean,
  questionId: String,
  oldAnswer : String,
  oldConfidence : Number,
  oldComment: String,
  newAnswer : { type : String, required: false},
  newConfidence : { type : Number, required: false},
  newComment: { type : String, required: false},
  submitTime : { type : Date, required: false, default: Date.now },
  editTime : { type : Date, required: false, default: Date.now }
});

var Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
