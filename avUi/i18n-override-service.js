/**
 * This file is part of common-ui.
 * Copyright (C) 2022 Eduardo Robles <edu@sequentech.io>

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
 * Overrides i18next translations. Example:
 * 
 * ```javascript
 * var override = {"en": {"avBooth.castTheBallot": "Cast thy ballot"}};
 * I18nOverride(override);
 * ```
 * 
 * It has two optional parameters:
 *
 * - overrides: dictionary with the overrides (see example above). If it's empty
 *   it will just use the overrides saved in $window.i18nOverride.
 *
 * - force: false by default. This means that overrides will not be applied if
 *   the provided overrides are the same as before (i.e. same as 
 *   $window.i18nOverride).
 */
angular
  .module('avUi')
  .service(
    'I18nOverride',
    function($i18next, $rootScope, $window)
    {
      return function (overrides, force, languagesConf)
      {
        force = angular.isDefined(force) ? force : false;
        var performOverrides = false;
        if (overrides !== null) {
          performOverrides = (
            force ||
            JSON.stringify(overrides) !== JSON.stringify($window.i18nOverride)
            );
          if (performOverrides) {
            $window.i18nOverride = overrides;
          }
        }

        if (languagesConf)
        {
          // For some reason it seems that `$i18next.options.lng` gets desynced
          // from `$window.i18next.resolvedLanguage`. This might result in an unexpected
          // language change when the init() function from $i18next gets called
          // later in this code. For this reason, we set the correct language in
          // `$i18next.options.lng` to ensure that doesn't happen.
          $i18next.options.lng = (languagesConf.force_default_language) ?
            languagesConf.default_language : $window.i18next.resolvedLanguage;

          $i18next.options.lngWhitelist = languagesConf.available_languages;
          $i18next.options.preload = languagesConf.available_languages;
          $i18next.options.fallbackLng = [languagesConf.default_language, 'en'];
        }
        console.log("calling $window.i18next.reloadResources()..");
        $window.i18next
          .reloadResources($i18next.options.preload)
          .then(function () {
            if (
              languagesConf &&
              languagesConf.force_default_language &&
              $window.i18next.changeAppLang
            ) {
              console.log("reloadResources: successful. force-changing default lang to=" + languagesConf.default_language);
              $window.i18next.changeAppLang(languagesConf.default_language);
            } else {
              console.log("reloadResources: successful. broadcast i18nextLanguageChange signal");
              $rootScope.$broadcast('i18nextLanguageChange', $i18next.options.lng);
            }
	  });
      };
    }
  );
