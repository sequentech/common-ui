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

        var now = new Date();
        scope.date = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate()
        };

        var initY = (new Date()).getFullYear();
        var i = 0;

        for (i=initY; i>=initY-130; i--) {
            scope.years.push(i);
        }

        for (i=1; i<=12; i++) {
            scope.months.push(i);
        }

        scope.getDays = function() {
            var days = [];
            var ndays = (new Date(scope.date.year, scope.date.month, 0)).getDate();
            for (i=1; i<=ndays; i++) {
                days.push(i);
            }
            return days;
        };

        scope.onChange = function() {
            scope.field.value = scope.date.year + "-" + scope.date.month + "-" + scope.date.day;
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
