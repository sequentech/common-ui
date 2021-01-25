angular.module('avRegistration')
  .directive('avrTextField', function($state) {
    function link(scope, element, attrs) {
      if (angular.isUndefined(scope.field.regex)) {
        scope.re = new RegExp("");
      } else {
        scope.re = new RegExp(scope.field.regex);
      }
    }
    return {
      restrict: 'AE',
      link: link,
      scope: true,
      templateUrl: 'avRegistration/fields/text-field-directive/text-field-directive.html'
    };
  });
