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
