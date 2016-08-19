/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /runresults              ->  index
 * POST    /runresults              ->  create
 * GET     /runresults/:id          ->  show
 * PUT     /runresults/:id          ->  update
 * DELETE  /runresults/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var RunResult = require('./runresult.model');


// Get list of runresult
exports.index = function(req, res) {
  var q = RunResult.find();  

  if(req.query.decision){
    q.where( {decision: req.query.decision} );
  }
  q.exec(function(err,runresults){
    //console.log('Number of runresult'+runresults.length);
    if(err) { return handleError(res, err); }    
    return res.json(200, runresults);
  });
};

// Get a single runresult
exports.show = function(req, res) {
  RunResult.findById(req.params.id, function (err, runresult) {
    if(err) { return handleError(res, err); }
    if(!runresult) { return res.send(404); }
    return res.json(runresult);
  });
};

// Creates a new runresult in the DB.
exports.create = function(req, res) {

  var q = RunResult.find();    
  q.where( {
    $and: [ {decision: req.body.decision} , 
            {strategy: req.body.strategy} ] 
         });
  q.exec(function(err,runresults){
    for(var i=0;i<runresults.length;i++){
      //console.log('Remove runresult:'+runresults[i].strategy);
      runresults[i].remove();    
    }
  });

  RunResult.create(req.body, function(err, runresult) {
    req.body.type='RunResult';
    if(err) { return handleError(res, err); }    
    return res.json(201, runresult);
  });
};

// Updates an existing runresult in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  RunResult.findById(req.params.id, function (err, runresult) {
    if (err) { return handleError(res, err); }
    if(!runresult) { return res.send(404); }
    var updated = _.merge(runresultrunresult, req.body,function(a,b){
      if(_.isArray(a) && _.isArray(b)){
        return b;
      }
    });
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, runresult);
    });
  });
};

// Deletes a testcase from the DB.
exports.destroy = function(req, res) {
  RunResult.findById(req.params.id, function (err, runresult) {
    if(err) { return handleError(res, err); }
    if(!runresult) { return res.send(404); }
    runresult.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  console.log(err);
  return res.send(500, err);
}