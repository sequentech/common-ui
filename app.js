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

angular.module(
  'common-ui',
  ['ui.bootstrap',
  'ui.utils',
  'ui.router',
  'ngAnimate',
  'ngResource',
  'ngCookies',
  'ipCookie',
  'ngSanitize',
  'infinite-scroll',
  'angularMoment',
  'SequentConfig',
  'jm.i18next',
  'avRegistration',
  'avUi',
  'avTest',
  'angularFileUpload',
  'dndLists',
  'angularLoad',
  'ng-autofocus'
]);

angular.module('common-ui').run(function($http, $rootScope) {

  $rootScope.safeApply = function(fn) {
    var phase = $rootScope.$$phase;
    if (phase === '$apply' || phase === '$digest') {
      if (fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams) {
      console.log("change start from " + fromState.name + " to " + toState.name);
      $("#angular-preloading").show();
    });
  $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams) {
      console.log("change success");
      $("#angular-preloading").hide();
    });
});

/*
This directive will trigger a click if the user presses space or enter
 */
angular.module('common-ui').directive('ngSpaceClick', function ($timeout) {
  return function (scope, element, attrs) {
    element.bind("keydown", function (event) {
      switch (event.which) {
        case 13:              // ENTER
        case 32: {            // SPACE
          $timeout(function() {event.currentTarget.click();},0);
          event.stopPropagation();
        }
      }
    });
  };
});

/*
This directive allows us to pass a function in on an enter key to do what we want.
 */
angular.module('common-ui').directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

/**
 * Truncate Filter
 * @Param text
 * @Param length, default is 10
 * @Param end, default is "..."
 * @return string
 */
angular.module('common-ui').filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length)) {
                length = 10;
            }

            if (end === undefined) {
                end = "...";
            }

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }

        };
    });

/*globals SequentConfigData:false, $buo:false */
/**
 * Check browser version with browser-update.org
 */
function $buo_f() {
  $buo(SequentConfigData.browserUpdate);
}

if (SequentConfigData.browserUpdate) {
  try {
    document.addEventListener("DOMContentLoaded", $buo_f, false);
  } catch (e) {
    window.attachEvent("onload", $buo_f);
  }
}
