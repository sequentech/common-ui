/**
 * This file is part of common-ui.
 * Copyright (C) 2015-2022  Sequent Tech Inc <legal@sequentech.io>

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
 * Simple change lang directive, that can be used in the navbar as a list
 * element:
 * <li class="dropdown" av-change-lang></li>
 */
angular.module('avUi')
  .directive('avChangeLang', function(
    $i18next,
    ipCookie,
    angularLoad,
    amMoment,
    $rootScope,
    ConfigService,
    $window,
    I18nOverride,
    Authmethod
  ) {
    function link(scope, element, attrs)
    {    
      scope.deflang = $window.i18next.resolvedLanguage;
      angular.element('#ng-app').attr('lang', scope.deflang);
      scope.langs =  $i18next.options.lngWhitelist;
      var isAdmin = Authmethod.isAdmin();
      function triggerDropdown()
      {
        setTimeout(function () {
          angular.element("#lang-dropdown-toggle").click();
        }, 0);
      }
      element.on('click', triggerDropdown);

      // detect language changes
      $rootScope.$on(
        'i18nextLanguageChange',
        function (event, languageCode)
        {
          scope.deflang = languageCode;
          scope.langs = $i18next.options.lngWhitelist;
          scope.$apply();
        }
      );

      // Changes i18n to a specific language, setting also a cookie for
      // remembering it, and updating all the translations instantly.
      //
      // Triggered when the user clicks and selects a language.
      scope.changeLang = function(lang)
      {
        $window.i18next
          .changeLanguage(lang)
          .then(function () {
            console.log("changeLang: changed, calling $i18next.reInit()");

            // This will trigget a $i18next's init function to be called and all
            // angularjs $i18next translations to be updated accordingly.
            $i18next.reInit();

          });

        console.log("setting cookie");
        var cookieConf = {
          expires: 360,
          path: "/"
        };
        ipCookie(
          "lang",
          lang,
          _.extend(cookieConf, ConfigService.i18nextCookieOptions)
        );
        scope.deflang = lang;
        angular.element('#ng-app').attr('lang', scope.deflang);

        // async load moment i18n
        if (isAdmin) {
          angularLoad
            .loadScript(ConfigService.base + '/locales/moment/' + lang + '.js')
            .then(function () {
              amMoment.changeLocale(lang);
            });
        }
      };
    }

    return {
      restrict: 'AE',
      scope: {},
      link: link,
      templateUrl: 'avUi/change-lang-directive/change-lang-directive.html'
    };
  });
