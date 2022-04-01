/**
 * This file is part of admin-console.
 * Copyright (C) 2015-2016  Sequent Tech Inc <legal@sequentech.io>

 * admin-console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * admin-console  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with admin-console.  If not, see <http://www.gnu.org/licenses/>.
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
