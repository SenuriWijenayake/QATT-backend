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
  firstVisit : { type : Boolean , "default" : true },
  completedComments : { type : Boolean , "default" : false },
  completedVotes : { type : Boolean , "default" : false },
  order: { type : Array , "default" : [] },
  code : {type : String, required: false}
});

var User = mongoose.model('User', userSchema);

module.exports = User;
