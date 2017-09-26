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
  .directive('avrTelField', function($state) {
    function link(scope, element, attrs) {
      scope.tlfPattern = /^[+]?\d{9,14}$/;
      var telInput = angular.element(document.getElementById('input' + scope.index));
      telInput.intlTelInput({ utilsScript: 'utils.js' });
      $("#phone").intlTelInput({utilsScript: "build/js/utils.js"});
    }
    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/fields/tel-field-directive/tel-field-directive.html'
    };
  });