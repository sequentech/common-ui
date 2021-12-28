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

angular
  .module('avUi')
  .service(
    'ShowVersionsModalService',
    function(ConfigService, $modal, $i18next) {
      return function () {
        $modal
        .open({
          templateUrl: "avUi/confirm-modal-controller/confirm-modal-controller.html",
          controller: "ConfirmModal",
          size: 'lg',
          resolve: {
            data: function () {
              var mainVersion = $i18next('avCommon.showVersionModal.mainVersion');
              var versionList = (
                "<li><strong>" + mainVersion + " (agora-dev-box):</strong> " +
                ConfigService.mainVersion +
                "<br><br></li>"
              );
              _.each(
                ConfigService.repoVersions,
                function (repo) {
                  versionList += (
                    "<li><strong>" +
                    repo.repoName +
                    ":</strong> " +
                    repo.repoVersion +
                    "</li>"
                  );
                }
              );
              var body = $i18next(
                'avCommon.showVersionModal.body',
                {
                  versionList: versionList
                }
              );
              return {
                i18n: {
                  header: $i18next('avCommon.showVersionModal.header'),
                  body: body,
                  confirmButton: $i18next('avCommon.showVersionModal.confirmButton'),
                },
                hideCancelButton: true
              };
            }
          }
        });
      };
    });
  