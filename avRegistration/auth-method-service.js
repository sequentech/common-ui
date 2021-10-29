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
        authmethod.resetVotersToPreRegistration = function (
          electionId, voterIds, comment
        ){
          var params = {
            "user-ids": voterIds,
            "comment": comment
          };
          var url = backendUrl + 'auth-event/' + electionId + '/reset-voter/';

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

        authmethod.removeUsersIds = function(eid, election, user_ids, comment) {
            var url = backendUrl + 'auth-event/'+eid+'/census/delete/';
            var data = {"user-ids": user_ids};
            if (comment) {
              data['comment'] = comment;
            }
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
