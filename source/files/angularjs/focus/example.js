var app = angular.module('plunker', []);
var MyCtrl = function ($scope, $timeout) {
};

app.directive('customFocus', function($timeout) {
  return {
    scope: { trigger: '=customFocus' },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if(value === true) { 
          $timeout(function() {
            element[0].focus();
            scope.trigger = false;
          });
        }
      });
    }
  };
});