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
  .directive('avrDateField', function($state, Patterns) {
    function link(scope, element, attrs) {
        scope.years = [];
        scope.months = [];
        scope.field = scope.$parent.field;
        scope.date = null;

        function initializeValue() {
          var dateValue = null;
          if (
            scope.field.value === null || scope.field.value.length === 0
          ) {
            dateValue = new Date();
          } else {
            var data = scope.field.value.split('-');
            dateValue = new Date(data[0], parseInt(data[1]) - 1, data[2]);
          }
          scope.date = {
            year: dateValue.getFullYear(),
            month: dateValue.getMonth() + 1,
            day: dateValue.getDate()
          };
        }
        initializeValue();

        scope.getYears = function () {
          var initY = (new Date()).getFullYear();
          var i = 0;
          var years = [];
 
          for (i=initY; i>=initY-130; i--) {
            years.push(i);
          }
          return years;
        };

        scope.getMonths = function () {
          var i = 0;
          var months = [];
  
          for (i=1; i<=12; i++) {
            months.push(i);
          }
          return months;
        };

        scope.getDays = function() {
          var days = [];
          var i = 0;
          var ndays = (new Date(scope.date.year, scope.date.month, 0)).getDate();
          for (i=1; i<=ndays; i++) {
            days.push(i);
          }
          return days;
        };

        function numberPadStart(num, size) {
          var str = "000000000" + num;
          return str.substr(str.length - size);
        }

        scope.onChange = function() {
          var monthStr = numberPadStart(scope.date.month, 2);
          var dayStr = numberPadStart(scope.date.day, 2);
          scope.field.value = scope.date.year + "-" + monthStr + "-" + dayStr;
        };

        // initial value update
        scope.onChange();
    }
    return {
      restrict: 'AE',
      link: link,
      scope: {
        label: '=',
      },
      templateUrl: 'avRegistration/fields/date-field-directive/date-field-directive.html'
    };
  });
