var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  id: String,
  name: {type : String, required: false},
  email: String,
  password: String,
  gender: String,
  age: Number,
  education: String,
  field : String,
  structure : Boolean,
  socialPresence : Boolean,
  genderSpecified : {type : String, required: false},
  profilePicture : {type : String, required: false},
  firstVisit : Boolean
});

var Result = mongoose.model('User', userSchema);

module.exports = Result;
