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
 * Usage:
 *
 * <div>
 *    <div>I need some space, this is a sibling</div>
 *    <div av-auto-height>
 *        I stretch to the available height,
 *        calculated from the height available from .parent and my siblings.
 *    </div>
 * </div>
 */
angular.module('avUi')
  .directive('avAutoHeight', function($window, $interval) {
    return {
      link: function(scope, element, attrs) {
        var sibling, recalculate, promise = null;

        sibling = function() {
          return element.closest(attrs.parentSelector).find(attrs.siblingSelector);
        };

        recalculate = function () {
          if (promise) {
            $interval.cancel(promise);
          }
          promise = $interval(function() {
            var additionalHeight = 0, height;
            if (!!attrs.additionalHeight) {
              additionalHeight = parseInt(attrs.additionalHeight, 10);
            }
            height = sibling().height();
            element.css('max-height', (height + additionalHeight) + "px");
          }, 300);
        };

        scope.$watch(
          function () {
            return sibling().height();
          },
          function (newValue, oldValue) {
            recalculate();
          });

        recalculate();
      }
    };
  }
);