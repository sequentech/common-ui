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
  .directive(
    'avLogin',
    function(
      Authmethod,
      StateDataService,
      $parse,
      $state,
      $location,
      $cookies,
      $i18next,
      $window,
      $timeout,
      ConfigService,
      Patterns)
    {
      // we use it as something similar to a controller here
      function link(scope, element, attrs)
      {
        scope.isCensusQuery = attrs.isCensusQuery;

        // by default
        scope.hide_default_login_lookup_field = false;
        var adminId = ConfigService.freeAuthId + '';
        var autheventid = scope.eventId = attrs.eventId;
        scope.orgName = ConfigService.organization.orgName;
        scope.openIDConnectProviders = ConfigService.openIDConnectProviders;

        // redirect from admin login to admin elections if login is not needed
        if (!!$cookies["authevent_" + adminId] && $cookies["authevent_" + adminId] === adminId &&
          autheventid === adminId && !!$cookies["auth_authevent_" + adminId])
        {
          $window.location.href = '/admin/elections';
        }
        scope.sendingData = false;

        scope.currentFormStep = 0;

        scope.stateData = StateDataService.getData();

        scope.signupLink = ConfigService.signupLink;

        scope.allowUserResend = false;
        scope.censusQuery = "not-sent";

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

        function isValidTel(inputName) {
          if (!document.getElementById(inputName)) {
            return false;
          }
          var telInput = angular.element(document.getElementById(inputName));
          return telInput.intlTelInput("isValidNumber");
        }

        function isValidEmail(email) {
          var pattern = Patterns.get('email');
          return null !== email.match(pattern);
        }

        /**
         * Send auth codes now to the voter
         */
        scope.resendAuthCode = function(field) {
          // if invalid method or already sending data, do not proceed
          if (
            scope.sendingData || 
            !_.contains(["email", "email-otp", "sms", "sms-otp"], scope.method)
          ) {
              return;
          }

          // if telIndex or emailIndex not set when needed, do not proceed
          if (
             (
              _.contains(["sms", "sms-otp"], scope.method) &&
              scope.telIndex === -1 &&
              !scope.hide_default_login_lookup_field
            ) || (
              _.contains(["email", "email-otp"], scope.method) &&
              scope.emailIndex === -1 &&
              !scope.hide_default_login_lookup_field
            )
          ) {
            return;
          }

          // obtain the data to be sent to the authapi to request
          // new auth codes by filtering and validating login fields 
          // with steps == undefined or included in step 0
          var stop = false;
          var data = _
            .filter(
              scope.login_fields, 
              function (element, index) {
                element.index = index;
                return (
                  element.steps === undefined || 
                  element.steps.indexOf(0) !== -1
                );
              }
            ).map(
              function (element) {
                if (
                  (
                    _.contains(["sms", "sms-otp"], scope.method) &&
                    element.index === scope.telIndex &&
                    !isValidTel("input" + scope.telIndex)
                  ) || (
                    _.contains(["email", "email-otp"], scope.method) &&
                    element.index === scope.emailIndex &&
                    !isValidEmail(element.value)
                  )
                ) {
                  stop = true;
                }
                return [element.name, element.value];
              }
            ).object();
          
          // if any issue found, do not proceed
          if (stop) {
            return;
          }


          // reset code field, as we are going to send a new one
          if (!!field) {
            field.value = "";
          }

          scope.sendingData = true;
          Authmethod.resendAuthCode(data, autheventid)
            .then(
              function(response) {
                // disabling login that are from previous step
                _.each(
                  scope.login_fields, 
                  function (element) {
                    if (
                      element.steps === undefined || 
                      element.steps.indexOf(0) !== -1
                    ) {
                      element.disabled = true;
                    }
                  }
                );
                scope.currentFormStep = 1;
                $timeout(scope.sendingDataTimeout, 3000);
              },
              function onError(response) {
                $timeout(scope.sendingDataTimeout, 3000);
                scope.error = $i18next('avRegistration.errorSendingAuthCode');
              }
            );
        };

        scope.sendingDataTimeout = function () {
          scope.sendingData = false;
        };

        scope.checkCensus = function(valid) {
            if (!valid) {
                return;
            }

            if (scope.sendingData) {
                return;
            }
            scope.censusQuery = "querying";

            var data = {
                'captcha_code': Authmethod.captcha_code,
            };
            _.each(scope.login_fields, function (field) {
              data[field.name] = field.value;
            });

            scope.sendingData = true;
            Authmethod.censusQuery(data, autheventid)
                .then(
                  function onSuccess(response) {
                    scope.sendingData = false;
                    scope.censusQueryData = response.data;
                    scope.censusQuery = "success";
                  },
                  function onError(response) {
                    scope.sendingData = false;
                    scope.censusQuery = "fail";
                  }
                );
        };

        scope.loginUser = function(valid) {
            if (!valid) {
                return;
            }
            if (scope.sendingData) {
                return;
            }

            // loginUser
            if (_.contains(['sms-otp', 'email-otp'], scope.method) && scope.currentFormStep === 0) {
                scope.resendAuthCode();
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
            Authmethod
              .login(data, autheventid)
              .then(
                function onSuccess(response) {
                  if (response.data.status === "ok") {
                      scope.khmac = response.data.khmac;
                      var postfix = "_authevent_" + autheventid;
                      $cookies["authevent_" + autheventid] = autheventid;
                      $cookies["userid" + postfix] = response.data.username;
                      $cookies["user" + postfix] = scope.email;
                      $cookies["auth" + postfix] = response.data['auth-token'];
                      $cookies["isAdmin" + postfix] = scope.isAdmin;
                      Authmethod.setAuth($cookies["auth" + postfix], scope.isAdmin, autheventid);
                      if (scope.isAdmin)
                      {
                          Authmethod.getUserInfo()
                            .then(
                              function onSuccess(response) {
                                $cookies["user" + postfix] = response.data.email;
                                $window.location.href = '/admin/elections';
                              },
                              function onError(response) {
                                $window.location.href = '/admin/elections';
                              }
                            );
                      }
                      else if (angular.isDefined(response.data['redirect-to-url']))
                      {
                          $window.location.href = response.data['redirect-to-url'];
                      }
                      else
                      {
                          // redirecting to vote link
                          Authmethod.getPerm("vote", "AuthEvent", autheventid)
                              .then(function onSuccess(response) {
                                  var khmac = response.data['permission-token'];
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
              },
              function onError(response) {
                  scope.sendingData = false;
                  scope.status = 'Registration error: ' + response.data.message;
                  scope.error = $i18next('avRegistration.invalidCredentials', { support: ConfigService.contact.email });
              }
            );
        };

        scope.apply = function(authevent) {
            scope.method = authevent['auth_method'];
            scope.name = authevent['name'];
            scope.registrationAllowed = (authevent['census'] === 'open');
            if (!scope.isCensusQuery) {
              scope.login_fields = Authmethod.getLoginFields(authevent);
            } else {
              scope.login_fields = Authmethod.getCensusQueryFields(authevent);
            }
            scope.hide_default_login_lookup_field = authevent.hide_default_login_lookup_field;
            scope.telIndex = -1;
            scope.emailIndex = -1;
            scope.telField = null;
            scope.allowUserResend = (function () {
              var ret = false;
              var href = $location.path();
              var adminMatch = href.match(/^\/admin\//);
              var electionsMatch = href.match(/^\/(elections|election)\/([0-9]+)\//);

              if (_.isArray(adminMatch)) {
                ret = true;
              } else if (_.isArray(electionsMatch) && 3 === electionsMatch.length) {
                ret = (_.isObject(authevent.auth_method_config) &&
                       _.isObject(authevent.auth_method_config.config) &&
                       true === authevent.auth_method_config.config.allow_user_resend);
              }
              return ret;
            })();

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
                if (el.type === "email") {
                  if (scope.email !== null) {
                    el.value = scope.email;
                    el.disabled = true;
                    if (scope.method === "email-otp") {
                      scope.currentFormStep = 1;
                    }
                  }
                  scope.emailIndex = index;
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
                } else if (el.type === "tlf" && scope.method === "sms-otp") {
                  if (scope.email !== null && scope.email.indexOf('@') === -1) {
                    el.value = scope.email;
                    el.disabled = true;
                    scope.currentFormStep = 1;
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

            if (scope.method !== 'openid-connect')
            {
              scope.loginUser(true);
            }

        };

        scope.view = function(id) {
            Authmethod.viewEvent(id)
                .then(
                  function onSuccess(response) {
                    if (response.data.status === "ok") {
                        scope.apply(response.data.events);
                    } else {
                        scope.status = 'Not found';
                        document.querySelector(".input-error").style.display = "block";
                    }
                  },
                  function onError(response) {
                    scope.status = 'Scan error: ' + response.data.message;
                    document.querySelector(".input-error").style.display = "block";
                  }
                );
        };
        scope.view(autheventid);

        scope.goSignup = function() {
            $state.go('registration.register', {id: autheventid});
        };

        scope.forgotPassword = function() {
            console.log('forgotPassword');
        };

        // generate a cryptogrpahically secure random string
        function randomStr()
        {
            /* jshint ignore:start */
            var random = sjcl.random.randomWords(/* bitlength */ 2048 / 32, 0);
            return sjcl.codec.hex.fromBits(random);
            /* jshint ignore:end */
        }

        // OpenIDConnect sets a cookie that is used to create a CSRF token
        // similar to what is mentioned here:
        // https://developers.google.com/identity/protocols/OpenIDConnect#createxsrftoken
        scope.openidConnectAuth = function(provider)
        {
            var randomState = randomStr();
            var randomNonce = randomStr();
            $cookies['openid-connect-csrf'] = angular.toJson({
              randomState: randomState,
              randomNonce: randomNonce,
              created: Date.now(),
              eventId: scope.eventId,
              providerId: provider.id
            });

            // find provider
            if (!provider)
            {
                scope.error = $i18next('avRegistration.openidError');
                return;
            }

            // Craft the OpenID Connect auth URI
            var authURI = (provider.authorization_endpoint +
                "?response_type=id_token" +
                "&client_id=" + encodeURIComponent(provider.client_id) +
                "&scope=" + encodeURIComponent("openid") +
                "&redirect_uri=" + encodeURIComponent(
                    $window.location.origin +
                    "/election/login-openid-connect-redirect"
                ) +
                "&state=" + randomState +
                "&nonce=" + randomNonce
            );

            // Redirect to the Auth URI
            $window.location.href = authURI;
        };
    }
    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/login-directive/login-directive.html'
    };
  });
