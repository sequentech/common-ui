/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2020  Agora Voting SL <agora@agoravoting.com>

 * agora-gui-admin is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * agora-gui-admin  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with agora-gui-admin.  If not, see <http://www.gnu.org/licenses/>.
**/

angular.module('avUi')
  .directive(
    'avChildrenElections', 
    function(ConfigService) 
    {
      // we use it as something similar to a controller here
      function link(scope, element, attrs) 
      {
        scope.electionsById = {};
        scope.selectedElectionId = scope.parentElectionId;
        scope.hideParent = (attrs.hideParent === 'true');

        // process each election
        _.each(
          scope.childrenElectionInfo.presentation.categories,
          function (category) 
          {
            _.each(
              category.events,
              function (election) 
              {
                if (
                  scope.mode === 'checkbox' ||
                  scope.mode === 'toggle-and-callback'
                ) 
                {
                  election.data = election.data || false;
                  election.disabled = election.disabled || false;
                }
              }
            );
          }
        );

        // add a processElection function
        scope.click = function (election) 
        {
          console.log("click to election.event_id = " + election.event_id);
          if (election.disabled) {
            console.log("election disabled, so ignoring click");
            return;
          }
          if (scope.mode === 'checkbox') 
          {
            election.data = !election.data;
          } 
          else if (scope.mode === 'toggle-and-callback')
          {
            scope.selectedElectionId = election.event_id;
            scope.callback({electionId: election.event_id});
          }
        };
      }

      return {
        restrict: 'AE',
        scope:  {
          mode: '@',
          callback: '&?',
          parentElectionId: '@?',
          childrenElectionInfo: '='
        },
        link: link,
        templateUrl: 'avUi/children-elections-directive/children-elections-directive.html'
      };
    }
  );
