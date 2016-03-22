angular.module('avRegistration', ['ui.bootstrap','ui.utils','ui.router']);

angular.module('avRegistration').config(function() {
    /* Add New States Above */
});

angular.module('avRegistration')
  .run(function(AdminPlugins) {
    var myData = {hideUserSendAuthCode: false};
    AdminPlugins.hook('hide-user-send-auth-code', myData);
    console.log("FELIX: " + myData.hideUserSendAuthCode);
  });