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

angular.module('avRegistration')
  .directive('avrTelField', function($state, $timeout) {
    function link(scope, element, attrs) {

      scope.tlfPattern = /^[+]?\d{9,14}$/;
      scope.isValidNumber = true;

      // lookup ip data and send callbacks when it is available

      var ipData = null;
      var ipCallbacks = [];
      $.get('https://ipinfo.io', function() {}, "jsonp")
      .always(function(resp) {
          ipData = resp;
          for (var i = 0; i < ipCallbacks.length; i++) {
            ipCallbacks[i]();
          }
        });
      $timeout(function() {
        /* configure registration telephone phone number */
        var telInput = angular.element(document.getElementById("input" + scope.index));
        // initialise plugin
        telInput.intlTelInput({
          utilsScript: "election/utils.js",
          separateDialCode: true,
          initialCountry: "auto",
          autoPlaceholder: "aggressive",
          placeholderNumberType: "MOBILE",
          geoIpLookup: function(callback) {
              var applyCountry = function()
              {
                var countryCode = (ipData && ipData.country) ? ipData.country : "";
                callback(countryCode);
              };
              if (ipData) {
                applyCountry();
              } else {
                ipCallbacks.push(applyCountry);
              }
            }
          });

          var validateTel = function()
          {
            var isValid = telInput.intlTelInput("isValidNumber");
            if (!isValid && $("#input"+ scope.index).val().replace("[ \t\n]", "").length > 0)
            {
              telInput.toggleClass("error", true);
              scope.isValidNumber = false;
            } else
            {
              telInput.toggleClass("error", false);
              scope.isValidNumber = true;
            }
          };
          // on keyup / change flag: reset
          telInput.on("keyup change", validateTel);
      });
    }
    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avRegistration/fields/tel-field-directive/tel-field-directive.html'
    };
  });