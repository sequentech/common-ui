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
    ConfigService,
    $window,
    I18nOverride
  ) {
    function link(scope, element, attrs)
    {    
      scope.deflang = window.i18n.lng();
      angular.element('#ng-app').attr('lang', scope.deflang);
      scope.langs =  $i18next.options.lngWhitelist;
      function triggerDropdown()
      {
        setTimeout(function () {
          angular.element("#lang-dropdown-toggle").click();
        }, 0);
      }
      element.on('click', triggerDropdown);

      // Changes i18n to a specific language, setting also a cookie for
      // remembering it, and updating all the translations instantly.
      //
      // Triggered when the user clicks and selects a language.
      scope.changeLang = function(lang)
      {
        $i18next.options.lng = lang;
        $i18next.options.useLocalStorage = true;

        // load i18n_overrides if any
        if (angular.isDefined($window.i18nOverride))
        {
          $window.i18n.preload(
            [lang],
            function ()
            {
              I18nOverride(
                /* overrides = */ $window.i18nOverride, // set to use the default, $window.i18nOverride
                /* force = */ true
              );
            }
          );
        }

        console.log("setting cookie");
        var cookieConf = {
          expires: 360,
          path: "/"
        };
        ipCookie(
          "lang",
          lang,
          _.extend(cookieConf, ConfigService.i18nextCookieOptions));
        scope.deflang = lang;
        angular.element('#ng-app').attr('lang', scope.deflang);

        // async load moment i18n
        /*angularLoad
          .loadScript(ConfigService.base + '/locales/moment/' + lang + '.js')
          .then(function () {
            amMoment.changeLocale(lang);
          });*/
      };
      setTimeout(function () {
        scope.changeLang($i18next.options.lng);
      }, 0);

    }

    return {
      restrict: 'AE',
      scope: {},
      link: link,
      templateUrl: 'avUi/change-lang-directive/change-lang-directive.html'
    };
  });
