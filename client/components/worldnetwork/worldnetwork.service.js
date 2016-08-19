'use strict';

angular.module('worldsviewApp')
  .factory('WorldNetwork', function WorldNetwork($rootScope,responsivenessService) {

    // Public API here
    return {
     
      newNetwork: function(model){

        return {  
          decision: model.decision,
          nodes: model.nodes,
          links: model.links,
          nodeIndex: 0,

          initialize: function() {
            this.nodeIndex =0;
          
            for(var i=0;i<this.nodes.length;i++){;          
                var n = this.nodes[i];
                n.nodeIndex=this.nodeIndex++;            
            }
            for(var i=0;i<this.links.length;i++){;          
                var l = this.links[i];
                for(var j=0;j<this.nodes.length;j++){
                  var n = this.nodes[j];
                  if(n._id == l.sourceId)
                    l.source=n.nodeIndex;
                  if(n._id == l.targetId)
                    l.target=n.nodeIndex;
                }
            }
          },
        
          getNodes: function() {
            return this.nodes;
          },
          getLinks: function() {
            return this.links;
          },

          addNode: function(node){  
            node.nodeIndex = this.nodeIndex++;      
            node.outcomes=[];
            this.nodes.push(node);
          },   
          delNode: function(node){
            for(var i=0;i<this.nodes.length;i++){;          
              if(this.nodes[i]._id === node._id){
                this.nodes.splice(i,1);
              }
            }            
          }, 
          addLink: function(link){
            var s,t;
            for(var i=0;i< this.nodes.length;i++){
              if(this.nodes[i]._id === link.sourceId)
                s = this.nodes[i];
              if(this.nodes[i]._id === link.targetId)
                t = this.nodes[i];
            }
            if(s!=null && t !=null){

              link.source = s.nodeIndex;
              link.target = t.nodeIndex;
              link.left = false;
              link.right = true;
              this.links.push(link);          
              return true;
            }else {
              return false;         
            }
          },
          setupLink: function(link){
            var s,t;
            for(var i=0;i< nodes.length;i++){
              if(nodes[i]._id === link.sourceId)
                s = nodes[i];
              if(nodes[i]._id === link.targetId)
                t = nodes[i];
            }
          },
          delLink: function(link){            
            for(var i=0;i<this.links.length;i++){
              var l = this.links[i];
              if(l.sourceId===link.sourceId && l.targetId===link.targetId){   
               this.links.splice(i,1);                     
              }else {                          
              }
            }            
          },

          computeSourceNodes: function(node){
            return this.computeSourceNodesFromLinks(node);        
          },
         
          computeSourceNodesFromLinks: function(node){
            var sourceNodes = [];
            for(var i=0;i < this.links.length;i++){
              var l = this.links[i];
              if(l.targetId == node._id){                
                for(var j=0;j < this.nodes.length;j++){
                  var candidate = this.nodes[j];
                  if(l.sourceId == candidate._id)
                    sourceNodes.push(this.nodes[j]);
                }   
              }
            }
            return sourceNodes;
          },

          computeSourceLinks: function(node){
            var sourceLinks = [];
            for(var i=0;i < this.links.length;i++){
              var l = this.links[i];
              if(l.targetId == node._id){
                    sourceLinks.push(l);        
              }
            }
            return sourceLinks;      
          },

          getSiblings: function(node){
            var siblings = [];        
            var parentNode = null;                
            for(var i=0;i < this.links.length;i++){
              var l = this.links[i];
              if(l.targetId == node._id){                
                for(var j=0;j < this.nodes.length;j++){
                  var candidate = nodes[j];
                  if(l.sourceId == candidate._id)
                    parentNode = candidate;
                }   
              }
            }
            if(parentNode!=null){
              //console.log("parent node:"+parentNode.name);
              for(var i=0;i < this.links.length;i++){
                var l = this.links[i];
                //console.log("link targetid:"+l.targetId)
                if(l.sourceId == parentNode._id){                
                  for(var j=0;j < this.nodes.length;j++){
                    var candidate = this.nodes[j];
                    //console.log('candidate:'+candidate.name);
                    if(l.targetId == candidate._id && candidate._id!=node._id)                  
                      siblings.push(candidate);
                  }   
                }
              }          
            }
            return siblings;
          },

          getNode: function(nodeId){            
                for(var j=0;j<this.nodes.length;j++){
                  if(this.nodes[j]._id==nodeId){
                    return nodes[j];    
                  }
                } 
            },

          getNodeByName: function(nodeName){            
                for(var j=0;j<nodes.length;j++){
                  if(this.nodes[j].name.valueOf()==nodeName.valueOf()){
                    return this.nodes[j];    
                  }
                } 
            },

          injectDependencies: function(parser) {                           
            if(this.decision.injections!=null)
              parser.eval(this.decision.injections)            
          },
          

          getNetworkState: function(parser,parameterType) {
            var res = [];
            _.each(parser.scope,function(value,key){
              if(parameterType==='Value'){
                if(typeof value ===  'number' || typeof value === 'boolean'){
                  res.push( {key: key, val: value});
                }
              }else {
                if(typeof value ===  'function'){
                  try {
                    if(key!=='normalDist'){
                      var v = parser.eval(key+'()');
                      
                      res.push( {key: key, val: v});
                    }
                  }catch(exception){   
                                
                  }
                }
              }
            });          
            return res;  
          },          
         
          computeOutcome: function(parser){                  
            for(var i=0;i<this.nodes.length;i++){
              var node = this.nodes[i];
              node.computed=false; 
              node.value = '';         
              node.exception=null;
            }
            for(var i=0;i<this.links.length;i++){
              var link = this.links[i];              
              link.value = false;   
              link.exception=null;      
            }
            var cntNodesToCompute = this.nodes.length;
            var cntPreviousNodesToCompute;
            do {
              cntPreviousNodesToCompute = cntNodesToCompute;
              for(var i=0;i<this.nodes.length;i++){
                var node = this.nodes[i];
                if(!node.computed){
                  if(this.canComputeNode(node,parser)){
                    this.computeNodeOutcome(node,parser);
                    node.computed=true;                
                  }
                }
              }
              cntNodesToCompute = this.countNodesToCompute();
            } while(cntNodesToCompute>0 && cntNodesToCompute!=cntPreviousNodesToCompute);
            return parser;
          },

          

          countNodesToCompute: function(){
            var cnt = 0;
            for(var i=0;i<this.nodes.length;i++){
                var node = this.nodes[i];
                if(!node.computed)
                  cnt++;
            }
            return cnt;
          },

          canComputeNode: function(node,parser){ 
              var sourceNodes = this.computeSourceNodes(node,parser);
              for(var i=0;i<sourceNodes.length;i++){
                var sourceNode = sourceNodes[i];          
                if(!sourceNode.computed)
                  return false
              }
              var sourceLinks = this.computeSourceLinks(node,parser);
              for(var i=0;i<sourceLinks.length;i++){
                var link = sourceLinks[i];          
                if(!this.computeLinkOutcome(link,parser))
                  return false;
              }
              return true;
          },

          computeNodeOutcome: function(node,parser){   
            //console.log('Computing Node:'+node.name);

            node.exception=null;
            {              
              if(node.script){
                try {
                  parser.eval(node.script);            
                }catch(exception){
                  node.value=exception;
                  node.exception='Exception computing node expression['+node.script+'] is ['+exception+']';
                  //throw 'Exception computing node expression['+node.script+']['+exception+']';                  
                }
              }
            }            
          },

          captureOutcome: function(parser){                  
            for(var i=0;i<this.nodes.length;i++){
              this.captureNodeOutcome(this.nodes[i],parser);
            }            
          },

          captureSeries: function(parser){                  
            for(var i=0;i<this.nodes.length;i++){
              this.captureNodeSeriesOutcome(this.nodes[i],parser);
            }
          },

          captureNodeOutcome: function(node,parser){   
            //console.log('Capturing Node:'+node.name);
            
            if(node.expression && node.expression.length>0){
              try {
                // if(node.compiledExpression==null)
                //   node.compiledExpression= math.compile(node.expression);
                // node.value = node.compiledExpression.eval();                
                node.value = parser.eval(node.expression);
              }catch(exception){
                node.value=exception;
              }
              node.outcomes.push({value: node.value});
            }      
          },

          captureNodeSeriesOutcome: function(node,parser){   
            //console.log('Capturing Node Series Outcome:'+node.name);
            
            if(node.series && node.series.length>0){
              try {
                node.value = parser.eval(node.series);                
              }catch(exception){
                node.value=exception;
              }
              node.seriesData.push({value: node.value});
            }
          },

          computeLinkOutcome: function(link,parser){  
            link.value = false;
            if(link.expression){          
              try {
                link.value = parser.eval(link.expression);            
                //console.log('Computing Link:'+link.expression+' is '+link.value);     
              }catch(exception){
                link.exception='Exception Computing Link['+link.expression+'] is ['+exception+']';
                //throw 'Exception Computing Link:'+link.expression+' is '+exception;
                //link.value=exception;
              }
            }
            return link.value;
          },

          clearOutcomes: function(){ 
            for(var i=0;i<this.nodes.length;i++){
              var node = this.nodes[i];          
              node.outcomes = [];         
              node.seriesData = [];
              node.compiledExpression=null;
            }
          },
          clearSeries: function(){ 
            for(var i=0;i<this.nodes.length;i++){
              var node = this.nodes[i];              
              node.seriesData = [];
            }
          },

          getNodeOutcomesAsList: function(node) {
            var result = [];
            if(node.outcomes!=null){
              for(var i=0;i<node.outcomes.length;i++){
                result.push(node.outcomes[i].value);          
              }
              if(result.length>0){
                node.minimum = math.min(result);
                node.maximum = math.max(result);
                node.medium = math.mean(result);
                node.standardDeviation = math.std(result);
              }
            }
            return result;
          },

          getNodeSeriesAsList: function(node) {
            var result = [];
            if(node.seriesData!=null){
              for(var i=0;i<node.seriesData.length;i++){
                result.push(node.seriesData[i].value);          
              }
            }
            return result;
          },

          markSourceNodes: function(node){
            var sourceNodes = this.computeSourceNodes(node,model);
            for(var i=0;i<sourceNodes.length;i++){          
                sourceNodes[i].interpreterSource=true;          
            }
          },
          unmarkSourceNodes: function(node){        
            for(var i=0;i<this.nodes.length;i++){          
                delete this.nodes[i].interpreterSource;
            }
          },

          checkTest:function(parser,test){            
              test.success=false;
              try {
                if(parser.eval(test.expression)){
                  test.success=true;  
                } else {
                  test.failureReason = test.expression + ' evaluates to false';
                }          
              }catch(exception){
                test.failureReason = exception.message;
              }            
          },
          summarizeTestResults:function(testcase){              
              delete testcase.exception;
              for(var i=0;i<testcase.tests.length;i++){
                if(!testcase.tests[i].success)
                  if(testcase.exception==null)
                    testcase.exception=testcase.tests[i].expression;
                  else
                    testcase.exception=testcase.exception+';'+testcase.tests[i].expression;                  
              }              
          },

          getParameterResults: function() {
            var parameters = [];
            for(var i=0;i<this.nodes.length;i++){
              var node = this.nodes[i];
              var parameter = {};
              parameter.parameterName = node.name;
              parameter.results = node.outcomes;
              parameters.push(parameter);
            }            
            return parameters;
          },

        // runSimulation: function(interpreter,strategyexpressions,numberIterations,numberRepeats,overrides,testcase,runprogress){
          
        //   for(var i=0;i<10;i++)
        //     window.setTimeout(function() {
        //       runprogress(i,100);  
        //     },i*100);
            
          
        //   //window.setTimeout(function() { runprogress(10,100); },2000);
        //   //window.setTimeout(function() {runprogress(50,100);},4000);
        //   //window.setTimeout(function(){ runprogress(100,100);},6000);

        // },

        runSimulation: function(interpreter,strategyexpressions,numberIterations,numberRepeats,overrides,testcase,runprogress,done){
          var parser = interpreter.createParser();
          this.clearOutcomes();          
          //for(var i=0;i<numberIterations;i++)
          var network = this;
          responsivenessService.responsiveIteration(numberIterations,function(i)
              {                
                if(runprogress!=null)
                  runprogress(i,numberIterations);
                network.clearSeries();
                parser = interpreter.createParser();
                network.injectDependencies(parser);
                if(strategyexpressions!=null)  {
                  for(var j=0;j<strategyexpressions.length;j++){
                    var e = strategyexpressions[j];
                    parser.eval(e.expression);    
                  }
                }
                if(overrides!=null){
                  for(var j=0;j<overrides.length;j++){
                    var override = overrides[j];
                    parser.eval(override.expression);                
                  }
                }
                for(var j=0;j<numberRepeats;j++){
                  network.computeOutcome(parser);
                  network.captureSeries(parser);
                }
                network.captureOutcome(parser);            
              },function(){
                if(testcase!=null){
                  for(var j=0;j<testcase.tests.length;j++){
                      var t = testcase.tests[j];
                      network.checkTest(parser,t);
                    }
                  network.summarizeTestResults(testcase);
                }
                done(parser);
              }
            )
        },
        
        debug: function(debugon){
            this.debugEnabled=debugon;
        },
        
      }
    }
  }
});
