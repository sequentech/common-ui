/**
 * This file is part of common-ui.
 * Copyright (C) 2015-2021  Sequent Tech Inc <legal@sequentech.io>

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

describe("Login Controler tests", function () {

  beforeEach(module("avRegistration"));

  var $controller, $rootScope;

  beforeEach(inject(function(_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
  }));

  describe("$scope.event_id", function() {
    it("Test login controller", function () {
      var $scope = $rootScope.$new();
      var controller = $controller('LoginController', {
        $scope: $scope,
        $stateParams: { id: 1, code: 'qwerty', email: 'test@sequentech.io', isOpenId: false },
        $filter: undefined,
        $i18next: undefined,
        $cookies: undefined,
        $window: window,
        ConfigService: {},
        Authmethod: {},
      });
      expect($scope.event_id).toBe(1);
    });
  });
});
