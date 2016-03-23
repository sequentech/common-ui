angular.module('avRegistration')
  .directive('avrCodeField', function($state, Plugins) {
    function link(scope, element, attrs) {
      scope.codePattern = /[abcdefghjklmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,8}/;
      
      scope.showResendAuthCode = function ()
      { 
        var data = {showUserSendAuthCode: true};
        console.log("1 got " + data.showUserSendAuthCode);
        Plugins.hook('hide-user-send-auth-code', data);
        console.log("2 got " + data.showUserSendAuthCode);
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
