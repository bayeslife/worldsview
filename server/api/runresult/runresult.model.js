'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RunResultSchema = new Schema({
  decision: String,
  strategy: String,
  parameters: [{
    parameterName: String,    
    results: []
  }]
});

module.exports = mongoose.model('RunResult', RunResultSchema);