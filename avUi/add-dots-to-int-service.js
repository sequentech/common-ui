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

/*
 * Given a number, adds dots every three digits.
 *
 * Example:
 *
 *    AddDotsToIntService(1234567) --> "1.234.567"
 *    AddDotsToIntService(1111.234567) --> "1.111,234567"
 */
angular.module('avUi')
  .service('AddDotsToIntService', function() {
    return function (number, fixedDigits) {
      if (angular.isNumber(fixedDigits) && fixedDigits >= 0) {
        number = number.toFixed(parseInt(fixedDigits));
      }
      var number_str = (number + "").replace(".", ",");
      var ret = "";
      var commaPos = number_str.length;
      if (number_str.indexOf(",") !== -1) {
        commaPos = number_str.indexOf(",");
      }
      for (var i = 0; i < commaPos; i++) {
        var reverse = commaPos - i;
        if ((reverse % 3 === 0) && reverse > 0 && i > 0) {
          ret = ret + ".";
        }
        ret = ret + number_str[i];
      }
      return ret + number_str.substr(commaPos, number_str.length);
    };
  });
