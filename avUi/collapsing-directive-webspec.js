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

/* jshint ignore:start */
describe("collapsing-directive tests", function () {

  beforeEach(function () {
    browser.get('/#/election/1/vote/ff66424d7d77607bbfe78209e407df6fff31abe214a1fe3b3a7dd82600ec0000/8dee0c135afeae29e208550e7258dab7b64fb008bc606fc326d41946ab8e773f:1:1411130040');
  });

  it("data-toggle-selector and unfixed-top-height are present", function () {
    var el = element(by.xpath('//div[@data-toggle-selector]'));
    expect(el.getAttribute('data-toggle-selector')).toBe('avb-start-screen #avb-toggle');
    expect(element(by.xpath('//div[@av-collapsing=".unfixed-top-height"]')).isPresent()).toBe(true);    
  });
  
  it("avb-help-screen is displayed on click", function () {
    var el = element(by.css('.glyphicon-question-sign'));
    expect(element(by.xpath('//avb-help-screen')).isPresent()).toBe(false);
    el.click();
    expect(element(by.xpath('//avb-help-screen')).isPresent()).toBe(true);    
  });

});

/* jshint ignore:end */