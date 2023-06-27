/**
 * This file is part of common-ui.
 * Copyright (C) 2015-2016  Sequent Tech Inc <legal@sequentech.io>

 * common-ui is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * common-ui  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with common-ui.  If not, see <http://www.gnu.org/licenses/>.
**/

angular.module('avRegistration')
  .directive(
    'avLogin',
    function(
      Authmethod,
      StateDataService,
      $state,
      $stateParams,
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
        scope.withCode = attrs.withCode;
        scope.username = attrs.username;
        scope.isOtl = attrs.isOtl;
        scope.otlSecret = attrs.otlSecret;
        scope.error = null;
        scope.current_alt_auth_method_id = undefined;
        scope.alternative_auth_methods = null;

        if (!attrs.withAltMethod || !attrs.selectedAltMethod) {
          scope.selectedAltMethod = null;
        } else {
          scope.selectedAltMethod = attrs.selectedAltMethod;
        }

        // by default
        scope.hide_default_login_lookup_field = false;
        var adminId = ConfigService.freeAuthId + '';
        var autheventid = scope.eventId = attrs.eventId;
        scope.orgName = ConfigService.organization.orgName;
        scope.openIDConnectProviders = ConfigService.openIDConnectProviders;

        // redirect from admin login to admin elections if login is not needed
        var autheventCookie = $cookies.get('authevent_' + adminId);
        var authCookie = $cookies.get('auth_authevent_' + adminId);
        if (!!autheventCookie && autheventCookie === adminId &&
          autheventid === adminId && !!authCookie)
        {
          $window.location.href = '/admin/elections';
        }
        scope.sendingData = false;

        scope.currentFormStep = 0;

        scope.stateData = StateDataService.getData();
        scope.successfulRegistration = scope.stateData.successfulRegistration || false;

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
            !(
              scope.hasOtpFieldsCode ||
              _.contains(["email", "email-otp", "sms", "sms-otp"], scope.method)
            )
          ) {
              return;
          }

          // if telIndex or emailIndex not set when needed, do not proceed
          if (
            !scope.hasOtpFieldsCode &&
            (
              (
                _.contains(["sms", "sms-otp"], scope.method) &&
                scope.telIndex === -1 &&
                !scope.hide_default_login_lookup_field
              ) || 
              (
                _.contains(["email", "email-otp"], scope.method) &&
                scope.emailIndex === -1 &&
                !scope.hide_default_login_lookup_field
              )
            )
          ) {
            return;
          }

          // obtain the data to be sent to the iam to request
          // new auth codes by filtering and validating login fields 
          // with steps == undefined or included in step 0
          var stop = false;
          var data = _.object(
            _.filter(
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
            )
          );
          
          // if any issue found, do not proceed
          if (stop) {
            return;
          }


          // reset code field, as we are going to send a new one
          if (!!field) {
            field.value = "";
          }

          function onAuthCodeSent(response) {
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
            scope.error = null;
            $timeout(scope.sendingDataTimeout, 3000);
          }

          scope.sendingData = true;
          if (scope.skipSendAuthCode) {
            onAuthCodeSent();
            scope.skipSendAuthCode = false;
            return;
          }

          Authmethod.resendAuthCode(data, autheventid)
            .then(
              onAuthCodeSent,
              function onError(response) {
                $timeout(scope.sendingDataTimeout, 3000);
                scope.error = $i18next('avRegistration.errorSendingAuthCode');
              }
            );
        };

        scope.sendingDataTimeout = function () {
          scope.sendingData = false;
        };

        scope.parseAuthToken = function () {
          if (scope.method !== 'smart-link' || scope.withCode) {
            return;
          }
          scope.authToken = $location.search()['auth-token'];

          var length = 'khmac:///'.length;
          var tails = scope.authToken.substr(length);
          var message = tails.split('/')[1];
          scope.user_id = message.split(':')[0];
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

        scope.otlAuth = function(valid) {
          if (!valid) {
            return;
          }

          if (scope.sendingData) {
            return;
          }
          scope.otlStatus = "querying";

          var data = {
            'captcha_code': Authmethod.captcha_code,
            '__otl_secret': scope.otlSecret
          };
          _.each(scope.login_fields, function (field) {
            data[field.name] = field.value;
          });

          scope.sendingData = true;
          Authmethod.authenticateOtl(data, autheventid)
            .then(
              function onSuccess(response) {
                scope.sendingData = false;
                scope.otpCode = response.data.code;
                scope.otlResponseData = response.data;
                scope.otlStatus = "success";
              },
              function onError(_response) {
                scope.sendingData = false;
                scope.otpCode = undefined;
                scope.otlResponseData = {};
                scope.otlStatus = "fail";
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
          if (
            !scope.withCode &&
            (
              scope.hasOtpFieldsCode ||
              _.contains(['sms-otp', 'email-otp'], scope.method)
            ) &&
            scope.currentFormStep === 0
          ) {
            scope.resendAuthCode();
            return;
          }
          var data = {
            'captcha_code': Authmethod.captcha_code,
          };

          // set alternative auth method id
          if (scope.current_alt_auth_method_id) {
            data.alt_auth_method_id = scope.current_alt_auth_method_id;
          }
          var hasEmptyCode = false;
          _.each(scope.login_fields, function (field) {
            if (angular.isUndefined(field.value)) {
              data[field.name] = '';
            }
            if (field.type === 'email') {
              scope.email = field.value;
            } else if (_.contains(['code', 'otp-code'], field.type)) {
              if (!angular.isString(field.value)) {
                // This will stop the login process
                hasEmptyCode = true;
              }
              field.value = field.value.trim().replace(/ |\n|\t|-|_/g,'').toUpperCase();
            }
            data[field.name] = field.value;
          });

          // This happens in non sms-otp or email-otp that have a code/otp-code
          // field empty
          if (hasEmptyCode) {
            return;
          }

          // Get the smart link authentication token and set it in the data if
          // this is an auth event with smart-link auth method
          if (scope.method === 'smart-link' && !scope.withCode)
          {
            data['auth-token'] = $location.search()['auth-token'];
          }

          scope.sendingData = true;
          scope.error = null;
          Authmethod
            .login(data, autheventid)
            .then(
              function onSuccess(response) {
                if (response.data.status === "ok") {
                  var postfix = "_authevent_" + autheventid;
                  var options = {};
                  if (ConfigService.cookies && ConfigService.cookies.expires) {
                    options.expires = new Date();
                    options.expires.setMinutes(options.expires.getMinutes() + ConfigService.cookies.expires);
                  }
                  $cookies.put("authevent_" + autheventid, autheventid, options);
                  $cookies.put("userid" + postfix, response.data.username, options);
                  $cookies.put("user" + postfix, scope.email || response.data.username || response.data.email, options);
                  $cookies.put("auth" + postfix, response.data['auth-token'], options);
                  $cookies.put("isAdmin" + postfix, scope.isAdmin, options);
                  Authmethod.setAuth($cookies.get("auth" + postfix), scope.isAdmin, autheventid);
                  if (scope.isAdmin)
                  {
                    Authmethod.getUserInfo()
                      .then(
                        function onSuccess(response) {
                          var redirectUrl = $window.sessionStorage.getItem("redirect");
                          if (redirectUrl) {
                            $window.sessionStorage.removeItem("redirect");
                          } else {
                            redirectUrl = '/admin/elections';
                          }
                          $cookies.put("user" + postfix, response.data.email || scope.email || response.data.username, options);
                          $window.location.href = redirectUrl;
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
                  // if it's an election with no children elections
                  else if (angular.isDefined(response.data['vote-permission-token']))
                  {
                    $window.sessionStorage.setItem(
                      "vote_permission_tokens", 
                      JSON.stringify([{
                        electionId: autheventid,
                        token: response.data['vote-permission-token'],
                        isFirst: true
                      }])
                    );
                    $window.sessionStorage.setItem(
                      "show-pdf",
                      !!response.data['show-pdf']
                    );
                    $window.location.href = '/booth/' + autheventid + '/vote';
                  }
                  // if it's an election with children elections then show access to them
                  else if (angular.isDefined(response.data['vote-children-info']))
                  {
                    // assumes the iam response has the same children 
                    var tokens = _
                      .chain(response.data['vote-children-info'])
                      .map(function (child, index) {
                        return {
                          electionId: child['auth-event-id'],
                          token: child['vote-permission-token'] || null,
                          skipped: false,
                          voted: false,
                          numSuccessfulLoginsAllowed: child['num-successful-logins-allowed'],
                          numSuccessfulLogins: child['num-successful-logins'],
                          isFirst: index === 0
                        };
                      })
                      .value();
                    $window.sessionStorage.setItem(
                      "vote_permission_tokens", 
                      JSON.stringify(tokens)
                    );

                    $window.location.href = '/booth/' + autheventid + '/vote';
                  } else {
                    scope.error = $i18next(
                      'avRegistration.loginError.' + scope.method + '.unrecognizedServerResponse', 
                      {support: ConfigService.contact.email}
                    );
                  }
                } else {
                  scope.sendingData = false;
                  scope.error = $i18next(
                    'avRegistration.loginError.' + scope.method + '.invalidServerResponse', 
                    {support: ConfigService.contact.email}
                  );
                }
            },
            function onError(response) {
              scope.sendingData = false;
              var codename = response.data.error_codename;
              scope.error = $i18next(
                'avRegistration.loginError.' + scope.method + '.' + codename, 
                {support: ConfigService.contact.email}
              );
            }
          );
        };

        scope.getUriParam = function (paramName) {
          var uri = $window.location.href;
          var paramName2 = paramName.replace(/[\[\]]/g, '\\$&');
          var rx = new RegExp('[?&]' + paramName2 + '(=([^&#]*)|&|#|$)');
          var params = rx.exec(uri);

          if (!params)
          {
              return null;
          }

          if (!params[2])
          {
              return '';
          }
          return decodeURIComponent(params[2].replace(/\+/g, ' ')) || undefined;
        };

        /**
         * Returns the translated name of the given alternative authentication
         * method.
         * @param {*} altAuthMethod altAuthMethod object
         */
        scope.getAltAuthMethodName = function(altAuthMethod) {
          var langCode = $window.i18n.lng();
          if (
            altAuthMethod.public_name_i18n &&
            altAuthMethod.public_name_i18n[langCode]
          ) {
            return altAuthMethod.public_name_i18n[langCode];
          } else {
            return altAuthMethod.public_name;
          }
        };

        /**
         * Sets the current alt auth method
         * @param {*} altAuthMethod altAuthMethod object
         */
        scope.setCurrentAltAuthMethod = function(altAuthMethod) {
          if (altAuthMethod === scope.current_alt_auth_method_id) {
            return;
          }

          var authevent = angular.copy(scope.base_authevent);
          if (altAuthMethod === null) {
            scope.current_alt_auth_method_id = null;
          } else {
            scope.current_alt_auth_method_id = altAuthMethod.id;
            authevent.extra_fields = altAuthMethod.extra_fields;
            authevent.auth_method = altAuthMethod.auth_method_name;
          }
          scope.apply(authevent);
        };

        scope.apply = function(authevent) {
            scope.hasOtpFieldsCode = Authmethod.hasOtpCodeField(authevent);
            scope.method = authevent['auth_method'];

            if (scope.hasOtpFieldsCode ||
              _.contains(['sms-otp', 'email-otp'], scope.method)) {
                scope.skipSendAuthCode = scope.successfulRegistration;
            }

            scope.name = authevent['name'];
            scope.parseAuthToken();
            scope.registrationAllowed = (
              (authevent['census'] === 'open') &&
              (autheventid !== adminId || ConfigService.allowAdminRegistration)
            );
            if (!scope.isCensusQuery && !scope.withCode && !scope.isOtl) {
              scope.login_fields = Authmethod.getLoginFields(authevent);
            } else if (scope.withCode) {
              scope.login_fields = Authmethod.getLoginWithCode(authevent);
            } else if (scope.isCensusQuery) {
              scope.login_fields = Authmethod.getCensusQueryFields(authevent);
            } else if (scope.isOtl) {
              scope.login_fields = Authmethod.getOtlFields(authevent);
            }

            // show some fields first
            scope.login_fields.sort(function (a, b) {
              var initialFields = [
                "tlf", "email", "code", "otp-code"
              ];
              if (initialFields.includes(a.type) && !initialFields.includes(b.type)) {
                return -1;
              }
              if (!initialFields.includes(a.type) && initialFields.includes(b.type)) {
                return 1;
              }
              return 0;
            });
            scope.hide_default_login_lookup_field = authevent.hide_default_login_lookup_field;
            scope.telIndex = -1;
            scope.emailIndex = -1;
            scope.telField = null;
            scope.allowUserResend = (function () {
              if (scope.withCode) {
                return false;
              }
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
                  var uriValue = scope.getUriParam(el.name);
                  if (angular.isString(uriValue)) {
                    el.value = uriValue;
                    el.disabled = true;
                  } else {
                    el.value = null;
                    el.disabled = false;
                  }
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
                } else if (el.name === '__username' && scope.withCode) {
                  el.value = scope.username;
                  el.disabled = true;
                } else if (
                  el.name === 'user_id' &&
                  scope.method === 'smart-link'
                ) {
                  el.value = scope.user_id;
                  el.disabled = true;
                }
                return el;
              });

            // if not all the fields all filled at this point, then we stop
            // here. otp-code fields do not count, because loginUser
            // function will send the appropiate OTP code if required
            var filledFields = _.filter(
              fields,
              function (el) {
                return (
                  el.value !== null ||
                  el.type === 'otp-code'
                );
              }
            );
            if (filledFields.length !== scope.login_fields.length) {
              return;
            }

            // if all fields all filled in and it's not OpenID Connect do
            // auto-login
            if (
              scope.method !== 'openid-connect' &&
              !scope.isOtl &&
              !scope.isCensusQuery &&
              !scope.withCode
            ) {
              scope.loginUser(true);
            }
        };

        scope.view = function(id) {
            Authmethod.viewEvent(id)
                .then(
                  function onSuccess(response) {
                    if (response.data.status === "ok") {
                      scope.base_authevent = angular.copy(response.data.events);
                      scope.alternative_auth_methods = scope.base_authevent.alternative_auth_methods;
                      var altAuthMethod = _.find(
                        scope.alternative_auth_methods,
                        function (altAuthMethod) {
                          return altAuthMethod.id === scope.selectedAltMethod; 
                        }
                      ) || null;
                      scope.setCurrentAltAuthMethod(altAuthMethod);
                    } else {
                        document.querySelector(".input-error").style.display = "block";
                    }
                  },
                  function onError(response) {
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
