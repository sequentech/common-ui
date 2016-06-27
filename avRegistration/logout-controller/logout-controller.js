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

angular.module('avRegistration').controller('LogoutController',
  function($scope, $stateParams, $filter, ConfigService, $i18next, $state, $cookies) {
    var adminId = ConfigService.freeAuthId;
    var authevent = $cookies.authevent;
    $cookies.user = '';
    $cookies.auth = '';
    $cookies.authevent = '';
    $cookies.userid = '';
    $cookies.isAdmin = false;
    if (authevent === ConfigService.freeAuthId + '' || !authevent) {
        $state.go("admin.login");
    } else {
        $state.go("registration.login", {id: $cookies.authevent});
    }
  }
);
