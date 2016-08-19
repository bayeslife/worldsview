'use strict';

angular.module('worldsviewApp')
  .factory('ModelService', function probability($rootScope,$http) {


return {
  getDecision: function(decisionId,model,done) {
    $http.get('/api/decisions/'+decisionId).success(function(decision) {    
      model.decision = decision;
      done();
    });
  },
  getDecisionByName: function(decisionName,done) {
    $http.get('/api/decisions?name='+decisionName).success(function(decisions) {    
      if(done!=null)
        done(decisions[0]._id);
    });
  },
  saveDecision: function(decision){
    $http.put('/api/decisions/'+decision._id, decision);
  },
  getEvents: function(decisionid, model,done) {
      $http.get('/api/events?decision='+decisionid).success(function(events) {        
        model.nodes = events;        
        done();
      });
  },
  addEvent: function(event,done){
    $http.post('/api/events', event).success(function(res){
      done(res);
    });
  },
  delEvent: function(event,done){
    $http.delete('/api/events/'+event._id).success(function(){
      if(done!=null)
        done();
    });
  },
  updateEvent: function(event,done){
    $http.put('/api/events/'+event._id, event);
  },
  
  getLinks: function(decisionId, model,done) {
    $http.get('/api/links?decision='+decisionId).success(function(storedlinks) {
        model.links = storedlinks;
          // for(var j=0;j<storedlinks.length;j++){
          //   var link = storedlinks[j];
          //   // if(!WorldNetwork.addLink(link)){
          //   //   $scope.delLink(link)
          //   // }                  
          // };                
          done();
      });                                     
  },
  addLink: function(link,done){
      $http.post('/api/links', link).success(function(res){
              //res.source= source.nodeIndex;
              //res.target= target.nodeIndex;
              _.merge(link,res);
              if(done)
                done(link);
          })    
  },
  delLink: function(link,done){
    $http.delete('/api/links/' + link._id); 
    if(done!=null){
      done();
    } 
  },
  updateLink: function(link,done){
    $http.put('/api/links/'+link._id, link);
  },

   getTestCases: function(decisionId,model,done) {
      $http.get('/api/testcases?decision='+decisionId).success(function(testcases) {        
        model.testcases = testcases;
        if(done!=null)
          done();
      });
  },
  addTestCase: function(testcase,done){
     $http.post('/api/testcases', testcase).success(function(tc){
        _.merge(testcase,tc); 
          if(done!=null)
            done(testcase);       
     })
  },
  duplicateTestCase: function(testcase,done){
    var newtestcase = {};
     _.merge(newtestcase,testcase); 
     delete newtestcase._id;
     $http.post('/api/testcases', newtestcase).success(function(tc){
        _.merge(newtestcase,tc); 
          if(done!=null)
            done(newtestcase);       
     })
  },
  delTestCase: function(testcase,done){
    $http.delete('/api/testcases/'+testcase._id).then(function(tc){      
      if(done!=null)
          done(tc);
     });
  },
  updateTestCase: function(testcase,done){
    $http.put('/api/testcases/'+testcase._id, testcase).success(function(){
      if(done!=null)
        done();
    }) 
  },

  getStrategies: function(decisionId,model,done) {
      $http.get('/api/strategies?decision='+decisionId).success(function(strategies) {        
        model.strategies = strategies;
        if(done!=null)
          done();
      });
  },
  addStrategy: function(strategy,done){
     $http.post('/api/strategies', strategy).success(function(tc){
        _.merge(strategy,tc); 
          if(done!=null)
            done(strategy);       
     })
  },
  duplicateStrategy: function(strategy,done){
    var newstrategy = {};
     _.merge(newstrategy,strategy); 
     delete newstrategy._id;
     $http.post('/api/strategies', newstrategy).success(function(tc){
        _.merge(newstrategy,tc); 
          if(done!=null)
            done(newstrategy);       
     })
  },
  delStrategy: function(strategy,done){
    $http.delete('/api/strategies/'+strategy._id).then(function(tc){      
      if(done!=null)
          done(tc);
     });
  },
  updateStrategy: function(strategy,done){
    $http.put('/api/strategies/'+strategy._id, strategy).success(function(){
      if(done!=null)
        done();
    }) 
  },


  getRunResults: function(decisionId,done) {
      var path = '/api/runresults?decision='+decisionId;      
      $http.get(path).success(function(runresults) {            
        if(done!=null)
          done(runresults);
      });
  },
  addRunResult: function(runresult,done){
     $http.post('/api/runresults', runresult).success(function(runresult){
          if(done!=null)
            done(runresult);
     })
  },  
  

  getModel: function(decisionid,done) {
    var model = {};
    var t = this;
    t.getDecision(decisionid,model,function(){
          t.getEvents(decisionid,model,function(){
            t.getLinks(decisionid,model,function(){
              t.getTestCases(decisionid,model,function(){
                t.getStrategies(decisionid,model,function(){
                  done(model);  
                }); 
              });              
            });
          });
        })
        return model;
    },
    getModelByName: function(name,done) {
      var intepreter = this;
      this.getDecisionByName(name,function(decisionid){
        intepreter.getModel(decisionid,function(model){
          if(done!=null)
            done(model);
        })
      })
      return {};
    }
 } 
});
