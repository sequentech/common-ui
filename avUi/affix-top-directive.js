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

/*
 * directive used to position an element always at the top. It just sets its
 * specified element with a margin-top to make space for the affixed element.
 * This is done dynamically, so that each time the affixed element's height
 * changes, the top-margin of the specified is recalculated and set.
 */
angular.module('avUi')
  .directive('avAffixTop', function($window, $timeout) {

    // add margin-top automatically
    var updateMargin = function(el, options) {
      var minHeight = parseInt(options.minHeight);
      var height = Math.max(
        $(el).height(),
        (angular.isNumber(minHeight) && !isNaN(minHeight) ? minHeight : 0) );
      $(options.avAffixTop).css("padding-top", height + "px");
    };

    return {
      restrict: 'EAC',
      link: function(scope, iElement, iAttrs) {
        updateMargin(iElement, iAttrs);

        if (iAttrs.minHeight === undefined) {
          iAttrs.minHeight = "20";
        }

        // timeout is used with callCheckPos so that we do not create too many
        // calls to checkPosition, at most one per 100ms
        var timeout;

        function updateMarginTimeout() {
          timeout = $timeout(function() {
            $timeout.cancel(timeout);
            updateMargin(iElement, iAttrs);
          }, 100);
        }

        // watch for window resizes and element resizes too
        angular.element(iElement).bind('resize', updateMarginTimeout);
        angular.element($window).bind('resize', updateMarginTimeout);
        $(iAttrs.avAffixTop).change(updateMarginTimeout);
      }
    };

  });
