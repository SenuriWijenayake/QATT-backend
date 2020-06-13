var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var answerSchema = new Schema({
  userId : String,
  questionId: Number,
  oldAnswer : String,
  oldConfidence : Number,
  oldComment: String,
  newAnswer : String,
  newConfidence : Number,
  newComment: String,
  submitTime : { type : Date, required: false, default: Date.now },
  editTime : { type : Date, required: false, default: Date.now }
});

var Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
