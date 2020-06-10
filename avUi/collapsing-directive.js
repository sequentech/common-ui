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
 * avCollapsing limits the default maximum height of an element by making it
 * collapsable if it exceeds the max-height of the selector.
 *  - if the element's height doesn't exceed its maximum height, the
 *    data-toggle-selector element will be set to hidden
 *  - if the element's height exceeds its maximum height, the
 *    data-toggle-selector element will be removed the class "hidden".
 *  - if the data-toggle-selector element it contains is clicked, they will be
 *    added the class ".in".
 *  - if the element's height exceeds its max height and the toggle is not
 *    ".in", then it adds the ".collapsed" class to the element, and makes sure
 *    the data-toggle-selector element is not hidden.
 *  - it will watch the element and window resizes to see if the conditions
 *    change.
 * - both maxHeightSelector and data-toggle-selector will be found using the
 *   parent selector as a base if the attribute "parent-selector" is set.
 *   Otherwise, it will directly a global angular.element() to find them.
 */
angular.module('avUi')
  .directive('avCollapsing', function($window, $timeout) {

    function select(instance, el, selector) {
      var val;
      if (!!instance.parentSelector) {
        val = el.closest(instance.parentSelector).find(selector);
      } else {
        val = angular.element(selector);
      }
      return val;
    }

    function collapseEl(instance, el) {
      var val = null;
      if (!!instance.collapseSelector) {
        val = select(instance, el, instance.collapseSelector);
      } else {
        val = angular.element(el);
      }
      return val;
    }

    var checkCollapse = function(instance, el, options) {
      var maxHeight = select(instance, el, instance.maxHeightSelector).css("max-height");
      var height = angular.element(el)[0].scrollHeight;

      // we want to remove padding-top in the calculation
      var paddingTop = angular.element(el).css('padding-top');

      if (maxHeight.indexOf("px") === -1) {
        console.log("invalid non-pixels max-height for " + instance.maxHeightSelector);
        return;
      }

      if (!paddingTop || paddingTop.indexOf("px") === -1) {
        paddingTop = 0;
      } else {
        paddingTop = parseInt(paddingTop.replace("px", ""));
      }

      maxHeight = parseInt(maxHeight.replace("px", ""));

      // make sure it's collapsed if it should
      if (height - paddingTop > maxHeight) {
        // already collapsed
        if (instance.isCollapsed) {
          return;
        }
        instance.isCollapsed = true;
        collapseEl(instance, el).addClass("collapsed");
        select(instance, el, instance.toggleSelector).removeClass("hidden in");

      // removed collapsed and hide toggle otherwise
      } else {
        // already not collapsed
        if (!instance.isCollapsed) {
          return;
        }
        instance.isCollapsed = false;
        collapseEl(instance, el).removeClass("collapsed");
        select(instance, el, instance.toggleSelector).addClass("hidden");
      }
    };

    var toggleCollapse = function(instance, el, options) {
      // if it's collapsed, uncollapse
      if (instance.isCollapsed) {
        collapseEl(instance, el).removeClass("collapsed");
        select(instance, el, instance.toggleSelector).addClass("in");

      // collapse otherwise
      } else {
        collapseEl(instance, el).addClass("collapsed");
        select(instance, el, instance.toggleSelector).removeClass("in");
      }


      instance.isCollapsed = !instance.isCollapsed;
    };

    return {
      restrict: 'EAC',
      link: function(scope, iElement, iAttrs) {
        var instance = {
          isCollapsed: false,
          maxHeightSelector: iAttrs.avCollapsing,
          toggleSelector: iAttrs.toggleSelector,
          parentSelector: iAttrs.parentSelector,
          collapseSelector: iAttrs.collapseSelector
        };

        // timeout is used with callCheck so that we do not create too many
        // calls to checkPosition, at most one per 100ms
        var timeout;

        function callCheck() {
          timeout = $timeout(function() {
            $timeout.cancel(timeout);
            checkCollapse(instance, iElement, iAttrs);
          }, 500);
        }
        callCheck();


        function launchToggle() {
            toggleCollapse(instance, iElement, iAttrs);
        }

        // watch for window resizes and element resizes too
        angular.element($window).bind('resize', callCheck);
        angular.element(iElement).bind('resize', callCheck);

        // watch toggle's clicking
        angular.element(instance.toggleSelector).bind('click', launchToggle);
      }
    };

  });
