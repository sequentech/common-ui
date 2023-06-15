/**
 * This file is part of common-ui.
 * Copyright (C) 2022  Sequent Tech Inc <legal@sequentech.io>

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


angular.module('avUi')
    .factory('ElectionCreation', function() {
        var service = {
        };

        service.generateAuthapiRequest = function (el) {
            // sanitize some unneeded values that might still be there. This
            // needs to be done because how we use ng-model
            if (el.census.config.subject && !_.contains(['email', 'email-otp'], el.census.auth_method)) {
              delete el.census.config.subject;
            }
            var authAction = el.census.config['authentication-action'];
            if (authAction.mode === 'vote') {
              authAction["mode-config"] = null;
            }

            var d = {
                auth_method: el.census.auth_method,
                has_ballot_boxes: el.census.has_ballot_boxes,
                support_otl_enabled: el.census.support_otl_enabled || false,
                census: el.census.census,
                auth_method_config: el.census.config,
                extra_fields: [],
                admin_fields: [],
                num_successful_logins_allowed: el.num_successful_logins_allowed,
                allow_public_census_query: el.allow_public_census_query,
                hide_default_login_lookup_field: el.hide_default_login_lookup_field,
                parent_id: el.parent_id || null,
                children_election_info: el.children_election_info || null,
                alternative_auth_methods: el.alternative_auth_methods || null
            };

            // Set election id if existing in election configuration
            if (el.id) {
              d.id = el.id;
            }

            d.admin_fields = _.filter(el.census.admin_fields, function(af) {
              return true;
            });

            d.extra_fields = _.filter(el.census.extra_fields, function(ef) {
              delete ef.disabled;
              delete ef.must;
              delete ef.value;

              // only add regex if it's filled and it's a text field
              if (!angular.isUndefined(ef.regex) &&
                (!_.contains(['int', 'text'], ef.type) || $.trim(ef.regex).length === 0)) {
                delete ef.regex;
              }

              if (_.contains(['bool', 'captcha'], ef.type)) {
                delete ef.min;
                delete ef.max;
              } else {
                if (!!ef.min) {
                  ef.min = parseInt(ef.min);
                }
                if (!!ef.max) {
                  ef.max = parseInt(ef.max);
                }
              }
              return true;
            });

            return d;
        };

        service.generateAuthapiResponse = function (el) {
          var election = service.generateAuthapiRequest(el);

          election.users = 0;
          election.tally_status = "notstarted";
          election.allow_public_census_query = false;
          election.created = "2022-12-05T15:22:34.862203%2B00:00";
          election.based_in = election.based_in || null;
          election.hide_default_login_lookup_field = election.hide_default_login_lookup_field || false;
          election.auth_method_config.config = {
            allow_user_resend: election.auth_method_config.allow_user_resend
          };
          election.openid_connect_providers = [];
          election.inside_authenticate_otl_period = false;

          return election;
        };

        service.generateBallotBoxRequest = function (data) {
          var el = angular.copy(data);

          if (typeof el.extra_data === 'object') {
              el.extra_data = JSON.stringify(el.extra_data);
          }
          if (typeof el.tallyPipesConfig === 'object') {
          el.tallyPipesConfig = JSON.stringify(el.tallyPipesConfig);
          }
          if (typeof el.ballotBoxesResultsConfig === 'object') {
          el.ballotBoxesResultsConfig = JSON.stringify(el.ballotBoxesResultsConfig);
          }

          _.each(el.questions, function (q) {
            _.each(q.answers, function (answer) {
              answer.urls = _.filter(answer.urls, function(url) { return $.trim(url.url).length > 0;});
            });
          });

          return el;
        };

        service.generateBallotBoxResponse = function (el) {
          var election = service.generateBallotBoxRequest(el);

          election.ballotBoxesResultsConfig = election.ballotBoxesResultsConfig || "";
          election.virtual = election.virtual || false;
          election.tally_allowed = false;
          election.publicCandidates = true;
          election.virtualSubelections = election.virtualSubelections || [];
          election.logo_url = election.logo_url || "";

          return {
            id: election.id,
            configuration: election,
            state:"started",
            // always use the same public keys
            pks: JSON.stringify(election.questions.map(function (q) {
              return {
                q: '24792774508736884642868649594982829646677044143456685966902090450389126928108831401260556520412635107010557472033959413182721740344201744439332485685961403243832055703485006331622597516714353334475003356107214415133930521931501335636267863542365051534250347372371067531454567272385185891163945756520887249904654258635354225185183883072436706698802915430665330310171817147030511296815138402638418197652072758525915640803066679883309656829521003317945389314422254112846989412579196000319352105328237736727287933765675623872956765501985588170384171812463052893055840132089533980513123557770728491280124996262883108653723',
                p: '49585549017473769285737299189965659293354088286913371933804180900778253856217662802521113040825270214021114944067918826365443480688403488878664971371922806487664111406970012663245195033428706668950006712214428830267861043863002671272535727084730103068500694744742135062909134544770371782327891513041774499809308517270708450370367766144873413397605830861330660620343634294061022593630276805276836395304145517051831281606133359766619313659042006635890778628844508225693978825158392000638704210656475473454575867531351247745913531003971176340768343624926105786111680264179067961026247115541456982560249992525766217307447',
                y: '25233303610624276354982811986201834016697399044876854448496917180808794460600684041443897755355520203095802059616029587815193698920031231714345315925211168639624595654625128533802897292140868582328656520616332091010467955507834092620045939069623671407818190171090021825044623127204061232697474129851550188729946673890631720197446903235998242798036758238763406311552128366413931805575611209227161344639186615808279023879377699069225460149170905910146022296229949546176735955646970920639173343909852697354526383408023054713403757933275765703706664300550788437833505997522376371433614613665995482912523477014539823187236',
                g: '27257469383433468307851821232336029008797963446516266868278476598991619799718416119050669032044861635977216445034054414149795443466616532657735624478207460577590891079795564114912418442396707864995938563067755479563850474870766067031326511471051504594777928264027177308453446787478587442663554203039337902473879502917292403539820877956251471612701203572143972352943753791062696757791667318486190154610777475721752749567975013100844032853600120195534259802017090281900264646220781224136443700521419393245058421718455034330177739612895494553069450438317893406027741045575821283411891535713793639123109933196544017309147'
              };
            })),
            tallyPipesConfig: election.tallyPipesConfig,
            ballotBoxesResultsConfig: election.ballotBoxesResultsConfig,
            virtual: election.virtual,
            tallyAllowed: false,
            publicCandidates:true,
            logo_url: election.logo_url,
            trusteeKeysState: []
          };
        };
        
        return service;
    });
