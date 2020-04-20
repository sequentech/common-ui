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

angular.module('avUi')
  .directive('avAffixTopOffset', function($window, $timeout, $parse) {
    var affixClass = "affix-top";
    var checkPosition = function(scope, instance, el, options) {

      var affix = false;
      var offset = el.offset();

      if (instance.affix && $window.pageYOffset + 20 >= instance.scrollAffix) {
        return;
      } else if (offset.top - $window.pageYOffset < instance.avAffixTopOffset) {
        affix = true;
      }

      if (instance.affix === affix) {
        return;
      }

      instance.affix = affix;
      instance.scrollAffix = $window.pageYOffset;
      if (!affix) {
        el.removeClass(affixClass);
        el.attr("style", "");

        if (options.affixPlaceholder !== undefined) {
          $(options.affixPlaceholder).removeClass("affixed");
        }
      } else {
        el.addClass(affixClass);
        el.data("page-offset", $window.pageYOffset);
        el.css("position", "fixed");
        el.css("float", "none");
        el.css("top", Math.floor(instance.avAffixTopOffset) + "px");
        el.css("left", Math.floor(instance.baseOffset.left) + "px");
        el.css("width", Math.floor(instance.baseWidth) + "px");
        el.css( "z-index", "10");

        if (options.affixPlaceholder !== undefined) {
          $(options.affixPlaceholder).addClass("affixed");
        }
      }

    };

    return {
      restrict: 'EAC',
      link: function(scope, iElement, iAttrs) {
        // instance saves state between calls to checkPosition
        var instance = {
          affix: false,
          scrollAffix: null,
          baseOffset: iElement.offset(),
          baseWidth: iElement.width(),
          avAffixTopOffset: parseInt(iAttrs.avAffixTopOffset, 10)
        };


        function callCheckPos() {
          checkPosition(scope, instance, iElement, iAttrs);
        }
        callCheckPos();

        // when window resizes, the baseoffset etc needs to be reset
        function resize() {
          iElement.removeClass(affixClass);
          iElement.attr("style", "");
          instance.affix = false;
          instance.scrollAffix = null;
          $timeout(function () {
            instance.baseOffset = iElement.offset();
            instance.baseWidth = iElement.width();
            callCheckPos();
          }, 1000);
        }

        // watch for window scrolling
        angular.element($window).on('scroll', callCheckPos);
        angular.element($window).on('resize', resize);
      }
    };

  });
