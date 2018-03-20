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
 * Simple change lang directive, that can be used in the navbar as a list
 * element:
 * <li class="dropdown" av-change-lang></li>
 */
angular.module('avUi')
  .directive('avChangeLang', function($i18next, ipCookie, angularLoad, amMoment, ConfigService) {
    function link(scope, element, attrs) {
      scope.deflang = window.i18n.lng();
      angular.element('#ng-app').attr('lang', scope.deflang);
      scope.langs =  $i18next.options.lngWhitelist;

      // Changes i18n to a specific language, setting also a cookie for
      // remembering it, and updating all the translations instantly.
      //
      // Triggered when the user clicks and selects a language.
      scope.changeLang = function(lang) {
        $i18next.options.lng = lang;
        console.log("setting cookie");
        ipCookie(
          "lang",
          lang,
          _.extend({expires: 360}, ConfigService.i18nextCookieOptions));
        scope.deflang = lang;
        angular.element('#ng-app').attr('lang', scope.deflang);

        // async load moment i18n
        angularLoad
          .loadScript(ConfigService.base + '/locales/moment/' + lang + '.js')
          .then(function () {
            amMoment.changeLocale(lang);
          });
      };
    }

    return {
      restrict: 'AE',
      scope: {},
      link: link,
      templateUrl: 'avUi/change-lang-directive/change-lang-directive.html'
    };
  });
