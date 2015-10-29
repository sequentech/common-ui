angular.module("avUi", []), jQuery.fn.flash = function(duration) {
    var selector = this;
    angular.isNumber(duration) || (duration = 300), "true" !== selector.attr("is-flashing") && (selector.attr("is-flashing", "true"), 
    selector.addClass("flashing").delay(duration).queue(function() {
        selector.removeClass("flashing").addClass("flashing-out").dequeue();
    }).delay(duration).queue(function() {
        selector.removeClass("flashing flashing-out").dequeue(), selector.attr("is-flashing", "false");
    }));
}, angular.module("avUi").directive("avSimpleError", [ "$resource", "$templateCache", "$window", function($resource, $templateCache, $window) {
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
        templateUrl: $templateCache.get("avUi/simple-error-directive/simple-error-directive.html")
    };
} ]), angular.module("avUi").directive("avChangeLang", [ "$i18next", "$templateCache", "ipCookie", "angularLoad", "amMoment", "ConfigService", function($i18next, $templateCache, ipCookie, angularLoad, amMoment, ConfigService) {
    function link(scope, element, attrs) {
        scope.deflang = window.i18n.lng(), scope.langs = $i18next.options.lngWhitelist, 
        scope.changeLang = function(lang) {
            $i18next.options.lng = lang, console.log("setting cookie"), ipCookie("lang", lang, _.extend({
                expires: 360
            }, ConfigService.i18nextCookieOptions)), scope.deflang = lang, angularLoad.loadScript("/locales/moment/" + lang + ".js").then(function() {
                amMoment.changeLocale(lang);
            });
        };
    }
    return {
        restrict: "AE",
        scope: {},
        link: link,
        templateUrl: $templateCache.get("avUi/change-lang-directive/change-lang-directive.html")
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
        if (-1 === maxHeight.indexOf("px")) return void console.log("invalid non-pixels max-height for " + instance.maxHeightSelector);
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
        return (void 0 === over || null === over) && (over = question.answer_total_votes_percentage), 
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
            }, item.postfix); else if ("lambda" === item.check) item.validator(d.data[item.key]) || error(item.check, {
                key: item.key
            }, item.postfix); else if ("is-string" === item.check) pass = angular.isString(d.data[item.key], item.postfix), 
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
                    var errorData = {
                        key: item.key,
                        max: itemMax,
                        num: d.data[item.key].length
                    };
                    error("array-length-max", errorData, item.postfix);
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
            return pass || "chain" !== d.data.groupType ? !0 : !1;
        });
        return ret;
    }
    return checker;
}), angular.module("avUi").service("AddDotsToIntService", function() {
    return function(number, fixedDigits) {
        angular.isNumber(fixedDigits) && fixedDigits >= 0 && (number = number.toFixed(parseInt(fixedDigits)));
        var number_str = (number + "").replace(".", ","), ret = "", commaPos = number_str.length;
        -1 !== number_str.indexOf(",") && (commaPos = number_str.indexOf(","));
        for (var i = 0; commaPos > i; i++) {
            var reverse = commaPos - i;
            reverse % 3 === 0 && reverse > 0 && i > 0 && (ret += "."), ret += number_str[i];
        }
        return ret + number_str.substr(commaPos, number_str.length);
    };
}), angular.module("avUi").service("EndsWithService", function() {
    return function(originString, searchString) {
        if (!angular.isString(originString) || !angular.isString(searchString)) return !1;
        var lastIndex = originString.indexOf(searchString);
        return -1 !== lastIndex && lastIndex === originString.length - searchString.length;
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
} ]), angular.module("avUi").directive("learnMore", function() {
    function link(scope, el, attrs) {
        $(el).attr("href", "https://bit.ly/avguiadeuso");
    }
    return {
        restrict: "EAC",
        link: link
    };
}), angular.module("agora-core-view", [ "ui.bootstrap", "ui.utils", "ui.router", "ngAnimate", "ngResource", "ngCookies", "ipCookie", "ngSanitize", "infinite-scroll", "angularMoment", "avConfig", "jm.i18next", "avUi", "avTest", "angularFileUpload", "dndLists", "angularLoad", "angular-date-picker-polyfill", "ng-autofocus" ]), 
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
} ]), angular.module("agora-core-view").run([ "$http", "$rootScope", function($http, $rootScope) {
    $rootScope.safeApply = function(fn) {
        var phase = $rootScope.$$phase;
        "$apply" === phase || "$digest" === phase ? fn && "function" == typeof fn && fn() : this.$apply(fn);
    }, $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        console.log("change start from " + fromState.name + " to " + toState.name), $("#angular-preloading").show();
    }), $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
        console.log("change success"), $("#angular-preloading").hide();
    });
} ]), angular.module("agora-core-view").directive("ngEnter", function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            13 === event.which && (scope.$apply(function() {
                scope.$eval(attrs.ngEnter);
            }), event.preventDefault());
        });
    };
}), angular.module("agora-core-view").filter("truncate", function() {
    return function(text, length, end) {
        return isNaN(length) && (length = 10), void 0 === end && (end = "..."), text.length <= length || text.length - end.length <= length ? text : String(text).substring(0, length - end.length) + end;
    };
}), angular.module("avTest", []), angular.module("avTest").controller("UnitTestE2EController", [ "$scope", "$location", "ConfigService", function($scope, $location, ConfigService) {
    ConfigService.debug && ($scope.html = $location.search().html, console.log($location.search()));
} ]), angular.module("agora-core-view").run([ "$templateCache", function($templateCache) {
    "use strict";
    $templateCache.put("avUi/change-lang-directive/change-lang-directive.html", '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{{ deflang }} <span class="caret"></span></a><ul class="dropdown-menu" role="menu"><li ng-repeat="lang in langs"><a ng-click="changeLang(lang)">{{lang}}</a></li></ul>'), 
    $templateCache.put("avUi/simple-error-directive/simple-error-directive.html", '<div class="av-simple-error-title" ng-transclude></div>'), 
    $templateCache.put("test/test_booth_widget.html", '<!DOCTYPE html><html><head><title>Test frame</title><meta charset="UTF-8"></head><script>function getCastHmac(auth_data, callback) {\n      callback("khmac:///sha-256;5e25a9af28a33d94b8c2c0edbc83d6d87355e45b93021c35a103821557ec7dc5/voter-1110-1dee0c135afeae29e208550e7258dab7b64fb008bc606fc326d41946ab8e773f:1415185712");\n    }</script><body style="overflow-y: hidden; overflow-x: hidden; padding: 0; margin: 0"><div style="width: 100%; display: block; position: absolute; top: 0; bottom: 0; scroll: none; padding: 0; margin: 0"><a class="agoravoting-voting-booth" href="http://agora.dev/#/election/1110/vote" data-authorization-funcname="getCastHmac">Votar con Agora Voting</a><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="http://agora.dev/avWidgets.min.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","agoravoting-widgets-js");</script></div></body></html>'), 
    $templateCache.put("test/unit_test_e2e.html", '<div dynamic="html" id="dynamic-result"></div>');
} ]);