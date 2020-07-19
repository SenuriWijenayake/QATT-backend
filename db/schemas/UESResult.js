var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var UESResultSchema = new Schema({
  userId : String,
  FA: Number,
  PU: Number,
  AE: Number,
  RW: Number,
  total: Number
});

var UESResult = mongoose.model('UESResult', UESResultSchema);

module.exports = UESResult;
