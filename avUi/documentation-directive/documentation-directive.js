 /**
 * This file is part of common-ui.
 * Copyright (C) 2015-2016  Sequent Tech Inc <legal@sequentech.io>

 * election-portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * election-portal  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with election-portal.  If not, see <http://www.gnu.org/licenses/>.
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
