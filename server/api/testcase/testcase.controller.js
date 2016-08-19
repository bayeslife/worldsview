/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /testcases              ->  index
 * POST    /testcases              ->  create
 * GET     /testcases/:id          ->  show
 * PUT     /testcases/:id          ->  update
 * DELETE  /testcases/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var TestCase = require('./testcase.model');

var Event = require('../event/event.controller');

// Get list of testcases
exports.index = function(req, res) {
  var q = TestCase.find();  
  if(req.query.decision){
    q.where( {
      $or: [ {decision: req.query.decision} , 
             {decision: { $exists: false} } ] 
           });
  }
  q.exec(function(err,testcases){
    if(err) { return handleError(res, err); }    
    return res.json(200, testcases);
  });
};

// Get a single testcase
exports.show = function(req, res) {
  TestCase.findById(req.params.id, function (err, testcase) {
    if(err) { return handleError(res, err); }
    if(!testcase) { return res.send(404); }
    return res.json(testcase);
  });
};

// Creates a new testcase in the DB.
exports.create = function(req, res) {
  TestCase.create(req.body, function(err, testcase) {
    req.body.type='Test Case';
    if(err) { return handleError(res, err); }    
    return res.json(201, testcase);
  });
};

// Updates an existing testcase in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  TestCase.findById(req.params.id, function (err, testcase) {
    if (err) { return handleError(res, err); }
    if(!testcase) { return res.send(404); }
    var updated = _.merge(testcase, req.body,function(a,b){
      if(_.isArray(a) && _.isArray(b)){
        return b;
      }
    });
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, testcase);
    });
  });
};

// Deletes a testcase from the DB.
exports.destroy = function(req, res) {
  TestCase.findById(req.params.id, function (err, testcase) {
    if(err) { return handleError(res, err); }
    if(!testcase) { return res.send(404); }
    testcase.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
   console.log(err);
  return res.send(500, err);
}