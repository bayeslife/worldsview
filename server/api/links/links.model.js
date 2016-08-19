'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LinkSchema = new Schema({
	decision: String,
	sourceId: String,
	sourceType: String,
	targetId: String,
	targetType: String,
	correlation: Number,
	left: Boolean,
	right: Boolean,
	expression: String
});

module.exports = mongoose.model('Link', LinkSchema);