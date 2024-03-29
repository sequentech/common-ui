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

jQuery.fn.flash = function(duration) {
  var selector = this;

  if (!angular.isNumber(duration)) {
    duration = 300;
  }

  if (selector.attr("is-flashing") === "true") {
    return;
  }

  selector.attr("is-flashing", "true");

  selector
    .addClass("flashing")
    .delay(duration)
    .queue(function() {
      selector.removeClass("flashing").addClass("flashing-out").dequeue();
    })
    .delay(duration)
    .queue(function() {
      selector.removeClass("flashing flashing-out").dequeue();
      selector.attr("is-flashing", "false");
    });
};