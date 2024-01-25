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
      function expandObject(obj)
      {
        var result = {};
    
        // Helper function to handle the recursion
        function assignValue(ref, keys, value) {
            var key = keys.shift(); // Get the current key part
            if (keys.length === 0) {
                // If no more keys, assign the value directly
                ref[key] = value;
            } else {
                // Prepare the next level sub-object if necessary
                if (!ref[key]) {
                  ref[key] = {};
                }
                // Recurse with the next level of the key and the corresponding sub-object
                assignValue(ref[key], keys, value);
            }
        }
    
        // Iterate over each property in the input object
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                var keys = prop.split('.'); // Split the property by dots into parts
                assignValue(result, keys, obj[prop]); // Use the helper to assign the value in the result object
            }
        }
    
        return result;
      }
      function deepExtend(target, source) {
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                if (target[prop] && typeof source[prop] === 'object') {
                  deepExtend(target[prop], source[prop]);
                }
                else {
                    target[prop] = source[prop];
                }
            }
        }
        return target;
      }
      return function (overrides, force, languagesConf)
      {
        force = angular.isDefined(force) ? force : false;
        if (overrides !== null) {
          if (languagesConf && languagesConf.available_languages)
          {
            // We use deep extend to have as an override for all available
            // languages the original changed with the override
            deepExtend(
              overrides,
              _.object(_.map(
                languagesConf.available_languages,
                function(key) { return [key, {}]; }
                ))
            );
          }
          overrides = _.mapObject(overrides, function(obj, langCode) {
            var original = $window.i18n.getResourceBundle(langCode, "locales");
            var override = expandObject(obj);
            deepExtend(original, override);
            return original;
          });
        } else {
          overrides = $window.i18nOverride;
        }

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
                /* ns = */ "locales",
                /* resources = */ expandObject(i18nOverride)
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
        $i18next.reInit();
      };
    }
  );
