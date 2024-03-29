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
          preferredCountries: ["es", "gb", "us"],
          autoPlaceholder: "aggressive",
          placeholderNumberType: "MOBILE",
          geoIpLookup: function(callback) {
              var applyCountry = function()
              {
                var countryCode = (ipData && ipData.country) ? ipData.country : "es";
                callback(countryCode);
              };
              if (ipData) {
                applyCountry();
              } else {
                ipCallbacks.push(applyCountry);
              }
            }
          });
          if (_.isString(scope.field.value) && 0 < scope.field.value.length) {
            telInput.intlTelInput("setNumber", scope.field.value);
          }

          var validateTel = function()
          {
            scope.$evalAsync(function() {
              var intlNumber = telInput.intlTelInput("getNumber");
              if (intlNumber) {
                scope.field.value = intlNumber;
              }
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
            });
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
