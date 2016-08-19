'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DecisionSchema = new Schema({
  name: String,
  info: String,
  description: String,
  active: Boolean,
  injections: String
});

module.exports = mongoose.model('Decision', DecisionSchema);