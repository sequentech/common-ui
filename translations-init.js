/**
 * This file is part of common-ui.
 * Copyright (C) 2023  Sequent Tech Inc <legal@sequentech.io>

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

// Before booting angular use i18next configuration system to configure and load your localization resources.
window.i18next
	.use(window.i18nextXHRBackend);

// note that we do not send the language: by default, it will try the language
// supported by the web browser
window.i18next.init({
	debug: true,
    useCookie: true,
    useLocalStorage: false,
    fallbackLng: 'en',
    cookieName: 'lang',
    detectLngQS: 'lang',
    lngWhitelist: ['en', 'es', 'gl', 'ca'],
	backend: {
		loadPath: '../locales/{{lng}}.json'
	},
    resGetPath: '/locales/__lng__.json',
    defaultLoadingValue: '' // ng-i18next option, *NOT* directly supported by i18next
}, function (err, t) {
	console.log('resources loaded');
});
