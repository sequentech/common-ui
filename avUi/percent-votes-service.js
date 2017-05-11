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

/*
 * Returns the percentage of votes received by an answer. The base number
 * of the percentage that is used depends on the
 * "answer_total_votes_percentage" option in the question.
 */
angular.module('avUi')
  .service('PercentVotesService', function() {
    return function (total_votes, question, over, format) {
      if (format === undefined) {
        format = "str";
      }
      
      function print(num) {
        if (format === "str") {
          return num.toFixed(2) + "%";
        } else {
          return num;
        }
      }

      // special case
      if (total_votes === 0) {
        return print(0.00);
      }

      var base = question.totals.valid_votes + question.totals.null_votes + question.totals.blank_votes;
      if (over === undefined || over === null) {
        over = question.answer_total_votes_percentage;
      }
      if ("over-valid-votes" === over) {
        base = question.totals.valid_votes;
      }
      else if ("over-total-valid-points" === over &&
        undefined !== question.totals.valid_points) {
        base = question.totals.valid_points;
      }

      return print(100*total_votes / base);
    };
  });
