'use strict';

angular.module('worldsviewApp')
  .factory('InterpreterService', function probability($rootScope,ModelService,WorldNetwork) {

    var NODEVALUE_FUNCTION='nv';

return {

   createParser: function() {
        var parser = math.parser();

        parser.set(NODEVALUE_FUNCTION, function(node){
          return node.value;
        });

        parser.set("normalDist", function(medium,std) {
          var u1, u2,
          picked = -1;
          // We reject values outside of the interval [0, 1]
          // TODO: check if it is ok to do that?
          while (picked < 0 || picked > 1) {
            u1 = Math.random();
            u2 = Math.random();
            picked = 1/6 * Math.pow(-2 * Math.log(u1), 0.5) * Math.cos(2 * Math.PI * u2) + 0.5;
          }
          return 2*picked*3*std+(medium-3*std);
          //return picked;
          }
        );

        
        // parser.set("dist", function(node){
        //   var values = [];
        //   for(var i=0;i<node.outcomes.length;i++){
        //     values.push(node.outcomes[i].value);
        //   };
        //   return values;
        // });

        // parser.set("repeat", function(modelName,cnt,expression){
        //   console.log('repeat:'+cnt); 

        //   try {
        //     var interpreter = this;
        //     ModelService.getModelByName(modelName,function(model){
        //       var networkService =WorldNetwork.newNetwork(model);
        //       networkService.initialize();            
        //       networkService.runSimulation(interpreter,1,cnt,expression);

        //       console.log('repeat: finished');
        //     });
            
        //   }catch(exception){
        //     console.log(exception);
        //   }

          
        // });

        return parser;
      },  


  getSourceNodes: function(expression,nodes){
      var results = [];
      try {
        var nd = math.parse(expression);

        nd.traverse(function (node, path, parent) {

        if(!node.hasOwnProperty('valueType') && node.hasOwnProperty('name')){
          if(node.name.valueOf()===NODEVALUE_FUNCTION.valueOf()){
            var nodename = node.args[0].name;
            results.push(nodename);
          }
        }

        // switch (node.type) {
        //   case 'OperatorNode': console.log(node.type, node.op);    break;
        //   case 'ConstantNode': console.log(node.type, node.value); break;
        //   case 'SymbolNode':   console.log(node.type, node.name);  break;
        //   default:             console.log(node.type);
        // }
      });
    }catch(exception){
        //ignore
    }
   return results;
  }

 } 
});
