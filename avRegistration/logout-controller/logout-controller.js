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

angular.module('avRegistration').controller('LogoutController',
  function($scope, $stateParams, $filter, ConfigService, $i18next, $state, $cookies, $location, Authmethod) {
    var adminId = ConfigService.freeAuthId;
    var authevent = Authmethod.getAuthevent();
    var postfix = "_authevent_" + authevent;
    $cookies.put("user" + postfix, '');
    $cookies.put("auth" + postfix, '');
    $cookies.put("authevent_" + authevent, '');
    $cookies.put("userid" + postfix, '');
    $cookies.put("isAdmin" + postfix, false);
    var loginLocation = $location.url();
    $cookies.put("redirect" + postfix, loginLocation);
    if (authevent === ConfigService.freeAuthId + '' || !authevent) {
        $state.go("admin.login");
    } else {
        $state.go("registration.login", {id: $cookies.get("authevent_" + authevent)});
    }
  }
);
