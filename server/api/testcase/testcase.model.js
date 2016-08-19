'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TestCaseSchema = new Schema({
  decision: String,
  name: String,
  info: String,
  description: String,
  
  fixed: String,
  x: Number,
  y: Number,

  strategy: String,
  overrides: [{
    expression: String
  }],
  tests: [{
    expression: String,    
    result: Boolean
  }]  ,
  iterations: Number,
  repeats: Number,
  active: Boolean
});

module.exports = mongoose.model('TestCase', TestCaseSchema);