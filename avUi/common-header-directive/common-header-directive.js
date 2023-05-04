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
        scope.defaultLogo = "/booth/img/sequent_voting_logo_100.png";
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