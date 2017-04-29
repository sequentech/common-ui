/**
 * This file is part of agora-gui-common.
 * Copyright (C) 2015-2016  Agora Voting SL <agora@agoravoting.com>

 * agora-gui-common is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * agora-gui-common  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with agora-gui-common.  If not, see <http://www.gnu.org/licenses/>.
**/

angular.module('avRegistration')
  .directive('avLogin', function(Authmethod,
                                 StateDataService,
                                 $parse,
                                 $state,
                                 $cookies,
                                 $i18next,
                                 $window,
                                 $timeout,
                                 ConfigService) {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
        var adminId = ConfigService.freeAuthId + '';
        var autheventid = attrs.eventId;
        scope.orgName = ConfigService.organization.orgName;

        // redirect from admin login to admin elections if login is not needed
        if ($cookies.authevent && $cookies.authevent === adminId &&
          autheventid === adminId)
        {
          $window.location.href = '/admin/elections';
        }
        scope.sendingData = false;

        scope.stateData = StateDataService.getData();

        scope.code = null;
        if (attrs.code && attrs.code.length > 0) {
          scope.code = attrs.code;
        }
        scope.email = null;
        if (attrs.email && attrs.email.length > 0) {
          scope.email = attrs.email;
        }

        scope.isAdmin = false;
        if (autheventid === adminId) {
            scope.isAdmin = true;
        }

        scope.resendAuthCode = function(field) {
          if (scope.sendingData || scope.method !== "sms") {
              return;
          }

          if (scope.telIndex === -1) {
            return;
          }

          if (scope.form["input" + scope.telIndex].$invalid) {
            return;
          }

          // reset code field, as we are going to send a new one
          field.value = "";

          var data = {};
          data['tlf'] = scope.telField.value;

          scope.sendingData = true;
          Authmethod.resendAuthCode(data, autheventid)
            .success(function(rcvData) {
              $timeout(scope.sendingDataTimeout, 3000);
            })
            .error(function(error) {
              $timeout(scope.sendingDataTimeout, 3000);
              scope.error = $i18next('avRegistration.errorSendingAuthCode');
            });
        };

        scope.sendingDataTimeout = function () {
          scope.sendingData = false;
        };

        scope.loginUser = function(valid) {
            if (!valid) {
                return;
            }
            if (scope.sendingData) {
                return;
            }
            var data = {
                'captcha_code': Authmethod.captcha_code,
            };
            _.each(scope.login_fields, function (field) {
              if (field.name === 'email') {
                scope.email = field.value;
              } else if ('code' === field.name) {
                field.value = field.value.trim().replace(/ |\n|\t|-|_/g,'').toUpperCase();
              }
              data[field.name] = field.value;
            });

            scope.sendingData = true;
            Authmethod.login(data, autheventid)
                .success(function(rcvData) {
                    if (rcvData.status === "ok") {
                        scope.khmac = rcvData.khmac;
                        $cookies.authevent = autheventid;
                        $cookies.userid = rcvData.username;
                        $cookies.user = scope.email;
                        $cookies.auth = rcvData['auth-token'];
                        $cookies.isAdmin = scope.isAdmin;
                        Authmethod.setAuth($cookies.auth, scope.isAdmin);
                        if (scope.isAdmin)
                        {
                            Authmethod.getUserInfo().success(function(d) {
                                $cookies.user = d.email;
                                $window.location.href = '/admin/elections';
                            }).error(function(error) {
                                $window.location.href = '/admin/elections';
                            });
                        }
                        else if (angular.isDefined(rcvData['redirect-to-url']))
                        {
                            $window.location.href = rcvData['redirect-to-url'];
                        }
                        else
                        {
                            // redirecting to vote link
                            Authmethod.getPerm("vote", "AuthEvent", autheventid)
                                .success(function(rcvData2) {
                                    var khmac = rcvData2['permission-token'];
                                    var path = khmac.split(";")[1];
                                    var hash = path.split("/")[0];
                                    var msg = path.split("/")[1];
                                    $window.location.href = '/booth/' + autheventid + '/vote/' + hash + '/' + msg;
                                });
                        }
                    } else {
                        scope.sendingData = false;
                        scope.status = 'Not found';
                        scope.error = $i18next('avRegistration.invalidCredentials', { support: ConfigService.contact.email });
                    }
                })
                .error(function(error) {
                    scope.sendingData = false;
                    scope.status = 'Registration error: ' + error.message;
                    scope.error = $i18next('avRegistration.invalidCredentials', { support: ConfigService.contact.email });
                });
        };

        scope.apply = function(authevent) {
            scope.method = authevent['auth_method'];
            scope.name = authevent['name'];
            scope.registrationAllowed = (authevent['census'] === 'open');
            scope.login_fields = Authmethod.getLoginFields(authevent);
            scope.telIndex = -1;
            scope.telField = null;

            var fields = _.map(
              scope.login_fields,
              function (el, index) {
                if (!!scope.stateData[el.name]) {
                  el.value = scope.stateData[el.name];
                  el.disabled = true;
                } else {
                  el.value = null;
                  el.disabled = false;
                }
                if (el.type === "email" && scope.email !== null) {
                  el.value = scope.email;
                  el.disabled = true;
                } else if (el.type === "code" && scope.code !== null) {
                  el.value = scope.code.trim().replace(/ |\n|\t|-|_/g,'').toUpperCase();
                  el.disabled = true;
                } else if (el.type === "tlf" && scope.method === "sms") {
                  if (scope.email !== null && scope.email.indexOf('@') === -1) {
                    el.value = scope.email;
                    el.disabled = true;
                  }
                  scope.telIndex = index+1;
                  scope.telField = el;
                }
                return el;
              });
            var filled_fields = _.filter(fields,
              function (el) { return el.value !== null; });

            if (filled_fields.length !== scope.login_fields.length) {
              return;
            }

            scope.loginUser(true);

        };

        scope.view = function(id) {
            Authmethod.viewEvent(id)
                .success(function(data) {
                    if (data.status === "ok") {
                        scope.apply(data.events);
                    } else {
                        scope.status = 'Not found';
                        document.querySelector(".input-error").style.display = "block";
                    }
                })
                .error(function(error) {
                    scope.status = 'Scan error: ' + error.message;
                    document.querySelector(".input-error").style.display = "block";
                });
        };
        scope.view(autheventid);

        scope.goSignup = function() {
            $state.go('registration.register', {id: autheventid});
        };

        scope.forgotPassword = function() {
            console.log('forgotPassword');
        };
    }
    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/login-directive/login-directive.html'
    };
  });
