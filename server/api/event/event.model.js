'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
  decision: String,
  type: String,
  name: String,
  info: String,
  active: Boolean,  
  script: String,
  expression: String,
  series: String,
  fixed: Number,
  x: Number,
  y: Number,
  outcomes: [{
    value: Number
  }]
});

module.exports = mongoose.model('Event', EventSchema);