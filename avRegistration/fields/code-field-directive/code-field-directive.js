angular.module('avRegistration')
  .directive('avrCodeField', function($state) {
    function link(scope, element, attrs) {
      scope.codePattern = /[abcdefghjklmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,8}/;
      scope.hideUserSendAuthCode = false;
    }
    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/fields/code-field-directive/code-field-directive.html'
    };
  });
