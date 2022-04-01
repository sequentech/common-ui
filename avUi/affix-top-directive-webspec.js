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

/* jshint ignore:start */
describe("affix-top-directive tests", function () {

  beforeEach(function () {
//    var html = '<nav av-affix-top style="height: 40px;"></nav>';
    var html = '<style>' + 
            '.navbar-fixed-top {min-height: 40px;}' +
            '.navbar-unfixed-top {margin: 0;}' +
            '</style>' + 
            '<nav class="navbar-fixed-top" av-affix-top=".navbar-unfixed-top"></nav>';
    browser.get('/#/unit-test-e2e?html=' + encodeURIComponent(html));
  });

  it("margin-top is present", function () {
    browser.manage().window().setSize(320, 480);
    expect(element(by.xpath('//nav[contains(@navbar-unfixed-top, margin-top)]')).isPresent()).toBe(true);
  });

});

/* jshint ignore:end */