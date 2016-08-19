/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /decisions              ->  index
 * POST    /decisions              ->  create
 * GET     /decisions/:id          ->  show
 * PUT     /decisions/:id          ->  update
 * DELETE  /decisions/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Decision = require('./decision.model');

var Event = require('../event/event.controller');

// Get list of decisions
exports.index = function(req, res) {
  var q = Decision.find();  
  if(req.query.name){
    q.where( {name: req.query.name});
  }
  q.exec(function(err,decisions){
  if(err) { return handleError(res, err); }    
    return res.json(200, decisions);
  });
};

// Get a single decision
exports.show = function(req, res) {
  Decision.findById(req.params.id, function (err, decision) {
    if(err) { return handleError(res, err); }
    if(!decision) { return res.send(404); }
    return res.json(decision);
  });
};

// Creates a new decision in the DB.
exports.create = function(req, res) {
  Decision.create(req.body, function(err, decision) {
    req.body.type='Decision';
    if(err) { return handleError(res, err); }    
    return res.json(201, decision);
  });
};

// Updates an existing decision in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Decision.findById(req.params.id, function (err, decision) {
    if (err) { return handleError(res, err); }
    if(!decision) { return res.send(404); }
    var updated = _.merge(decision, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, decision);
    });
  });
};

// Deletes a decision from the DB.
exports.destroy = function(req, res) {

  Event.removeDecision(req.params.id);

  Decision.findById(req.params.id, function (err, decision) {
    if(err) { return handleError(res, err); }
    if(!decision) { return res.send(404); }
    decision.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}