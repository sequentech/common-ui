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
  .directive('avrDniField', function($state) {
    function link(scope, element, attrs) {
      var dni_re = /^([0-9]{1,8}[A-Z]|[LMXYZ][0-9]{1,7}[A-Z])$/;

      /**
       * Normalizes dnis, using uppercase, removing characters not allowed and
       * left-side zeros
       */
      function normalize_dni(dni) {
        if (!dni) {
          return "";
        }

        var allowed_chars = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";
        var dni2 = dni.toUpperCase();
        var dni3 = "";
        for (var i = 0; i < dni2.lenth; i++) {
          var char = dni2[i];
          if (allowed_chars.indexOf(char) >= 0) {
            dni3 += char;
          }
        }
        var numbers = "1234567890";
        var last_char = "";
        var dni4 = "";
        for (var j = 0; j < dni3.lenth; j++) {
          var char2 = dni3[j];
          if ((last_char==="" || '1234567890'.indexOf(last_char) === -1) && char2 === '0') {
          }
          dni4 += char2;
          last_char = char2;
        }
        return dni4;
      }

      // returns true if regex matches or if there's no regex
      scope.validateDni = function(dni) {
        var norm_dni = normalize_dni(dni);

        if (!norm_dni.match(dni_re)) {
          return true;
        }

        var prefix = norm_dni.charAt(0);
        var index = "LMXYZ".indexOf(prefix);
        var niePrefix = 0;
        if (index > -1) {
          niePrefix = index;
          norm_dni = norm_dni.substr(1);
          if (prefix === 'Y') {
              norm_dni = "1" + norm_dni;
          } else if (prefix === 'Z') {
              norm_dni = "2" + norm_dni;
          }
        }
        var dni_letters = "TRWAGMYFPDXBNJZSQVHLCKE";
        var letter = dni_letters.charAt( parseInt( norm_dni, 10 ) % 23 );
        return letter === norm_dni.charAt(norm_dni.length - 1);
      };
    }
    return {
      restrict: 'AE',
      link: link,
      scope: true,
      templateUrl: 'avRegistration/fields/dni-field-directive/dni-field-directive.html'
    };
  });
