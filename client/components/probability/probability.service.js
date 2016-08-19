'use strict';

angular.module('worldsviewApp')
  .factory('ProbabilityService', function probability($rootScope) {

return {

  asDistribution: function(values){
    var results = [];
    if(values==null || values.length==0)
      return results;

    var max = math.max(values);
    var min = math.min(values);

    if(min==max) {
      min = min - min*0.1;
      max = max + max*0.1;
      if(min==0){
        min=-0.1;
        max=0.1;
      }
    }



    var bandsize = (max-min)/19;
    
    for(var i=0;i<20;i++){
      results[i] = { 
        min: min+i*bandsize, 
        max: min + (i+1)*bandsize, 
        median: (min+ i*bandsize + bandsize/2),
        band: i , 
        count:0 };
    }

    for(var i=0;i<values.length;i++){
      var val = values[i];      
      var band = math.floor( (val-min)/bandsize );
      if(band<0 || band>19){
        console.log("Out of band:"+band);
      }else{ 
        if(results[band])       
          results[band].count++;
      }
    }

    for(var i=0;i<20;i++){
      results[i].frequency = results[i].count/values.length;
    }
   
   return results;
  },

 // var parameters = ['strategy1','strategy2','strategy3']
          
 //          var data = [
 //            { band: 0,  values: [1,5,1 ] },
 //            { band: 1,  values: [1,4,2 ] },
 //            { band: 2,  values: [1,3,3 ] },
 //            { band: 3,  values: [1,2,4 ] },
 //            { band: 4,  values: [1,1,5 ] },
 //          ]
 runresultsAsDistribution: function(node,strategies,runresults){
    var results = [];
    if(node==null || runresults==null || runresults.length==0 || strategies.length==0)
      return results;

    //find strategies, then find parameter into a list of results
    var comparables = [];
    _.each(strategies,function(strategy){
      _.each(runresults,function(runresult){
        if(runresult.strategy === strategy._id){
            _.each(runresult.parameters,function(parameter){
                if(node.name===parameter.parameterName){
                  comparables.push({ strategy: strategy.name, parameter: parameter});
                }
            })
        }
      })
    })

    var max = null;
    _.each(comparables,function(comparable){
        _.each(comparable.parameter.results,function(result){
            if(max==null)
              max = result.value;
            else
              max = math.max(max,result.value);
        });        
    });
    var min = null;
    _.each(comparables,function(comparable){
        _.each(comparable.parameter.results,function(result){
            if(min==null)
              min = result.value;
            else
              min = math.min(min,result.value);
        });
    });
    

    if(min==max) {
      min = min - min*0.1;
      max = max + max*0.1;
      if(min==0){
        min=-0.1;
        max=0.1;
      }
    }

    var bandsize = (max-min)/19;
    
    for(var i=0;i<20;i++){
      results[i] = { 
        min: min+i*bandsize, 
        max: min + (i+1)*bandsize, 
        median: (min+ i*bandsize + bandsize/2),
        band: i,        
        distributions: [],
        values: []
      };
    }

    for(var j=0;j<comparables.length;j++){
      var comparable = comparables[j];
      for(var i=0;i<20;i++){
        results[i].distributions[j] = {count:0};        
      }
    }

    for(var j=0;j<comparables.length;j++){
      var comparable = comparables[j];
      _.each(comparable.parameter.results,function(result){
        var val = result.value;
        var band = math.floor( (val-min)/bandsize );
        if(band<0 || band>19){
          console.log("Out of band:"+band);
        }else{ 
           results[band].distributions[j].count++;            
        }
      });
    };

    for(var j=0;j<comparables.length;j++){
      var comparable = comparables[j];
      var total = comparable.parameter.results.length;
      for(var i=0;i<20;i++){
        results[i].values.push(results[i].distributions[j].count/total);
      }
    };
   
   return results;
  },



 } 
});
