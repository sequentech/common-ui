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

angular.module('avRegistration', ['ui.bootstrap','ui.utils','ui.router']);

angular.module('avRegistration').config(function() {
    /* Add New States Above */
});
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

    .factory('Authmethod', function($http, $cookies, ConfigService, $interval, $location) {
        var backendUrl = ConfigService.authAPI;
        var authId = ConfigService.freeAuthId;
        var authmethod = {};
        authmethod.captcha_code = null;
        authmethod.captcha_image_url = "";
        authmethod.captcha_status = "";
        authmethod.admin = false;

        authmethod.getAuthevent = function() {
          var adminId = ConfigService.freeAuthId + '';
          var href = $location.path();
          var authevent = '';

          var adminMatch = href.match(/^\/admin\//);
          var boothMatch = href.match(/^\/booth\/([0-9]+)\//);
          var electionsMatch = href.match(/^\/(elections|election)\/([0-9]+)\//);

          if (_.isArray(adminMatch)) {
            authevent = adminId;
          } else if(_.isArray(boothMatch) && 2 === boothMatch.length) {
            authevent = boothMatch[1];
          } else if(_.isArray(electionsMatch) && 3 === electionsMatch.length) {
            authevent = electionsMatch[2];
          }
          return authevent;
        };

        authmethod.isAdmin = function() {
            return authmethod.isLoggedIn() && authmethod.admin;
        };

        authmethod.isLoggedIn = function() {
            var auth = $http.defaults.headers.common.Authorization;
            return auth && auth.length > 0;
        };

        authmethod.signup = function(data, authevent) {
            var eid = authevent || authId;
            return $http.post(backendUrl + 'auth-event/'+eid+'/register/', data);
        };

        authmethod.getUserInfoExtra = function() {
            if (!authmethod.isLoggedIn()) {
              var data = {
                then: function (onSuccess, onError) {
                  setTimeout(function() {
                    onError({data: {message:"not-logged-in"}});
                  }, 0);
                  return data;
                }
              };
              return data;
            }
            return $http.get(backendUrl + 'user/extra/', {});
        };

        /**
         * @returns an activity page
         */
        authmethod.getActivity = function(eid, page, size, filterOptions, filterStr, receiver_id)
        {
            var params = {};
            var url = backendUrl + 'auth-event/' + eid + '/activity/';

            // 1. initialize GET params

            if (size === 'max') {
              params.size = 500;
            } else if (angular.isNumber(size) && size > 0 && size < 500) {
              params.size = parseInt(size);
            } else {
              params.size = 10;
            }

            if (!angular.isNumber(page)) {
                params.page = 1;
            } else {
                params.page = parseInt(page);
            }


            if (angular.isNumber(receiver_id)) {
                params.receiver_id = receiver_id;
            }

            _.extend(params, filterOptions);
            if (filterStr && filterStr.length > 0) {
                params.filter = filterStr;
            }

            // 2. generate request
            return $http.get(url, {params: params});
        };

        /**
         * @returns a page of ballot boxes
         */
        authmethod.getBallotBoxes = function(eid, page, size, filterOptions, filterStr)
        {
            var params = {};
            var url = backendUrl + 'auth-event/' + eid + '/ballot-box/';

            // 1. initialize GET params

            if (size === 'max') {
              params.size = 500;
            } else if (angular.isNumber(size) && size > 0 && size < 500) {
              params.size = parseInt(size);
            } else {
              params.size = 10;
            }

            if (!angular.isNumber(page)) {
                params.page = 1;
            } else {
                params.page = parseInt(page);
            }

            _.extend(params, filterOptions);
            if (filterStr && filterStr.length > 0) {
                params.filter = filterStr;
            }

            // 2. generate request
            return $http.get(url, {params: params});
        };

        /**
         * @returns the http request
         */
        authmethod.createBallotBox = function(eid, name)
        {
            var params = {name: name};
            var url = backendUrl + 'auth-event/' + eid + '/ballot-box/';

            return $http.post(url, params);
        };

        /**
         * @returns the http request
         */
        authmethod.obtainVoterAuthCode = function (electionId, username)
        {
          var params = {username: username};
          var url = backendUrl + 'auth-event/' + electionId + '/generate-auth-code/';

          return $http.post(url, params);
        };

        /**
         * @returns the http request
         */
        authmethod.postTallySheet = function(eid, ballot_box_id, data)
        {
            var url = backendUrl + 'auth-event/' + eid + '/ballot-box/' + ballot_box_id + '/tally-sheet/';

            return $http.post(url, data);
        };

        /**
         * @returns the http request
         */
        authmethod.voteStats = function(eid)
        {
            var url = backendUrl + 'auth-event/' + eid + '/vote-stats/';

            return $http.get(url);
        };


        /**
         * @returns the http request
         */
        authmethod.getTallySheet = function(eid, ballot_box_id, tally_sheet_id)
        {
            var url = null;
            if (!tally_sheet_id) {
                url = backendUrl + 'auth-event/' + eid + '/ballot-box/' + ballot_box_id + '/tally-sheet/';
            } else {
              url = backendUrl + 'auth-event/' + eid + '/ballot-box/' + ballot_box_id + '/tally-sheet/' + tally_sheet_id + '/';
            }

            return $http.get(url);
        };

        /**
         * @returns the http request
         */
        authmethod.deleteTallySheet = function(eid, ballot_box_id, tally_sheet_id)
        {
            var url = backendUrl + 'auth-event/' + eid + '/ballot-box/' + ballot_box_id + '/tally-sheet/' + tally_sheet_id + "/";

            return $http.delete(url, {});
        };

        /**
         * @returns the http request
         */
        authmethod.deleteBallotBox = function(eid, ballot_box_id)
        {
            var url = backendUrl + 'auth-event/' + eid + '/ballot-box/' + ballot_box_id + "/delete/";

            return $http.delete(url, {});
        };

        authmethod.updateUserExtra = function (extra) {
            if (!authmethod.isLoggedIn()) {
              var data = {
                then: function (onSuccess, onError) {
                  setTimeout(function() {
                    onError({data: {message:"not-logged-in"}});
                  }, 0);
                  return data;
                }
              };
              return data;
            }
            return $http.post(backendUrl + 'user/extra/', extra);
        };

        authmethod.getUserInfo = function(userid) {
            if (!authmethod.isLoggedIn()) {
              var data = {
                then: function (onSuccess, onError) {
                  setTimeout(function() {
                    onError({data: {message:"not-logged-in"}});
                  }, 0);
                  return data;
                }
              };
              return data;
            }
            if (typeof userid === 'undefined') {
                return $http.get(backendUrl + 'user/', {});
            } else {
                return $http.get(backendUrl + 'user/%d' % userid, {});
            }
        };

        authmethod.ping = function() {
            if (!authmethod.isLoggedIn()) {
              var data = {
                then: function (onSuccess, onError) {
                  setTimeout(function() {
                    onError({data: {message:"not-logged-in"}});
                  }, 0);
                  return data;
                }
              };
              return data;
            }
            return $http.get(backendUrl + 'auth-event/'+authId+'/ping/');
        };

        authmethod.getImage = function(ev, uid) {
            return $http.get(backendUrl + 'auth-event/'+ev+'/census/img/'+uid+'/');
        };

        authmethod.login = function(data, authevent) {
            var eid = authevent || authId;
            delete data['authevent'];
            return $http.post(backendUrl + 'auth-event/'+eid+'/authenticate/', data);
        };

        authmethod.censusQuery = function(data, authevent) {
            var eid = authevent || authId;
            delete data['authevent'];
            return $http.post(backendUrl + 'auth-event/'+eid+'/census/public-query/', data);
        };

        authmethod.resendAuthCode = function(data, eid) {
            return $http.post(backendUrl + 'auth-event/'+eid+'/resend_auth_code/', data);
        };

        authmethod.editChildrenParent = function(data, eid) {
            return $http.post(backendUrl + 'auth-event/'+eid+'/edit-children-parent/', data);
        };

        authmethod.getPerm = function(perm, object_type, object_id) {
            var data = {
                permission: perm,
                object_type: object_type,
                object_id: (object_id === null) ? object_id : object_id + "" // to convert to string
            };
            return $http.post(backendUrl + 'get-perms/', data);
        };

        authmethod.viewEvent = function(id) {
            return $http.get(backendUrl + 'auth-event/' + id + '/');
        };

        authmethod.viewEvents = function() {
            return $http.get(backendUrl + 'auth-event/');
        };

        authmethod.createEvent = function(data) {
            return $http.post(backendUrl + 'auth-event/', data);
        };

        authmethod.editEvent = function(id, data) {
            return $http.post(backendUrl + 'auth-event/' + id +'/', data);
        };

        authmethod.addCensus = function(id, data, validation) {
            if (!angular.isDefined(validation)) {
              validation = "enabled";
            }
            var d = {
                "field-validation": validation,
                "census": data
            };
            return $http.post(backendUrl + 'auth-event/' + id + '/census/', d);
        };

        authmethod.getCensus = function(id, params) {
          if (!angular.isObject(params)) {
            return $http.get(backendUrl + 'auth-event/' + id + '/census/');
          }

          return $http.get(
            backendUrl + 'auth-event/' + id + '/census/',
            {params:params});
        };

        authmethod.getRegisterFields = function (viewEventData) {
          var fields = _.filter(
            angular.copy(viewEventData.extra_fields),
            function (item) {
              if (true === item.required_when_registered) {
                return false;
              }
              return true;
            });

          if (!fields) { fields = []; }

          // put captcha the last
          for (var i = 0; i < fields.length; i++) {
            if (fields[i]['type'] === "captcha") {
              var captcha = fields.splice(i, 1);
              fields.push(captcha[0]);
              break;
            }
          }
          return fields;
        };

        authmethod.getCensusQueryFields = function (viewEventData)
        {
            var fields = angular.copy(viewEventData.extra_fields);

            fields = _.filter(
                fields,
                function (field) {
                    return field.required_on_authentication;
                }
            );

            return fields;
        };

        authmethod.getLoginWithCode = function (_viewEventData) {
          return [
            {
              "name": "__username",
              "type": "text",
              "required": true,
              "min": 3, 
              "max": 200,
              "required_on_authentication": true
            },
            {
              "name": "code",
              "type": "code",
              "required": true,
              "required_on_authentication": true
            }
          ];
        };

        authmethod.getLoginFields = function (viewEventData) {
            var fields = authmethod.getRegisterFields(
              viewEventData
            );
            if (_.contains(["sms", "email"], viewEventData.auth_method))
            {
              fields.push({
                "name": "code",
                "type": "code",
                "required": true,
                "required_on_authentication": true
              });
            } else if (_.contains(["sms-otp", "email-otp"], viewEventData.auth_method))
            {
              fields.push({
                "name": "code",
                "type": "code",
                "required": true,
                "steps": [1],
                "required_on_authentication": true
              });
            }

            fields = _.filter(fields, function (field) {return field.required_on_authentication;});

            // put captha the last
            for (var i=0; i<fields.length; i++) {
                if (fields[i]['type'] === "captcha") {
                    var captcha = fields.splice(i, 1);
                    fields.push(captcha[0]);
                    break;
                }
            }
            return fields;
        };

        authmethod.newCaptcha = function(message) {
            authmethod.captcha_status = message;
            return $http.get(backendUrl + 'captcha/new/', {})
              .then(function (response) {
                console.log(response.data);
                if (response.data.captcha_code !== null) {
                    authmethod.captcha_code = response.data.captcha_code;
                    authmethod.captcha_image_url = response.data.image_url;
                } else {
                    authmethod.captcha_status = 'Not found';
                }
              });
        };

        // TEST
        authmethod.test = function() {
            return $http.get(backendUrl);
        };

        authmethod.setAuth = function(auth, isAdmin, autheventid) {
            authmethod.admin = isAdmin;
            $http.defaults.headers.common.Authorization = auth;
            if (!authmethod.pingTimeout) {
                $interval.cancel(authmethod.pingTimeout);
                authmethod.launchPingDaemon(autheventid);
                authmethod.pingTimeout = $interval(
                        function() { authmethod.launchPingDaemon(autheventid); },
                        ConfigService.timeoutSeconds*500 // ms * 500 mean seconds * 1/2
                );
            }
            return false;
        };

        authmethod.electionsIds = function(page, listType, ids, page_size) {
            if (!page) {
                page = 1;
            }
            if (!listType) {
              listType = 'all';
            }
            
            // default perms to request
            var perms = 'edit|view';
            if (listType === 'archived') {
              perms = 'unarchive|view-archived';
            }
            // only if needed
            var queryIds = '';
            if (!!ids) {
              queryIds = '&ids=' + ids.join('|');
            } else {
              queryIds = '&only_parent_elections=true';
            }
            if (!!page_size) {
              queryIds += '&n=' + page_size;
            }

            return $http.get(
              backendUrl + 
              'auth-event/?has_perms=' +
              perms +
              queryIds +
              '&order=-pk&page=' +
              page
            );
        };

        authmethod.sendAuthCodes = function(eid, election, user_ids, auth_method, extra) {
            var url = backendUrl + 'auth-event/'+eid+'/census/send_auth/';
            var data = {};
            if (angular.isDefined(election)) {
              data.msg = election.census.config.msg;
              if ('email' === auth_method) {
                data.subject = election.census.config.subject;
              }
            }
            if (angular.isDefined(user_ids)) {
              data["user-ids"] = user_ids;
            }
            if (angular.isDefined(auth_method)) {
              data["auth-method"] = auth_method;
            }
            if (extra) {
              data["extra"] = extra;
            }
            return $http.post(url, data);
        };

        authmethod.removeUsersIds = function(eid, election, user_ids) {
            var url = backendUrl + 'auth-event/'+eid+'/census/delete/';
            var data = {"user-ids": user_ids};
            return $http.post(url, data);
        };

        authmethod.activateUsersIds = function(eid, election, user_ids, comment) {
            var url = backendUrl + 'auth-event/'+eid+'/census/activate/';
            var data = {"user-ids": user_ids, "comment": comment};
            return $http.post(url, data);
        };

        authmethod.deactivateUsersIds = function(eid, election, user_ids, comment) {
            var url = backendUrl + 'auth-event/'+eid+'/census/deactivate/';
            var data = {"user-ids": user_ids, "comment": comment};
            return $http.post(url, data);
        };

        authmethod.changeAuthEvent = function(eid, st, data) {
            var url = backendUrl + 'auth-event/'+eid+'/'+st+'/';
            if (data === undefined) {
              data = {};
            }
            return $http.post(url, data);
        };

        authmethod.allowTally = function(eid) {
            var url = backendUrl + 'auth-event/'+eid+'/allow-tally/';
            var data = {};
            return $http.post(url, data);
        };

        authmethod.unpublishResults = function(eid) {
            var url = backendUrl + 'auth-event/'+eid+'/unpublish-results/';
            var data = {};
            return $http.post(url, data);
        };

        authmethod.archive = function(eid) {
            var url = backendUrl + 'auth-event/'+eid+'/archive/';
            var data = {};
            return $http.post(url, data);
        };

        authmethod.unarchive = function(eid) {
            var url = backendUrl + 'auth-event/'+eid+'/unarchive/';
            var data = {};
            return $http.post(url, data);
        };

        authmethod.launchTally = function(
          electionId,
          tallyElectionIds,
          forceTally
        ) {
            var url = backendUrl + 'auth-event/' + electionId + '/tally-status/';
            var data = {
              children_election_ids: tallyElectionIds,
              force_tally: forceTally
            };
            return $http.post(url, data);
        };

        authmethod.launchPingDaemon = function(autheventid) {
          var postfix = "_authevent_" + autheventid;
          // only needed if it's an admin and daemon has not been launched
          if (!$cookies.get("isAdmin" + postfix)) {
            return;
          }
          authmethod.ping()
            .then(function(response) {
                var options = {};
                if (ConfigService.cookies && ConfigService.cookies.expires) {
                  options.expires = new Date();
                  options.expires.setMinutes(options.expires.getMinutes() + ConfigService.cookies.expires);
                }
                $cookies.put("auth" + postfix, response.data['auth-token'], options);
                authmethod.setAuth($cookies.get("auth" + postfix), $cookies.get("isAdmin" + postfix), autheventid);
            });
        };

        authmethod.getUserDraft = function () {
            if (!authmethod.isLoggedIn()) {
              var data = {
                then: function (onSuccess, onError) {
                  setTimeout(function() {
                    onError({data: {message:"not-logged-in"}});
                  }, 0);
                  return data;
                }
              };
              return data;
            }
            return $http.get(backendUrl + 'user/draft/', {});
        };

        authmethod.uploadUserDraft = function (draft) {
            if (!authmethod.isLoggedIn()) {
              var data = {
                then: function (onSuccess, onError) {
                  setTimeout(function() {
                    onError({data: {message:"not-logged-in"}});
                  }, 0);
                  return data;
                }
              };
              return data;
            }
            var draft_data = {
              'draft_election': draft
            };
            return $http.post(backendUrl + 'user/draft/', draft_data);
        };

        return authmethod;
    });

/**
 * Caching http response error to deauthenticate
 */
//angular.module('avRegistration').config(
//  function($httpProvider) {
//    $httpProvider.interceptors.push(function($q, $injector) {
//      return {
//        'responseError': function(rejection) {
//            if (rejection.data && rejection.data.error_codename &&
//              _.contains(
//                ['expired_hmac_key', 'empty_hmac', 'invalid_hmac_userid'],
//                rejection.data.error_codename))
//            {
//              $httpProvider.defaults.headers.common.Authorization = '';
//              $injector.get('$state').go("admin.logout");
//            }
//            return $q.reject(rejection);
//        }
//      };
//    });
//});

/**
 * IF the cookie is there we make the autologin
 */
//angular.module('avRegistration').run(function($cookies, $http, Authmethod) {
//    if ($cookies.auth) {
//        Authmethod.setAuth($cookies.auth, $cookies.isAdmin);
//    }
//});

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
  .controller(
    'LoginController',
    function(
      $scope,
      $stateParams
    ) {
      $scope.event_id = $stateParams.id;
      $scope.code = $stateParams.code;
      $scope.email = $stateParams.email;
      $scope.username = $stateParams.username;
      $scope.isOpenId = $stateParams.isOpenId;
      $scope.withCode = $stateParams.withCode;
    }
  );

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
        scope.withCode = attrs.withCode;
        scope.username = attrs.username;
        scope.error = null;

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
                scope.error = null;
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

          // Get the smart link authentication token and set it in the data if
          // this is an auth event with smart-link auth method
          if (scope.method === 'smart-link')
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
                          $cookies.put("user" + postfix, response.data.email || scope.email || response.data.username, options);
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
                  // if it's an election with no children elections
                  else if (angular.isDefined(response.data['vote-permission-token']))
                  {
                    $window.sessionStorage.setItem(
                      "vote_permission_tokens", 
                      JSON.stringify([{
                        electionId: autheventid,
                        token: response.data['vote-permission-token']
                      }])
                    );
                    $window.location.href = '/booth/' + autheventid + '/vote';
                  }
                  // if it's an election with children elections then show access to them
                  else if (angular.isDefined(response.data['vote-children-info']))
                  {
                    // assumes the authapi response has the same children 
                    var tokens = _
                      .chain(response.data['vote-children-info'])
                      .filter(function (child) {
                        return (
                          child['num-successful-logins-allowed'] === 0 ||
                          child['num-successful-logins'] < child['num-successful-logins-allowed']
                         ) && !!child['vote-permission-token'];
                      })
                      .map(function (child, index) {
                        return {
                          electionId: child['auth-event-id'],
                          token: child['vote-permission-token'],
                          skipped: false,
                          voted: false,
                          isFirst: index === 0
                        };
                      })
                      .value();
                    $window.sessionStorage.setItem(
                      "vote_permission_tokens", 
                      JSON.stringify(tokens)
                    );

                    if (tokens.length > 0) {
                      $window.location.href = '/booth/' + tokens[0].electionId + '/vote';
                    } else {
                      scope.error = $i18next(
                        'avRegistration.invalidCredentials', 
                        {support: ConfigService.contact.email}
                      );
                    }
                  } else {
                    scope.error = $i18next(
                      'avRegistration.invalidCredentials', 
                      {support: ConfigService.contact.email}
                    );
                  }
                } else {
                  scope.sendingData = false;
                  scope.status = 'Not found';
                  scope.error = $i18next(
                    'avRegistration.invalidCredentials', 
                    {support: ConfigService.contact.email}
                  );
                }
            },
            function onError(response) {
              scope.sendingData = false;
              scope.status = 'Registration error: ' + response.data.message;
              scope.error = $i18next(
                'avRegistration.invalidCredentials', 
                {support: ConfigService.contact.email}
              );
            }
          );
        };

        scope.apply = function(authevent) {
            scope.method = authevent['auth_method'];
            scope.name = authevent['name'];
            scope.registrationAllowed = (
              (authevent['census'] === 'open') &&
              (autheventid !== adminId || ConfigService.allowAdminRegistration)
            );
            if (!scope.isCensusQuery && !scope.withCode) {
              scope.login_fields = Authmethod.getLoginFields(authevent);
            } else if (scope.withCode) {
              scope.login_fields = Authmethod.getLoginWithCode(authevent);
            } else { // scope.isCensusQuery is true
              scope.login_fields = Authmethod.getCensusQueryFields(authevent);
            }
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
                } else if (el.name === '__username' && scope.withCode) {
                  el.value = scope.username;
                  el.disabled = true;
                }
                return el;
              });
            var filled_fields = _.filter(fields,
              function (el) { return el.value !== null; });

            // if not all the fields all filled at this point, then we stop here
            if (filled_fields.length !== scope.login_fields.length) {
              return;
            }

            // if all fields all filled in and it's not OpenID Connect do
            // auto-login
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
    'avOpenidConnect',
    function(
      $cookies,
      $window,
      $location,
      ConfigService,
      Authmethod
    ) {
      // we use it as something similar to a controller here
      function link(scope, element, attrs)
      {
        // Maximum Oauth Login Timeout is 5 minutes
        var maxOAuthLoginTimeout = 1000 * 60 * 5;

        scope.csrf = null;

        // simply redirect to login
        function simpleRedirectToLogin()
        {
          if (scope.csrf)
          {
            $window.location.href = "/election/" + scope.csrf.eventId + "/public/login";
          } else  {
            $window.location.href = "/";
          }
        }

        // Returns the logout url if any from the appropiate openidprovider
        // TODO: logout asumes that you are using the first provider, so it
        // basically supports only one provider
        function getLogoutUri()
        {
          if (ConfigService.openIDConnectProviders.length === 0 || !ConfigService.openIDConnectProviders[0].logout_uri)
          {
            return false;
          }

          var eventId = null;
          if (scope.csrf)
          {
            eventId = scope.csrf.eventId;
          }

          var uri = ConfigService.openIDConnectProviders[0].logout_uri;
          uri = uri.replace("__EVENT_ID__", "" + eventId);

          var postfix = "_authevent_" + eventId;
          if (!!$cookies.get("id_token_" + postfix))
          {
            uri = uri.replace("__ID_TOKEN__", $cookies.get("id_token_" + postfix));

          // if __ID_TOKEN__ is there but we cannot replace it, we need to
          // directly redirect to the login, otherwise the URI might show an
          // error 500
          } else if (uri.indexOf("__ID_TOKEN__") > -1)
          {
            uri = "/election/" + eventId + "/public/login";
          }

          return uri;
        }

        scope.redirectingToUri = false;

        // Redirects to the login page of the respective event_id if any
        function redirectToLogin()
        {
          if (scope.redirectingToUri)
          {
            return;
          }

          scope.redirectingToUri = true;

          var eventId = null;
          if (scope.csrf)
          {
            eventId = scope.csrf.eventId;
          } else {
            $window.location.href = "/";
            return;
          }

          Authmethod.viewEvent(eventId)
            .then(
              function onSuccess(response)
              {
                if (response.data.status !== "ok" || !response.data.events || response.data.events.auth_method !== 'openid-connect' || !getLogoutUri())
                {
                  simpleRedirectToLogin();
                  return;
                }

                var postfix = "_authevent_" + eventId;
                var uri = getLogoutUri();
                $cookies.remove("id_token_" + postfix);
                $window.location.href = uri;
              },
              function onError(response)
              {
                simpleRedirectToLogin();
              }
            );
        }

        // Get the decoded value of a uri parameter from any uri. The uri does not
        // need to have any domain, it can start with the character "?"
        function getURIParameter(paramName, uri)
        {
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
            return decodeURIComponent(params[2].replace(/\+/g, ' '));
        }

        // validates the CSRF token
        function validateCsrfToken()
        {
            if (!$cookies.get('openid-connect-csrf'))
            {
                redirectToLogin();
                return null;
            }

            // validate csrf token format and data
            var csrf = scope.csrf = angular.fromJson($cookies.get('openid-connect-csrf'));
            var uri = "?" + $window.location.hash.substr(1);

            // NOTE: if you need to debug this callback, obtain the callback
            // URL, get the callback received in the server (to obtain the
            // nonce) that was received by the client and change the data here
            // accordingly and set here the debug break point, then execute
            // a line like the following in the comment.
            //
            // The only data that needs to be changed is the randomNonnce and
            // the eventId.
            //
            // csrf = scope.csrf = {
            //   randomNonce: 'something',
            //   randomState: getURIParameter("state", uri),
            //   created: Date.now(),
            //   eventId: 11111
            // };

            $cookies.remove('openid-connect-csrf');
            var isCsrfValid = (!!csrf &&
              angular.isObject(csrf) &&
              angular.isString(csrf.randomState) &&
              angular.isString(csrf.randomNonce) &&
              angular.isNumber(csrf.created) &&
              getURIParameter("state", uri) === csrf.randomState &&
              csrf.created - Date.now() < maxOAuthLoginTimeout
            );

            if (!isCsrfValid)
            {
                redirectToLogin();
                return null;
            }
            return true;
        }

        // Process an OpenId Connect callback coming from the provider, try to
        // validate the callback data and get the authentication token from our
        // server and redirect to vote
        function processOpenIdAuthCallback()
        {
            // validate csrf token from uri and from state in the hash
            validateCsrfToken();

            var uri = "?" + $window.location.hash.substr(1);

            var data = {
                id_token: getURIParameter("id_token", uri),
                provider: scope.csrf.providerId,
                nonce: scope.csrf.randomNonce
            };

            var options = {};
            if (ConfigService.cookies && ConfigService.cookies.expires) {
              options.expires = new Date();
              options.expires.setMinutes(options.expires.getMinutes() + ConfigService.cookies.expires);
            }

            var postfix = "_authevent_" + scope.csrf.eventId;
            $cookies.put("id_token_" + postfix, data.id_token, options);

            // Send the authentication request to our server
            Authmethod.login(data, scope.csrf.eventId)
                .then(
                  function onSuccess(response)
                  {
                    if (response.data.status === "ok")
                    {
                        scope.khmac = response.data.khmac;
                        var postfix = "_authevent_" + scope.csrf.eventId;
                        $cookies.put("authevent_" + scope.csrf.eventId, scope.csrf.eventId, options);
                        $cookies.put("userid" + postfix, response.data.username, options);
                        $cookies.put("user" + postfix, response.data.username, options);
                        $cookies.put("auth" + postfix, response.data['auth-token'], options);
                        $cookies.put("isAdmin" + postfix, false, options);
                        Authmethod.setAuth($cookies.get("auth" + postfix), scope.isAdmin, scope.csrf.eventId);

                        if (angular.isDefined(response.data['redirect-to-url']))
                        {
                            $window.location.href = response.data['redirect-to-url'];
                        }
                        else
                        {
                            // redirecting to vote link
                            Authmethod.getPerm("vote", "AuthEvent", scope.csrf.eventId)
                                .then(function onSuccess(response2)
                                {
                                    var khmac = response2.data['permission-token'];
                                    var path = khmac.split(";")[1];
                                    var hash = path.split("/")[0];
                                    var msg = path.split("/")[1];
                                    $window.location.href = '/booth/' + scope.csrf.eventId + '/vote/' + hash + '/' + msg;
                                });
                        }
                    } else
                    {
                        // TODO: show error
                        redirectToLogin();
                        return;
                    }
                  },
                  function onError(response)
                  {
                    // TODO: show error
                    redirectToLogin();
                    return;
                  }
                );
        }

        processOpenIdAuthCallback();
      }
      return {
        restrict: 'AE',
        scope: true,
        link: link,
        templateUrl: 'avRegistration/openid-connect-directive/openid-connect-directive.html'
      };
    });

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

angular.module('avRegistration').controller('LogoutController',
  function($scope, $stateParams, $filter, ConfigService, $i18next, $state, $cookies, Authmethod) {
    var adminId = ConfigService.freeAuthId;
    var authevent = Authmethod.getAuthevent();
    var postfix = "_authevent_" + authevent;
    $cookies.put("user" + postfix, '');
    $cookies.put("auth" + postfix, '');
    $cookies.put("authevent_" + authevent, '');
    $cookies.put("userid" + postfix, '');
    $cookies.put("isAdmin" + postfix, false);
    if (authevent === ConfigService.freeAuthId + '' || !authevent) {
        $state.go("admin.login");
    } else {
        $state.go("registration.login", {id: $cookies.get("authevent_" + authevent)});
    }
  }
);

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

angular.module('avRegistration').controller('RegisterController',
  function($scope, $stateParams, $filter, ConfigService, $i18next) {
    $scope.event_id = $stateParams.id;
    $scope.email = $stateParams.email;
  }
);

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
  .directive('avRegister', function(Authmethod, StateDataService, $parse, $state, ConfigService, $cookies, $i18next, $sce) {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
        var autheventid = attrs.eventId;
        scope.dnieurl = ConfigService.dnieUrl + autheventid + '/';
        scope.register = {};
        scope.sendingData = false;
        scope.admin = false;
        scope.error = null;

        scope.email = null;
        if (attrs.email && attrs.email.length > 0) {
          scope.email = attrs.email;
        }

        if ("admin" in attrs) {
          scope.admin = true;
        }

        scope.getLoginDetails = function (eventId) {
          if (!scope.admin) {
              return {
                path: 'election.public.show.login_email',
                data: {id: eventId, email: scope.email}
              };
          } else {
              return {path: 'admin.login_email', data:{email: scope.email}};
          }
        };

        scope.signUp = function(valid) {
            if (!valid) {
                return;
            }
            scope.sendingData = true;
            scope.error = null;
            var data = {
                'captcha_code': Authmethod.captcha_code,
            };
            _.each(scope.register_fields, function (field) {
              data[field.name] = field.value;
              if (field.name === 'email' && _.contains(['email', 'email-otp'], scope.method))
              {
                scope.email = field.value;
              }
              else if (field.name === 'tlf' &&
                _.contains(['sms', 'sms-otp'], scope.method))
              {
                scope.email = field.value;
              }
            });
            var details;
            Authmethod.signup(data, autheventid)
                .then(
                  function onSuccess(response) {
                    details = scope.getLoginDetails(autheventid);
                    if (response.data.status === "ok") {
                        scope.user = response.data.user;
                        StateDataService.go(details.path, details.data, data);
                        scope.error = response.data.msg || $sce.trustAsHtml($i18next('avRegistration.invalidRegisterData', {
                          url: $state.href(details.path, details.data)
                        }));
                    } else {
                        scope.sendingData = false;
                        scope.status = 'Not found';
                        scope.error = response.data.msg || $sce.trustAsHtml($i18next('avRegistration.invalidRegisterData', {
                          url: $state.href(details.path, details.data)
                        }));
                    }
                  },
                  function onError(response) {
                    details = scope.getLoginDetails(autheventid);
                    scope.sendingData = false;
                    scope.status = 'Registration error: ' + response.data.message;

                    if (!!response.data.error_codename && response.data.error_codename === 'invalid-dni') {
                      scope.error = $sce.trustAsHtml($i18next('avRegistration.invalidRegisterDNI'));
                    } else {
                        scope.error = response.data.msg || $sce.trustAsHtml($i18next('avRegistration.invalidRegisterData', {
                          url: $state.href(details.path, details.data)
                        }));
                        if (response.data.msg === 'Invalid captcha') {
                            Authmethod.newCaptcha();
                        }
                    }
                  }
                );
        };

        scope.goLogin = function(event) {
          console.log("goLogin");
          if (event) {
            event.preventDefault();
            event.stopPropagation();
          }

          if (!scope.authevent) {
            return;
          }

          if (scope.authevent['id'] === ConfigService.freeAuthId) {
              $state.go("admin.login");
          } else {
              $state.go("election.public.show.login", {id: scope.authevent['id']});
          }
        };

        scope.apply = function(authevent) {
            scope.method = authevent['auth_method'];
            scope.name = authevent['name'];
            scope.authevent = authevent;

            // if registration is closed, redirect to login
            if (authevent['census'] !== 'open' || scope.method === 'openid-connect') {
              if (authevent['id'] === ConfigService.freeAuthId) {
                  $state.go("admin.login");
              } else {
                  $state.go("election.public.show.login", {id: authevent['id']});
              }
            }
            scope.register_fields = Authmethod.getRegisterFields(authevent);
            var fields = _.map(
              scope.register_fields,
              function (el) {
                el.value = null;
                el.disabled = false;
                if (el.type === "email" && scope.email !== null) {
                  el.value = scope.email;
                  el.disabled = true;
                }
                return el;
              });
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
    }

    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/register-directive/register-directive.html'
    };
  });

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
    .factory('Patterns', function() {
        var patterns = {};
        patterns.get = function(name) {
            if (name === 'dni') {
                return /^\d{7,8}[a-zA-Z]{1}$/i;
            } else if (name === 'mail' || name === 'email') {
                return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            } else {
                return /.*/;
            }
        };
        return patterns;
    });

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

/**
 * Shows a field
 */
angular.module('avRegistration')
  .directive('avrField', function($state) {
    function link(scope, element, attrs) {
      console.log("type = " + scope.field.type);
      scope.index = attrs.index;
    }

    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/field-directive/field-directive.html'
    };
  });

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
  .directive('avrEmailField', function($state, Patterns) {
    function link(scope, element, attrs) {
      scope.emailRe = Patterns.get('email');
    }
    return {
      restrict: 'AE',
      link: link,
      scope: true,
      templateUrl: 'avRegistration/fields/email-field-directive/email-field-directive.html'
    };
  });

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
  .directive('avrDateField', function($state, Patterns) {
    function link(scope, element, attrs) {
        scope.years = [];
        scope.months = [];
        scope.field = scope.$parent.field;
        scope.date = null;

        function initializeValue() {
          var dateValue = null;
          if (
            scope.field.value === null || scope.field.value.length === 0
          ) {
            dateValue = new Date();
          } else {
            var data = scope.field.value.split('-');
            dateValue = new Date(data[0], parseInt(data[1]) - 1, data[2]);
          }
          scope.date = {
            year: dateValue.getFullYear(),
            month: dateValue.getMonth() + 1,
            day: dateValue.getDate()
          };
        }
        initializeValue();

        scope.getYears = function () {
          var initY = (new Date()).getFullYear();
          var i = 0;
          var years = [];
 
          for (i=initY; i>=initY-130; i--) {
            years.push(i);
          }
          return years;
        };

        scope.getMonths = function () {
          var i = 0;
          var months = [];
  
          for (i=1; i<=12; i++) {
            months.push(i);
          }
          return months;
        };

        scope.getDays = function() {
          var days = [];
          var i = 0;
          var ndays = (new Date(scope.date.year, scope.date.month, 0)).getDate();
          for (i=1; i<=ndays; i++) {
            days.push(i);
          }
          return days;
        };

        function numberPadStart(num, size) {
          var str = "000000000" + num;
          return str.substr(str.length - size);
        }

        scope.onChange = function() {
          var monthStr = numberPadStart(scope.date.month, 2);
          var dayStr = numberPadStart(scope.date.day, 2);
          scope.field.value = scope.date.year + "-" + monthStr + "-" + dayStr;
        };

        // initial value update
        scope.onChange();
    }
    return {
      restrict: 'AE',
      link: link,
      scope: {
        label: '=',
      },
      templateUrl: 'avRegistration/fields/date-field-directive/date-field-directive.html'
    };
  });

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
  .directive('avrPasswordField', function($state) {
    return {
      restrict: 'AE',
      scope: true,
      templateUrl: 'avRegistration/fields/password-field-directive/password-field-directive.html'
    };
});
angular.module('avRegistration')
  .directive('avrTextField', function($state) {
    function link(scope, element, attrs) {
      if (angular.isUndefined(scope.field.regex)) {
        scope.re = new RegExp("");
      } else {
        scope.re = new RegExp(scope.field.regex);
      }
    }
    return {
      restrict: 'AE',
      link: link,
      scope: true,
      templateUrl: 'avRegistration/fields/text-field-directive/text-field-directive.html'
    };
  });

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
  .directive('avrDniField', function($state) {
    function link(scope, element, attrs) {
      var dni_re = /^([0-9]{1,8}[A-Z]|[LMXYZ][0-9]{1,7}[A-Z])$/;

      /**
       * Normalizes dnis, using uppercase, removing characters not allowed and
       * left-side zeros
       */
      function normalize_dni(dni) {
        if (!dni) {
          return "";
        }

        var allowed_chars = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";
        var dni2 = dni.toUpperCase();
        var dni3 = "";
        for (var i = 0; i < dni2.lenth; i++) {
          var char = dni2[i];
          if (allowed_chars.indexOf(char) >= 0) {
            dni3 += char;
          }
        }
        var numbers = "1234567890";
        var last_char = "";
        var dni4 = "";
        for (var j = 0; j < dni3.lenth; j++) {
          var char2 = dni3[j];
          if ((last_char==="" || '1234567890'.indexOf(last_char) === -1) && char2 === '0') {
          }
          dni4 += char2;
          last_char = char2;
        }
        return dni4;
      }

      // returns true if regex matches or if there's no regex
      scope.validateDni = function(dni) {
        var norm_dni = normalize_dni(dni);

        if (!norm_dni.match(dni_re)) {
          return true;
        }

        var prefix = norm_dni.charAt(0);
        var index = "LMXYZ".indexOf(prefix);
        var niePrefix = 0;
        if (index > -1) {
          niePrefix = index;
          norm_dni = norm_dni.substr(1);
          if (prefix === 'Y') {
              norm_dni = "1" + norm_dni;
          } else if (prefix === 'Z') {
              norm_dni = "2" + norm_dni;
          }
        }
        var dni_letters = "TRWAGMYFPDXBNJZSQVHLCKE";
        var letter = dni_letters.charAt( parseInt( norm_dni, 10 ) % 23 );
        return letter === norm_dni.charAt(norm_dni.length - 1);
      };
    }
    return {
      restrict: 'AE',
      link: link,
      scope: true,
      templateUrl: 'avRegistration/fields/dni-field-directive/dni-field-directive.html'
    };
  });

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
  .directive('avrCodeField', function($state, Plugins) {
    function link(scope, element, attrs) {
      scope.codePattern = /[abcdefghjklmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789-]{8,9}/;
      var rand_code = '' + _.random(1e12);
      scope.code_id = 'input' + scope.index + rand_code;

      scope.showResendAuthCode = function ()
      { 
        var data = {showUserSendAuthCode: true};
        Plugins.hook('hide-user-send-auth-code', data);
        return data.showUserSendAuthCode;
      };

      // TODO: validate email for email-otp. For now, we just allow the resend
      // button for that use-case
      if (_.contains(['sms', 'sms-otp'], scope.method)) {
        var telInput =
          angular.element(document.getElementById('input' + scope.telIndex));
        scope.isValidTel = telInput.intlTelInput("isValidNumber");
        scope.$watch('telField.value',
          function (newValue, oldValue) {
            scope.isValidTel = telInput.intlTelInput("isValidNumber");
          },
          true);
      }
    }
    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/fields/code-field-directive/code-field-directive.html'
    };
  });

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
  .directive('avrTelField', function($state, $timeout) {
    function link(scope, element, attrs) {

      scope.tlfPattern = /^[+]?\d{9,14}$/;
      scope.isValidNumber = true;

      // lookup ip data and send callbacks when it is available

      var ipData = null;
      var ipCallbacks = [];
      $.get('https://ipinfo.io', function() {}, "jsonp")
      .always(function(resp) {
          ipData = resp;
          for (var i = 0; i < ipCallbacks.length; i++) {
            ipCallbacks[i]();
          }
        });

      $timeout(function() {
        /* configure registration telephone phone number */
        var telInput = angular.element(document.getElementById("input" + scope.index));
        // initialise plugin
        telInput.intlTelInput({
          utilsScript: "election/utils.js",
          separateDialCode: true,
          initialCountry: "auto",
          preferredCountries: ["es", "gb", "us"],
          autoPlaceholder: "aggressive",
          placeholderNumberType: "MOBILE",
          geoIpLookup: function(callback) {
              var applyCountry = function()
              {
                var countryCode = (ipData && ipData.country) ? ipData.country : "es";
                callback(countryCode);
              };
              if (ipData) {
                applyCountry();
              } else {
                ipCallbacks.push(applyCountry);
              }
            }
          });
          if (_.isString(scope.field.value) && 0 < scope.field.value.length) {
            telInput.intlTelInput("setNumber", scope.field.value);
          }

          var validateTel = function()
          {
            scope.$evalAsync(function() {
              var intlNumber = telInput.intlTelInput("getNumber");
              if (intlNumber) {
                scope.field.value = intlNumber;
              }
              var isValid = telInput.intlTelInput("isValidNumber");
              if (!isValid && $("#input"+ scope.index).val().replace("[ \t\n]", "").length > 0)
              {
                telInput.toggleClass("error", true);
                scope.isValidNumber = false;
              } else
              {
                telInput.toggleClass("error", false);
                scope.isValidNumber = true;
              }
            });
          };
          // on keyup / change flag: reset
          telInput.on("keyup change", validateTel);
      });
    }
    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/fields/tel-field-directive/tel-field-directive.html'
    };
  });

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
  .directive('avrBoolField', function($state) {
    return {
      restrict: 'AE',
      scope: true,
      templateUrl: 'avRegistration/fields/bool-field-directive/bool-field-directive.html'
    };
  });

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
  .directive('avrIntField', function($state) {
    function link(scope, element, attrs) {
      if (angular.isUndefined(scope.field.regex)) {
        scope.re = new RegExp("");
      } else {
        scope.re = new RegExp(scope.field.regex);
      }
    }
    return {
      restrict: 'AE',
      link: link,
      scope: true,
      templateUrl: 'avRegistration/fields/int-field-directive/int-field-directive.html'
    };
  });

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
  .directive('avrCaptchaField', ['Authmethod', '$state', '$interval', function(Authmethod, $state, $interval) {
    function link(scope, element, attrs) {
        var timeoutId = null;

        scope.authMethod = Authmethod;
        Authmethod.newCaptcha("");
    }

    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/fields/captcha-field-directive/captcha-field-directive.html'
    };
  }]);

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
  .directive('avrTextareaField', function($state) {
    return {
      restrict: 'AE',
      scope: true,
      templateUrl: 'avRegistration/fields/textarea-field-directive/textarea-field-directive.html'
    };
  });

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
  .directive('avrImageField', function($state, $timeout) {
    function link(scope, element, attrs) {
        function readImage(input) {
            if ( input.files && input.files[0] ) {
                var FR = new FileReader();
                FR.onload = function(e) {
                     scope.field.value = e.target.result;
                };
                FR.readAsDataURL( input.files[0] );
            }
        }

        $timeout(function() {
            $("#image-field").change(function() { readImage( this ); });
        }, 0);
    }

    return {
      restrict: 'AE',
      link: link,
      scope: true,
      templateUrl: 'avRegistration/fields/image-field-directive/image-field-directive.html'
    };
  });

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

/**
 * @description Service that manages the Plugins extension points.
 *
 * These are the hooks called by agora-gui-admin:
 *
 * - Name: election-modified
 *
 *   Description: called by @a ElectionsApi.setCurrent service before the new
 *   election is set.
 *
 *   Input data: {
 *      // old election object (before setCurrent was called)
 *      "old": Election,
 *
 *      // old new election object that is going to be set
 *      "el": Election
 *   }
 *
 * - Name: send-auth-codes-steps
 *
 *   Description: called by @a SendMsg.calculateSteps service before calculating
 *   the number of steps of the send authentication codes dialog. It's a good
 *   way of modifying @a SendMsg.steps.extra.
 *
 *   Input data: {
 *      // current election object
 *      "el": Election,
 *
 *      // ids of the electorate to which the authentication message is going
 *      // to be set. Might be null if it's all the electorate.
 *      "user_ids": List[Integer]
 *   }
 *
 * - Name: send-auth-codes-confirm-extra
 *
 *   Description: called by @a SendMsg.confirmAuthCodesModal service before
 *   showing the @a SendAuthCodesModalConfirm window when sending authentication
 *   codes to the electorate. This hook allows to set some html to be shown in
 *   the modal window. Note that the html will not be trusted unless you
 *   explicitly make it trusted with @a $sce.
 *
 *   Input data: {
 *      // modifiable list of html strings to shown in the modal confirm window.
 *      // starts empty, but other hook handlers might modify it. It's used as
 *      // the hook's output.
 *      "html": []
 *   }
 *
 * - Name: send-auth-codes-confirm-close
 *
 *   Description: Called by @a .confirmAuthCodesModal service after
 *   closing the @a SendAuthCodesModalConfirm window to process the result of
 *   the modal (this result is the input of the hook) and decide what to do.
 *
 *   Input data: string
 *
 * - Name: send-auth-codes-pre
 *
 *   Description: Called by @a SendMsg.sendAuthCodes before sending auth codes.
 *   Used to decide whether or not to send them - if any hook handler returns
 *   a value interpretable as false, won't send it.
 *
 *   Input data: {
 *      // current election object
 *      "el": Election,
 *
 *      // ids of the electorate to which the authentication message is going
 *      // to be set. Might be null if it's all the electorate.
 *      "user_ids": List[Integer]
 *   }
 *
 * - Name: send-auth-codes-success
 *
 *   Description: Called by @a SendMsg.sendAuthCodes after sending auth codes
 *   when the sending was successful.
 *
 *   Input data: {
 *      // current election object
 *      "el": Election,
 *
 *      // ids of the electorate to which the authentication message is going
 *      // to be set. Might be null if it's all the electorate.
 *      "ids": List[Integer]
 *
 *      // response object from jquery
 *      "response": ResponseObject
 *   }
 *
 * - Name: send-auth-codes-error
 *
 *   Description: Called by @a SendMsg.sendAuthCodes after sending auth codes
 *   when the sending had an error.
 *
 *   Input data: {
 *      // current election object
 *      "el": Election,
 *
 *      // ids of the electorate to which the authentication message is going
 *      // to be set. Might be null if it's all the electorate.
 *      "ids": List[Integer]
 *
 *      // response object from jquery
 *      "response": ResponseObject
 *
 * - Name: add-to-census-pre
 *
 *   Description: Called by @a avAdminElcensus.censusCall just before adding
 *   some electors to the election. A hook handler can cancel the add to census
 *   action return a value interpretable as false.
 *
 *   // List of electors that are about to be added
 *   Input data: List[NewElectorMetadata]
 *
 * - Name: add-to-census-success
 *
 *   Description: Called by @a avAdminElcensus.censusCall after adding
 *   some electors to the election when the call to the API was successful.
 *   Allows the hook handler process the api result.
 *
 *   Input data: {
 *      // List of electors that are about to be added
 *      "data": List[NewElectorMetadata],
 *
 *      // response object from jquery
 *      "response": ResponseObject
 *   }
 *
 * - Name: add-to-census-error
 *
 *   Description: Called by @a avAdminElcensus.censusCall after adding
 *   some electors to the election when the call to the api produced an error.
 *   Allows the hook handler process the api result.
 *
 *   Input data: {
 *      // List of electors that are about to be added
 *      "data": List[NewElectorMetadata],
 *
 *      // response object from jquery
 *      "response": ResponseObject
 *   }
 */
angular.module('avRegistration')
    .factory('Plugins', function() {
        var plugins = {};
        // TODO: What are plugins used for exactly? Please explain
        plugins.plugins = {list: []};

        // Signal storage
        plugins.signals = $.Callbacks("unique");

        /**
         * List of hooks handlers.
         *
         * A hook is a point of extension. Each time @a Plugins.hook()
         * is called, all the hooks are called with the arguments given and in
         * list order, so that they can process the hook.
         *
         * To insert/delete/list hook handlers, access directly to
         * @a Plugins.hooks.
         *
         * Each hook handler is a function that receives two arguments:
         * - hookname
         * - data
         *
         * A hook handler should return a value interpretable as a false
         * expression if it wants no other hook to process the call, or
         * anything else otherwise.
         *
         * Example hook handler:
         *
         * <code>
         *    var fooHookHandler = function(hookname, data) {
         *      if (hookname === "foo") {
         *         processFoo(data);
         *         return false;
         *      }
         *
         *      return true;
         *    };
         *
         *    // add the handler
         *    Plugins.hooks.push(fooHookHandler);
         * </code>
         */
        plugins.hooks = [];

        /*
         * Adds a plugin.
         *
         * plugin format:
         * {
         *   name: 'test',
         *   directive: 'test', (optional, only if this link has a directive)
         *   head: true | false,
         *   link: ui-sref link,
         *   menu: html() | {icon: icon, text: text}
         * }
         */
        plugins.add = function(plugin) {
            plugins.plugins.list.push(plugin);
        };

        /*
         * Clears the plugins list.
         */
        plugins.clear = function() {
            plugins.plugins.list = [];
        };

        /**
         * Remove a plugin from the list.
         */
        plugins.remove = function(plugin) {
            // Implemented by creating a new list without the plugin of that
            // name
            var pluginList = plugins.plugins.list;
            plugins.plugins.list = [];
            pluginList.forEach(function(pluginFromList) {
                if (plugin.name !== pluginFromList.name) {
                    plugins.plugins.list.push(pluginFromList);
                }
            });
        };

        /**
         * Emits a signal by name.
         *
         * @data can be any object or even null.
         */
        plugins.emit = function(signalName, data) {
            plugins.signals.fire(signalName, data);
        };

        /**
         * Calls to a hook by name.
         *
         * Each function stored as a hook is called with the provided
         * @a hookname and @a data in the hook insertion order. When a hook
         * returns a value interpretable as false, no more hooks are called.
         *
         * @a data can be any object or even null.
         * @a hookname should be a string.
         *
         * @returns false if any of the hooks returns false, or true otherwise.
         */
        plugins.hook = function(hookname, data) {
            for (var i=0; i<plugins.hooks.length; i++) {
                var h = plugins.hooks[i];
                var ret = h(hookname, data);
                if (!ret) {
                    return false;
                }
            }
            return true;
        };

        return plugins;
    });

/**
 * Directive to include angular templates with directives from plugins into
 * the admin interface
 * This directive is based on the stackoverflow thread:
 * http://stackoverflow.com/questions/17417607/angular-ng-bind-html-unsafe-and-directive-within-it
 **/
angular.module('avRegistration')
.directive(
  'avPluginHtml',
  function ($compile, $sce, $parse)
  {
    return function(scope, element, attrs)
    {
      var parsedHtml = $parse(attrs.ngBindHtml);

      // compile again on template modification
      scope.$watch(
        function()
        {
          return (parsedHtml(scope) || "").toString();
        },
        function()
        {
          // -9999 skips directives in order to prevent recompiling
          // recursively
          $compile(element, null, -9999)(scope);
        }
      );
    };
  }
);

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

/*
 * The avUi module contains a series of user interface directives and utilities.
 */

angular.module('avUi', []);

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

jQuery.fn.flash = function(duration) {
  var selector = this;

  if (!angular.isNumber(duration)) {
    duration = 300;
  }

  if (selector.attr("is-flashing") === "true") {
    return;
  }

  selector.attr("is-flashing", "true");

  selector
    .addClass("flashing")
    .delay(duration)
    .queue(function() {
      selector.removeClass("flashing").addClass("flashing-out").dequeue();
    })
    .delay(duration)
    .queue(function() {
      selector.removeClass("flashing flashing-out").dequeue();
      selector.attr("is-flashing", "false");
    });
};
/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2020  Agora Voting SL <agora@agoravoting.com>

 * agora-gui-admin is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * agora-gui-admin  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with agora-gui-admin.  If not, see <http://www.gnu.org/licenses/>.
**/

angular.module('avUi')
  .directive(
    'avChildrenElections', 
    function(ConfigService) 
    {
      // we use it as something similar to a controller here
      function link(scope, element, attrs) 
      {
        scope.electionsById = {};
        scope.selectedElectionId = scope.parentElectionId;

        // process each election
        _.each(
          scope.childrenElectionInfo.presentation.categories,
          function (category) 
          {
            _.each(
              category.events,
              function (election) 
              {
                if (
                  scope.mode === 'checkbox' ||
                  scope.mode === 'toggle-and-callback'
                ) 
                {
                  election.data = election.data || false;
                  election.disabled = election.disabled || false;
                }
              }
            );
          }
        );

        // add a processElection function
        scope.click = function (election) 
        {
          console.log("click to election.event_id = " + election.event_id);
          if (scope.mode === 'checkbox') 
          {
            election.data = !election.data;
          } 
          else if (scope.mode === 'toggle-and-callback')
          {
            scope.selectedElectionId = election.event_id;
            scope.callback({electionId: election.event_id});
          }
        };
      }

      return {
        restrict: 'AE',
        scope:  {
          mode: '@',
          callback: '&?',
          parentElectionId: '@?',
          childrenElectionInfo: '='
        },
        link: link,
        templateUrl: 'avUi/children-elections-directive/children-elections-directive.html'
      };
    }
  );

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

/*
 * Simple error directive.
 */
angular.module('avUi')
  .directive('avSimpleError', function($resource, $window) {
    function link(scope, element, attrs) {
      // moves the title on top of the busy indicator
      scope.updateTitle = function() {
        var title = element.find(".av-simple-error-title");

        // set margin-top
        var marginTop = - title.height() - 45;
        var marginLeft = - title.width()/2;
        title.attr("style", "margin-top: " + marginTop + "px; margin-left: " + marginLeft + "px");
      };

      scope.$watch(attrs.title,
        function() {
          scope.updateTitle();
        }
      );
    }
    return {
      restrict: 'AE',
      scope: {},
      link: link,
      transclude: true,
      templateUrl: 'avUi/simple-error-directive/simple-error-directive.html'
    };
  });

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

/*
 * Simple change lang directive, that can be used in the navbar as a list
 * element:
 * <li class="dropdown" av-change-lang></li>
 */
angular.module('avUi')
  .directive('avChangeLang', function($i18next, ipCookie, angularLoad, amMoment, ConfigService) {
    function link(scope, element, attrs) {
      scope.deflang = window.i18n.lng();
      angular.element('#ng-app').attr('lang', scope.deflang);
      scope.langs =  $i18next.options.lngWhitelist;

      // Changes i18n to a specific language, setting also a cookie for
      // remembering it, and updating all the translations instantly.
      //
      // Triggered when the user clicks and selects a language.
      scope.changeLang = function(lang) {
        $i18next.options.lng = lang;
        console.log("setting cookie");
        var cookieConf = {
          expires: 360,
          path: "/"
        };
        ipCookie(
          "lang",
          lang,
          _.extend(cookieConf, ConfigService.i18nextCookieOptions));
        scope.deflang = lang;
        angular.element('#ng-app').attr('lang', scope.deflang);

        // async load moment i18n
        angularLoad
          .loadScript(ConfigService.base + '/locales/moment/' + lang + '.js')
          .then(function () {
            amMoment.changeLocale(lang);
          });
      };
    }

    return {
      restrict: 'AE',
      scope: {},
      link: link,
      templateUrl: 'avUi/change-lang-directive/change-lang-directive.html'
    };
  });

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

/*
 * directive used to position an element always at the bottom, so that it's
 * always shown completely. There are two scenarios:
 * a) if the page has no scroll, we assume the element is shown, and do nothing
 * b) if the page has scroll, the bottom of the page is not completely (or at
 *    all) being shown, so we set the affixed element the class affix-bottom and
 *    make space for it giving some bottom margin in its parent element.
 *
 * As an optional trigger to the settings of the affix-bottom, you can also set
 * the data-force-affix-width attribute in the affixed element to a number of
 * pixels. If this attribute is set and the window width is less than this,
 * automatically the element will be affixed.
 */
angular.module('avUi')
  .directive('avAffixBottom', function($window, $timeout, $parse) {
    var affixBottomClass = "affix-bottom";
    var checkPosition = function(scope, instance, el, options) {

      var affix = false;
      var elHeight = $(el).actual('height');

      if (($("body").height() + elHeight > window.innerHeight) ||
          (instance.forceAffixWidth && window.innerWidth < instance.forceAffixWidth)) {
        affix = affixBottomClass;
      }

      if (instance.affixed === affix) {
        return;
      }

      instance.affix = affix;
      instance.setIsAffix(scope, affix);
      el.removeClass("hidden");

      if (!affix) {
        el.removeClass(affixBottomClass);
        $(el).parent().css("margin-bottom", instance.defaultBottomMargin);
      } else {
        el.addClass(affixBottomClass);

        // add bottom-margin automatically
        $(el).parent().css("margin-bottom", elHeight + "px");
      }

    };

    return {
      restrict: 'EAC',
      link: function(scope, iElement, iAttrs) {
        // instance saves state between calls to checkPosition
        var instance = {
          affix: false,
          getIsAffix: null,
          setIsAffix: angular.noop,
          defaultBottomMargin: iElement.css("margin-bottom"),
          forceAffixWidth: parseInt(iAttrs.forceAffixWidth, 10)
        };


        if (iAttrs.avAffixBottom.length > 0) {
          instance.getIsAffix = $parse(iAttrs.avAffixBottom);
          instance.setIsAffix = instance.getIsAffix.assign;
        }

        // timeout is used with callCheckPos so that we do not create too many
        // calls to checkPosition, at most one per 300ms
        var timeout;

        function callCheckPos() {
          timeout = $timeout(function() {
            $timeout.cancel(timeout);
            checkPosition(scope, instance, iElement, iAttrs);
          }, 300);
        }
        callCheckPos();

        // watch for window resizes and element resizes too
        angular.element($window).on('resize', callCheckPos);
        angular.element(document.body).on('resize', callCheckPos);
        console.log("iElement NOT resize, height = " + iElement.height());
        angular.element(iElement).on('resize', callCheckPos);
      }
    };

  });

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

/**
 * Usage:
 *
 * <div>
 *    <div>I need some space, this is a sibling</div>
 *    <div av-auto-height>
 *        I stretch to the available height,
 *        calculated from the height available from .parent and my siblings.
 *    </div>
 * </div>
 */
angular.module('avUi')
  .directive('avAutoHeight', function($window, $timeout) {
    return {
      link: function(scope, element, attrs) {
        var sibling, recalculate, promise = null;

        sibling = function() {
          return element.closest(attrs.parentSelector).find(attrs.siblingSelector);
        };

        recalculate = function () {
          if (promise) {
            $timeout.cancel(promise);
          }
          promise = $timeout(function() {
            var additionalHeight = 0, height;
            if (!!attrs.additionalHeight) {
              additionalHeight = parseInt(attrs.additionalHeight, 10);
            }
            height = sibling().height();
            element.css('max-height', (height + additionalHeight) + "px");
          }, 300);
        };

        scope.$watch(
          function () {
            return sibling().height();
          },
          function (newValue, oldValue) {
            recalculate();
          });

        recalculate();
      }
    };
  }
);
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

angular.module('avUi')
  .directive('avAffixTopOffset', function($window, $timeout, $parse) {
    var affixClass = "affix-top";
    var checkPosition = function(scope, instance, el, options) {

      var affix = false;
      var offset = el.offset();

      if (instance.affix && $window.pageYOffset + 20 >= instance.scrollAffix) {
        return;
      } else if (offset.top - $window.pageYOffset < instance.avAffixTopOffset) {
        affix = true;
      }

      if (instance.affix === affix) {
        return;
      }

      instance.affix = affix;
      instance.scrollAffix = $window.pageYOffset;
      if (!affix) {
        el.removeClass(affixClass);
        el.attr("style", "");

        if (options.affixPlaceholder !== undefined) {
          $(options.affixPlaceholder).removeClass("affixed");
        }
      } else {
        el.addClass(affixClass);
        el.data("page-offset", $window.pageYOffset);
        el.css("position", "fixed");
        el.css("float", "none");
        el.css("top", Math.floor(instance.avAffixTopOffset) + "px");
        el.css("left", Math.floor(instance.baseOffset.left) + "px");
        el.css("width", Math.floor(instance.baseWidth) + "px");
        el.css( "z-index", "10");

        if (options.affixPlaceholder !== undefined) {
          $(options.affixPlaceholder).addClass("affixed");
        }
      }

    };

    return {
      restrict: 'EAC',
      link: function(scope, iElement, iAttrs) {
        // instance saves state between calls to checkPosition
        var instance = {
          affix: false,
          scrollAffix: null,
          baseOffset: iElement.offset(),
          baseWidth: iElement.width(),
          avAffixTopOffset: parseInt(iAttrs.avAffixTopOffset, 10)
        };


        function callCheckPos() {
          checkPosition(scope, instance, iElement, iAttrs);
        }
        callCheckPos();

        // when window resizes, the baseoffset etc needs to be reset
        function resize() {
          iElement.removeClass(affixClass);
          iElement.attr("style", "");
          instance.affix = false;
          instance.scrollAffix = null;
          $timeout(function () {
            instance.baseOffset = iElement.offset();
            instance.baseWidth = iElement.width();
            callCheckPos();
          }, 300);
        }

        // watch for window scrolling
        angular.element($window).on('scroll', callCheckPos);
        angular.element($window).on('resize', resize);
      }
    };

  });

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

/*
 * directive used to position an element always at the top. It just sets its
 * specified element with a margin-top to make space for the affixed element.
 * This is done dynamically, so that each time the affixed element's height
 * changes, the top-margin of the specified is recalculated and set.
 */
angular.module('avUi')
  .directive('avAffixTop', function($window, $timeout) {

    // add margin-top automatically
    var updateMargin = function(el, options) {
      var minHeight = parseInt(options.minHeight);
      var height = Math.max(
        $(el).height(),
        (angular.isNumber(minHeight) && !isNaN(minHeight) ? minHeight : 0) );
      $(options.avAffixTop).css("padding-top", height + "px");
    };

    return {
      restrict: 'EAC',
      link: function(scope, iElement, iAttrs) {
        updateMargin(iElement, iAttrs);

        if (iAttrs.minHeight === undefined) {
          iAttrs.minHeight = "20";
        }

        // timeout is used with callCheckPos so that we do not create too many
        // calls to checkPosition, at most one per 300ms
        var timeout;

        function updateMarginTimeout() {
          timeout = $timeout(function() {
            $timeout.cancel(timeout);
            updateMargin(iElement, iAttrs);
          }, 300);
        }
        updateMarginTimeout();

        // watch for window resizes and element resizes too
        angular.element(iElement).bind('resize', updateMarginTimeout);
        angular.element($window).bind('resize', updateMarginTimeout);
        $(iAttrs.avAffixTop).change(updateMarginTimeout);
      }
    };

  });

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

/*
 * avCollapsing limits the default maximum height of an element by making it
 * collapsable if it exceeds the max-height of the selector.
 *  - if the element's height doesn't exceed its maximum height, the
 *    data-toggle-selector element will be set to hidden
 *  - if the element's height exceeds its maximum height, the
 *    data-toggle-selector element will be removed the class "hidden".
 *  - if the data-toggle-selector element it contains is clicked, they will be
 *    added the class ".in".
 *  - if the element's height exceeds its max height and the toggle is not
 *    ".in", then it adds the ".collapsed" class to the element, and makes sure
 *    the data-toggle-selector element is not hidden.
 *  - it will watch the element and window resizes to see if the conditions
 *    change.
 * - both maxHeightSelector and data-toggle-selector will be found using the
 *   parent selector as a base if the attribute "parent-selector" is set.
 *   Otherwise, it will directly a global angular.element() to find them.
 */
angular.module('avUi')
  .directive('avCollapsing', function($window, $timeout) {

    function select(instance, el, selector) {
      var val;
      if (!!instance.parentSelector) {
        val = el.closest(instance.parentSelector).find(selector);
      } else {
        val = angular.element(selector);
      }
      return val;
    }

    function collapseEl(instance, el) {
      var val = null;
      if (!!instance.collapseSelector) {
        val = select(instance, el, instance.collapseSelector);
      } else {
        val = angular.element(el);
      }
      return val;
    }

    var checkCollapse = function(instance, el, options) {
      var maxHeight = select(instance, el, instance.maxHeightSelector).css("max-height");
      var height = angular.element(el)[0].scrollHeight;

      // we want to remove padding-top in the calculation
      var paddingTop = angular.element(el).css('padding-top');

      if (maxHeight.indexOf("px") === -1) {
        console.log("invalid non-pixels max-height for " + instance.maxHeightSelector);
        return;
      }

      if (!paddingTop || paddingTop.indexOf("px") === -1) {
        paddingTop = 0;
      } else {
        paddingTop = parseInt(paddingTop.replace("px", ""));
      }

      maxHeight = parseInt(maxHeight.replace("px", ""));

      // make sure it's collapsed if it should
      if (height - paddingTop > maxHeight) {
        // already collapsed
        if (instance.isCollapsed) {
          return;
        }
        instance.isCollapsed = true;
        collapseEl(instance, el).addClass("collapsed");
        select(instance, el, instance.toggleSelector).removeClass("hidden in");

      // removed collapsed and hide toggle otherwise
      } else {
        // already not collapsed
        if (!instance.isCollapsed) {
          return;
        }
        instance.isCollapsed = false;
        collapseEl(instance, el).removeClass("collapsed");
        select(instance, el, instance.toggleSelector).addClass("hidden");
      }
    };

    var toggleCollapse = function(instance, el, options) {
      // if it's collapsed, uncollapse
      if (instance.isCollapsed) {
        collapseEl(instance, el).removeClass("collapsed");
        select(instance, el, instance.toggleSelector).addClass("in");

      // collapse otherwise
      } else {
        collapseEl(instance, el).addClass("collapsed");
        select(instance, el, instance.toggleSelector).removeClass("in");
      }


      instance.isCollapsed = !instance.isCollapsed;
    };

    return {
      restrict: 'EAC',
      link: function(scope, iElement, iAttrs) {
        var instance = {
          isCollapsed: false,
          maxHeightSelector: iAttrs.avCollapsing,
          toggleSelector: iAttrs.toggleSelector,
          parentSelector: iAttrs.parentSelector,
          collapseSelector: iAttrs.collapseSelector
        };

        // timeout is used with callCheck so that we do not create too many
        // calls to checkPosition, at most one per 100ms
        var timeout;

        function callCheck() {
          timeout = $timeout(function() {
            $timeout.cancel(timeout);
            checkCollapse(instance, iElement, iAttrs);
          }, 500);
        }
        callCheck();


        function launchToggle() {
            toggleCollapse(instance, iElement, iAttrs);
        }

        // watch for window resizes and element resizes too
        angular.element($window).bind('resize', callCheck);
        angular.element(iElement).bind('resize', callCheck);

        // watch toggle's clicking
        angular.element(instance.toggleSelector).bind('click', launchToggle);
      }
    };

  });

/*
The MIT License (MIT)
Copyright (c) 2014 Kent C. Dodds
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Source: https://github.com/kentcdodds/kcd-angular
Copyright (c) 2014 Kent C. Dodds kent+github@doddsfamily.us
 */

angular.module('avUi').directive('avRecompile', function($compile, $parse) {
  'use strict';
  function getElementAsHtml(el) {
    return angular.element('<a></a>').append(el.clone()).html();
  }

  return {
    scope: true, // required to be able to clear watchers safely
    compile: function(el) {
      var template = getElementAsHtml(el);
      return function link(scope, $el, attrs) {
        var stopWatching = scope.$parent.$watch(attrs.avRecompile, function(_new, _old) {
          var useBoolean = attrs.hasOwnProperty('useBoolean');
          if ((useBoolean && (!_new || _new === 'false')) || (!useBoolean && (!_new || _new === _old))) {
            return;
          }
          // reset kcdRecompile to false if we're using a boolean
          if (useBoolean) {
            $parse(attrs.kcdRecompile).assign(scope.$parent, false);
          }

          // recompile
          var newEl = $compile(template)(scope.$parent);
          $el.replaceWith(newEl);

          // Destroy old scope, reassign new scope.
          stopWatching();
          scope.$destroy();
        });
      };
    }
  };
});

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

// source: https://gist.github.com/tommaitland/7579618#file-ng-debounce-js
angular.module('avUi')
  .directive('avDebounce', function($timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      priority: 99,
      link: function(scope, elm, attr, ngModelCtrl) {
        if (attr.type === 'radio' || attr.type === 'checkbox') {
          return;
        }
        elm.unbind('input');
        var debounce;

        elm.bind('input', function() {
          $timeout.cancel(debounce);
          debounce = $timeout( function() {
            scope.$apply(function() {
              ngModelCtrl.$setViewValue(elm.val());
            });
          }, attr.avDebounce || 500);
        });

        elm.bind('blur', function() {
          scope.$apply(function() {
            ngModelCtrl.$setViewValue(elm.val());
          });
        });
      }
    };
});
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

angular.module('avUi')
  .service('InsideIframeService', function() {
    return function() {
      try {
          return window.self !== window.top;
      } catch (e) {
          return true;
      }
    };
  });

/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2015-2021  Agora Voting SL <agora@agoravoting.com>

 * agora-gui-admin is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * agora-gui-admin  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with agora-gui-admin.  If not, see <http://www.gnu.org/licenses/>.
**/

angular
  .module('avUi')
  .directive(
    'avLoadCss', 
    function() 
    {
      function link(scope, element, _attrs) 
      {
        function updateCss(newValue, oldValue)
        {
          if (newValue && typeof newValue === 'string' && newValue !== oldValue) 
          {
            element.text(newValue);
          }
        }
        updateCss(scope.css);
        scope.$watch("css", updateCss);
      }

      return {
        restrict: 'AE',
        scope: {
          css: '='
        },
        link: link
      };
  });

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

/*
 * Returns the percentage of votes received by an answer. The base number
 * of the percentage that is used depends on the
 * "answer_total_votes_percentage" option in the question.
 */
angular.module('avUi')
  .service('PercentVotesService', function() {
    return function (total_votes, question, over, format) {
      if (format === undefined) {
        format = "str";
      }
      
      function print(num) {
        if (format === "str") {
          return num.toFixed(2) + "%";
        } else {
          return num;
        }
      }

      // special case
      if (total_votes === 0) {
        return print(0.00);
      }

      var base = question.totals.valid_votes + question.totals.null_votes + question.totals.blank_votes;
      if (over === undefined || over === null) {
        over = question.answer_total_votes_percentage;
      }
      if ("over-valid-votes" === over || "over-total-valid-votes" === over) {
        base = question.totals.valid_votes;
      }
      else if ("over-total-valid-points" === over &&
        undefined !== question.totals.valid_points) {
        base = question.totals.valid_points;
      }

      return print(100*total_votes / base);
    };
  });

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

/*
 * Checks input data with a list of checks.
 *
 * Example:
 *
        var checks = [
          {
            check: "array-group",
            prefix: "question-",
            checks: [
              {check: "is-array", key: "questions"},
              {check: "array-length", key: "questions", min: 1, max: 40},
              {
                check: "array-key-group-chain",
                key: "questions",
                prefix: "question-",
                checks: [
                  {check: "is-int", key: "min"},
                  {check: "is-int", key: "max"},
                  {check: "is-int", key: "num_winners"},
                  {check: "is-array", key: "answers"},
                  {check: "array-length", key: "answers", min: 1, max: 10000},
                  {check: "int-size", key: "min", min: 0, max: "$value.max"},
                  {
                    check: "int-size",
                    key: "max",
                    min: "$value.min",
                    max: "$value.answers.length"
                  },
                  {
                    check: "int-size",
                    key: "num_winners",
                    max: "$value.answers.length"
                  }
                ]
              }
            ]
          }
        ];

        scope.errors = [];
        CheckerService({
          checks: checks,
          data: scope.elections,
          onError: function (errorKey, errorData) {
            scope.errors.push({
              data: errorData,
              key: errorKey
            });
          }
        });
 */
angular.module('avUi')
  .service('CheckerService', function() {
    function checker(d) {

      /*
       * Used to eval the expressions given by the programmer in the checker
       * script
       */
      function evalValue(code, $value) {
        if (angular.isString(code)) {
          /* jshint ignore:start */
          return eval(code);
          /* jshint ignore:end */
        } else {
          return code;
        }
      }

      function sumStrs(str1, str2) {
        var ret = "";
        if (angular.isString(str1)) {
          ret = str1;
        }
        if (angular.isString(str2)) {
          ret += str2;
        }
        return ret;
      }

      function error(errorKey, errorData, postfix) {
        angular.extend(errorData, d.errorData);
        d.onError(
          _.reduce([d.prefix, errorKey, postfix], sumStrs, ""),
          errorData
        );
      }

      if (angular.isUndefined(d.errorData)) {
        d.errorData = {};
      }

      var ret = _.every(d.checks, function (item) {
        var pass = true;
        var itemMin;
        var itemMax;
        var max;
        var min;
        var dataToCheck = angular.isDefined(item.key) ? d.data[item.key] : d.data;
        if (item.check === "is-int") {
          pass = angular.isNumber(dataToCheck, item.postfix);
          if (!pass) {
            error(item.check, {key: item.key}, item.postfix);
          }

        } else if (item.check === "is-array") {
          pass = angular.isArray(dataToCheck, item.postfix);
          if (!pass) {
            error(item.check, {key: item.key}, item.postfix);
          }
        } else if (item.check === "lambda") {
          if (!item.validator(dataToCheck)) {
            var errorData = {key: item.key};
            if (!angular.isUndefined(item.appendOnErrorLambda)) {
              errorData = item.appendOnErrorLambda(dataToCheck);
            }
            if (_.isObject(item.append) &&
                _.isString(item.append.key) &&
                !_.isUndefined(item.append.value)) {
              errorData[item.append.key] = evalValue(item.append.value, item);
            }
            error(item.check, errorData, item.postfix);
          }

        } else if (item.check === "is-string-if-defined") {
          pass = angular.isUndefined(dataToCheck) ||
                   angular.isString(dataToCheck, item.postfix);
          if (!pass) {
            error(item.check, {key: item.key}, item.postfix);
          }

        } else if (item.check === "array-length-if-defined") {
          if (angular.isDefined(dataToCheck)) {
            itemMin = evalValue(item.min, d.data);
            itemMax = evalValue(item.max, d.data);

            if (angular.isArray(dataToCheck) || angular.isString(dataToCheck))
            {
              min = angular.isUndefined(item.min) || dataToCheck.length >= itemMin;
              max = angular.isUndefined(item.max) || dataToCheck.length <= itemMax;
              pass = min && max;
              if (!min) {
                error(
                  "array-length-min",
                  {key: item.key, min: itemMin, num: dataToCheck.length},
                  item.postfix);
              }
              if (!max) {
                var itemErrorData0 = {key: item.key, max: itemMax, num: dataToCheck.length};
                error(
                  "array-length-max",
                  itemErrorData0,
                  item.postfix);
              }
            }
          }
        } else if (item.check === "is-string") {
          pass = angular.isString(dataToCheck, item.postfix);
          if (!pass) {
            error(item.check, {key: item.key}, item.postfix);
          }

        } else if (item.check === "array-length") {
          itemMin = evalValue(item.min, d.data);
          itemMax = evalValue(item.max, d.data);

          if (angular.isArray(dataToCheck) || angular.isString(dataToCheck))
          {
            min = angular.isUndefined(item.min) || dataToCheck.length >= itemMin;
            max = angular.isUndefined(item.max) || dataToCheck.length <= itemMax;
            pass = min && max;
            if (!min) {
              error(
                "array-length-min",
                {key: item.key, min: itemMin, num: dataToCheck.length},
                item.postfix);
            }
            if (!max) {
              var itemErrorData = {key: item.key, max: itemMax, num: dataToCheck.length};
              error(
                "array-length-max",
                itemErrorData,
                item.postfix);
            }
          }

        } else if (item.check === "int-size") {
          itemMin = evalValue(item.min, d.data);
          itemMax = evalValue(item.max, d.data);
          min = angular.isUndefined(item.min) || dataToCheck >= itemMin;
          max = angular.isUndefined(item.max) || dataToCheck <= itemMax;
          pass = min && max;
          if (!min) {
            error(
              "int-size-min",
              {key: item.key, min: itemMin, value: dataToCheck},
              item.postfix);
          }
          if (!max) {
            error(
              "int-size-max",
              {key: item.key, max: itemMax, value: dataToCheck},
              item.postfix);
          }
        } else if (item.check === "group-chain") {
          pass = _.all(
            _.map(
              item.checks,
              function(check) {
                return checker({
                  data: d.data,
                  errorData: d.errorData,
                  onError: d.onError,
                  checks: [check],
                  prefix: sumStrs(d.prefix, item.prefix)
                });
              })
            );
        } else if (item.check === "array-key-group-chain") {
          pass = _.every(
            dataToCheck,
            function (data, index) {
              var extra = {};
              var prefix = "";
              if (angular.isString(d.prefix)) {
                prefix = d.prefix;
              }
              if (angular.isString(item.prefix)) {
                prefix += item.prefix;
              }
              extra.prefix = prefix;
              extra[item.append.key] = evalValue(item.append.value, data);
              return checker({
                data: data,
                errorData: angular.extend({}, d.errorData, extra),
                onError: d.onError,
                checks: item.checks,
                prefix: sumStrs(d.prefix, item.prefix),
              });
            });
        } else if (item.check === "array-group-chain") {
          pass = _.every(d.data, function (data, index) {
            var extra = {};
            extra[item.append.key] = evalValue(item.append.value, data);
            return checker({
              data: data,
              errorData: angular.extend({}, d.errorData, extra),
              onError: d.onError,
              checks: item.checks,
              prefix: sumStrs(d.prefix, item.prefix),
            });
          });
        } else if (item.check === "array-group") {
          pass = _.contains(
            _.map(
              d.data,
              function (data, index) {
                var extra = {};
                extra[item.append.key] = evalValue(item.append.value, data);
                return checker({
                  data: data,
                  errorData: angular.extend({}, d.errorData, extra),
                  onError: d.onError,
                  checks: item.checks,
                  prefix: sumStrs(d.prefix, item.prefix),
                });
              }),
            true);
        } else if (item.check === "object-key-chain") {
          pass = _.isString(item.key) && _.isObject(dataToCheck);
          if (!!pass) {
            var data = dataToCheck;
            var extra = {};
            extra[item.append.key] = evalValue(item.append.value, data);
            var prefix = "";
            if (angular.isString(d.prefix)) {
              prefix += d.prefix;
            }
            if (angular.isString(item.prefix)) {
              prefix += item.prefix;
            }
            pass = _.every(
              item.checks,
              function (check, index) {
                return checker({
                  data: data,
                  errorData: angular.extend({}, d.errorData, extra),
                  onError: d.onError,
                  checks: [check],
                  prefix: prefix,
                });
              });
          }
        }
        if (!pass && d.data.groupType === 'chain') {
          return false;
        }
        return true;
      });

      return ret;
    }
    return checker;
  });

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

/*
 * Given a number, adds dots every three digits.
 *
 * Example:
 *
 *    AddDotsToIntService(1234567) --> "1.234.567"
 *    AddDotsToIntService(1111.234567) --> "1.111,234567"
 */
angular.module('avUi')
  .service('AddDotsToIntService', function() {
    return function (number, fixedDigits) {
      if (angular.isNumber(fixedDigits) && fixedDigits >= 0) {
        number = number.toFixed(parseInt(fixedDigits));
      }
      var number_str = (number + "").replace(".", ",");
      var ret = "";
      var commaPos = number_str.length;
      if (number_str.indexOf(",") !== -1) {
        commaPos = number_str.indexOf(",");
      }
      for (var i = 0; i < commaPos; i++) {
        var reverse = commaPos - i;
        if ((reverse % 3 === 0) && reverse > 0 && i > 0) {
          ret = ret + ".";
        }
        ret = ret + number_str[i];
      }
      return ret + number_str.substr(commaPos, number_str.length);
    };
  });

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

angular.module('avUi')
  .service('EndsWithService', function() {
    return function (originString, searchString) {
        if (!angular.isString(originString) || !angular.isString(searchString)) {
          return false;
        }
        var lastIndex = originString.indexOf(searchString);
        return lastIndex !== -1 && lastIndex === originString.length - searchString.length;
      };
    });
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

/*
 * Save data between states.
 *
 * Example:
 *
 *    StateDataService.go('election.public.show.login', {id: autheventid}, {something: "foo"})
 *    StateDataService.getData() --> {something: "foo"}
 */
angular.module('avUi')
  .service('StateDataService', function($state) {
    var data = {};
    return {
      go: function (path, stateData, newData) {
        data = angular.copy(newData);
        $state.go(path, stateData);
      },
      getData: function () {
        return data;
      }
    };
  });

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

/**
 * Always scrolls to bottom the div to which the directive is attached when
 * the observed property is modified.
 *
 * Example:
 *
 *    <div av-autoscroll-down ng-bind-html="log"></div>
 */
angular.module('avUi')
  .directive('avScrollToBottom', function($timeout) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        scope.$watch(
          function () {
            return element.children().length;
          },
          function () {
            element.animate({ scrollTop: element.prop('scrollHeight') }, 300);
          }
        );
      }
    };
});
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

/**
 * Adds target blank to links.
 *
 * Usage example:
 *
 * <div ng-bind-html="foo.contentHtml | addTargetBlank"></div>
 */
angular.module('avUi')
  .filter('addTargetBlank', function(){
    return function(x) {
      //defensively wrap in a div to avoid 'invalid html' exception, then add
      //the target _blank to links
      var tree = angular.element('<div>'+x+'</div>');
      tree.find('a').attr('target', '_blank');

      //trick to have a string representation
      return angular.element('<div>').append(tree).html();
    };
  });
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

angular.module('avUi')
  .filter('htmlToText', function() {
    return function(text) {
      return angular.element('<div>'+text+'</div>').text();
    };
  });
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

// see https://github.com/angular/angular.js/issues/1404
angular.module('avUi')
  .config(function($provide) {
    $provide.decorator('ngModelDirective', function($delegate) {
      var ngModel = $delegate[0], controller = ngModel.controller;
      ngModel.controller = ['$scope', '$element', '$attrs', '$injector', function(scope, element, attrs, $injector) {
        var $interpolate = $injector.get('$interpolate');
        attrs.$set('name', $interpolate(attrs.name || '')(scope));
        $injector.invoke(controller, Object.setPrototypeOf(this, controller.prototype), {
          '$scope': scope,
          '$element': element,
          '$attrs': attrs
        });
      }];
      return $delegate;
    });
    $provide.decorator('formDirective', function($delegate) {
      var form = $delegate[0], controller = form.controller;
      form.controller = ['$scope', '$element', '$attrs', '$injector', function(scope, element, attrs, $injector) {
        var $interpolate = $injector.get('$interpolate');
        attrs.$set('name', $interpolate(attrs.name || attrs.ngForm || '')(scope));
        $injector.invoke(controller, Object.setPrototypeOf(this, controller.prototype), {
          '$scope': scope,
          '$element': element,
          '$attrs': attrs
        });
      }];
      return $delegate;
    });
  });

 /**
 * This file is part of agora-gui-common.
 * Copyright (C) 2015-2016  Agora Voting SL <agora@agoravoting.com>

 * agora-gui-elections is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * agora-gui-elections  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with agora-gui-elections.  If not, see <http://www.gnu.org/licenses/>.
**/

/*
 * Shows the public view of an election. Controls mainly the changing inner states
 * loading config, showing results, showing error if needed.
 */
angular.module('avUi').controller('DocumentationUiController',
  function($state, $stateParams, $http, $scope, $sce, $i18next, ConfigService, InsideIframeService, Authmethod) {
    $scope.inside_iframe = InsideIframeService();
    $scope.documentation = ConfigService.documentation;
    $scope.documentation.security_contact = ConfigService.legal.security_contact;
    $scope.documentation_html_include = $sce.trustAsHtml(ConfigService.documentation_html_include);
    $scope.auths_url = '/election/' + $stateParams.id + '/public/authorities';
    $scope.election_id = $stateParams.id + '';

    Authmethod.viewEvent($stateParams.id)
      .then(function(response) {
        if (response.data.status === "ok") {
          $scope.authEvent = response.data.events;
        }
      });
  }
);

angular.module('avUi')
  .directive('documentationDirective', function() {
    return {
      restrict: 'AE',
      scope: {
        extra: '='
      },
      templateUrl: 'avUi/documentation-directive/documentation-directive.html',
      controller: 'DocumentationUiController'
    };
  });

/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2015-2016  Agora Voting SL <agora@agoravoting.com>

 * agora-gui-admin is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * agora-gui-admin  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with agora-gui-admin.  If not, see <http://www.gnu.org/licenses/>.
**/

angular.module('avUi')
  .directive('avFoot', function(ConfigService) {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
      scope.contact = ConfigService.contact;
      scope.social = ConfigService.social;
      scope.technology = ConfigService.technology;
      scope.legal = ConfigService.legal;
      scope.organization = ConfigService.organization;
    }

    return {
      restrict: 'AE',
      scope: {
      },
      link: link,
      templateUrl: 'avUi/foot-directive/foot-directive.html'
    };
  });

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

angular.module(
  'agora-gui-common',
  ['ui.bootstrap',
  'ui.utils',
  'ui.router',
  'ngAnimate',
  'ngResource',
  'ngCookies',
  'ipCookie',
  'ngSanitize',
  'infinite-scroll',
  'angularMoment',
  'avConfig',
  'jm.i18next',
  'avRegistration',
  'avUi',
  'avTest',
  'angularFileUpload',
  'dndLists',
  'angularLoad',
  'ng-autofocus'
]);

angular.module('jm.i18next').config(function ($i18nextProvider, ConfigServiceProvider) {
  // note that we do not send the language: by default, it will try the language
  // supported by the web browser
  $("#no-js").hide();

  $i18nextProvider.options = _.extend(
    {
      useCookie: true,
      useLocalStorage: false,
      fallbackLng: 'en',
      cookieName: 'lang',
      detectLngQS: 'lang',
      lngWhitelist: ['en', 'es', 'gl', 'ca'],
      resGetPath: '/locales/__lng__.json',
      defaultLoadingValue: '' // ng-i18next option, *NOT* directly supported by i18next
    },
    ConfigServiceProvider.i18nextInitOptions);
});

angular.module('agora-gui-common').run(function($http, $rootScope) {

  $rootScope.safeApply = function(fn) {
    var phase = $rootScope.$$phase;
    if (phase === '$apply' || phase === '$digest') {
      if (fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams) {
      console.log("change start from " + fromState.name + " to " + toState.name);
      $("#angular-preloading").show();
    });
  $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams) {
      console.log("change success");
      $("#angular-preloading").hide();
    });
});

/*
This directive will trigger a click if the user presses space or enter
 */
angular.module('agora-gui-common').directive('ngSpaceClick', function ($timeout) {
  return function (scope, element, attrs) {
    element.bind("keydown", function (event) {
      switch (event.which) {
        case 13:              // ENTER
        case 32: {            // SPACE
          $timeout(function() {event.currentTarget.click();},0);
          event.stopPropagation();
        }
      }
    });
  };
});

/*
This directive allows us to pass a function in on an enter key to do what we want.
 */
angular.module('agora-gui-common').directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

/**
 * Truncate Filter
 * @Param text
 * @Param length, default is 10
 * @Param end, default is "..."
 * @return string
 */
angular.module('agora-gui-common').filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length)) {
                length = 10;
            }

            if (end === undefined) {
                end = "...";
            }

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }

        };
    });

/*globals avConfigData:false, $buo:false */
/**
 * Check browser version with browser-update.org
 */
function $buo_f() {
  $buo(avConfigData.browserUpdate);
}

if (avConfigData.browserUpdate) {
  try {
    document.addEventListener("DOMContentLoaded", $buo_f, false);
  } catch (e) {
    window.attachEvent("onload", $buo_f);
  }
}

angular.module('avTest', []);
/*
 * UnitTestE2EController, that allows E2E unit tests to inject code for testing
 * purposes.
 */

angular.module('avTest')
  .controller('UnitTestE2EController',
    function($scope, $location, ConfigService) {
      if (ConfigService.debug) {
        $scope.html = ($location.search()).html;
        console.log($location.search());
      }
    });

angular.module('agora-gui-common').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('avRegistration/error.html',
    "<div av-simple-error><p ng-i18next=\"avRegistration.errorRegistration\"></p></div>"
  );


  $templateCache.put('avRegistration/field-directive/field-directive.html',
    "<div ng-switch=\"field.type\"><div avr-email-field ng-switch-when=\"email\"></div><div avr-password-field ng-switch-when=\"password\"></div><div avr-code-field ng-switch-when=\"code\"></div><div avr-text-field ng-switch-when=\"text\"></div><div avr-dni-field ng-switch-when=\"dni\"></div><div avr-date-field ng-switch-when=\"date\"></div><div avr-tel-field ng-switch-when=\"tlf\"></div><div avr-int-field ng-switch-when=\"int\"></div><div avr-bool-field ng-switch-when=\"bool\"></div><div avr-captcha-field ng-switch-when=\"captcha\"></div><div avr-textarea-field ng-switch-when=\"textarea\"></div><div avr-image-field ng-switch-when=\"image\"></div></div>"
  );


  $templateCache.put('avRegistration/fields/bool-field-directive/bool-field-directive.html',
    "<div class=\"form-group\"><label class=\"control-label col-sm-4\"><input type=\"checkbox\" class=\"form-control\" aria-label=\"input{{index}}-bool\" id=\"{{index}}Text\" ng-model=\"field.value\" ng-disabled=\"field.disabled\" tabindex=\"{{index}}\" ng-required=\"{{field.required}}\"></label><div class=\"col-sm-8\"><label class=\"text-left\" for=\"{{index}}Text\"><span ng-bind-html=\"field.name | addTargetBlank\"></span></label><p class=\"help-block\" ng-if=\"field.help\" ng-bind-html=\"field.help | addTargetBlank\"></p><div class=\"input-error\"></div></div></div>"
  );


  $templateCache.put('avRegistration/fields/captcha-field-directive/captcha-field-directive.html',
    "<div class=\"form-group\"><div class=\"col-sm-8 col-sm-offset-4\"><img ng-src=\"{{authMethod.captcha_image_url}}\" style=\"width:161px;height:65px\"></div><label for=\"{{index}}Text\" class=\"control-label col-sm-4\"><span>{{field.name}}</span></label><div class=\"col-sm-8\"><input type=\"text\" class=\"form-control\" aria-label=\"input{{index}}-captcha\" id=\"{{index}}Text\" minlength=\"{{field.min}}\" maxlength=\"{{field.max}}\" ng-model=\"field.value\" ng-disabled=\"field.disabled\" autocomplete=\"off\" tabindex=\"{{index}}\" required><p class=\"help-block\" ng-if=\"field.help\">{{field.help}}</p><div class=\"input-error\">{{authMethod.captcha_status}}</div></div></div>"
  );


  $templateCache.put('avRegistration/fields/code-field-directive/code-field-directive.html',
    "<div class=\"form-group\"><label for=\"{{code_id}}\" class=\"control-label col-sm-4\" ng-i18next=\"avRegistration.codeLabel\"></label><div class=\"col-sm-8\"><input type=\"text\" class=\"form-control\" aria-label=\"{{code_id}}-code\" id=\"{{code_id}}\" ng-model=\"field.value\" ng-disabled=\"field.disabled\" tabindex=\"{{index}}\" autocomplete=\"off\" ng-class=\"{'filled': form[code_id].$viewValue.length > 0}\" minlength=\"8\" maxlength=\"9\" ng-pattern=\"codePattern\" name=\"{{code_id}}\" ng-i18next=\"[placeholder]avRegistration.codePlaceholder\" required><p class=\"help-block\" ng-i18next=\"avRegistration.codeHelp\"></p><p class=\"help-block code-help\"><span ng-if=\"allowUserResend && showResendAuthCode() && !sendingData && ((method !== 'sms' && method !== 'sms-otp') || isValidTel)\"><b ng-i18next=\"avRegistration.noCodeReceivedQuestion\"></b> <a ng-click=\"resendAuthCode(field)\" ng-i18next=\"avRegistration.sendCodeAgain\"></a> <span></span></span></p><div class=\"input-error\"></div></div></div>"
  );


  $templateCache.put('avRegistration/fields/date-field-directive/date-field-directive.html',
    "<div class=\"form-group\"><label ng-if=\"!label\" class=\"control-label col-sm-4\">{{field.name}}</label> <label class=\"control-label col-sm-4\" ng-if=\"label\" ng-bind=\"label\"></label><div class=\"col-sm-8\"><select aria-label=\"{{field.name}}-year\" ng-model=\"date.year\" ng-change=\"onChange()\" ng-disabled=\"field.disabled\"><option ng-selected=\"date.year == item\" ng-repeat=\"item in getYears()\" ng-value=\"item\">{{item}}</option></select> <select aria-label=\"{{field.name}}-month\" ng-model=\"date.month\" ng-change=\"onChange()\" ng-disabled=\"field.disabled\"><option ng-selected=\"date.month == item\" ng-repeat=\"item in getMonths()\" ng-value=\"item\">{{item}}</option></select> <select aria-label=\"{{field.name}}-day\" ng-model=\"date.day\" ng-change=\"onChange()\" ng-disabled=\"field.disabled\"><option ng-selected=\"date.day == item\" ng-repeat=\"item in getDays()\" ng-value=\"item\">{{item}}</option></select><p class=\"help-block\" ng-if=\"field.help\">{{field.help}}</p></div></div>"
  );


  $templateCache.put('avRegistration/fields/dni-field-directive/dni-field-directive.html',
    "<ng-form name=\"fieldForm\"><div class=\"form-group\" ng-class=\"{'has-error': fieldForm.input.$dirty && fieldForm.input.$invalid}\"><label for=\"input{{index}}\" class=\"control-label col-sm-4\"><span>{{field.name}}</span></label><div class=\"col-sm-8\"><input type=\"text\" id=\"input{{index}}\" aria-label=\"input{{index}}-dni\" class=\"form-control\" minlength=\"{{field.min}}\" maxlength=\"{{field.max}}\" ng-model=\"field.value\" ng-model-options=\"{debounce: 500}\" ng-disabled=\"field.disabled\" tabindex=\"{{index}}\" autocomplete=\"off\" ui-validate=\"{dni: 'validateDni($value)'}\" ng-required=\"{{field.required}}\"><p class=\"help-block\" ng-i18next=\"avRegistration.dniHelp\"></p><div class=\"input-error\"><span class=\"error text-brand-danger\" ng-show=\"fieldForm.input.$dirty && fieldForm.input.$invalid\" ng-i18next=\"avRegistration.invalidDni\"></span></div></div></div></ng-form>"
  );


  $templateCache.put('avRegistration/fields/email-field-directive/email-field-directive.html',
    "<div class=\"form-group\" ng-class=\"{true: 'has-error',false: 'is-required'}[form.emailText.$dirty && form.emailText.$invalid]\"><label for=\"emailText\" class=\"control-label col-sm-4\" ng-i18next=\"avRegistration.emailLabel\"></label><div class=\"col-sm-8\"><input type=\"text\" class=\"form-control\" ng-model=\"field.value\" name=\"emailText\" id=\"emailText\" ng-i18next=\"[placeholder]avRegistration.emailPlaceholder\" tabindex=\"{{index}}\" autocomplete=\"off\" ng-pattern=\"emailRe\" required ng-disabled=\"field.disabled\"><p class=\"text-warning\" ng-if=\"'email-otp' === method\" ng-i18next=\"avRegistration.otpHelp\"></p><div class=\"input-error\"><small class=\"error text-danger\" ng-show=\"form.emailText.$dirty && form.emailText.$invalid\" ng-i18next=\"avRegistration.emailError\"></small></div></div></div>"
  );


  $templateCache.put('avRegistration/fields/image-field-directive/image-field-directive.html',
    "<ng-form name=\"fieldForm\"><div class=\"form-group\" ng-class=\"{'has-error': fieldForm.input.$dirty && fieldForm.input.$invalid}\"><label for=\"image-field\" class=\"control-label col-sm-4\"><span>{{field.name}}</span></label><div class=\"col-sm-8\"><input type=\"file\" name=\"image\" id=\"image-field\" aria-label=\"image-field{{index}}\" class=\"form-control\" ng-disabled=\"field.disabled\" tabindex=\"{{index}}\" ng-required=\"{{field.required}}\"><p class=\"help-block\" ng-i18next=\"avRegistration.imageHelp\"></p><div class=\"input-error\"><span class=\"error text-brand-danger\" ng-show=\"fieldForm.input.$dirty && fieldForm.input.$invalid\" ng-i18next=\"avRegistration.invalidImage\"></span></div></div></div></ng-form>"
  );


  $templateCache.put('avRegistration/fields/int-field-directive/int-field-directive.html',
    "<ng-form name=\"fieldForm\"><div class=\"form-group\" ng-class=\"{'has-error': fieldForm.input.$dirty && fieldForm.input.$invalid}\"><label for=\"input{{index}}\" class=\"control-label col-sm-4\"><span>{{field.name}}</span></label><div class=\"col-sm-8\"><input type=\"number\" class=\"form-control\" id=\"input{{index}}\" aria-label=\"input{{index}}-int\" name=\"input\" min=\"{{field.min}}\" autocomplete=\"off\" max=\"{{field.max}}\" ng-model=\"field.value\" ng-model-options=\"{debounce: 500}\" ng-disabled=\"field.disabled\" ng-pattern=\"re\" tabindex=\"{{index}}\" ng-required=\"{{field.required}}\"><p class=\"help-block\" ng-if=\"field.help\">{{field.help}}</p><div class=\"input-error\"><span class=\"error text-brand-danger\" ng-show=\"fieldForm.input.$dirty && fieldForm.input.$invalid\" ng-i18next=\"avRegistration.invalidDataRegEx\"></span></div></div></div></ng-form>"
  );


  $templateCache.put('avRegistration/fields/password-field-directive/password-field-directive.html',
    "<div class=\"form-group\" ng-class=\"{true: 'has-error',false: 'is-required'}[form.passwordText.$dirty && form.passwordText.$invalid]\"><label for=\"passwordText\" class=\"control-label col-sm-4\"><span ng-i18next=\"avRegistration.passwordLabel\"></span></label><div class=\"col-sm-8\"><input type=\"password\" class=\"form-control\" ng-model=\"field.value\" id=\"passwordText\" autocomplete=\"off\" ng-disabled=\"field.disabled\" ng-i18next=\"[placeholder]avRegistration.passwordPlaceholder\" tabindex=\"{{index}}\" required><p class=\"help-block\"><a href=\"#\" ng-i18next=\"avRegistration.forgotPassword\" ng-click=\"forgotPassword()\" tabindex=\"{{index+1}}\"></a></p><div class=\"input-error\"><small class=\"error text-danger\" ng-show=\"form.$submitted && form.$invalid\" ng-i18next=\"avRegistration.invalidCredentials\"></small></div></div></div>"
  );


  $templateCache.put('avRegistration/fields/tel-field-directive/tel-field-directive.html',
    "<div class=\"form-group\"><label for=\"input{{index}}\" class=\"control-label col-sm-4\" ng-i18next=\"avRegistration.telLabel\"></label><div class=\"col-sm-8\"><input type=\"tel\" class=\"form-control phone-login\" aria-label=\"input{{index}}-tel\" id=\"input{{index}}\" ng-disabled=\"field.disabled\" tabindex=\"{{index}}\" name=\"input{{index}}\" required><p class=\"help-block\" ng-i18next=\"avRegistration.telHelp\"></p><p class=\"text-warning\" ng-if=\"'sms-otp' === method\" ng-i18next=\"avRegistration.otpHelp\"></p><div class=\"input-error\"><span class=\"error\" ng-show=\"!isValidNumber\" ng-i18next=\"avRegistration.telInvalid\"></span></div></div></div>"
  );


  $templateCache.put('avRegistration/fields/text-field-directive/text-field-directive.html',
    "<ng-form name=\"fieldForm\"><div class=\"form-group\" ng-class=\"{'has-error': fieldForm.input.$dirty && fieldForm.input.$invalid}\"><label for=\"input{{index}}\" class=\"control-label col-sm-4\"><span ng-if=\"field.name == 'username' || field.name == '__username'\" ng-i18next=\"avRegistration.usernameLabel\"></span> <span ng-if=\"field.name != 'username' && field.name != '__username'\">{{field.name}}</span></label><div class=\"col-sm-8\"><input type=\"text\" name=\"input\" id=\"input{{index}}\" aria-label=\"input{{index}}-textarea\" class=\"form-control\" minlength=\"{{field.min}}\" maxlength=\"{{field.max}}\" ng-model=\"field.value\" ng-model-options=\"{debounce: 500}\" ng-disabled=\"field.disabled\" tabindex=\"{{index}}\" ng-pattern=\"re\" autocomplete=\"off\" ng-required=\"{{field.required}}\"><p class=\"help-block\" ng-if=\"field.help\">{{field.help}}</p><div class=\"input-error\"><span class=\"error text-brand-danger\" ng-show=\"fieldForm.input.$dirty && fieldForm.input.$invalid\" ng-i18next=\"avRegistration.invalidDataRegEx\"></span></div></div></div></ng-form>"
  );


  $templateCache.put('avRegistration/fields/textarea-field-directive/textarea-field-directive.html',
    "<div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><textarea aria-label=\"{{index}}Text\" id=\"{{index}}Text\" rows=\"5\" cols=\"60\" tabindex=\"{{index}}\" readonly>{{field.name}}</textarea><p class=\"help-block\" ng-if=\"field.help\">{{field.help}}</p></div></div>"
  );


  $templateCache.put('avRegistration/loading.html',
    "<div avb-busy><p ng-i18next=\"avRegistration.loadingRegistration\"></p></div>"
  );


  $templateCache.put('avRegistration/login-controller/login-controller.html',
    "<div class=\"col-xs-12 top-section\"><div class=\"pad\"><div av-login event-id=\"{{event_id}}\" code=\"{{code}}\" email=\"{{email}}\" with-code=\"{{withCode}}\" username=\"{{username}}\" ng-if=\"!isOpenId\"></div><div av-openid-connect ng-if=\"isOpenId\"></div></div></div>"
  );


  $templateCache.put('avRegistration/login-directive/login-directive.html',
    "<div class=\"container-fluid\"><div class=\"row\"><div class=\"col-sm-12 loginheader\"><h2 class=\"tex-center\" ng-if=\"!isCensusQuery && method !== 'openid-connect'\" ng-i18next=\"[i18next]({name: orgName})avRegistration.loginHeader\"></h2><h2 class=\"tex-center\" ng-if=\"!isCensusQuery && method === 'openid-connect'\" ng-i18next=\"[i18next]avRegistration.loginButton\"></h2><h2 class=\"tex-center\" ng-if=\"!!isCensusQuery\" ng-i18next=\"avRegistration.censusQueryHeader\"></h2></div><div class=\"col-sm-6\" ng-if=\"method !== 'openid-connect'\"><form name=\"form\" id=\"loginForm\" role=\"form\" class=\"form-horizontal\"><div ng-repeat=\"field in login_fields\" avr-field index=\"{{$index+1}}\" ng-if=\"field.steps === undefined || field.steps.indexOf(currentFormStep) !== -1\"></div><div class=\"col-sm-offset-4 col-sm-8 button-group\"><div class=\"input-error\" ng-if=\"!isCensusQuery\"><div class=\"error text-danger\" ng-if=\"error\">{{ error }}</div></div><div class=\"input-warn\"><span class=\"text-warning\" ng-if=\"!form.$valid || sendingData\" ng-i18next>avRegistration.fillValidFormText</span></div><button type=\"submit\" class=\"btn btn-block btn-success\" ng-if=\"!isCensusQuery\" ng-i18next=\"avRegistration.loginButton\" ng-click=\"loginUser(form.$valid)\" tabindex=\"{{login_fields.length+1}}\" ng-disabled=\"!form.$valid || sendingData\"></button> <button type=\"submit\" class=\"btn btn-block btn-success\" ng-if=\"!!isCensusQuery\" ng-i18next=\"avRegistration.checkCensusButton\" ng-click=\"checkCensus(form.$valid)\" tabindex=\"{{login_fields.length+1}}\" ng-disabled=\"!form.$valid || sendingData\"></button><div class=\"census-query\" ng-if=\"isCensusQuery\"><div class=\"input-info census-query\" ng-if=\"censusQuery == 'querying'\"><div class=\"text-info\" ng-i18next=\"avRegistration.censusQuerying\"></div></div><div class=\"input-success census-query\" ng-if=\"censusQuery == 'success'\"><div class=\"success text-success\" ng-i18next=\"[html]avRegistration.censusSuccess\"></div></div><div class=\"input-success census-query\" ng-if=\"censusQuery == 'fail'\"><div class=\"error text-danger\" ng-i18next=\"[html]avRegistration.censusFail\"></div></div></div></div></form></div><div class=\"col-sm-5 col-sm-offset-1 hidden-xs\" ng-if=\"registrationAllowed && !isCensusQuery  && method !== 'openid-connect'\"><h3 class=\"help-h3\" ng-i18next=\"avRegistration.notRegisteredYet\"></h3><p><a ng-if=\"!isAdmin\" href=\"/election/{{election.id}}/public/register\" ng-i18next=\"avRegistration.registerHere\" ng-click=\"goSignup()\" tabindex=\"{{login_fields.length+2}}\"></a><br><a ng-if=\"isAdmin\" href=\"{{ signupLink }}\" ng-i18next=\"avRegistration.registerHere\" tabindex=\"{{login_fields.length+2}}\"></a><br><span ng-i18next=\"avRegistration.fewMinutes\"></span></p></div><div class=\"col-sm-12 text-center\" ng-if=\"method === 'openid-connect'\"><span ng-repeat=\"provider in openIDConnectProviders\"><a ng-click=\"openidConnectAuth(provider)\" alt=\"{{provider.description}}\" class=\"btn btn-primary btn-login\"><img ng-if=\"!!provider.icon\" alt=\"{{provider.description}}\" class=\"logo-img\" ng-src=\"{{provider.icon}}\"> {{provider.title}}</a></span></div></div></div>"
  );


  $templateCache.put('avRegistration/openid-connect-directive/openid-connect-directive.html',
    ""
  );


  $templateCache.put('avRegistration/register-controller/register-controller.html',
    "<div class=\"col-xs-12 top-section\"><div class=\"pad\"><div av-register event-id=\"{{event_id}}\" code=\"{{code}}\" email=\"{{email}}\"></div></div></div>"
  );


  $templateCache.put('avRegistration/register-directive/register-directive.html',
    "<div class=\"container\"><div class=\"row\"><div class=\"col-sm-12\"><h2 ng-if=\"!admin\" class=\"registerheader\" ng-i18next=\"avRegistration.registerHeader\"></h2><h2 ng-if=\"admin\" class=\"registerheader\" ng-i18next=\"avRegistration.registerAdminHeader\"></h2></div></div><div class=\"row\"><div class=\"col-sm-6\"><div ng-if=\"method == 'dnie'\"><a type=\"submit\" class=\"btn btn-block btn-success\" ng-i18next=\"avRegistration.registerButton\" ng-href=\"{{ dnieurl }}/\"></a></div><form ng-if=\"method != 'dnie'\" name=\"form\" id=\"registerForm\" role=\"form\" class=\"form-horizontal\"><div ng-repeat=\"field in register_fields\" avr-field index=\"{{$index+1}}\"></div><div class=\"col-sm-offset-4 col-sm-8 button-group\"><div class=\"input-error\"><div class=\"error text-danger\" ng-if=\"error\" ng-bind-html=\"error\"></div></div><div class=\"input-warn\"><span class=\"text-warning\" ng-if=\"!form.$valid || sendingData\" ng-i18next>avRegistration.fillValidFormText</span></div><button type=\"submit\" class=\"btn btn-block btn-success\" ng-i18next=\"avRegistration.registerButton\" ng-click=\"signUp(form.$valid)\" tabindex=\"{{register_fields.length+1}}\" ng-disabled=\"!form.$valid || sendingData\"></button></div></form></div><div class=\"col-sm-5 col-sm-offset-1 help-sidebar hidden-xs\"><span><h3 class=\"help-h3\" ng-i18next=\"avRegistration.registerAdminFormHelpTitle\"></h3><p ng-i18next>avRegistration.helpAdminRegisterForm</p></span><span><p ng-if=\"!admin\" ng-i18next>avRegistration.helpRegisterForm</p><h3 class=\"help-h3\" ng-i18next=\"avRegistration.alreadyRegistered\"></h3><p ng-i18next>[html]avRegistration.helpAlreadyRegisteredForm</p><a href=\"\" ng-click=\"goLogin($event)\" ng-i18next=\"avRegistration.loginHere\"></a><br></span></div></div></div>"
  );


  $templateCache.put('avRegistration/success.html',
    "<div av-success><p ng-i18next=\"avRegistration.successRegistration\"></p></div>"
  );


  $templateCache.put('avUi/change-lang-directive/change-lang-directive.html',
    "<a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" role=\"button\" aria-expanded=\"false\">{{ deflang }} <span class=\"caret\"></span></a><ul class=\"dropdown-menu\" role=\"menu\"><li ng-repeat=\"lang in langs\"><a role=\"menuitem\" ng-click=\"changeLang(lang)\" ng-space-click tabindex=\"0\">{{lang}}</a></li></ul>"
  );


  $templateCache.put('avUi/children-elections-directive/children-elections-directive.html',
    "<div class=\"row\" ng-if=\"mode === 'toggle-and-callback'\"><div class=\"col-xs-12\"><div class=\"btn btn-success btn-election\" ng-class=\"{'selected': selectedElectionId === parentElectionId}\" ng-click=\"click({event_id: parentElectionId})\"><span ng-i18next>avAdmin.childrenElections.main</span></div></div></div><div ng-repeat=\"category in childrenElectionInfo.presentation.categories\" class=\"row\"><div class=\"col-xs-12\"><h4>{{category.title}}</h4><div ng-repeat=\"election in category.events\" class=\"btn btn-success btn-election\" ng-disabled=\"election.disabled\" ng-class=\"{'selected': selectedElectionId === election.event_id}\" data-election-id=\"{{election.event_id}}\" ng-click=\"click(election)\"><i ng-if=\"mode === 'checkbox'\" class=\"fa-fw fa\" ng-class=\"{'fa-square-o': !election.data, 'fa-check-square-o': !!election.data}\" aria-hidden=\"true\"></i> {{election.title}}</div></div></div>"
  );


  $templateCache.put('avUi/documentation-directive/documentation-directive.html',
    "<div><h2 class=\"text-center text-av-secondary\" ng-i18next=\"avDocumentation.documentation.title\"></h2><p ng-i18next=\"avDocumentation.documentation.first_line\"></p><ul class=\"docu-ul\"><li ng-if=\"!!documentation.faq\"><a href=\"{{documentation.faq}}\" target=\"_blank\" ng-i18next=\"avDocumentation.documentation.faq\"></a></li><li ng-if=\"!!documentation.overview\"><a href=\"{{documentation.overview}}\" target=\"_blank\" ng-i18next=\"avDocumentation.documentation.overview\"></a></li><li><a href=\"{{auths_url}}\" target=\"_blank\" ng-i18next=\"avDocumentation.documentation.authorities\"></a></li><li ng-if=\"!!documentation.technical\"><a href=\"{{documentation.technical}}\" target=\"_blank\" ng-i18next=\"avDocumentation.documentation.technical\"></a></li><li ng-if=\"!!documentation.security_contact\"><a href=\"{{documentation.security_contact}}\" target=\"_blank\" ng-i18next=\"avDocumentation.documentation.security_contact\"></a></li></ul><div class=\"documentation-html-include\" av-plugin-html ng-bind-html=\"documentation_html_include\"></div></div>"
  );


  $templateCache.put('avUi/foot-directive/foot-directive.html',
    "<div class=\"commonfoot\"><div class=\"social\" style=\"text-align: center;\"><span class=\"powered-by pull-left\" ng-i18next=\"[html:i18next]({url: organization.orgUrl, name: organization.orgName})avCommon.poweredBy\"></span> <a href=\"{{social.facebook}}\" target=\"_blank\" ng-if=\"!!social.facebook\" aria-label=\"Facebook\"><i class=\"fa fa-fw fa-lg fa-facebook\"></i></a> <a href=\"{{social.twitter}}\" target=\"_blank\" ng-if=\"!!social.twitter\" aria-label=\"Twitter\"><i class=\"fa fa-fw fa-lg fa-twitter\"></i></a> <a href=\"{{social.googleplus}}\" target=\"_blank\" ng-if=\"!!social.googleplus\" aria-label=\"Google Plus\"><i class=\"fa fa-fw fa-lg fa-google-plus\"></i></a> <a href=\"{{social.youtube}}\" target=\"_blank\" ng-if=\"!!social.youtube\" aria-label=\"Youtube\"><i class=\"fa fa-fw fa-lg fa-youtube-play\"></i></a> <a href=\"{{social.github}}\" target=\"_blank\" ng-if=\"!!social.github\" aria-label=\"Github\"><i class=\"fa fa-fw fa-lg fa-github\"></i></a></div></div>"
  );


  $templateCache.put('avUi/simple-error-directive/simple-error-directive.html',
    "<div class=\"av-simple-error-title\" ng-transclude></div>"
  );


  $templateCache.put('test/test_booth_widget.html',
    "<!DOCTYPE html><html><head><title>Test frame</title><meta charset=\"UTF-8\"></head><script>function getCastHmac(auth_data, callback) {\n" +
    "      callback(\"khmac:///sha-256;5e25a9af28a33d94b8c2c0edbc83d6d87355e45b93021c35a103821557ec7dc5/voter-1110-1dee0c135afeae29e208550e7258dab7b64fb008bc606fc326d41946ab8e773f:1415185712\");\n" +
    "    }</script><body style=\"overflow-y: hidden; overflow-x: hidden; padding: 0; margin: 0\"><div style=\"width: 100%; display: block; position: absolute; top: 0; bottom: 0; scroll: none; padding: 0; margin: 0\"><a class=\"agoravoting-voting-booth\" href=\"http://agora.dev/#/election/1110/vote\" data-authorization-funcname=\"getCastHmac\">Votar con Agora Voting</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=\"http://agora.dev/avWidgets.min.js\";fjs.parentNode.insertBefore(js,fjs);}}(document,\"script\",\"agoravoting-widgets-js\");</script></div></body></html>"
  );


  $templateCache.put('test/unit_test_e2e.html',
    "<div dynamic=\"html\" id=\"dynamic-result\"></div>"
  );

}]);
