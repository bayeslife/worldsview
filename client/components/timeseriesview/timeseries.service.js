'use strict';

angular.module('worldsviewApp')
  .factory('TimeSeriesService', function probability($rootScope) {

return {

  asTimeSeries: function(values){
    var results = [];

    if(values==null || values.length==0)
      return results;

    for(var i=0;i<values.length;i++){
      results.push( { index: i, value: values[i]} );
    }
   return results;
  }

 } 
});
