angular.module('avRegistration')
  .directive('avrCodeField', function($state, AdminPlugins) {
    function link(scope, element, attrs) {
      scope.codePattern = /[abcdefghjklmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,8}/;
      var myData = {hideUserSendAuthCode: false};
      console.log("loaded AdminPlugins");
      console.log(AdminPlugins);
      AdminPlugins.hook('hide-user-send-auth-code', myData);
      scope.hideUserSendAuthCode = myData.hideUserSendAuthCode;
    }
    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/fields/code-field-directive/code-field-directive.html'
    };
  });
