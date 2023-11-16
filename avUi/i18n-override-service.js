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
        overrides = overrides === null ? $window.i18nOverride : overrides;

        // reset $window.i18nOverride
        var performOverrides = false;
        if (overrides) {
          performOverrides = (
            force ||
            JSON.stringify(overrides) !== JSON.stringify($window.i18nOverride)
          );
          $window.i18nOverride = overrides;
        }

        if (languagesConf)
        {
          // For some reason it seems that `$i18next.options.lng` gets desynced
          // from `$window.i18n.lng()`. This might result in an unexpected
          // language change when the init() function from $i18next gets called
          // later in this code. For this reason, we set the correct language in
          // `$i18next.options.lng` to ensure that doesn't happen.
          $i18next.options.lng = (languagesConf.force_default_language) ?
            languagesConf.default_language : $window.i18n.lng();

          $i18next.options.lngWhitelist = languagesConf.available_languages;
          $i18next.options.fallbackLng = [languagesConf.default_language, 'en'];
        }

        // load i18n_overrides if any
        if (performOverrides)
        {
          _.map(
            $window.i18nOverride,
            function (i18nOverride, language)
            {
              $window.i18n.addResources(
                /* lng = */ language,
                /* ns = */ "translation",
                /* resources = */ i18nOverride
              );

              // force-refresh cached translations to override
              _.each(
                _.keys(i18nOverride),
                function (i18nString)
                {
                  $i18next(i18nString, {});
                }
              );
            }
          );
        }

        // This will trigget a $i18next's init function to be called and all
        // angularjs $i18next translations to be updated accordingly.
        // `i18nextLanguageChange` signal is special for $i18next, see its code
        // for reference.
        $rootScope.$emit(
          'i18nextLanguageChange',
          $i18next.options.lng
        );
      };
    }
  );
