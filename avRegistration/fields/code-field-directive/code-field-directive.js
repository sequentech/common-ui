angular.module('avRegistration')
  .directive('avrCodeField', function($state, Plugins) {
    function link(scope, element, attrs) {
      scope.codePattern = /[abcdefghjklmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,8}/;
      
      scope.showResendAuthCode = function ()
      { 
        var data = {showUserSendAuthCode: true};
        Plugins.hook('hide-user-send-auth-code', data);
        return data.showUserSendAuthCode;
      };
    }
    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/fields/code-field-directive/code-field-directive.html'
    };
  });
