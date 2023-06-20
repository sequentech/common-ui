/**
 * This file is part of common-ui.
 * Copyright (C) 2015-2023 Sequent Tech Inc <legal@sequentech.io>

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

/*
 * Directive that shows the booth header.
 */
angular
  .module('avUi')
  .directive(
    'avbCommonHeader',
    function(ConfigService, ShowVersionsModalService)
    {
      var link = function(scope, _element, attrs) {
        scope.parentElection = scope.$parent.parentElection;
        scope.election = scope.$parent.election;
        scope.confirmLogoutModal = scope.$parent.confirmLogoutModal;
        scope.configService = ConfigService;
        scope.ballotHash = attrs.ballotHash !== 'false' && attrs.ballotHash  || false;
        scope.isElectionPortal = ("true" === attrs.isElectionPortal) || false;
        scope.buttonsInfo = attrs.buttonsInfo && JSON.parse(attrs.buttonsInfo) || false;
        scope.defaultLogo = "/booth/img/Sequent_logo.svg";
        scope.enableLogOut = function () {
          var election = (
            (!!scope.parentElection) ?
            scope.parentElection :
            scope.election
          );
  
          return (
            !election ||
            !election.presentation ||
            !election.presentation.extra_options ||
            !election.presentation.extra_options.booth_log_out__disable
          );
        };

        scope.showVersionsModal = ShowVersionsModalService;

        function updateTimedown() {
          scope.showCountdown = true;
          scope.countdownSecs = Math.round((scope.logoutTimeMs - Date.now()) / 1000);
          scope.countdownMins = Math.round((scope.logoutTimeMs - Date.now()) / (60 * 1000));
          var ratio = (scope.logoutTimeMs - Date.now())/(scope.logoutTimeMs - scope.countdownStartTimeMs);
          scope.countdownPercent = (Math.round(10000*ratio)/100) + '%';
          $(".logout-bar")[0].style.setProperty('width', scope.countdownPercent);
          scope.$apply();
          if (scope.countdownSecs <= 1) {
            return;
          }
          setTimeout(
            updateTimedown,
            scope.countdownMins > 0?  1 * 1000 : 1000
          );
        }
      
        // Show countdown on logout button based on cookies
        function enableLogoutCountdown() {
          scope.showCountdown = false;
          // demo and live preview don't need to expire
          if (scope.isDemo || scope.isPreview) {
            //return;
          }
  
          var election = (
            (!!scope.parentElection) ?
            scope.parentElection :
            scope.election
          );
  
          if (
            ConfigService.cookies.expires &&
            (
              election &&
              election.presentation &&
              _.isNumber(election.presentation.booth_log_out__countdown_seconds)
            )
          ) {
            scope.showCountdown = false;
            scope.countdownSecs = 0;
            scope.countdownMins = 0;
            scope.countdownPercent = '100%';
            $(".logout-bar")[0].style.setProperty('width', scope.countdownPercent);

            var initialTimeMs = Date.now();
            scope.elapsedCountdownMs = (
              election.presentation.booth_log_out__countdown_seconds > 0?
              election.presentation.booth_log_out__countdown_seconds :
              ConfigService.cookies.expires * 60
            ) * 1000;
            scope.logoutTimeMs = initialTimeMs + ConfigService.cookies.expires * 60 * 1000;
            scope.countdownStartTimeMs = scope.logoutTimeMs - scope.elapsedCountdownMs;
            
            setTimeout(
              updateTimedown,
              election.presentation.booth_log_out__countdown_seconds > 0?  scope.countdownStartTimeMs - Date.now() : 0
            );

          }
        }
        setTimeout(enableLogoutCountdown, 0);
      };
      return {
        restrict: 'AE',
        scope: {
          hashHelp: '&'
        },
        link: link,
        templateUrl: 'avUi/common-header-directive/common-header-directive.html'
      };
    }
  );