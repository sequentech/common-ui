angular.module('avRegistration')
  .directive('avrCodeField', function($state, Plugins) {
    function link(scope, element, attrs) {
      scope.codePattern = /[abcdefghjklmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,8}/;
      
      //var myData = true;
      scope.showResendAuthCode = function ()
      {   
        var myData = true;
        console.log("1 got " + myData);
        Plugins.hook('hide-user-send-auth-code', myData);
        console.log("2 got " + myData);
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
