angular.module("avRegistration", [ "ui.bootstrap", "ui.utils", "ui.router" ]), angular.module("avRegistration").config(function() {}), 
angular.module("avRegistration").factory("Authmethod", [ "$http", "$cookies", "ConfigService", "$interval", function($http, $cookies, ConfigService, $interval) {
    var backendUrl = ConfigService.authAPI, authId = ConfigService.freeAuthId, authmethod = {};
    return authmethod.captcha_code = null, authmethod.captcha_image_url = "", authmethod.captcha_status = "", 
    authmethod.admin = !1, authmethod.isAdmin = function() {
        return authmethod.isLoggedIn() && authmethod.admin;
    }, authmethod.isLoggedIn = function() {
        var auth = $http.defaults.headers.common.Authorization;
        return auth && auth.length > 0;
    }, authmethod.signup = function(data, authevent) {
        var eid = authevent || authId;
        return $http.post(backendUrl + "auth-event/" + eid + "/register/", data);
    }, authmethod.getUserInfo = function(userid) {
        if (!authmethod.isLoggedIn()) {
            var data = {
                success: function() {
                    return data;
                },
                error: function(func) {
                    return setTimeout(function() {
                        func({
                            message: "not-logged-in"
                        });
                    }, 0), data;
                }
            };
            return data;
        }
        return "undefined" == typeof userid ? $http.get(backendUrl + "user/", {}) : $http.get(backendUrl + "user/%d" % userid, {});
    }, authmethod.ping = function() {
        if (!authmethod.isLoggedIn()) {
            var data = {
                success: function() {
                    return data;
                },
                error: function(func) {
                    return setTimeout(function() {
                        func({
                            message: "not-logged-in"
                        });
                    }, 0), data;
                }
            };
            return data;
        }
        return $http.get(backendUrl + "auth-event/" + authId + "/ping/");
    }, authmethod.getImage = function(ev, uid) {
        return $http.get(backendUrl + "auth-event/" + ev + "/census/img/" + uid + "/");
    }, authmethod.login = function(data, authevent) {
        var eid = authevent || authId;
        return delete data.authevent, $http.post(backendUrl + "auth-event/" + eid + "/authenticate/", data);
    }, authmethod.resendAuthCode = function(data, eid) {
        return $http.post(backendUrl + "auth-event/" + eid + "/resend_auth_code/", data);
    }, authmethod.getPerm = function(perm, object_type, object_id) {
        var data = {
            permission: perm,
            object_type: object_type,
            object_id: object_id + ""
        };
        return $http.post(backendUrl + "get-perms/", data);
    }, authmethod.viewEvent = function(id) {
        return $http.get(backendUrl + "auth-event/" + id + "/");
    }, authmethod.viewEvents = function() {
        return $http.get(backendUrl + "auth-event/");
    }, authmethod.createEvent = function(data) {
        return $http.post(backendUrl + "auth-event/", data);
    }, authmethod.editEvent = function(id, data) {
        return $http.post(backendUrl + "auth-event/" + id + "/", data);
    }, authmethod.addCensus = function(id, data, validation) {
        angular.isDefined(validation) || (validation = "enabled");
        var d = {
            "field-validation": validation,
            census: data
        };
        return $http.post(backendUrl + "auth-event/" + id + "/census/", d);
    }, authmethod.getCensus = function(id, params) {
        return angular.isObject(params) ? $http.get(backendUrl + "auth-event/" + id + "/census/", {
            params: params
        }) : $http.get(backendUrl + "auth-event/" + id + "/census/");
    }, authmethod.getRegisterFields = function(viewEventData) {
        var fields = angular.copy(viewEventData.extra_fields);
        fields || (fields = []), "sms" === viewEventData.auth_method ? fields.push({
            name: "tlf",
            type: "tlf",
            required: !0,
            required_on_authentication: !0
        }) : "email" === viewEventData.auth_method ? fields.push({
            name: "email",
            type: "email",
            required: !0,
            required_on_authentication: !0
        }) : "user-and-password" === viewEventData.auth_method && (fields.push({
            name: "email",
            type: "email",
            required: !0,
            required_on_authentication: !0
        }), fields.push({
            name: "password",
            type: "password",
            required: !0,
            required_on_authentication: !0
        }));
        for (var i = 0; i < fields.length; i++) if ("captcha" === fields[i].type) {
            var captcha = fields.splice(i, 1);
            fields.push(captcha[0]);
            break;
        }
        return fields;
    }, authmethod.getLoginFields = function(viewEventData) {
        var fields = authmethod.getRegisterFields(viewEventData);
        "sms" !== viewEventData.auth_method && "email" !== viewEventData.auth_method || fields.push({
            name: "code",
            type: "code",
            required: !0,
            required_on_authentication: !0
        }), fields = _.filter(fields, function(field) {
            return field.required_on_authentication;
        });
        for (var i = 0; i < fields.length; i++) if ("captcha" === fields[i].type) {
            var captcha = fields.splice(i, 1);
            fields.push(captcha[0]);
            break;
        }
        return fields;
    }, authmethod.newCaptcha = function(message) {
        return authmethod.captcha_status = message, $http.get(backendUrl + "captcha/new/", {}).success(function(data) {
            console.log(data), null !== data.captcha_code ? (authmethod.captcha_code = data.captcha_code, 
            authmethod.captcha_image_url = data.image_url) : authmethod.captcha_status = "Not found";
        });
    }, authmethod.test = function() {
        return $http.get(backendUrl);
    }, authmethod.setAuth = function(auth, isAdmin) {
        return authmethod.admin = isAdmin, $http.defaults.headers.common.Authorization = auth, 
        authmethod.pingTimeout || ($interval.cancel(authmethod.pingTimeout), authmethod.launchPingDaemon(), 
        authmethod.pingTimeout = $interval(function() {
            authmethod.launchPingDaemon();
        }, 500 * ConfigService.timeoutSeconds)), !1;
    }, authmethod.electionsIds = function(page) {
        return page || (page = 1), $http.get(backendUrl + "acl/mine/?object_type=AuthEvent&perm=edit&order=-pk&page=" + page);
    }, authmethod.sendAuthCodes = function(eid, election, user_ids, auth_method, extra) {
        var url = backendUrl + "auth-event/" + eid + "/census/send_auth/", data = {};
        return angular.isDefined(election) && (data.msg = election.census.config.msg, "email" === auth_method && (data.subject = election.census.config.subject)), 
        angular.isDefined(user_ids) && (data["user-ids"] = user_ids), angular.isDefined(auth_method) && (data["auth-method"] = auth_method), 
        extra && (data.extra = extra), $http.post(url, data);
    }, authmethod.removeUsersIds = function(eid, election, user_ids) {
        var url = backendUrl + "auth-event/" + eid + "/census/delete/", data = {
            "user-ids": user_ids
        };
        return $http.post(url, data);
    }, authmethod.activateUsersIds = function(eid, election, user_ids) {
        var url = backendUrl + "auth-event/" + eid + "/census/activate/", data = {
            "user-ids": user_ids
        };
        return $http.post(url, data);
    }, authmethod.deactivateUsersIds = function(eid, election, user_ids) {
        var url = backendUrl + "auth-event/" + eid + "/census/deactivate/", data = {
            "user-ids": user_ids
        };
        return $http.post(url, data);
    }, authmethod.changeAuthEvent = function(eid, st) {
        var url = backendUrl + "auth-event/" + eid + "/" + st + "/", data = {};
        return $http.post(url, data);
    }, authmethod.launchPingDaemon = function() {
        $cookies.isAdmin && authmethod.ping().success(function(data) {
            $cookies.auth = data["auth-token"], authmethod.setAuth($cookies.auth, $cookies.isAdmin);
        });
    }, authmethod;
} ]), angular.module("avRegistration").controller("LoginController", [ "$scope", "$stateParams", "$filter", "ConfigService", "$i18next", function($scope, $stateParams, $filter, ConfigService, $i18next) {
    $scope.event_id = $stateParams.id, $scope.code = $stateParams.code, $scope.email = $stateParams.email;
} ]), angular.module("avRegistration").directive("avLogin", [ "Authmethod", "StateDataService", "$parse", "$state", "$cookies", "$i18next", "$window", "$timeout", "ConfigService", function(Authmethod, StateDataService, $parse, $state, $cookies, $i18next, $window, $timeout, ConfigService) {
    function link(scope, element, attrs) {
        var adminId = ConfigService.freeAuthId + "", autheventid = attrs.eventId;
        scope.orgName = ConfigService.organization.orgName, $cookies.authevent && $cookies.authevent === adminId && autheventid === adminId && ($window.location.href = "/admin/elections"), 
        scope.sendingData = !1, scope.stateData = StateDataService.getData(), scope.code = null, 
        attrs.code && attrs.code.length > 0 && (scope.code = attrs.code), scope.email = null, 
        attrs.email && attrs.email.length > 0 && (scope.email = attrs.email), scope.isAdmin = !1, 
        autheventid === adminId && (scope.isAdmin = !0), scope.resendAuthCode = function(field) {
            if (!scope.sendingData && "sms" === scope.method && scope.telIndex !== -1 && !scope.form["input" + scope.telIndex].$invalid) {
                field.value = "";
                var data = {};
                data.tlf = scope.telField.value, scope.sendingData = !0, Authmethod.resendAuthCode(data, autheventid).success(function(rcvData) {
                    $timeout(scope.sendingDataTimeout, 3e3);
                }).error(function(error) {
                    $timeout(scope.sendingDataTimeout, 3e3), scope.error = $i18next("avRegistration.errorSendingAuthCode");
                });
            }
        }, scope.sendingDataTimeout = function() {
            scope.sendingData = !1;
        }, scope.loginUser = function(valid) {
            if (valid && !scope.sendingData) {
                var data = {
                    captcha_code: Authmethod.captcha_code
                };
                _.each(scope.login_fields, function(field) {
                    data[field.name] = field.value, "email" === field.name && (scope.email = field.value);
                }), scope.sendingData = !0, Authmethod.login(data, autheventid).success(function(rcvData) {
                    "ok" === rcvData.status ? (scope.khmac = rcvData.khmac, $cookies.authevent = autheventid, 
                    $cookies.userid = rcvData.username, $cookies.user = scope.email, $cookies.auth = rcvData["auth-token"], 
                    $cookies.isAdmin = scope.isAdmin, Authmethod.setAuth($cookies.auth, scope.isAdmin), 
                    scope.isAdmin ? Authmethod.getUserInfo().success(function(d) {
                        $cookies.user = d.email, $window.location.href = "/admin/elections";
                    }).error(function(error) {
                        $window.location.href = "/admin/elections";
                    }) : angular.isDefined(rcvData["redirect-to-url"]) ? $window.location.href = rcvData["redirect-to-url"] : Authmethod.getPerm("vote", "AuthEvent", autheventid).success(function(rcvData2) {
                        var khmac = rcvData2["permission-token"], path = khmac.split(";")[1], hash = path.split("/")[0], msg = path.split("/")[1];
                        $window.location.href = "/booth/" + autheventid + "/vote/" + hash + "/" + msg;
                    })) : (scope.sendingData = !1, scope.status = "Not found", scope.error = $i18next("avRegistration.invalidCredentials"));
                }).error(function(error) {
                    scope.sendingData = !1, scope.status = "Registration error: " + error.message, scope.error = $i18next("avRegistration.invalidCredentials");
                });
            }
        }, scope.apply = function(authevent) {
            scope.method = authevent.auth_method, scope.name = authevent.name, scope.registrationAllowed = "open" === authevent.census, 
            scope.login_fields = Authmethod.getLoginFields(authevent), scope.telIndex = -1, 
            scope.telField = null;
            var fields = _.map(scope.login_fields, function(el, index) {
                return scope.stateData[el.name] ? (el.value = scope.stateData[el.name], el.disabled = !0) : (el.value = null, 
                el.disabled = !1), "email" === el.type && null !== scope.email ? (el.value = scope.email, 
                el.disabled = !0) : "code" === el.type && null !== scope.code ? (el.value = scope.code.trim().toUpperCase(), 
                el.disabled = !0) : "tlf" === el.type && "sms" === scope.method && (null !== scope.email && scope.email.indexOf("@") === -1 && (el.value = scope.email, 
                el.disabled = !0), scope.telIndex = index + 1, scope.telField = el), el;
            }), filled_fields = _.filter(fields, function(el) {
                return null !== el.value;
            });
            filled_fields.length === scope.login_fields.length && scope.loginUser(!0);
        }, scope.view = function(id) {
            Authmethod.viewEvent(id).success(function(data) {
                "ok" === data.status ? scope.apply(data.events) : (scope.status = "Not found", document.querySelector(".input-error").style.display = "block");
            }).error(function(error) {
                scope.status = "Scan error: " + error.message, document.querySelector(".input-error").style.display = "block";
            });
        }, scope.view(autheventid), scope.goSignup = function() {
            $state.go("registration.register", {
                id: autheventid
            });
        }, scope.forgotPassword = function() {
            console.log("forgotPassword");
        };
    }
    return {
        restrict: "AE",
        scope: !0,
        link: link,
        templateUrl: "avRegistration/login-directive/login-directive.html"
    };
} ]), angular.module("avRegistration").controller("LogoutController", [ "$scope", "$stateParams", "$filter", "ConfigService", "$i18next", "$state", "$cookies", function($scope, $stateParams, $filter, ConfigService, $i18next, $state, $cookies) {
    var authevent = (ConfigService.freeAuthId, $cookies.authevent);
    $cookies.user = "", $cookies.auth = "", $cookies.authevent = "", $cookies.userid = "", 
    $cookies.isAdmin = !1, authevent !== ConfigService.freeAuthId + "" && authevent ? $state.go("registration.login", {
        id: $cookies.authevent
    }) : $state.go("admin.login");
} ]), angular.module("avRegistration").controller("RegisterController", [ "$scope", "$stateParams", "$filter", "ConfigService", "$i18next", function($scope, $stateParams, $filter, ConfigService, $i18next) {
    $scope.event_id = $stateParams.id, $scope.email = $stateParams.email;
} ]), angular.module("avRegistration").directive("avRegister", [ "Authmethod", "StateDataService", "$parse", "$state", "ConfigService", "$cookies", "$i18next", "$sce", function(Authmethod, StateDataService, $parse, $state, ConfigService, $cookies, $i18next, $sce) {
    function link(scope, element, attrs) {
        var autheventid = attrs.eventId;
        scope.dnieurl = ConfigService.dnieUrl + autheventid + "/", scope.register = {}, 
        scope.sendingData = !1, scope.admin = !1, scope.email = null, attrs.email && attrs.email.length > 0 && (scope.email = attrs.email), 
        "admin" in attrs && (scope.admin = !0), scope.getLoginDetails = function(eventId) {
            return scope.admin ? {
                path: "admin.login",
                data: {}
            } : {
                path: "election.public.show.login",
                data: {
                    id: eventId
                }
            };
        }, scope.signUp = function(valid) {
            if (valid) {
                scope.sendingData = !0;
                var data = {
                    captcha_code: Authmethod.captcha_code
                };
                _.each(scope.register_fields, function(field) {
                    data[field.name] = field.value, "email" === field.name && (scope.email = field.value);
                });
                var details;
                Authmethod.signup(data, autheventid).success(function(rcvData) {
                    details = scope.getLoginDetails(autheventid), "ok" === rcvData.status ? (scope.user = rcvData.user, 
                    StateDataService.go(details.path, details.data, data), scope.error = rcvData.msg || $sce.trustAsHtml($i18next("avRegistration.invalidRegisterData", {
                        url: $state.href(details.path, details.data)
                    }))) : (scope.sendingData = !1, scope.status = "Not found", scope.error = rcvData.msg || $sce.trustAsHtml($i18next("avRegistration.invalidRegisterData", {
                        url: $state.href(details.path, details.data)
                    })));
                }).error(function(error) {
                    details = scope.getLoginDetails(autheventid), scope.sendingData = !1, scope.status = "Registration error: " + error.message, 
                    error.error_codename && "invalid-dni" === error.error_codename ? scope.error = $sce.trustAsHtml($i18next("avRegistration.invalidRegisterDNI")) : (scope.error = error.msg || $sce.trustAsHtml($i18next("avRegistration.invalidRegisterData", {
                        url: $state.href(details.path, details.data)
                    })), "Invalid captcha" === error.msg && Authmethod.newCaptcha());
                });
            }
        }, scope.goLogin = function(event) {
            console.log("goLogin"), event && (event.preventDefault(), event.stopPropagation()), 
            scope.authevent && (scope.authevent.id === ConfigService.freeAuthId ? $state.go("admin.login") : $state.go("election.public.show.login", {
                id: scope.authevent.id
            }));
        }, scope.apply = function(authevent) {
            scope.method = authevent.auth_method, scope.name = authevent.name, scope.authevent = authevent, 
            "open" !== authevent.census && (authevent.id === ConfigService.freeAuthId ? $state.go("admin.login") : $state.go("election.public.show.login", {
                id: authevent.id
            })), scope.register_fields = Authmethod.getRegisterFields(authevent);
            _.map(scope.register_fields, function(el) {
                return el.value = null, el.disabled = !1, "email" === el.type && null !== scope.email && (el.value = scope.email, 
                el.disabled = !0), el;
            });
        }, scope.view = function(id) {
            Authmethod.viewEvent(id).success(function(data) {
                "ok" === data.status ? scope.apply(data.events) : (scope.status = "Not found", document.querySelector(".input-error").style.display = "block");
            }).error(function(error) {
                scope.status = "Scan error: " + error.message, document.querySelector(".input-error").style.display = "block";
            });
        }, scope.view(autheventid);
    }
    return {
        restrict: "AE",
        scope: !0,
        link: link,
        templateUrl: "avRegistration/register-directive/register-directive.html"
    };
} ]), angular.module("avRegistration").factory("Patterns", function() {
    var patterns = {};
    return patterns.get = function(name) {
        return "dni" === name ? /^\d{7,8}[a-zA-Z]{1}$/i : "mail" === name || "email" === name ? /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ : /.*/;
    }, patterns;
}), angular.module("avRegistration").directive("avrField", [ "$state", function($state) {
    function link(scope, element, attrs) {
        console.log("type = " + scope.field.type), scope.index = attrs.index;
    }
    return {
        restrict: "AE",
        scope: !0,
        link: link,
        templateUrl: "avRegistration/field-directive/field-directive.html"
    };
} ]), angular.module("avRegistration").directive("avrEmailField", [ "$state", "Patterns", function($state, Patterns) {
    function link(scope, element, attrs) {
        scope.patterns = function(name) {
            return Patterns.get(name);
        };
    }
    return {
        restrict: "AE",
        link: link,
        scope: !0,
        templateUrl: "avRegistration/fields/email-field-directive/email-field-directive.html"
    };
} ]), angular.module("avRegistration").directive("avrPasswordField", [ "$state", function($state) {
    return {
        restrict: "AE",
        scope: !0,
        templateUrl: "avRegistration/fields/password-field-directive/password-field-directive.html"
    };
} ]), angular.module("avRegistration").directive("avrTextField", [ "$state", function($state) {
    function link(scope, element, attrs) {
        angular.isUndefined(scope.field.regex) ? scope.re = new RegExp("") : scope.re = new RegExp(scope.field.regex), 
        scope.getRe = function(value) {
            return scope.re;
        };
    }
    return {
        restrict: "AE",
        link: link,
        scope: !0,
        templateUrl: "avRegistration/fields/text-field-directive/text-field-directive.html"
    };
} ]), angular.module("avRegistration").directive("avrDniField", [ "$state", function($state) {
    function link(scope, element, attrs) {
        scope.dni_re = /^[XYZ]?\d{7,8}[A-Z]$/, scope.validateDni = function(str) {
            str || (str = ""), str = str.toUpperCase().replace(/\s/, "");
            var prefix = str.charAt(0), index = "XYZ".indexOf(prefix), niePrefix = 0;
            index > -1 && (niePrefix = index, str = str.substr(1), "Y" === prefix ? str = "1" + str : "Z" === prefix && (str = "2" + str));
            var dni_letters = "TRWAGMYFPDXBNJZSQVHLCKE", letter = dni_letters.charAt(parseInt(str, 10) % 23);
            return letter === str.charAt(str.length - 1);
        };
    }
    return {
        restrict: "AE",
        link: link,
        scope: !0,
        templateUrl: "avRegistration/fields/dni-field-directive/dni-field-directive.html"
    };
} ]), angular.module("avRegistration").directive("avrCodeField", [ "$state", "Plugins", function($state, Plugins) {
    function link(scope, element, attrs) {
        scope.codePattern = /[abcdefghjklmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8,8}/, 
        scope.showResendAuthCode = function() {
            var data = {
                showUserSendAuthCode: !0
            };
            return Plugins.hook("hide-user-send-auth-code", data), data.showUserSendAuthCode;
        };
    }
    return {
        restrict: "AE",
        scope: !0,
        link: link,
        templateUrl: "avRegistration/fields/code-field-directive/code-field-directive.html"
    };
} ]), angular.module("avRegistration").directive("avrTelField", [ "$state", function($state) {
    function link(scope, element, attrs) {
        scope.tlfPattern = /^[+]?\d{9,14}$/;
    }
    return {
        restrict: "AE",
        scope: !0,
        link: link,
        templateUrl: "avRegistration/fields/tel-field-directive/tel-field-directive.html"
    };
} ]), angular.module("avRegistration").directive("avrBoolField", [ "$state", function($state) {
    return {
        restrict: "AE",
        scope: !0,
        templateUrl: "avRegistration/fields/bool-field-directive/bool-field-directive.html"
    };
} ]), angular.module("avRegistration").directive("avrIntField", [ "$state", function($state) {
    function link(scope, element, attrs) {
        angular.isUndefined(scope.field.regex) ? scope.re = new RegExp("") : scope.re = new RegExp(scope.field.regex), 
        scope.getRe = function(value) {
            return scope.re;
        };
    }
    return {
        restrict: "AE",
        link: link,
        scope: !0,
        templateUrl: "avRegistration/fields/int-field-directive/int-field-directive.html"
    };
} ]), angular.module("avRegistration").directive("avrCaptchaField", [ "Authmethod", "$state", "$interval", function(Authmethod, $state, $interval) {
    function link(scope, element, attrs) {
        scope.authMethod = Authmethod, Authmethod.newCaptcha("");
    }
    return {
        restrict: "AE",
        scope: !0,
        link: link,
        templateUrl: "avRegistration/fields/captcha-field-directive/captcha-field-directive.html"
    };
} ]), angular.module("avRegistration").directive("avrTextareaField", [ "$state", function($state) {
    return {
        restrict: "AE",
        scope: !0,
        templateUrl: "avRegistration/fields/textarea-field-directive/textarea-field-directive.html"
    };
} ]), angular.module("avRegistration").directive("avrImageField", [ "$state", "$timeout", function($state, $timeout) {
    function link(scope, element, attrs) {
        function readImage(input) {
            if (input.files && input.files[0]) {
                var FR = new FileReader();
                FR.onload = function(e) {
                    scope.field.value = e.target.result;
                }, FR.readAsDataURL(input.files[0]);
            }
        }
        $timeout(function() {
            $("#image-field").change(function() {
                readImage(this);
            });
        }, 0);
    }
    return {
        restrict: "AE",
        link: link,
        scope: !0,
        templateUrl: "avRegistration/fields/image-field-directive/image-field-directive.html"
    };
} ]), angular.module("avRegistration").factory("Plugins", function() {
    var plugins = {};
    return plugins.plugins = {
        list: []
    }, plugins.signals = $.Callbacks("unique"), plugins.hooks = [], plugins.add = function(plugin) {
        plugins.plugins.list.push(plugin);
    }, plugins.clear = function() {
        plugins.plugins.list = [];
    }, plugins.remove = function(plugin) {
        var pluginList = plugins.plugins.list;
        plugins.plugins.list = [], pluginList.forEach(function(pluginFromList) {
            plugin.name !== pluginFromList.name && plugins.plugins.list.push(pluginFromList);
        });
    }, plugins.emit = function(signalName, data) {
        plugins.signals.fire(signalName, data);
    }, plugins.hook = function(hookname, data) {
        for (var i = 0; i < plugins.hooks.length; i++) {
            var h = plugins.hooks[i], ret = h(hookname, data);
            if (!ret) return !1;
        }
        return !0;
    }, plugins;
}), angular.module("avRegistration").directive("avPluginHtml", [ "$compile", "$sce", "$parse", function($compile, $sce, $parse) {
    return function(scope, element, attrs) {
        var parsedHtml = $parse(attrs.ngBindHtml);
        scope.$watch(function() {
            return (parsedHtml(scope) || "").toString();
        }, function() {
            $compile(element, null, -9999)(scope);
        });
    };
} ]), angular.module("avUi", []), jQuery.fn.flash = function(duration) {
    var selector = this;
    angular.isNumber(duration) || (duration = 300), "true" !== selector.attr("is-flashing") && (selector.attr("is-flashing", "true"), 
    selector.addClass("flashing").delay(duration).queue(function() {
        selector.removeClass("flashing").addClass("flashing-out").dequeue();
    }).delay(duration).queue(function() {
        selector.removeClass("flashing flashing-out").dequeue(), selector.attr("is-flashing", "false");
    }));
}, angular.module("avUi").directive("avSimpleError", [ "$resource", "$window", function($resource, $window) {
    function link(scope, element, attrs) {
        scope.updateTitle = function() {
            var title = element.find(".av-simple-error-title"), marginTop = -title.height() - 45, marginLeft = -title.width() / 2;
            title.attr("style", "margin-top: " + marginTop + "px; margin-left: " + marginLeft + "px");
        }, scope.$watch(attrs.title, function() {
            scope.updateTitle();
        });
    }
    return {
        restrict: "AE",
        scope: {},
        link: link,
        transclude: !0,
        templateUrl: "avUi/simple-error-directive/simple-error-directive.html"
    };
} ]), angular.module("avUi").directive("avChangeLang", [ "$i18next", "ipCookie", "angularLoad", "amMoment", "ConfigService", function($i18next, ipCookie, angularLoad, amMoment, ConfigService) {
    function link(scope, element, attrs) {
        scope.deflang = window.i18n.lng(), scope.langs = $i18next.options.lngWhitelist, 
        scope.changeLang = function(lang) {
            $i18next.options.lng = lang, console.log("setting cookie"), ipCookie("lang", lang, _.extend({
                expires: 360
            }, ConfigService.i18nextCookieOptions)), scope.deflang = lang, angularLoad.loadScript(ConfigService.base + "/locales/moment/" + lang + ".js").then(function() {
                amMoment.changeLocale(lang);
            });
        };
    }
    return {
        restrict: "AE",
        scope: {},
        link: link,
        templateUrl: "avUi/change-lang-directive/change-lang-directive.html"
    };
} ]), angular.module("avUi").directive("avAffixBottom", [ "$window", "$timeout", "$parse", function($window, $timeout, $parse) {
    var affixBottomClass = "affix-bottom", checkPosition = function(scope, instance, el, options) {
        var affix = !1, elHeight = $(el).actual("height");
        ($("body").height() + elHeight > window.innerHeight || instance.forceAffixWidth && window.innerWidth < instance.forceAffixWidth) && (affix = affixBottomClass), 
        instance.affixed !== affix && (instance.affix = affix, instance.setIsAffix(scope, affix), 
        el.removeClass("hidden"), affix ? (el.addClass(affixBottomClass), $(el).parent().css("margin-bottom", elHeight + "px")) : (el.removeClass(affixBottomClass), 
        $(el).parent().css("margin-bottom", instance.defaultBottomMargin)));
    };
    return {
        restrict: "EAC",
        link: function(scope, iElement, iAttrs) {
            function callCheckPos() {
                timeout = $timeout(function() {
                    $timeout.cancel(timeout), checkPosition(scope, instance, iElement, iAttrs);
                }, 100);
            }
            var instance = {
                affix: !1,
                getIsAffix: null,
                setIsAffix: angular.noop,
                defaultBottomMargin: iElement.css("margin-bottom"),
                forceAffixWidth: parseInt(iAttrs.forceAffixWidth, 10)
            };
            iAttrs.avAffixBottom.length > 0 && (instance.getIsAffix = $parse(iAttrs.avAffixBottom), 
            instance.setIsAffix = instance.getIsAffix.assign);
            var timeout;
            callCheckPos(), angular.element($window).on("resize", callCheckPos), angular.element(document.body).on("resize", callCheckPos), 
            console.log("iElement NOT resize, height = " + iElement.height()), angular.element(iElement).on("resize", callCheckPos);
        }
    };
} ]), angular.module("avUi").directive("avAutoHeight", [ "$window", "$timeout", function($window, $timeout) {
    return {
        link: function(scope, element, attrs) {
            var sibling, recalculate, promise = null;
            sibling = function() {
                return element.closest(attrs.parentSelector).find(attrs.siblingSelector);
            }, recalculate = function() {
                promise && $timeout.cancel(promise), promise = $timeout(function() {
                    var height, additionalHeight = 0;
                    attrs.additionalHeight && (additionalHeight = parseInt(attrs.additionalHeight, 10)), 
                    height = sibling().height(), element.css("max-height", height + additionalHeight + "px");
                }, 100);
            }, scope.$watch(function() {
                return sibling().height();
            }, function(newValue, oldValue) {
                recalculate();
            }), recalculate();
        }
    };
} ]), angular.module("avUi").directive("avAffixTopOffset", [ "$window", "$timeout", "$parse", function($window, $timeout, $parse) {
    var affixClass = "affix-top", checkPosition = function(scope, instance, el, options) {
        var affix = !1, offset = el.offset();
        instance.affix && $window.pageYOffset + 20 >= instance.scrollAffix || (offset.top - $window.pageYOffset < instance.avAffixTopOffset && (affix = !0), 
        instance.affix !== affix && (instance.affix = affix, instance.scrollAffix = $window.pageYOffset, 
        affix ? (el.addClass(affixClass), el.data("page-offset", $window.pageYOffset), el.css("position", "fixed"), 
        el.css("float", "none"), el.css("top", Math.floor(instance.avAffixTopOffset) + "px"), 
        el.css("left", Math.floor(instance.baseOffset.left) + "px"), el.css("width", Math.floor(instance.baseWidth) + "px"), 
        el.css("z-index", "10"), void 0 !== options.affixPlaceholder && $(options.affixPlaceholder).addClass("affixed")) : (el.removeClass(affixClass), 
        el.attr("style", ""), void 0 !== options.affixPlaceholder && $(options.affixPlaceholder).removeClass("affixed"))));
    };
    return {
        restrict: "EAC",
        link: function(scope, iElement, iAttrs) {
            function callCheckPos() {
                checkPosition(scope, instance, iElement, iAttrs);
            }
            function resize() {
                iElement.removeClass(affixClass), iElement.attr("style", ""), instance.affix = !1, 
                instance.scrollAffix = null, $timeout(function() {
                    instance.baseOffset = iElement.offset(), instance.baseWidth = iElement.width(), 
                    callCheckPos();
                }, 100);
            }
            var instance = {
                affix: !1,
                scrollAffix: null,
                baseOffset: iElement.offset(),
                baseWidth: iElement.width(),
                avAffixTopOffset: parseInt(iAttrs.avAffixTopOffset, 10)
            };
            callCheckPos(), angular.element($window).on("scroll", callCheckPos), angular.element($window).on("resize", resize);
        }
    };
} ]), angular.module("avUi").directive("avAffixTop", [ "$window", "$timeout", function($window, $timeout) {
    var updateMargin = function(el, options) {
        var minHeight = parseInt(options.minHeight), height = Math.max($(el).height(), angular.isNumber(minHeight) && !isNaN(minHeight) ? minHeight : 0);
        $(options.avAffixTop).css("padding-top", height + "px");
    };
    return {
        restrict: "EAC",
        link: function(scope, iElement, iAttrs) {
            function updateMarginTimeout() {
                timeout = $timeout(function() {
                    $timeout.cancel(timeout), updateMargin(iElement, iAttrs);
                }, 100);
            }
            updateMargin(iElement, iAttrs), void 0 === iAttrs.minHeight && (iAttrs.minHeight = "20");
            var timeout;
            angular.element(iElement).bind("resize", updateMarginTimeout), angular.element($window).bind("resize", updateMarginTimeout), 
            $(iAttrs.avAffixTop).change(updateMarginTimeout);
        }
    };
} ]), angular.module("avUi").directive("avCollapsing", [ "$window", "$timeout", function($window, $timeout) {
    function collapseEl(instance, el) {
        var val = null;
        return val = instance.collapseSelector ? select(instance, el, instance.collapseSelector) : angular.element(el);
    }
    function select(instance, el, selector) {
        var val;
        return val = instance.parentSelector ? el.closest(instance.parentSelector).find(selector) : angular.element(selector);
    }
    var checkCollapse = function(instance, el, options) {
        var maxHeight = select(instance, el, instance.maxHeightSelector).css("max-height"), height = angular.element(el)[0].scrollHeight;
        if (maxHeight.indexOf("px") === -1) return void console.log("invalid non-pixels max-height for " + instance.maxHeightSelector);
        if (maxHeight = parseInt(maxHeight.replace("px", "")), height > maxHeight) {
            if (instance.isCollapsed) return;
            instance.isCollapsed = !0, collapseEl(instance, el).addClass("collapsed"), select(instance, el, instance.toggleSelector).removeClass("hidden in");
        } else {
            if (!instance.isCollapsed) return;
            instance.isCollapsed = !1, collapseEl(instance, el).removeClass("collapsed"), select(instance, el, instance.toggleSelector).addClass("hidden");
        }
    }, toggleCollapse = function(instance, el, options) {
        instance.isCollapsed ? (collapseEl(instance, el).removeClass("collapsed"), select(instance, el, instance.toggleSelector).addClass("in")) : (collapseEl(instance, el).addClass("collapsed"), 
        select(instance, el, instance.toggleSelector).removeClass("in")), instance.isCollapsed = !instance.isCollapsed;
    };
    return {
        restrict: "EAC",
        link: function(scope, iElement, iAttrs) {
            function callCheck() {
                timeout = $timeout(function() {
                    $timeout.cancel(timeout), checkCollapse(instance, iElement, iAttrs);
                }, 100);
            }
            function launchToggle() {
                toggleCollapse(instance, iElement, iAttrs);
            }
            var timeout, instance = {
                isCollapsed: !1,
                maxHeightSelector: iAttrs.avCollapsing,
                toggleSelector: iAttrs.toggleSelector,
                parentSelector: iAttrs.parentSelector,
                collapseSelector: iAttrs.collapseSelector
            };
            callCheck(), angular.element($window).bind("resize", callCheck), angular.element(iElement).bind("resize", callCheck), 
            angular.element(instance.toggleSelector).bind("click", launchToggle);
        }
    };
} ]), angular.module("avUi").directive("avRecompile", [ "$compile", "$parse", function($compile, $parse) {
    "use strict";
    function getElementAsHtml(el) {
        return angular.element("<a></a>").append(el.clone()).html();
    }
    return {
        scope: !0,
        compile: function(el) {
            var template = getElementAsHtml(el);
            return function(scope, $el, attrs) {
                var stopWatching = scope.$parent.$watch(attrs.avRecompile, function(_new, _old) {
                    var useBoolean = attrs.hasOwnProperty("useBoolean");
                    if ((!useBoolean || _new && "false" !== _new) && (useBoolean || _new && _new !== _old)) {
                        useBoolean && $parse(attrs.kcdRecompile).assign(scope.$parent, !1);
                        var newEl = $compile(template)(scope.$parent);
                        $el.replaceWith(newEl), stopWatching(), scope.$destroy();
                    }
                });
            };
        }
    };
} ]), angular.module("avUi").directive("avDebounce", [ "$timeout", function($timeout) {
    return {
        restrict: "A",
        require: "ngModel",
        priority: 99,
        link: function(scope, elm, attr, ngModelCtrl) {
            if ("radio" !== attr.type && "checkbox" !== attr.type) {
                elm.unbind("input");
                var debounce;
                elm.bind("input", function() {
                    $timeout.cancel(debounce), debounce = $timeout(function() {
                        scope.$apply(function() {
                            ngModelCtrl.$setViewValue(elm.val());
                        });
                    }, attr.avDebounce || 500);
                }), elm.bind("blur", function() {
                    scope.$apply(function() {
                        ngModelCtrl.$setViewValue(elm.val());
                    });
                });
            }
        }
    };
} ]), angular.module("avUi").service("InsideIframeService", function() {
    return function() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return !0;
        }
    };
}), angular.module("avUi").service("PercentVotesService", function() {
    return function(total_votes, question, over, format) {
        function print(num) {
            return "str" === format ? num.toFixed(2) + "%" : num;
        }
        if (void 0 === format && (format = "str"), 0 === total_votes) return print(0);
        var base = question.totals.valid_votes + question.totals.null_votes + question.totals.blank_votes;
        return void 0 !== over && null !== over || (over = question.answer_total_votes_percentage), 
        "over-valid-votes" === over && (base = question.totals.valid_votes), print(100 * total_votes / base);
    };
}), angular.module("avUi").service("CheckerService", function() {
    function checker(d) {
        function evalValue(code, $value) {
            return angular.isString(code) ? eval(code) : code;
        }
        function sumStrs(str1, str2) {
            var ret = "";
            return angular.isString(str1) && (ret = str1), angular.isString(str2) && (ret += str2), 
            ret;
        }
        function error(errorKey, errorData, postfix) {
            angular.extend(errorData, d.errorData), d.onError(_.reduce([ d.prefix, errorKey, postfix ], sumStrs, ""), errorData);
        }
        angular.isUndefined(d.errorData) && (d.errorData = {});
        var ret = _.every(d.checks, function(item) {
            var itemMin, itemMax, max, min, pass = !0;
            if ("is-int" === item.check) pass = angular.isNumber(d.data[item.key], item.postfix), 
            pass || error(item.check, {
                key: item.key
            }, item.postfix); else if ("is-array" === item.check) pass = angular.isArray(d.data[item.key], item.postfix), 
            pass || error(item.check, {
                key: item.key
            }, item.postfix); else if ("lambda" === item.check) {
                if (!item.validator(d.data[item.key])) {
                    var errorData = {
                        key: item.key
                    };
                    angular.isUndefined(item.appendOnErrorLambda) || (errorData = item.appendOnErrorLambda(d.data[item.key])), 
                    error(item.check, errorData, item.postfix);
                }
            } else if ("is-string" === item.check) pass = angular.isString(d.data[item.key], item.postfix), 
            pass || error(item.check, {
                key: item.key
            }, item.postfix); else if ("array-length" === item.check) {
                if (itemMin = evalValue(item.min, d.data), itemMax = evalValue(item.max, d.data), 
                (angular.isArray(d.data[item.key]) || angular.isString(d.data[item.key])) && (min = angular.isUndefined(item.min) || d.data[item.key].length >= itemMin, 
                max = angular.isUndefined(item.max) || d.data[item.key].length <= itemMax, pass = min && max, 
                min || error("array-length-min", {
                    key: item.key,
                    min: itemMin,
                    num: d.data[item.key].length
                }, item.postfix), !max)) {
                    var itemErrorData = {
                        key: item.key,
                        max: itemMax,
                        num: d.data[item.key].length
                    };
                    error("array-length-max", itemErrorData, item.postfix);
                }
            } else "int-size" === item.check ? (itemMin = evalValue(item.min, d.data), itemMax = evalValue(item.max, d.data), 
            min = angular.isUndefined(item.min) || d.data[item.key] >= itemMin, max = angular.isUndefined(item.max) || d.data[item.key] <= itemMax, 
            pass = min && max, min || error("int-size-min", {
                key: item.key,
                min: itemMin,
                value: d.data[item.key]
            }, item.postfix), max || error("int-size-max", {
                key: item.key,
                max: itemMax,
                value: d.data[item.key]
            }, item.postfix)) : "group-chain" === item.check ? pass = _.all(_.map(item.checks, function(check) {
                return checker({
                    data: d.data,
                    errorData: d.errorData,
                    onError: d.onError,
                    checks: [ check ],
                    prefix: sumStrs(d.prefix, item.prefix)
                });
            })) : "array-key-group-chain" === item.check ? pass = _.every(d.data[item.key], function(data, index) {
                var extra = {}, prefix = "";
                return angular.isString(d.prefix) && (prefix = d.prefix), angular.isString(item.prefix) && (prefix += item.prefix), 
                extra.prefix = prefix, extra[item.append.key] = evalValue(item.append.value, data), 
                checker({
                    data: data,
                    errorData: angular.extend({}, d.errorData, extra),
                    onError: d.onError,
                    checks: item.checks,
                    prefix: sumStrs(d.prefix, item.prefix)
                });
            }) : "array-group-chain" === item.check ? pass = _.every(d.data, function(data, index) {
                var extra = {};
                return extra[item.append.key] = evalValue(item.append.value, data), checker({
                    data: data,
                    errorData: angular.extend({}, d.errorData, extra),
                    onError: d.onError,
                    checks: item.checks,
                    prefix: sumStrs(d.prefix, item.prefix)
                });
            }) : "array-group" === item.check && (pass = _.contains(_.map(d.data, function(data, index) {
                var extra = {};
                return extra[item.append.key] = evalValue(item.append.value, data), checker({
                    data: data,
                    errorData: angular.extend({}, d.errorData, extra),
                    onError: d.onError,
                    checks: item.checks,
                    prefix: sumStrs(d.prefix, item.prefix)
                });
            }), !0));
            return !(!pass && "chain" === d.data.groupType);
        });
        return ret;
    }
    return checker;
}), angular.module("avUi").service("AddDotsToIntService", function() {
    return function(number, fixedDigits) {
        angular.isNumber(fixedDigits) && fixedDigits >= 0 && (number = number.toFixed(parseInt(fixedDigits)));
        var number_str = (number + "").replace(".", ","), ret = "", commaPos = number_str.length;
        number_str.indexOf(",") !== -1 && (commaPos = number_str.indexOf(","));
        for (var i = 0; i < commaPos; i++) {
            var reverse = commaPos - i;
            reverse % 3 === 0 && reverse > 0 && i > 0 && (ret += "."), ret += number_str[i];
        }
        return ret + number_str.substr(commaPos, number_str.length);
    };
}), angular.module("avUi").service("EndsWithService", function() {
    return function(originString, searchString) {
        if (!angular.isString(originString) || !angular.isString(searchString)) return !1;
        var lastIndex = originString.indexOf(searchString);
        return lastIndex !== -1 && lastIndex === originString.length - searchString.length;
    };
}), angular.module("avUi").service("StateDataService", [ "$state", function($state) {
    var data = {};
    return {
        go: function(path, stateData, newData) {
            data = angular.copy(newData), $state.go(path, stateData);
        },
        getData: function() {
            return data;
        }
    };
} ]), angular.module("avUi").directive("avScrollToBottom", [ "$timeout", function($timeout) {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            scope.$watch(function() {
                return element.children().length;
            }, function() {
                element.animate({
                    scrollTop: element.prop("scrollHeight")
                }, 300);
            });
        }
    };
} ]), angular.module("avUi").filter("addTargetBlank", function() {
    return function(x) {
        var tree = angular.element("<div>" + x + "</div>");
        return tree.find("a").attr("target", "_blank"), angular.element("<div>").append(tree).html();
    };
}), angular.module("avUi").filter("htmlToText", function() {
    return function(text) {
        return angular.element("<div>" + text + "</div>").text();
    };
}), angular.module("avUi").config([ "$provide", function($provide) {
    $provide.decorator("ngModelDirective", [ "$delegate", function($delegate) {
        var ngModel = $delegate[0], controller = ngModel.controller;
        return ngModel.controller = [ "$scope", "$element", "$attrs", "$injector", function(scope, element, attrs, $injector) {
            var $interpolate = $injector.get("$interpolate");
            attrs.$set("name", $interpolate(attrs.name || "")(scope)), $injector.invoke(controller, this, {
                $scope: scope,
                $element: element,
                $attrs: attrs
            });
        } ], $delegate;
    } ]), $provide.decorator("formDirective", [ "$delegate", function($delegate) {
        var form = $delegate[0], controller = form.controller;
        return form.controller = [ "$scope", "$element", "$attrs", "$injector", function(scope, element, attrs, $injector) {
            var $interpolate = $injector.get("$interpolate");
            attrs.$set("name", $interpolate(attrs.name || attrs.ngForm || "")(scope)), $injector.invoke(controller, this, {
                $scope: scope,
                $element: element,
                $attrs: attrs
            });
        } ], $delegate;
    } ]);
} ]), angular.module("avUi").controller("DocumentationUiController", [ "$state", "$stateParams", "$http", "$scope", "$i18next", "ConfigService", "InsideIframeService", "Authmethod", function($state, $stateParams, $http, $scope, $i18next, ConfigService, InsideIframeService, Authmethod) {
    $scope.inside_iframe = InsideIframeService(), $scope.documentation = ConfigService.documentation, 
    $scope.documentation.security_contact = ConfigService.legal.security_contact, $scope.documentation_html_include = ConfigService.documentation_html_include, 
    $scope.auths_url = "/election/" + $stateParams.id + "/public/authorities", $scope.legal_url = "/election/" + $stateParams.id + "/public/legal", 
    Authmethod.viewEvent($stateParams.id).success(function(data) {
        "ok" === data.status && ($scope.authEvent = data.events);
    });
} ]), angular.module("avUi").directive("documentationDirective", function() {
    return {
        restrict: "AE",
        templateUrl: "avUi/documentation-directive/documentation-directive.html",
        controller: "DocumentationUiController"
    };
}), angular.module("avUi").directive("avFoot", [ "ConfigService", function(ConfigService) {
    function link(scope, element, attrs) {
        scope.contact = ConfigService.contact, scope.social = ConfigService.social, scope.technology = ConfigService.technology, 
        scope.legal = ConfigService.legal;
    }
    return {
        restrict: "AE",
        scope: {},
        link: link,
        templateUrl: "avUi/foot-directive/foot-directive.html"
    };
} ]), angular.module("agora-gui-common", [ "ui.bootstrap", "ui.utils", "ui.router", "ngAnimate", "ngResource", "ngCookies", "ipCookie", "ngSanitize", "infinite-scroll", "angularMoment", "avConfig", "jm.i18next", "avRegistration", "avUi", "avTest", "angularFileUpload", "dndLists", "angularLoad", "angular-date-picker-polyfill", "ng-autofocus" ]), 
angular.module("jm.i18next").config([ "$i18nextProvider", "ConfigServiceProvider", function($i18nextProvider, ConfigServiceProvider) {
    $("#no-js").hide(), $i18nextProvider.options = _.extend({
        useCookie: !0,
        useLocalStorage: !1,
        fallbackLng: "en",
        cookieName: "lang",
        detectLngQS: "lang",
        lngWhitelist: [ "en", "es", "gl", "ca" ],
        resGetPath: "/locales/__lng__.json",
        defaultLoadingValue: ""
    }, ConfigServiceProvider.i18nextInitOptions);
} ]), angular.module("agora-gui-common").run([ "$http", "$rootScope", function($http, $rootScope) {
    $rootScope.safeApply = function(fn) {
        var phase = $rootScope.$$phase;
        "$apply" === phase || "$digest" === phase ? fn && "function" == typeof fn && fn() : this.$apply(fn);
    }, $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        console.log("change start from " + fromState.name + " to " + toState.name), $("#angular-preloading").show();
    }), $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        console.log("change success"), $("#angular-preloading").hide();
    });
} ]), angular.module("agora-gui-common").directive("ngEnter", function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            13 === event.which && (scope.$apply(function() {
                scope.$eval(attrs.ngEnter);
            }), event.preventDefault());
        });
    };
}), angular.module("agora-gui-common").filter("truncate", function() {
    return function(text, length, end) {
        return isNaN(length) && (length = 10), void 0 === end && (end = "..."), text.length <= length || text.length - end.length <= length ? text : String(text).substring(0, length - end.length) + end;
    };
}), angular.module("avTest", []), angular.module("avTest").controller("UnitTestE2EController", [ "$scope", "$location", "ConfigService", function($scope, $location, ConfigService) {
    ConfigService.debug && ($scope.html = $location.search().html, console.log($location.search()));
} ]), angular.module("agora-gui-common").run([ "$templateCache", function($templateCache) {
    "use strict";
    $templateCache.put("avRegistration/error.html", '<div av-simple-error><p ng-i18next="avRegistration.errorRegistration"></p></div>'), 
    $templateCache.put("avRegistration/field-directive/field-directive.html", '<div ng-switch="field.type"><div avr-email-field ng-switch-when="email"></div><div avr-password-field ng-switch-when="password"></div><div avr-code-field ng-switch-when="code"></div><div avr-text-field ng-switch-when="text"></div><div avr-dni-field ng-switch-when="dni"></div><div avr-tel-field ng-switch-when="tlf"></div><div avr-int-field ng-switch-when="int"></div><div avr-bool-field ng-switch-when="bool"></div><div avr-captcha-field ng-switch-when="captcha"></div><div avr-textarea-field ng-switch-when="textarea"></div><div avr-image-field ng-switch-when="image"></div></div>'), 
    $templateCache.put("avRegistration/fields/bool-field-directive/bool-field-directive.html", '<div class="form-group"><label class="control-label col-sm-4"><input type="checkbox" class="form-control" id="{{index}}Text" ng-model="field.value" ng-disabled="field.disabled" tabindex="{{index}}" ng-required="{{field.required}}"></label><div class="col-sm-8"><label class="text-left" for="{{index}}Text"><span ng-bind-html="field.name | addTargetBlank"></span></label><p class="help-block" ng-if="field.help" ng-bind-html="field.help | addTargetBlank"></p><div class="input-error"></div></div></div>'), 
    $templateCache.put("avRegistration/fields/captcha-field-directive/captcha-field-directive.html", '<div class="form-group"><div class="col-sm-8 col-sm-offset-4"><img ng-src="{{authMethod.captcha_image_url}}" style="width:161px;height:65px"></div><label for="{{index}}Text" class="control-label col-sm-4"><span>{{field.name}}</span></label><div class="col-sm-8"><input type="text" class="form-control" id="{{index}}Text" minlength="{{field.min}}" maxlength="{{field.max}}" ng-model="field.value" ng-disabled="field.disabled" tabindex="{{index}}" required><p class="help-block" ng-if="field.help">{{field.help}}</p><div class="input-error">{{authMethod.captcha_status}}</div></div></div>'), 
    $templateCache.put("avRegistration/fields/code-field-directive/code-field-directive.html", '<div class="form-group"><label for="input{{index}}" class="control-label col-sm-4" ng-i18next="avRegistration.codeLabel"></label><div class="col-sm-8"><input type="password" class="form-control" id="input{{index}}" ng-model="field.value" ng-disabled="field.disabled" tabindex="{{index}}" autocomplete="off" ng-class="{\'filled\': form[\'input\' + index].$viewValue.length > 0}" minlength="8" maxlength="8" ng-pattern="codePattern" name="input{{index}}" ng-i18next="[placeholder]avRegistration.codePlaceholder" required><p class="help-block" ng-i18next="avRegistration.codeHelp"></p><p class="help-block code-help"><span ng-if="showResendAuthCode() && !sendingData && !form[\'input\' + telIndex].$invalid"><b ng-i18next="avRegistration.noCodeReceivedQuestion"></b> <a ng-click="resendAuthCode(field)" ng-i18next="avRegistration.sendCodeAgain"></a> <span></span></span></p><div class="input-error"></div></div></div>'), 
    $templateCache.put("avRegistration/fields/dni-field-directive/dni-field-directive.html", '<ng-form name="fieldForm"><div class="form-group" ng-class="{\'has-error\': fieldForm.input.$dirty && fieldForm.input.$invalid}"><label for="input" class="control-label col-sm-4"><span>{{field.name}}</span></label><div class="col-sm-8"><input type="text" name="input" class="form-control" minlength="{{field.min}}" maxlength="{{field.max}}" ng-model="field.value" ng-model-options="{debounce: 500}" ng-disabled="field.disabled" tabindex="{{index}}" ui-validate="{dni: \'validateDni($value)\'}" ng-required="{{field.required}}"><p class="help-block" ng-i18next="avRegistration.dniHelp"></p><div class="input-error"><span class="error text-brand-danger" ng-show="fieldForm.input.$dirty && fieldForm.input.$invalid" ng-i18next="avRegistration.invalidDni"></span></div></div></div></ng-form>'), 
    $templateCache.put("avRegistration/fields/email-field-directive/email-field-directive.html", '<div class="form-group" ng-class="{true: \'has-error\',false: \'is-required\'}[form.emailText.$dirty && form.emailText.$invalid]"><label for="emailText" class="control-label col-sm-4" ng-i18next="avRegistration.emailLabel"></label><div class="col-sm-8"><input type="text" class="form-control" ng-model="field.value" name="emailText" id="emailText" ng-i18next="[placeholder]avRegistration.emailPlaceholder" tabindex="{{index}}" ng-pattern="patterns(\'email\')" required ng-disabled="field.disabled"><div class="input-error"><small class="error text-danger" ng-show="form.emailText.$dirty && form.emailText.$invalid" ng-i18next="avRegistration.emailError"></small></div></div></div>'), 
    $templateCache.put("avRegistration/fields/image-field-directive/image-field-directive.html", '<ng-form name="fieldForm"><div class="form-group" ng-class="{\'has-error\': fieldForm.input.$dirty && fieldForm.input.$invalid}"><label for="input" class="control-label col-sm-4"><span>{{field.name}}</span></label><div class="col-sm-8"><input type="file" name="image" id="image-field" class="form-control" ng-disabled="field.disabled" tabindex="{{index}}" ng-required="{{field.required}}"><p class="help-block" ng-i18next="avRegistration.imageHelp"></p><div class="input-error"><span class="error text-brand-danger" ng-show="fieldForm.input.$dirty && fieldForm.input.$invalid" ng-i18next="avRegistration.invalidImage"></span></div></div></div></ng-form>'), 
    $templateCache.put("avRegistration/fields/int-field-directive/int-field-directive.html", '<ng-form name="fieldForm"><div class="form-group" ng-class="{\'has-error\': fieldForm.input.$dirty && fieldForm.input.$invalid}"><label for="input" class="control-label col-sm-4"><span>{{field.name}}</span></label><div class="col-sm-8"><input type="number" class="form-control" name="input" min="{{field.min}}" max="{{field.max}}" ng-model="field.value" ng-model-options="{debounce: 500}" ng-disabled="field.disabled" ng-pattern="getRe()" tabindex="{{index}}" ng-required="{{field.required}}"><p class="help-block" ng-if="field.help">{{field.help}}</p><div class="input-error"><span class="error text-brand-danger" ng-show="fieldForm.input.$dirty && fieldForm.input.$invalid" ng-i18next="avRegistration.invalidDataRegEx"></span></div></div></div></ng-form>'), 
    $templateCache.put("avRegistration/fields/password-field-directive/password-field-directive.html", '<div class="form-group" ng-class="{true: \'has-error\',false: \'is-required\'}[form.passwordText.$dirty && form.passwordText.$invalid]"><label for="passwordText" class="control-label col-sm-4"><span ng-i18next="avRegistration.passwordLabel"></span></label><div class="col-sm-8"><input type="password" class="form-control" ng-model="field.value" id="passwordText" ng-disabled="field.disabled" ng-i18next="[placeholder]avRegistration.passwordPlaceholder" tabindex="{{index}}" required><p class="help-block"><a href="#" ng-i18next="avRegistration.forgotPassword" ng-click="forgotPassword()" tabindex="{{index+1}}"></a></p><div class="input-error"><small class="error text-danger" ng-show="form.$submitted && form.$invalid" ng-i18next="avRegistration.invalidCredentials"></small></div></div></div>'), 
    $templateCache.put("avRegistration/fields/tel-field-directive/tel-field-directive.html", '<div class="form-group"><label for="input{{index}}" class="control-label col-sm-4" ng-i18next="avRegistration.telLabel"></label><div class="col-sm-8"><input type="tel" class="form-control" id="input{{index}}" ng-model="field.value" ng-disabled="field.disabled" ng-pattern="tlfPattern" tabindex="{{index}}" name="input{{index}}" ng-i18next="[placeholder]avRegistration.telPlaceholder" required><p class="help-block" ng-i18next="avRegistration.telHelp"></p><div class="input-error"><span class="error" ng-show="form.input{{index}}.$error.pattern" ng-i18next="avRegistration.telInvalid"></span></div></div></div>'), 
    $templateCache.put("avRegistration/fields/text-field-directive/text-field-directive.html", '<ng-form name="fieldForm"><div class="form-group" ng-class="{\'has-error\': fieldForm.input.$dirty && fieldForm.input.$invalid}"><label for="input" class="control-label col-sm-4"><span>{{field.name}}</span></label><div class="col-sm-8"><input type="text" name="input" class="form-control" minlength="{{field.min}}" maxlength="{{field.max}}" ng-model="field.value" ng-model-options="{debounce: 500}" ng-disabled="field.disabled" tabindex="{{index}}" ng-pattern="getRe()" ng-required="{{field.required}}"><p class="help-block" ng-if="field.help">{{field.help}}</p><div class="input-error"><span class="error text-brand-danger" ng-show="fieldForm.input.$dirty && fieldForm.input.$invalid" ng-i18next="avRegistration.invalidDataRegEx"></span></div></div></div></ng-form>'), 
    $templateCache.put("avRegistration/fields/textarea-field-directive/textarea-field-directive.html", '<div class="form-group"><div class="col-sm-offset-2 col-sm-10"><textarea id="{{index}}Text" rows="5" cols="60" tabindex="{{index}}" readonly>{{field.name}}</textarea><p class="help-block" ng-if="field.help">{{field.help}}</p></div></div>'), 
    $templateCache.put("avRegistration/loading.html", '<div avb-busy><p ng-i18next="avRegistration.loadingRegistration"></p></div>'), 
    $templateCache.put("avRegistration/login-controller/login-controller.html", '<div class="col-xs-12 top-section"><div class="pad"><div av-login event-id="{{event_id}}" code="{{code}}" email="{{email}}"></div></div></div>'), 
    $templateCache.put("avRegistration/login-directive/login-directive.html", '<div class="container-fluid"><div class="row"><div class="col-sm-12 loginheader"><h2 class="tex-center" ng-i18next="[i18next]({name: orgName})avRegistration.loginHeader"></h2></div><div class="col-sm-6"><form name="form" id="loginForm" role="form" class="form-horizontal"><div ng-repeat="field in login_fields" avr-field index="{{$index+1}}"></div><div class="col-sm-offset-4 col-sm-8 button-group"><div class="input-error"><div class="error text-danger" ng-if="error">{{ error }}</div></div><div class="input-warn"><span class="text-warning" ng-if="!form.$valid || sendingData" ng-i18next>avRegistration.fillValidFormText</span></div><button type="submit" class="btn btn-block btn-success" ng-i18next="avRegistration.loginButton" ng-click="loginUser(form.$valid)" tabindex="{{login_fields.length+1}}" ng-disabled="!form.$valid || sendingData"></button></div></form></div><div class="col-sm-5 col-sm-offset-1 hidden-xs" ng-if="registrationAllowed"><h3 class="help-h3" ng-i18next="avRegistration.notRegisteredYet"></h3><p><a ng-if="!isAdmin" href="#/election/{{election.id}}/public/register" ng-i18next="avRegistration.registerHere" ng-click="goSignup()" tabindex="{{login_fields.length+2}}"></a><br><a ng-if="isAdmin" ui-sref="admin.signup()" ng-i18next="avRegistration.registerHere" tabindex="{{login_fields.length+2}}"></a><br><span ng-i18next="avRegistration.fewMinutes"></span></p></div></div></div>'), 
    $templateCache.put("avRegistration/register-controller/register-controller.html", '<div class="col-xs-12 top-section"><div class="pad"><div av-register event-id="{{event_id}}" code="{{code}}" email="{{email}}"></div></div></div>'), 
    $templateCache.put("avRegistration/register-directive/register-directive.html", '<div class="container"><div class="row"><div class="col-sm-12"><h2 ng-if="!admin" class="registerheader" ng-i18next="avRegistration.registerHeader"></h2><h2 ng-if="admin" class="registerheader" ng-i18next="avRegistration.registerAdminHeader"></h2></div></div><div class="row"><div class="col-sm-6"><div ng-if="method == \'dnie\'"><a type="submit" class="btn btn-block btn-success" ng-i18next="avRegistration.registerButton" ng-href="{{ dnieurl }}/"></a></div><form ng-if="method != \'dnie\'" name="form" id="registerForm" role="form" class="form-horizontal"><div ng-repeat="field in register_fields" avr-field index="{{$index+1}}"></div><div class="col-sm-offset-4 col-sm-8 button-group"><div class="input-error"><div class="error text-danger" ng-if="error" ng-bind-html="error"></div></div><div class="input-warn"><span class="text-warning" ng-if="!form.$valid || sendingData" ng-i18next>avRegistration.fillValidFormText</span></div><button type="submit" class="btn btn-block btn-success" ng-i18next="avRegistration.registerButton" ng-click="signUp(form.$valid)" tabindex="{{register_fields.length+1}}" ng-disabled="!form.$valid || sendingData"></button></div></form></div><div class="col-sm-5 col-sm-offset-1 help-sidebar hidden-xs"><span><h3 class="help-h3" ng-i18next="avRegistration.registerAdminFormHelpTitle"></h3><p ng-i18next>avRegistration.helpAdminRegisterForm</p></span> <span><p ng-if="!admin" ng-i18next>avRegistration.helpRegisterForm</p><h3 class="help-h3" ng-i18next="avRegistration.alreadyRegistered"></h3><p ng-i18next>[html]avRegistration.helpAlreadyRegisteredForm</p><a href="" ng-click="goLogin($event)" ng-i18next="avRegistration.loginHere"></a><br></span></div></div></div>'), 
    $templateCache.put("avRegistration/success.html", '<div av-success><p ng-i18next="avRegistration.successRegistration"></p></div>'), 
    $templateCache.put("avUi/change-lang-directive/change-lang-directive.html", '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{{ deflang }} <span class="caret"></span></a><ul class="dropdown-menu" role="menu"><li ng-repeat="lang in langs"><a ng-click="changeLang(lang)">{{lang}}</a></li></ul>'), 
    $templateCache.put("avUi/documentation-directive/documentation-directive.html", '<div><h2 class="text-center text-av-secondary" ng-i18next="avDocumentation.documentation.title"></h2><p ng-i18next="avDocumentation.documentation.first_line"></p><ul><li><a href="{{documentation.faq}}" target="_blank" ng-i18next="avDocumentation.documentation.faq"></a></li><li><a href="{{documentation.overview}}" target="_blank" ng-i18next="avDocumentation.documentation.overview"></a></li><li><a href="{{auths_url}}" target="_blank" ng-i18next="avDocumentation.documentation.authorities"></a></li><li><a href="{{documentation.technical}}" target="_blank" ng-i18next="avDocumentation.documentation.technical"></a></li><li><a href="{{documentation.security_contact}}" target="_blank" ng-i18next="avDocumentation.documentation.security_contact"></a></li><li><a href="{{legal_url}}" target="_blank" ng-i18next="avDocumentation.legal.title"></a></li></ul><div class="documentation-html-include" ng-bind-html="documentation_html_include | addTargetBlank"></div></div>'), 
    $templateCache.put("avUi/foot-directive/foot-directive.html", '<div class="commonfoot"><div class="container"><div class="row"><div class="col-md-2 col-md-offset-1"><h3 ng-i18next="avCommon.foot.contact"></h3><ul><li><a href="mailto:{{contact.email}}" ng-i18next="avCommon.foot.contactsupport"></a></li><li><a href="mailto:{{contact.sales}}" ng-i18next="avCommon.foot.contactsales"></a></li></ul><!-- social links --><div class="social"><a href="{{social.facebook}}"><i class="fa fa-fw fa-lg fa-facebook"></i></a> <a href="{{social.twitter}}"><i class="fa fa-fw fa-lg fa-twitter"></i></a> <a href="{{social.googleplus}}"><i class="fa fa-fw fa-lg fa-google-plus"></i></a> <a href="{{social.youtube}}"><i class="fa fa-fw fa-lg fa-youtube-play"></i></a> <a href="{{social.github}}"><i class="fa fa-fw fa-lg fa-github"></i></a></div></div><div class="col-md-2"><h3 ng-i18next="avCommon.foot.technology"></h3><ul><li><a href="{{technology.aboutus}}" ng-i18next="avCommon.foot.aboutus"></a></li><li><a href="{{technology.pricing}}" ng-i18next="avCommon.foot.pricing"></a></li><li><a href="{{technology.overview}}" ng-i18next="avCommon.foot.technology"></a></li><li><a href="{{technology.solutions}}" ng-i18next="avCommon.foot.solutions"></a></li><li><a href="{{technology.admin_manual}}" ng-i18next="avCommon.foot.adminManual"></a></li></ul></div><div class="col-md-2"><h3 ng-i18next="avCommon.foot.legal"></h3><ul><li><a href="{{legal.terms_of_service}}" ng-i18next="avCommon.foot.tos"></a></li><li><a href="{{legal.cookies}}" ng-i18next="avCommon.foot.cookies"></a></li><li><a href="{{legal.privacy}}" ng-i18next="avCommon.foot.privacy"></a></li><li><a href="{{legal.security_contact}}" ng-i18next="avCommon.foot.securitycontact"></a></li><li><a target="_blank" href="{{legal.community_website}}" ng-i18next="avCommon.foot.communitywebsite"></a></li></ul></div></div></div></div>'), 
    $templateCache.put("avUi/simple-error-directive/simple-error-directive.html", '<div class="av-simple-error-title" ng-transclude></div>'), 
    $templateCache.put("test/test_booth_widget.html", '<!DOCTYPE html><html><head><title>Test frame</title><meta charset="UTF-8"></head><script>function getCastHmac(auth_data, callback) {\n      callback("khmac:///sha-256;5e25a9af28a33d94b8c2c0edbc83d6d87355e45b93021c35a103821557ec7dc5/voter-1110-1dee0c135afeae29e208550e7258dab7b64fb008bc606fc326d41946ab8e773f:1415185712");\n    }</script><body style="overflow-y: hidden; overflow-x: hidden; padding: 0; margin: 0"><div style="width: 100%; display: block; position: absolute; top: 0; bottom: 0; scroll: none; padding: 0; margin: 0"><a class="agoravoting-voting-booth" href="http://agora.dev/#/election/1110/vote" data-authorization-funcname="getCastHmac">Votar con Agora Voting</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="http://agora.dev/avWidgets.min.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","agoravoting-widgets-js");</script></div></body></html>'), 
    $templateCache.put("test/unit_test_e2e.html", '<div dynamic="html" id="dynamic-result"></div>');
} ]);