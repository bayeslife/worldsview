/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /strategys              ->  index
 * POST    /strategys              ->  create
 * GET     /strategys/:id          ->  show
 * PUT     /strategys/:id          ->  update
 * DELETE  /strategys/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Strategy = require('./strategy.model');

// Get list of strategys
exports.index = function(req, res) {
  var q = Strategy.find();  
  if(req.query.decision){
    q.where( {
      $or: [ {decision: req.query.decision} , 
             {decision: { $exists: false} } ] 
           });
  }
  q.exec(function(err,strategys){
    if(err) { return handleError(res, err); }    
    return res.json(200, strategys);
  });
};

// Get a single strategy
exports.show = function(req, res) {
  Strategy.findById(req.params.id, function (err, strategy) {
    if(err) { return handleError(res, err); }
    if(!strategy) { return res.send(404); }
    return res.json(strategy);
  });
};

// Creates a new strategy in the DB.
exports.create = function(req, res) {
  Strategy.create(req.body, function(err, strategy) {
    req.body.type='Strategy';
    if(err) { return handleError(res, err); }    
    return res.json(201, strategy);
  });
};

// Updates an existing strategy in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Strategy.findById(req.params.id, function (err, strategy) {
    if (err) { return handleError(res, err); }
    if(!strategy) { return res.send(404); }
    var updated = _.merge(strategy, req.body,function(a,b){
      if(_.isArray(a) && _.isArray(b)){
        return b;
      }
    });
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, strategy);
    });
  });
};

// Deletes a strategy from the DB.
exports.destroy = function(req, res) {
  Strategy.findById(req.params.id, function (err, strategy) {
    if(err) { return handleError(res, err); }
    if(!strategy) { return res.send(404); }
    strategy.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}