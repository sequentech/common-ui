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
  function($state, $stateParams, $http, $scope,$i18next, ConfigService, InsideIframeService, Authmethod, extra) {
    $scope.inside_iframe = InsideIframeService();
    $scope.documentation = ConfigService.documentation;
    $scope.documentation.security_contact = ConfigService.legal.security_contact;
    $scope.documentation_html_include = ConfigService.documentation_html_include;
    $scope.auths_url = '/election/' + $stateParams.id + '/public/authorities';
    $scope.legal_url = '/election/' + $stateParams.id + '/public/legal';
    if (_.isObject(extra)) {
      $scope = _.extend($scope, extra);
    }

    Authmethod.viewEvent($stateParams.id)
      .success(function(data) {
        if (data.status === "ok") {
          $scope.authEvent = data.events;
        }
      });
  }
);

angular.module('avUi')
  .directive('documentationDirective', function() {
    return {
      restrict: 'AE',
      scope: {
        extra: '=extra'
      },
      templateUrl: 'avUi/documentation-directive/documentation-directive.html',
      controller: 'DocumentationUiController'
    };
  });
