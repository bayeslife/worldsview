/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /events              ->  index
 * POST    /events              ->  create
 * GET     /events/:id          ->  show
 * PUT     /events/:id          ->  update
 * DELETE  /events/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Event = require('./event.model');

// Get list of events
exports.index = function(req, res) {
  //Event.find(function (err, events) {
  var q = Event.find();  
  if(req.query.decision){
    q.where( {
      $or: [ {decision: req.query.decision} , 
             {decision: { $exists: false} } ] 
           });
  }
  q.exec(function(err,events){
    if(err) { return handleError(res, err); }    
    return res.json(200, events);
  });
};

// Get a single event
exports.show = function(req, res) {
  Event.findById(req.params.id, function (err, event) {
    if(err) { return handleError(res, err); }
    if(!event) { return res.send(404); }
    return res.json(event);
  });
};

// Creates a new event in the DB.
exports.create = function(req, res) {
  //req.body.type='event';
  //console.log(req.body);
  Event.create(req.body, function(err, event) {
    
    if(err) {       
      return handleError(res, err); 
    }    
    return res.json(201, event);
  });
};

// Updates an existing event in the DB.
exports.update = function(req, res) {

  if(req.body._id) { delete req.body._id; }
  Event.findById(req.params.id, function (err, event) {
    if (err) { return handleError(res, err); }
    if(!event) { return res.send(404); }
    var updated = _.merge(event, req.body,function(a,b){
      if(_.isArray(a) && _.isArray(b)){
        return b;        
      }
    });
    
    updated.save(function (err) {
      if (err) { 
        console.log(err);
        return handleError(res, err); }
      return res.json(200, event);
    });
  });
};

// Deletes a event from the DB.
exports.destroy = function(req, res) {
  Event.findById(req.params.id, function (err, event) {
    if(err) { return handleError(res, err); }
    if(!event) { return res.send(404); }
    event.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

// Deletes a event from the DB.
exports.removeDecision = function(decisionId) {
  var q = Event.find();
  q.where( {decision: decisionId} );
  
  q.exec(function(err,events){
    console.log('Removing events:'+ events.length);
    if(!err) { 
      events.forEach(function(event){
          event.remove();
      });
    }
  });
};

function handleError(res, err) {
  return res.send(500, err);
}