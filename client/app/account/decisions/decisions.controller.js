'use strict';

angular.module('worldsviewApp').controller('DecisionsCtrl', function ($scope, User, Auth, $stateParams, $location, D3Editor , GuidService, WorldNetwork, DistributionView, TimeSeriesView,ProbabilityService, TimeSeriesService,ModelService, InterpreterService,ComparisonView) {

    $scope.errors = {};

    $scope.evaluation = {'expression':''};

    $scope.viewType='Name';
    $scope.parameterType='Value';

    $scope.decisionId = $stateParams.id;
    $scope.events = [];

    $scope.evaluationEdit=false;
    $scope.testEdit=false;
    $scope.injectionEdit=false;
    $scope.strategyEdit=false;

    $scope.selectedStrategies=[];

    $scope.centerTransform = 'translate('+$scope.width/2+','+$scope.height/2+')';

    $scope.compareEdit=false;

    $scope.simulation = {
      iterations: 10,
      repeats: 10,
      strategy: null
    }

    $scope.networkstate = [];

    $scope.modelEditor = null;
    $scope.testEditor = null;

    $scope.disabledAllEdits = function() {
      $scope.strategyEdit = false;
      $scope.decisionEdit = false;
      $scope.testEdit=false;
      $scope.injectionEdit=false;
      $scope.evaluationEdit=false;
      $scope.compareEdit=false;
    }

    $scope.toggleEdit = function(){
      var edit = !$scope.decisionEdit;
      $scope.disabledAllEdits();
      $scope.decisionEdit = edit;      
    }

    $scope.toggleSimulationConfig = function(){
      var edit = !$scope.simulationconfigEdit;
      $scope.disabledAllEdits();
      $scope.simulationconfig = $scope.simulation.iterations +':'+$scope.simulation.repeats+':'+$scope.getStrategyName($scope.simulation.strategy);
      $scope.simulationconfigEdit = edit;      
    }

    $scope.toggleTests = function(){
        var edit= !$scope.testEdit;
        $scope.disabledAllEdits();
        $scope.testEdit = edit;   

        if($scope.testEdit){
          $scope.testEditor.clear();
          $scope.testEditor.render();
        }
    }

    $scope.toggleStrategies = function(){
      var edit = !$scope.strategyEdit;
      $scope.disabledAllEdits();
      $scope.strategyEdit = edit;
    }

    $scope.toggleInjections = function(){
      var edit=!$scope.injectionEdit;
      $scope.disabledAllEdits();
      $scope.injectionEdit=edit;
    }

    $scope.toggleEvaluation = function(){
       $scope.disabledAllEdits();
      var edit=!$scope.evaluationEdit;      
      $scope.evaluationEdit=edit;
    }

    $scope.toggleCompare = function(){      
      var edit = !$scope.compareEdit;
      $scope.disabledAllEdits();
      $scope.compareEdit = edit;
    }

    $scope.toggleViewType = function(){
      if($scope.viewType.valueOf()==='Name'.valueOf()){
        $scope.viewType='Value';
      }else if($scope.viewType.valueOf()==='Value'.valueOf()){
        $scope.viewType='Expression';
      }else if($scope.viewType.valueOf()==='Expression'.valueOf()){
        $scope.viewType='Name';
      }      
      $scope.modelEditor.refresh();
    }

    $scope.toggleParameterType = function(){
      if($scope.parameterType.valueOf()==='Value'.valueOf()){
        $scope.parameterType='Function';      
      }else if($scope.parameterType.valueOf()==='Function'.valueOf()){
        $scope.parameterType='Value';
      }      
      $scope.networkstate = $scope.network.getNetworkState($scope.parser,$scope.parameterType);    
    }

    $scope.getNodeDisplayValue = function(node){
      try {
        if($scope.viewType.valueOf()==='Name'.valueOf()){
          return node.name
        }else if($scope.viewType.valueOf()==='Value'.valueOf()){
          return node.value.toFixed(3);
        } else if($scope.viewType.valueOf()==='Expression'.valueOf()){
          return node.expression;      
        }
      }catch(exception){
        return '';
      }
    }
    $scope.getNameAsNodeDisplayValue = function(node){
      return node.name;
    }
    
    $scope.nodeRadius = function() { 
      if($scope.viewType.valueOf()==='Name'.valueOf()){
        return 14
      }else 
        return 14;
    }

    $scope.setStrategy = function(strategy) {      
      $scope.simulation.strategy = strategy._id;
    };


    $scope.saveDecision = function() {      
      ModelService.saveDecision($scope.decision);
      $scope.toggleEdit();            
    };

    $scope.saveInjections = function() {      
      ModelService.saveDecision($scope.decision);
      $scope.toggleInjections();      
    };
    $scope.closeInjections = function() {      
      $scope.toggleInjections();      
    };

    $scope.refreshEvents = function() {
      ModelService.getEvent($scope.decisionId,$scope.model,function(){
        $scope.events = model.events;
      })
    }

    $scope.nodename = 'node name';
    //$scope.nodes = [];
    var nodeIndex = 0;
    //$scope.links = [];

    $scope.events = [];

    
    $scope.addNode = function(done) {
      var node;
      var t = $scope.type;
      var color = 1;
      var probabilityNode = true;
      var binaryNode = false;
      
      var node = { name: $scope.nodename, type: $scope.type, color: color, reflexive: false, decision: $scope.decisionId};
      
      $scope.network.addNode(node,$scope.model);  
      
      ModelService.addEvent(node,function(res){
        _.merge(node,res);
        done(node);
      })             
    }  

    $scope.delNode = function(node) {  
      $scope.network.delNode(node);
      ModelService.delEvent(node);        
    }

 

    $scope.addLink = function(source,target,done) {      
      var link = {                             
          sourceId: source._id,
          source: source.nodeIndex,                            
          sourceType: source.type,
          targetId: target._id,
          target: target.nodeIndex,
          targetType: target.type,
          correlation: 0,
          decision: $scope.decisionId
       };

      if(link!=null){
          $scope.network.addLink(link,$scope.model);
          ModelService.addLink(link);
          // $http.post('/api/links', link).success(function(res){
          //     res.source= source.nodeIndex;
          //     res.target= target.nodeIndex;
          //     _.merge(link,res);
          //     done(link);
          // });
        }
    }

    $scope.delLink = function(link) {
        $scope.network.delLink(link);  
        ModelService.delLink(link);            
    } 

    $scope.selectNode = function(node){ 
      $scope.nodename = node.name;
      $scope.selectedNode = node;

      if($scope.compareEdit){
          $scope.updateComparison();
          return;
     }

      $scope.selectedNode.unsaved=true;

      delete $scope.compiled;

      {
        var series = $scope.network.getNodeSeriesAsList(node);
        if($scope.selectedNode.series!=null && $scope.selectedNode.series.length>0 ){
          var timeseriesdata = TimeSeriesService.asTimeSeries(series);
          if(timeseriesdata.length>0)
            TimeSeriesView.render(timeseriesdata);
            $scope.selectedHasSeries=true;

            $scope.sampleValues = [];
            for(var i=0;i<5;i++){
                if(series.length>i)
                  $scope.sampleValues.push(series[i]);
          }
        }
      }


      {
        var list = $scope.network.getNodeOutcomesAsList(node);      
        if($scope.selectedNode.expression!=null && $scope.selectedNode.expression.length>0){
          //var dist = [ {band: 1, frequency: 0.25}, {band: 2, frequency: 0.75} ];
          var dist = ProbabilityService.asDistribution(list);
          if(dist.length>0){
            DistributionView.render(dist);
            $scope.selectedHasDistribution=true;

            $scope.sampleValues = [];
            for(var i=0;i<5;i++){
              if(list.length>i)
                $scope.sampleValues.push(list[i]);
            }
          }
        }
        
      }

    }

  $scope.deselectNode = function(node){
    $scope.nodename = null;
    $scope.selectedNode = null;  

    if($scope.compareEdit){
          $scope.updateComparison();
          return;
     }

    $scope.selectedHasDistribution=false;
    $scope.selectedHasSeries=false;          

    delete node.unsaved;
    
    ModelService.updateEvent(node);

    DistributionView.clear(); 
    TimeSeriesView.clear();   
  }

  $scope.selectTestNode = function(testcase){      
      testcase.unsaved=true;
      $scope.selectTestCase(testcase);
  }
  $scope.deselectTestNode = function(testcase){    
    delete testcase.unsaved;
    $scope.closeTestCase(testcase);
    ModelService.updateTestCase(testcase);
  }

  $scope.selectStrategyNode = function(strategy){       
    $scope.selectStrategy(strategy);

    if($scope.compareEdit){
        var exists = false;
        for(var i=0;i<$scope.selectedStrategies.length;i++){
            if($scope.selectedStrategies[i]._id === strategy._id){
              exists = true;
            }
        }
        if(!exists){
          $scope.selectedStrategies.push(strategy);            
          $scope.updateComparison();
        }
        return;
    }

    strategy.unsaved=true;
  }
  $scope.deselectStrategyNode = function(strategy){    

    if($scope.compareEdit){
        for(var i=0;i<$scope.selectedStrategies.length;i++){
              if($scope.selectedStrategies[i]._id === strategy._id){                
                $scope.selectedStrategies.splice(i,1);
                break;
              }
            }        
        $scope.updateComparison();          
        return;
    }


    delete strategy.unsaved;
    $scope.closeStrategy(strategy);
    ModelService.updateStrategy(strategy);
  }

  $scope.selectLink = function(link){
      $scope.selectedLink = link;
      
  }
   $scope.deselectLink = function(link){
      $scope.selectedLink = null;
      ModelService.updateLink(link);       
   }

    // $scope.getTestCases = function(done){
    //   ModelService.getTestCases($scope.decisionId,$scope.model,function(){       
    //     if(done!=null)
    //       done();
    //   })    
    // }

   $scope.addTestCase = function(done) {
     $scope.selectedTestCase = {name:'Test X', expression: 'something==true', decision: $scope.decision._id};
     var tc = $scope.selectedTestCase;
     ModelService.addTestCase(tc,function(res){
      _.merge(tc,res);
      $scope.testcases.push(tc);      
      done(tc);
     })
   }

   $scope.deleteTestCase= function(testcase,done) {   
     for(var i=0;i<$scope.testcases.length;i++){;          
              if($scope.testcases[i]._id === testcase._id){
                $scope.testcases.splice(i,1);
              }
            }     
      ModelService.delTestCase(testcase);     
      done(); 
   }

   $scope.duplicateTestCase= function(testcase) {   
      ModelService.duplicateTestCase(testcase,function(tc){
        _.merge(testcase,tc);
         $scope.testcases.push(testcase); 
      });       
   }

   $scope.selectTestCase = function(testcase) {
     $scope.selectedTestCase = testcase;
     $scope.tests = testcase.tests;
     $scope.parser = testcase.parser;
   }

  $scope.closeTestCase = function() {  
    $scope.selectedTestCase=null;
  }

    $scope.saveTestCase = function() {  
    var tc = $scope.selectedTestCase;    
      ModelService.updateTestCase($scope.selectedTestCase,function(){
        $scope.selectedTestCase=null;        
      });   
    };

  $scope.addStrategyExpression = function() {
     $scope.selectedStrategy.expressions.push({expression:'foo()=123'});    
   }

  $scope.delStrategyExpression = function(strategyexpression) {
    for(var i=0;i<$scope.selectedStrategy.expressions.length;i++){
      var o = $scope.selectedStrategy.expressions[i];
      if(o.expression.valueOf()===strategyexpression.expression.valueOf()){
        $scope.selectedStrategy.expressions.splice(i,1);
        break;
      }
    }
  }

     $scope.addOverride = function() {
       $scope.selectedTestCase.overrides.push({expression:'foo()=123'});    
     }

    $scope.delOverride = function(override) {
      for(var i=0;i<$scope.selectedTestCase.overrides.length;i++){
        var o = $scope.selectedTestCase.overrides[i];
        if(o.expression.valueOf()===override.expression.valueOf()){
          $scope.selectedTestCase.overrides.splice(i,1);
          break;
        }
      }     
    }

     $scope.addTest = function() {
       $scope.selectedTestCase.tests.push({expression:'foo=123'});    
     }

    $scope.delTest = function(test) {
      for(var i=0;i<$scope.selectedTestCase.tests.length;i++){
        var o = $scope.selectedTestCase.tests[i];
        if(o.expression.valueOf()===test.expression.valueOf()){
          $scope.selectedTestCase.tests.splice(i,1);
          break;
        }
      }     
    }


    $scope.getStrategies = function(){
      ModelService.getStrategies($scope.decisionId,$scope.model,function(){
        $scope.strategies = $scope.model.strategies;  
      })    
    }
    $scope.getStrategyName = function(strategyid){
      var strategy=null;
      if($scope.strategies!=null){
        for(var i=0;i<$scope.strategies.length;i++){
          var s = $scope.strategies[i];
          if(s._id==strategyid)
            strategy=s;
        }      
        if(strategy!=null)
          return strategy.name;
        }
      return null;
    }

    $scope.getStrategyExpression = function(strategyid){
      var strategy=null;
      for(var i=0;i<$scope.strategies.length;i++){
        var s = $scope.strategies[i];
        if(s._id==strategyid)
          strategy=s;
      }      
      if(strategy!=null)
        return strategy.expressions;
      return null;
    }

   $scope.addStrategy = function(done) {
    var s = $scope.selectedStrategy;
    s = {name:'Strategy X', expression: 'something==true', decision: $scope.decision._id};     
     ModelService.addStrategy(s,function(res){
        _.merge(s,res);
        $scope.strategies.push(s);      
        done(s);       
     })
   }

   $scope.deleteStrategy = function(strategy,done) {
     for(var i=0;i<$scope.strategies.length;i++){;          
              if($scope.strategies[i]._id === strategy._id){
                $scope.strategies.splice(i,1);
              }
            }  
      ModelService.delStrategy(strategy,function(){
        if(done)
          done();
      }); 
   }

   $scope.duplicateStrategy = function(strategy) {   
      ModelService.duplicateStrategy(strategy,function(){
        $scope.getStrategies();
      });       
   }

   $scope.selectStrategy = function(strategy) {
     $scope.selectedStrategy = strategy;
   }

  $scope.saveStrategy = function() {      
    ModelService.updateStrategy($scope.selectedStrategy,function(){
      $scope.selectedStrategy=null;      
      $scope.getStrategies();
    });
  };

  $scope.closeStrategy = function() {  
    $scope.selectedStrategy=null;
  }

  $scope.progressTotal = 100;
  $scope.progressCurrent = 0;  
   $scope.runProgress = function(count,total) {        
    $scope.progressCurrent = ((count+1)/total*100);    
  }
  

// $scope.runSimulation = function(){
//     var rp = $scope.runProgress;
//     $scope.simulationRunning=true;    
//     var sim = $scope.simulation;
//     var strategyExpressions = $scope.getStrategyExpression($scope.simulation.strategy);
//     $scope.parser = $scope.network.runSimulation(InterpreterService,strategyExpressions,$scope.simulation.iterations,$scope.simulation.repeats,null,null,$scope.runProgress);      
//   }

  $scope.runSimulation = function(){
    var rp = $scope.runProgress;
    $scope.simulationRunning=true;    
    var sim = $scope.simulation;
    var strategyExpressions = $scope.getStrategyExpression($scope.simulation.strategy);
    $scope.network.runSimulation(InterpreterService,strategyExpressions,$scope.simulation.iterations,$scope.simulation.repeats,null,null,$scope.runProgress,function(parser){
      $scope.parser = parser;  
      $scope.networkstate = $scope.network.getNetworkState($scope.parser,$scope.parameterType);    
      $scope.modelEditor.refresh();
      $scope.simulationRunning=false;
      $scope.addRunResult();
    });
  }

  $scope.runTestCase = function(testcase){
    var strategyExpressions = $scope.getStrategyExpression(testcase.strategy);
    $scope.network.runSimulation(InterpreterService,strategyExpressions,1,1,testcase.overrides,testcase,$scope.runProgress,function(parser){
      testcase.parser = parser;
      $scope.networkstate = $scope.network.getNetworkState(testcase.parser,$scope.parameterType);    
      $scope.tests = testcase.tests;    
      $scope.modelEditor.refresh();
      $scope.parser = testcase.parser;
      $scope.testEditor.restart();
    });
  }

  // $scope.debugSimulation = function(){    
  //   try {
  //     $scope.network.debug(true);
  //     $scope.network.runSimulation(InterpreterService,1,1);    
  //     $scope.network.debug(false);
  //   }catch(exception){
  //     console.log(exception);    
  //   }
  //   D3Editor.refresh();
  // }

  $scope.runTests = function(){
    for(var i=0;i<$scope.testcases.length;i++){
      var testcase = $scope.testcases[i];
      var strategyExpressions = $scope.getStrategyExpression(testcase.strategy);
      $scope.network.runSimulation(InterpreterService,strategyExpressions,1,1,testcase.overrides,testcase,$scope.runProgress,function(parser){
          testcase.parser = parser;  
          $scope.testEditor.restart();
      });      
    }; 
    
  }

  $scope.evaluate = function() {  
    var e = $scope.evaluation.expression;  
    try {  
      $scope.evaluation.result = $scope.parser.eval(e);
    }catch(exception){
      $scope.evaluation.result = exception.message;
    }
  }

  $scope.applyChanges = function(){
    $scope.$apply();
  }

  $scope.addRunResult = function() {
     var runresult = {
        strategy: $scope.simulation.strategy,
        decision: $scope.decision._id,
        parameters: $scope.network.getParameterResults()
      };
      ModelService.addRunResult(runresult);
   }

   $scope.updateComparison = function() {
      ComparisonView.clear();
      if($scope.selectedNode==null || $scope.selectedStrategies.length==0)
        return;

      ModelService.getRunResults($scope.decisionId,function(runresults){
          var r = runresults;
          $scope.runresults = r;

          var data = ProbabilityService.runresultsAsDistribution($scope.selectedNode,$scope.selectedStrategies,$scope.runresults);
          
          var parameters = [];
          parameters.push($scope.selectedNode.name);

          if(data.length>0)
            ComparisonView.render(1600,400,parameters,$scope.selectedStrategies,data);
      });
  }

  ModelService.getModel($scope.decisionId,function(model){
    $scope.model = model;
    $scope.decision = model.decision;
    $scope.strategies = $scope.model.strategies;
    $scope.network = WorldNetwork.newNetwork($scope.model);
    $scope.network.initialize();
    $scope.testcases = $scope.model.testcases;
    if($scope.strategies.length>0)
      $scope.simulation.strategy = $scope.strategies[0]._id;
    $scope.simulationconfig = $scope.simulation.iterations +':'+$scope.simulation.repeats+':'+$scope.getStrategyName($scope.simulation.strategy);

    for(var i=0;i<$scope.model.nodes.length;i++){
      var event = model.nodes[i];      
      event.color= 1;
      event.reflexive = false;
    }
    for(var j=0;j<$scope.model.links.length;j++){
      var link = model.links[j];
      if(link.source==null || link.target==null){
        ModelService.delLink(link);
        $scope.network.delLink(link);
      }
    };

    var testCallbacks = {
      selectNode: $scope.selectTestNode,
      deselectNode: $scope.deselectTestNode,
      selectLink: $scope.selectLink,
      deselectLink: $scope.deselectLink,
      addLink: $scope.addLink,
      delLink: $scope.delLink,
      addNode: $scope.addTestCase,
      delNode: $scope.deleteTestCase,
      getNodeDisplayValue: $scope.getNameAsNodeDisplayValue,
      nodeRadius: $scope.nodeRadius,
      applyChanges: $scope.applyChanges,
    }    
    $scope.testEditor  = D3Editor.newView('#testeditor',$location.absUrl(),$scope.testcases,[],testCallbacks);
    $scope.testEditor.render();    

    var strategyCallbacks = {
      selectNode: $scope.selectStrategyNode,
      deselectNode: $scope.deselectStrategyNode,
      selectLink: $scope.selectLink,
      deselectLink: $scope.deselectLink,
      addLink: $scope.addLink,
      delLink: $scope.delLink,
      addNode: $scope.addStrategy,
      delNode: $scope.deleteStrategy,
      getNodeDisplayValue: $scope.getNameAsNodeDisplayValue,
      nodeRadius: $scope.nodeRadius,
      applyChanges: $scope.applyChanges,
    }    
    $scope.strategyEditor  = D3Editor.newView('#strategyeditor',$location.absUrl(),$scope.strategies,[],strategyCallbacks);
    $scope.strategyEditor.render();    

    var modelCallbacks = {
      selectNode: $scope.selectNode,
      deselectNode: $scope.deselectNode,
      selectLink: $scope.selectLink,
      deselectLink: $scope.deselectLink,
      addLink: $scope.addLink,
      delLink: $scope.delLink,
      addNode: $scope.addNode,
      delNode: $scope.delNode,
      getNodeDisplayValue: $scope.getNodeDisplayValue,
      nodeRadius: $scope.nodeRadius,
      applyChanges: $scope.applyChanges,
    }    
    $scope.modelEditor  = D3Editor.newView('#editor',$location.absUrl(),$scope.network.nodes,$scope.network.links,modelCallbacks);
    $scope.modelEditor.render();    
    
  });

  
});
