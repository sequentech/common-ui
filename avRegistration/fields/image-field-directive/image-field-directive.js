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

angular.module('avRegistration')
  .directive('avrImageField', function($state, $timeout) {
    function link(scope, element, attrs) {
        function readImage(input) {
            if ( input.files && input.files[0] ) {
                var FR = new FileReader();
                FR.onload = function(e) {
                     scope.field.value = e.target.result;
                };
                FR.readAsDataURL( input.files[0] );
            }
        }

        $timeout(function() {
            $("#image-field").change(function() { readImage( this ); });
        }, 0);
    }

    return {
      restrict: 'AE',
      link: link,
      scope: true,
      templateUrl: 'avRegistration/fields/image-field-directive/image-field-directive.html'
    };
  });
