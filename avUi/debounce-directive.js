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

// source: https://gist.github.com/tommaitland/7579618#file-ng-debounce-js
angular.module('avUi')
  .directive('avDebounce', function($interval) {
    return {
      restrict: 'A',
      require: 'ngModel',
      priority: 99,
      link: function(scope, elm, attr, ngModelCtrl) {
        if (attr.type === 'radio' || attr.type === 'checkbox') {
          return;
        }
        elm.unbind('input');
        var debounce;

        elm.bind('input', function() {
          $interval.cancel(debounce);
          debounce = $interval( function() {
            scope.$apply(function() {
              ngModelCtrl.$setViewValue(elm.val());
            });
          }, attr.avDebounce || 500);
        });

        elm.bind('blur', function() {
          scope.$apply(function() {
            ngModelCtrl.$setViewValue(elm.val());
          });
        });
      }
    };
});