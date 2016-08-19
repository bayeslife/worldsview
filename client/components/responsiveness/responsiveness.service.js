'use strict';

angular.module('worldsviewApp')
  .factory('responsivenessService', function responsivenessService($q, $timeout) {
    
   return {
   	 responsiveIteration: function(count, evalFn,doneFn) {
       
        // Closures to track the resulting collection as it's built and the iteration index
        var index = 0;

        function enQueueNext() {
            $timeout(function () {
                // Process the element at "index"
                evalFn(index);

                index++;
                if (index < count)
                    enQueueNext();
                else
                  doneFn();           
            }, 0);
        }

        // Start off the process
        enQueueNext();        
      }

    }});


