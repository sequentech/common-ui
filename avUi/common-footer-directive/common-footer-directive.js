/**
 * This file is part of common-ui.
 * Copyright (C) 2023 Sequent Tech Inc <legal@sequentech.io>

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
    'avbCommonFooter',
    function(ConfigService)
    {
      var link = function(scope, _element, _attrs) {
        scope.configService = ConfigService;
      };
      return {
        restrict: 'AE',
        scope:  {
          float: '='
        },
        link: link,
        templateUrl: 'avUi/common-footer-directive/common-footer-directive.html'
      };
    }
  );