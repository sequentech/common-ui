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

        function calculateCountdownPercent() {
          var ratio = (scope.logoutTimeMs - Date.now())/(scope.logoutTimeMs - scope.countdownStartTimeMs);
          return Math.min(100, Math.round(10000*ratio)/100) + '%';
        }

        // find progress bar and update its width
        function updateProgressBar(percent) {
          var element = $(".logout-bar")[0];
          if (!element) {
            // There's no logout on the login page
            return;
          }
          element.style.setProperty('width', percent);
        }

        // helper function for enableLogoutCountdown()
        function updateTimedown() {
          if (scope.$parent.getSessionEndTime) {
            scope.logoutTimeMs = scope.$parent.getSessionEndTime();
          }

          if (scope.$parent.getSessionStartTime) {
            scope.countdownStartTimeMs = scope.$parent.getSessionStartTime(true);
          }

          scope.showCountdown = true;
          var now = Date.now();
          scope.countdownSecs = Math.round((scope.logoutTimeMs - now) / 1000);
          scope.countdownMins = Math.round((scope.logoutTimeMs - now) / (60 * 1000));
          scope.countdownPercent = calculateCountdownPercent();
          updateProgressBar(scope.countdownPercent);
          scope.$apply();
          if (scope.countdownSecs <= 1) {
            return;
          }
          setTimeout(
            updateTimedown,
            1000
          );
        }
      
        // Show countdown on logout button based on cookies
        function enableLogoutCountdown() {
          scope.showCountdown = false;

          if (scope.$parent.isStateCompatibleWithCountdown && !scope.$parent.isStateCompatibleWithCountdown()) {
            return;
          }
  
          var election = (
            (!!scope.parentElection) ?
            scope.parentElection :
            scope.election
          );
  
          if (
            ConfigService.authTokenExpirationSeconds &&
            (
              election &&
              election.presentation &&
              _.isNumber(election.presentation.booth_log_out__countdown_seconds)
            )
          ) {
            scope.showCountdown = false;
            scope.countdownSecs = 0;
            scope.countdownMins = 0;

            var initialTimeMs = scope.$parent.getSessionStartTime && scope.$parent.getSessionStartTime(true) || Date.now();
            scope.elapsedCountdownMs = (
              election.presentation.booth_log_out__countdown_seconds > 0?
              election.presentation.booth_log_out__countdown_seconds :
              ConfigService.authTokenExpirationSeconds
            ) * 1000;
            if (scope.$parent.getSessionEndTime) {
              scope.logoutTimeMs = scope.$parent.getSessionEndTime();
            } else {
              scope.logoutTimeMs = initialTimeMs + ConfigService.authTokenExpirationSeconds * 1000;
            }
            scope.countdownStartTimeMs = scope.logoutTimeMs - scope.elapsedCountdownMs;
            scope.countdownPercent = calculateCountdownPercent();
            updateProgressBar(scope.countdownPercent);

            // If we're on a demo/live preview, the bar is fixed at 100%
            if (scope.isDemo || scope.isPreview) {
              return;
            }
            
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