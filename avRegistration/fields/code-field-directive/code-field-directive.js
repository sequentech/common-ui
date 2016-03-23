angular.module('avRegistration')
  .directive('avrCodeField', function($state) {
    function link(scope, element, attrs, Plugins) {
      scope.codePattern = /[abcdefghjklmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,8}/;
      
      var myData = true;
      scope.showResendAuthCode = function ()
      {   
        console.log("got 1");
        Plugins.hook('hide-user-send-auth-code', myData);
        return myData;
      };
    }
    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/fields/code-field-directive/code-field-directive.html'
    };
  });
