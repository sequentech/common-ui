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
 * Checks input data with a list of checks.
 *
 * Example:
 *
        var checks = [
          {
            check: "array-group",
            prefix: "question-",
            checks: [
              {check: "is-array", key: "questions"},
              {check: "array-length", key: "questions", min: 1, max: 40},
              {
                check: "array-key-group-chain",
                key: "questions",
                prefix: "question-",
                checks: [
                  {check: "is-int", key: "min"},
                  {check: "is-int", key: "max"},
                  {check: "is-int", key: "num_winners"},
                  {check: "is-array", key: "answers"},
                  {check: "array-length", key: "answers", min: 1, max: 10000},
                  {check: "int-size", key: "min", min: 0, max: "$value.max"},
                  {
                    check: "int-size",
                    key: "max",
                    min: "$value.min",
                    max: "$value.answers.length"
                  },
                  {
                    check: "int-size",
                    key: "num_winners",
                    max: "$value.answers.length"
                  }
                ]
              }
            ]
          }
        ];

        scope.errors = [];
        CheckerService({
          checks: checks,
          data: scope.elections,
          onError: function (errorKey, errorData) {
            scope.errors.push({
              data: errorData,
              key: errorKey
            });
          }
        });
 */
angular.module('avUi')
  .service('CheckerService', function() {
    function checker(d) {

      /*
       * Used to eval the expressions given by the programmer in the checker
       * script
       */
      function evalValue(code, $value) {
        if (angular.isString(code)) {
          /* jshint ignore:start */
          return eval(code);
          /* jshint ignore:end */
        } else {
          return code;
        }
      }

      function sumStrs(str1, str2) {
        var ret = "";
        if (angular.isString(str1)) {
          ret = str1;
        }
        if (angular.isString(str2)) {
          ret += str2;
        }
        return ret;
      }

      function error(errorKey, errorData, postfix) {
        angular.extend(errorData, d.errorData);
        d.onError(
          _.reduce([d.prefix, errorKey, postfix], sumStrs, ""),
          errorData
        );
      }

      if (angular.isUndefined(d.errorData)) {
        d.errorData = {};
      }

      var ret = _.every(d.checks, function (item) {
        var pass = true;
        var itemMin;
        var itemMax;
        var max;
        var min;
        var dataToCheck = angular.isDefined(item.key) ? d.data[item.key] : d.data;
        if (item.check === "is-int") {
          pass = angular.isNumber(dataToCheck, item.postfix);
          if (!pass) {
            error(item.check, {key: item.key}, item.postfix);
          }

        } else if (item.check === "is-array") {
          pass = angular.isArray(dataToCheck, item.postfix);
          if (!pass) {
            error(item.check, {key: item.key}, item.postfix);
          }
        } else if (item.check === "lambda") {
          if (!item.validator(dataToCheck)) {
            var errorData = {key: item.key};
            if (!angular.isUndefined(item.appendOnErrorLambda)) {
              errorData = item.appendOnErrorLambda(dataToCheck);
            }
            if (_.isObject(item.append) &&
                _.isString(item.append.key) &&
                !_.isUndefined(item.append.value)) {
              errorData[item.append.key] = evalValue(item.append.value, item);
            }
            error(item.check, errorData, item.postfix);
          }

        } else if (item.check === "is-string-if-defined") {
          pass = angular.isUndefined(dataToCheck) ||
                   angular.isString(dataToCheck, item.postfix);
          if (!pass) {
            error(item.check, {key: item.key}, item.postfix);
          }

        } else if (item.check === "array-length-if-defined") {
          if (angular.isDefined(dataToCheck)) {
            itemMin = evalValue(item.min, d.data);
            itemMax = evalValue(item.max, d.data);

            if (angular.isArray(dataToCheck) || angular.isString(dataToCheck))
            {
              min = angular.isUndefined(item.min) || dataToCheck.length >= itemMin;
              max = angular.isUndefined(item.max) || dataToCheck.length <= itemMax;
              pass = min && max;
              if (!min) {
                error(
                  "array-length-min",
                  {key: item.key, min: itemMin, num: dataToCheck.length},
                  item.postfix);
              }
              if (!max) {
                var itemErrorData0 = {key: item.key, max: itemMax, num: dataToCheck.length};
                error(
                  "array-length-max",
                  itemErrorData0,
                  item.postfix);
              }
            }
          }
        } else if (item.check === "is-string") {
          pass = angular.isString(dataToCheck, item.postfix);
          if (!pass) {
            error(item.check, {key: item.key}, item.postfix);
          }

        } else if (item.check === "array-length") {
          itemMin = evalValue(item.min, d.data);
          itemMax = evalValue(item.max, d.data);

          if (angular.isArray(dataToCheck) || angular.isString(dataToCheck))
          {
            min = angular.isUndefined(item.min) || dataToCheck.length >= itemMin;
            max = angular.isUndefined(item.max) || dataToCheck.length <= itemMax;
            pass = min && max;
            if (!min) {
              error(
                "array-length-min",
                {key: item.key, min: itemMin, num: dataToCheck.length},
                item.postfix);
            }
            if (!max) {
              var itemErrorData = {key: item.key, max: itemMax, num: dataToCheck.length};
              error(
                "array-length-max",
                itemErrorData,
                item.postfix);
            }
          }

        } else if (item.check === "int-size") {
          itemMin = evalValue(item.min, d.data);
          itemMax = evalValue(item.max, d.data);
          min = angular.isUndefined(item.min) || dataToCheck >= itemMin;
          max = angular.isUndefined(item.max) || dataToCheck <= itemMax;
          pass = min && max;
          if (!min) {
            error(
              "int-size-min",
              {key: item.key, min: itemMin, value: dataToCheck},
              item.postfix);
          }
          if (!max) {
            error(
              "int-size-max",
              {key: item.key, max: itemMax, value: dataToCheck},
              item.postfix);
          }
        } else if (item.check === "group-chain") {
          pass = _.all(
            _.map(
              item.checks,
              function(check) {
                return checker({
                  data: d.data,
                  errorData: d.errorData,
                  onError: d.onError,
                  checks: [check],
                  prefix: sumStrs(d.prefix, item.prefix)
                });
              })
            );
        } else if (item.check === "array-key-group-chain") {
          pass = _.every(
            dataToCheck,
            function (data, index) {
              var extra = {};
              var prefix = "";
              if (angular.isString(d.prefix)) {
                prefix = d.prefix;
              }
              if (angular.isString(item.prefix)) {
                prefix += item.prefix;
              }
              extra.prefix = prefix;
              extra[item.append.key] = evalValue(item.append.value, data);
              return checker({
                data: data,
                errorData: angular.extend({}, d.errorData, extra),
                onError: d.onError,
                checks: item.checks,
                prefix: sumStrs(d.prefix, item.prefix),
              });
            });
        } else if (item.check === "array-group-chain") {
          pass = _.every(d.data, function (data, index) {
            var extra = {};
            extra[item.append.key] = evalValue(item.append.value, data);
            return checker({
              data: data,
              errorData: angular.extend({}, d.errorData, extra),
              onError: d.onError,
              checks: item.checks,
              prefix: sumStrs(d.prefix, item.prefix),
            });
          });
        } else if (item.check === "array-group") {
          pass = _.contains(
            _.map(
              d.data,
              function (data, index) {
                var extra = {};
                extra[item.append.key] = evalValue(item.append.value, data);
                return checker({
                  data: data,
                  errorData: angular.extend({}, d.errorData, extra),
                  onError: d.onError,
                  checks: item.checks,
                  prefix: sumStrs(d.prefix, item.prefix),
                });
              }),
            true);
        } else if (item.check === "object-key-chain") {
          pass = _.isString(item.key) && _.isObject(dataToCheck);
          if (!!pass) {
            var data = dataToCheck;
            var extra = {};
            extra[item.append.key] = evalValue(item.append.value, data);
            var prefix = "";
            if (angular.isString(d.prefix)) {
              prefix += d.prefix;
            }
            if (angular.isString(item.prefix)) {
              prefix += item.prefix;
            }
            pass = _.every(
              item.checks,
              function (check, index) {
                return checker({
                  data: data,
                  errorData: angular.extend({}, d.errorData, extra),
                  onError: d.onError,
                  checks: [check],
                  prefix: prefix,
                });
              });
          }
        }
        if (!pass && d.data.groupType === 'chain') {
          return false;
        }
        return true;
      });

      return ret;
    }
    return checker;
  });
