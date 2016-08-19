'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StrategySchema = new Schema({
  decision: String,
  name: String,
  info: String,
  description: String,  
  expression: String,
  expressions: [{
    expression: String
  }],
  active: Boolean,
  fixed: String,
  x: Number,
  y: Number
});

module.exports = mongoose.model('Strategy', StrategySchema);