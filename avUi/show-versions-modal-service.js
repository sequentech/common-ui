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

angular
  .module('avUi')
  .service(
    'ShowVersionsModalService',
    function(ConfigService, $modal, $sce, $window) {
      return function () {
        $modal
        .open({
          templateUrl: "avUi/confirm-modal-controller/confirm-modal-controller.html",
          controller: "ConfirmModal",
          size: 'lg',
          resolve: {
            data: function () {
              var mainVersion = $window.i18next.t('avCommon.showVersionModal.mainVersion');
              var versionList = (
                "<li><strong>" + mainVersion + " (deployment-tool):</strong> " +
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
              var body = $sce.trustAsHtml($window.i18next.t(
                'avCommon.showVersionModal.body',
                {
                  versionList: versionList,
                  interpolation: { escapeValue: false }
                }
              ));
              return {
                i18n: {
                  header: $window.i18next.t('avCommon.showVersionModal.header'),
                  body: body,
                  confirmButton: $window.i18next.t('avCommon.showVersionModal.confirmButton'),
                },
                hideCancelButton: true
              };
            }
          }
        });
      };
    });
  