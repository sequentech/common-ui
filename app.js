angular.module(
  'agora-core-view',
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
  'avConfig',
  'jm.i18next',
  'avRegistration',
  'avUi',
  'avTest',
  'angularFileUpload',
  'dndLists',
  'angularLoad',
  'angular-date-picker-polyfill',
  'ng-autofocus'
]);

angular.module('jm.i18next').config(function ($i18nextProvider, ConfigServiceProvider) {
  // note that we do not send the language: by default, it will try the language
  // supported by the web browser
  $("#no-js").hide();

  $i18nextProvider.options = _.extend(
    {
      useCookie: true,
      useLocalStorage: false,
      fallbackLng: 'en',
      cookieName: 'lang',
      detectLngQS: 'lang',
      lngWhitelist: ['en', 'es', 'gl', 'ca'],
      resGetPath: '/locales/__lng__.json',
      defaultLoadingValue: '' // ng-i18next option, *NOT* directly supported by i18next
    },
    ConfigServiceProvider.i18nextInitOptions);
});

angular.module('agora-core-view').run(function($http, $rootScope) {

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
This directive allows us to pass a function in on an enter key to do what we want.
 */
angular.module('agora-core-view').directive('ngEnter', function () {
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
angular.module('agora-core-view').filter('truncate', function () {
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
