angular.module('avRegistration')
  .directive('avrCodeField', function($state, Plugins) {
    function link(scope, element, attrs) {
      scope.codePattern = /[abcdefghjklmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,8}/;
      
      var myData = {};
      myData.data = true;
      scope.showResendAuthCode = function ()
      {   
        console.log("1 got " + myData.data);
        Plugins.hook('hide-user-send-auth-code', myData);
        console.log("2 got " + myData.data);
        return myData.data;
      };
    }
    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/fields/code-field-directive/code-field-directive.html'
    };
  });
