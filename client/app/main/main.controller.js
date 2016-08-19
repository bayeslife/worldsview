'use strict';

angular.module('worldsviewApp')
  .controller('MainCtrl', function ($scope, $http) {

    $scope.decisions = [];

    $scope.refreshDecisions = function(){
      $http.get('/api/decisions').success(function(decisions) {
        $scope.decisions = decisions;        
      });
    }

    $scope.addDecision= function() {
      if($scope.newDecision === '') {
        return;
      }
      $http.post('/api/decisions', { name: $scope.newDecision });
      $scope.newDecision = '';
      $scope.refreshDecisions();
    };

    $scope.deleteDecision = function(decision) {
      $http.delete('/api/decisions/' + decision._id);
      $scope.refreshDecisions();
    };


    $scope.refreshDecisions();

    // $scope.awesomeThings = [];

    // $http.get('/api/things').success(function(awesomeThings) {
    //   $scope.awesomeThings = awesomeThings;
    //   socket.syncUpdates('thing', $scope.awesomeThings);
    // });

    // $scope.addThing = function() {
    //   if($scope.newThing === '') {
    //     return;
    //   }
    //   $http.post('/api/things', { name: $scope.newThing });
    //   $scope.newThing = '';
    // };

    // $scope.deleteThing = function(thing) {
    //   $http.delete('/api/things/' + thing._id);
    // };

    // $scope.$on('$destroy', function () {
    //   socket.unsyncUpdates('thing');
    // });
  });
