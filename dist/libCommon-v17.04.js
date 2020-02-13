function q(a) {
    throw a;
}

(function() {
    angular.module("angular-date-picker-polyfill", []);
}).call(this), function() {
    angular.module("angular-date-picker-polyfill").directive("aaCalendar", [ "aaMonthUtil", "aaDateUtil", "$filter", function(aaMonthUtil, aaDateUtil, $filter) {
        return {
            restrict: "A",
            replace: !0,
            require: "ngModel",
            scope: {},
            link: function(scope, elem, attrs, ngModelCtrl) {
                var pullMonthDateFromModel, refreshView;
                return scope.dayAbbreviations = [ "Su", "M", "T", "W", "R", "F", "S" ], scope.monthArray = [ [] ], 
                scope.monthDate = null, scope.selected = null, ngModelCtrl.$render = function() {
                    return scope.selected = ngModelCtrl.$viewValue, pullMonthDateFromModel(), refreshView();
                }, pullMonthDateFromModel = function() {
                    var d;
                    return (d = angular.isDate(ngModelCtrl.$viewValue) ? angular.copy(ngModelCtrl.$viewValue) : new Date()).setDate(1), 
                    scope.monthDate = d;
                }, refreshView = function() {
                    return scope.monthArray = aaMonthUtil.generateMonthArray(scope.monthDate.getFullYear(), scope.monthDate.getMonth(), ngModelCtrl.$viewValue);
                }, scope.setDate = function(d) {
                    var c;
                    return (c = angular.isDate(ngModelCtrl.$viewValue) ? angular.copy(ngModelCtrl.$viewValue) : aaDateUtil.todayStart()).setYear(d.getFullYear()), 
                    c.setMonth(d.getMonth()), c.setDate(d.getDate()), ngModelCtrl.$setViewValue(c), 
                    aaDateUtil.dateObjectsAreEqualToMonth(d, scope.monthDate) || pullMonthDateFromModel(), 
                    refreshView(), scope.$emit("aa:calendar:set-date");
                }, scope.setToToday = function() {
                    return scope.setDate(aaDateUtil.todayStart());
                }, scope.incrementMonths = function(num) {
                    return scope.monthDate.setMonth(scope.monthDate.getMonth() + num), refreshView();
                };
            },
            template: "<div class='aa-cal'>\n  <div class='aa-cal-controls'>\n    <span ng-click='incrementMonths(-12)' class='aa-cal-btn aa-cal-prev-year'></span>\n    <span ng-click='incrementMonths(-1)' class='aa-cal-btn aa-cal-prev-month'></span>\n    <span ng-click='setToToday()' class='aa-cal-btn aa-cal-set-to-today'></span>\n    <strong class='aa-cal-month-name' ng-bind=\"monthDate | date:'MMMM yyyy'\"></strong>\n    <span ng-click='incrementMonths(12)' class='aa-cal-btn aa-cal-next-year'></span>\n    <span ng-click='incrementMonths(1)' class='aa-cal-btn aa-cal-next-month'></span>\n  </div>\n  <table class='aa-cal-month'>\n    <thead>\n      <tr><th ng-repeat='abbr in dayAbbreviations track by $index' ng-bind='abbr'></th></tr>\n    </thead>\n    <tbody>\n      <tr ng-repeat='week in monthArray'>\n        <td\n          ng-repeat='day in week'\n          ng-class=\"{'aa-cal-today': day.isToday, 'aa-cal-other-month': day.isOtherMonth, 'aa-cal-selected': day.isSelected, 'aa-cal-disabled': day.isDisabled}\"\n          ng-click='setDate(day.date)'>\n            <span ng-bind=\"day.date | date:'d'\"></span>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n</div>"
        };
    } ]);
}.call(this), function() {
    angular.module("angular-date-picker-polyfill").factory("aaDateUtil", function() {
        return {
            dateObjectsAreEqualToDay: function(d1, d2) {
                return !(!angular.isDate(d1) || !angular.isDate(d2)) && (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate());
            },
            dateObjectsAreEqualToMonth: function(d1, d2) {
                return !(!angular.isDate(d1) || !angular.isDate(d2)) && (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth());
            },
            convertToDate: function(val) {
                var d;
                return angular.isDate(val) ? val : (d = Date.parse(val), angular.isDate(d) ? d : null);
            },
            todayStart: function() {
                var d;
                return (d = new Date()).setHours(0), d.setMinutes(0), d.setSeconds(0), d.setMilliseconds(0), 
                d;
            }
        };
    });
}.call(this), function() {
    var linker;
    linker = function(scope, elem, attrs, ngModelCtrl, $compile, aaDateUtil, includeTimepicker) {
        var compileTemplate, init, setupNonInputEvents, setupNonInputValidatorAndFormatter, setupPopupTogglingEvents, setupViewActionMethods;
        return null == includeTimepicker && (includeTimepicker = !1), init = function() {
            if (compileTemplate(), setupViewActionMethods(), setupPopupTogglingEvents(), "INPUT" !== elem.prop("tagName") || "date" !== attrs.type && "datetime-local" !== attrs.type) return setupNonInputEvents(), 
            setupNonInputValidatorAndFormatter();
        }, setupNonInputValidatorAndFormatter = function() {
            ngModelCtrl.$formatters.unshift(aaDateUtil.convertToDate);
        }, compileTemplate = function() {
            var $popup, popupDiv, tmpl;
            return elem.wrap("<div class='aa-date-input'></div>"), tmpl = "<div class='aa-datepicker-popup' data-ng-show='isOpen'>\n  <div class='aa-datepicker-popup-close' data-ng-click='closePopup()'></div>\n  <div data-aa-calendar ng-model='ngModel'></div>", 
            includeTimepicker && (tmpl += "<div data-aa-timepicker use-am-pm='" + (null == attrs.useAmPm || (!0 === attrs.useAmPm || "true" === attrs.useAmPm)) + "' ng-model='ngModel'></div>"), 
            tmpl += "</div>", popupDiv = angular.element(tmpl), $popup = $compile(popupDiv)(scope), 
            elem.after($popup);
        }, setupPopupTogglingEvents = function() {
            var $wrapper, onDocumentClick, wrapperClicked;
            return scope.$on("aa:calendar:set-date", function() {
                if (!includeTimepicker) return scope.closePopup();
            }), wrapperClicked = !1, elem.on("focus", function(e) {
                if (!scope.isOpen) return scope.$apply(function() {
                    return scope.openPopup();
                });
            }), ($wrapper = elem.parent()).on("mousedown", function(e) {
                return wrapperClicked = !0, setTimeout(function() {
                    return wrapperClicked = !1;
                }, 100);
            }), elem.on("blur", function(e) {
                if (scope.isOpen && !wrapperClicked) return scope.$apply(function() {
                    return scope.closePopup();
                });
            }), onDocumentClick = function(e) {
                if (scope.isOpen && !wrapperClicked) return scope.$apply(function() {
                    return scope.closePopup();
                });
            }, angular.element(window.document).on("mousedown", onDocumentClick), scope.$on("$destroy", function() {
                return elem.off("focus"), elem.off("blur"), $wrapper.off("mousedown"), angular.element(window.document).off("mousedown", onDocumentClick);
            });
        }, setupNonInputEvents = function() {
            return elem.on("click", function(e) {
                if (!scope.isOpen) return scope.$apply(function() {
                    return scope.openPopup();
                });
            }), scope.$on("$destroy", function() {
                return elem.off("click");
            });
        }, setupViewActionMethods = function() {
            return scope.openPopup = function() {
                return scope.isOpen = !0;
            }, scope.closePopup = function() {
                return scope.isOpen = !1;
            };
        }, init();
    }, angular.module("angular-date-picker-polyfill").directive("aaDateInput", [ "$compile", "aaDateUtil", function($compile, ngModel, aaDateUtil) {
        return {
            restrict: "A",
            require: "ngModel",
            scope: {
                ngModel: "="
            },
            link: function(scope, elem, attrs, ngModelCtrl) {
                return linker(scope, elem, attrs, ngModelCtrl, $compile, aaDateUtil, !1);
            }
        };
    } ]), angular.module("angular-date-picker-polyfill").directive("aaDateTimeInput", [ "$compile", "aaDateUtil", function($compile, aaDateUtil) {
        return {
            restrict: "A",
            require: "ngModel",
            scope: {
                ngModel: "="
            },
            link: function(scope, elem, attrs, ngModelCtrl) {
                return linker(scope, elem, attrs, ngModelCtrl, $compile, aaDateUtil, !0);
            }
        };
    } ]), angular.module("angular-date-picker-polyfill").directive("input", [ "$compile", "aaDateUtil", function($compile, aaDateUtil) {
        return {
            restrict: "E",
            require: "?ngModel",
            scope: {
                ngModel: "="
            },
            compile: function(elem, attrs) {
                if (null != attrs.ngModel && ("date" === attrs.type || "datetime-local" === attrs.type)) return function(scope, elem, attrs, ngModelCtrl) {
                    return linker(scope, elem, attrs, ngModelCtrl, $compile, aaDateUtil, "datetime-local" === attrs.type);
                };
            }
        };
    } ]);
}.call(this), function() {
    angular.module("angular-date-picker-polyfill").factory("aaMonthUtil", [ "aaDateUtil", function(aaDateUtil) {
        return {
            numberOfDaysInMonth: function(year, month) {
                return [ 31, year % 4 == 0 && year % 100 != 0 || year % 400 == 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ][month];
            },
            generateMonthArray: function(year, month, selected) {
                var arr, d, endDate, obj, offset, today, weekNum, _i;
                for (null == selected && (selected = null), d = new Date(year, month, 1), today = new Date(), 
                endDate = new Date(year, month, this.numberOfDaysInMonth(year, month)), offset = d.getDay(), 
                d.setDate(d.getDate() + -1 * offset), arr = [], weekNum = 0; d <= endDate; ) {
                    for (arr.push([]), _i = 0; _i <= 6; ++_i) obj = {
                        date: angular.copy(d),
                        isToday: aaDateUtil.dateObjectsAreEqualToDay(d, today),
                        isSelected: !(!selected || !aaDateUtil.dateObjectsAreEqualToDay(d, selected)),
                        isOtherMonth: d.getMonth() !== month
                    }, arr[weekNum].push(obj), d.setDate(d.getDate() + 1);
                    weekNum += 1;
                }
                return arr;
            }
        };
    } ]);
}.call(this), function() {
    angular.module("angular-date-picker-polyfill").factory("aaTimeUtil", function() {
        return {
            getMinuteAndHourFromDate: function(d, useAmPmHours) {
                var amPm, h;
                if (null == useAmPmHours && (useAmPmHours = !0), !angular.isDate(d)) return null;
                if (h = d.getHours(), amPm = null, useAmPmHours) switch (!1) {
                  case 0 !== h:
                    h = 12, amPm = "AM";
                    break;

                  case 12 !== h:
                    amPm = "PM";
                    break;

                  case h <= 12:
                    h -= 12, amPm = "PM";
                }
                return [ h, d.getMinutes(), amPm ];
            },
            applyTimeValuesToDateObject: function(timeValues, d) {
                var hour = timeValues[0], minute = timeValues[1], amPm = timeValues[2];
                return d.setMinutes(minute), "AM" === amPm ? d.setHours(12 === hour ? 0 : hour) : "PM" === amPm && 12 === hour ? d.setHours(12) : "PM" === amPm && 12 !== hour ? d.setHours(hour + 12) : d.setHours(hour), 
                d;
            }
        };
    });
}.call(this), function() {
    angular.module("angular-date-picker-polyfill").directive("aaTimepicker", [ "aaTimeUtil", "aaDateUtil", function(aaTimeUtil, aaDateUtil) {
        return {
            restrict: "A",
            replace: !0,
            require: "ngModel",
            scope: {},
            link: function(scope, elem, attrs, ngModelCtrl) {
                var init, pullTimeFromModel, resetToNull, setupSelectOptions;
                return init = function() {
                    return setupSelectOptions(), resetToNull();
                }, setupSelectOptions = function() {
                    var _i, _j, _results, _results1;
                    return scope.useAmPm = null == attrs.useAmPm || (!0 === attrs.useAmPm || "true" === attrs.useAmPm), 
                    scope.hourOptions = scope.useAmPm ? [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] : function() {
                        for (_results = [], _i = 0; _i <= 23; _i++) _results.push(_i);
                        return _results;
                    }.apply(this), scope.minuteOptions = function() {
                        for (_results1 = [], _j = 0; _j <= 59; _j++) _results1.push(_j);
                        return _results1;
                    }.apply(this), scope.amPmOptions = [ "AM", "PM" ];
                }, resetToNull = function() {
                    return scope.hour = null, scope.minute = null, scope.amPm = null;
                }, ngModelCtrl.$render = function() {
                    return pullTimeFromModel();
                }, pullTimeFromModel = function() {
                    var d, _ref;
                    return angular.isDate(ngModelCtrl.$viewValue) ? (d = angular.copy(ngModelCtrl.$viewValue), 
                    _ref = aaTimeUtil.getMinuteAndHourFromDate(d, scope.useAmPm), scope.hour = _ref[0], 
                    scope.minute = _ref[1], scope.amPm = _ref[2], _ref) : resetToNull();
                }, scope.setTimeFromFields = function() {
                    var d;
                    if (null != scope.hour && null == scope.minute && (scope.minute = 0), null != scope.hour && scope.useAmPm && null == scope.amPm && (scope.amPm = "AM"), 
                    !(null == scope.hour || null == scope.minute || scope.useAmPm && null == scope.amPm)) return d = null != ngModelCtrl.$viewValue && angular.isDate(ngModelCtrl.$viewValue) ? new Date(ngModelCtrl.$viewValue) : aaDateUtil.todayStart(), 
                    aaTimeUtil.applyTimeValuesToDateObject([ scope.hour, parseInt(scope.minute), scope.amPm ], d), 
                    ngModelCtrl.$setViewValue(d);
                }, init();
            },
            template: "<div class='aa-timepicker'>\n  <select\n    tabindex='-1'\n    class='aa-timepicker-hour'\n    ng-model='hour'\n    ng-options='hour as hour for hour in hourOptions'\n    ng-change='setTimeFromFields()'>\n  </select>\n  <select\n    tabindex='-1'\n    class='aa-timepicker-minute'\n    ng-model='minute'\n    ng-options=\"min as ((min < 10) ? ('0' + min) : ('' + min)) for min in minuteOptions\"\n    ng-change='setTimeFromFields()'>\n  </select>\n  <select\n    tabindex='-1'\n    class='aa-timepicker-ampm'\n    ng-show='useAmPm'\n    ng-model='amPm'\n    ng-options='v for v in amPmOptions'\n    ng-change='setTimeFromFields()'>\n  </select>\n</div>"
        };
    } ]);
}.call(this), function($, window, document) {
    "use strict";
    var BROWSER_IS_IE7, BROWSER_SCROLLBAR_WIDTH, DOMSCROLL, NanoScroll, SCROLL, UP, cAF, defaults, getBrowserScrollbarWidth, hasTransform, isFFWithBuggyScrollbar, rAF, transform, _elementStyle, _vendor;
    defaults = {
        paneClass: "nano-pane",
        sliderClass: "nano-slider",
        contentClass: "nano-content",
        iOSNativeScrolling: !1,
        preventPageScrolling: !1,
        disableResize: !1,
        alwaysVisible: !1,
        flashDelay: 1500,
        sliderMinHeight: 20,
        sliderMaxHeight: null,
        documentContext: null,
        windowContext: null
    }, SCROLL = "scroll", UP = "up", DOMSCROLL = "DOMMouseScroll", BROWSER_IS_IE7 = "Microsoft Internet Explorer" === window.navigator.appName && /msie 7./i.test(window.navigator.appVersion) && window.ActiveXObject, 
    BROWSER_SCROLLBAR_WIDTH = null, rAF = window.requestAnimationFrame, cAF = window.cancelAnimationFrame, 
    _elementStyle = document.createElement("div").style, _vendor = function() {
        var i, vendors, _i, _len;
        for (i = _i = 0, _len = (vendors = [ "t", "webkitT", "MozT", "msT", "OT" ]).length; _i < _len; i = ++_i) if (vendors[i], 
        vendors[i] + "ransform" in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
        return !1;
    }(), transform = function(style) {
        return !1 !== _vendor && ("" === _vendor ? style : _vendor + style.charAt(0).toUpperCase() + style.substr(1));
    }("transform"), hasTransform = !1 !== transform, getBrowserScrollbarWidth = function() {
        var outer, outerStyle, scrollbarWidth;
        return (outerStyle = (outer = document.createElement("div")).style).position = "absolute", 
        outerStyle.width = "100px", outerStyle.height = "100px", outerStyle.overflow = SCROLL, 
        outerStyle.top = "-9999px", document.body.appendChild(outer), scrollbarWidth = outer.offsetWidth - outer.clientWidth, 
        document.body.removeChild(outer), scrollbarWidth;
    }, isFFWithBuggyScrollbar = function() {
        var isOSXFF, ua, version;
        return ua = window.navigator.userAgent, !!(isOSXFF = /(?=.+Mac OS X)(?=.+Firefox)/.test(ua)) && (version = (version = /Firefox\/\d{2}\./.exec(ua)) && version[0].replace(/\D+/g, ""), 
        isOSXFF && 23 < +version);
    }, NanoScroll = function() {
        function NanoScroll(el, options) {
            this.el = el, this.options = options, BROWSER_SCROLLBAR_WIDTH = BROWSER_SCROLLBAR_WIDTH || getBrowserScrollbarWidth(), 
            this.$el = $(this.el), this.doc = $(this.options.documentContext || document), this.win = $(this.options.windowContext || window), 
            this.body = this.doc.find("body"), this.$content = this.$el.children("." + options.contentClass), 
            this.$content.attr("tabindex", this.options.tabIndex || 0), this.content = this.$content[0], 
            this.previousPosition = 0, this.options.iOSNativeScrolling && (null != this.el.style.WebkitOverflowScrolling || navigator.userAgent.match(/mobi.+Gecko/i)) ? this.nativeScrolling() : this.generate(), 
            this.createEvents(), this.addEvents(), this.reset();
        }
        return NanoScroll.prototype.preventScrolling = function(e, direction) {
            if (this.isActive) if (e.type === DOMSCROLL) ("down" === direction && 0 < e.originalEvent.detail || direction === UP && e.originalEvent.detail < 0) && e.preventDefault(); else if ("mousewheel" === e.type) {
                if (!e.originalEvent || !e.originalEvent.wheelDelta) return;
                ("down" === direction && e.originalEvent.wheelDelta < 0 || direction === UP && 0 < e.originalEvent.wheelDelta) && e.preventDefault();
            }
        }, NanoScroll.prototype.nativeScrolling = function() {
            this.$content.css({
                WebkitOverflowScrolling: "touch"
            }), this.iOSNativeScrolling = !0, this.isActive = !0;
        }, NanoScroll.prototype.updateScrollValues = function() {
            var content, direction;
            content = this.content, this.maxScrollTop = content.scrollHeight - content.clientHeight, 
            this.prevScrollTop = this.contentScrollTop || 0, this.contentScrollTop = content.scrollTop, 
            direction = this.contentScrollTop > this.previousPosition ? "down" : this.contentScrollTop < this.previousPosition ? "up" : "same", 
            this.previousPosition = this.contentScrollTop, "same" != direction && this.$el.trigger("update", {
                position: this.contentScrollTop,
                maximum: this.maxScrollTop,
                direction: direction
            }), this.iOSNativeScrolling || (this.maxSliderTop = this.paneHeight - this.sliderHeight, 
            this.sliderTop = 0 === this.maxScrollTop ? 0 : this.contentScrollTop * this.maxSliderTop / this.maxScrollTop);
        }, NanoScroll.prototype.setOnScrollStyles = function() {
            var cssValue, _this;
            hasTransform ? (cssValue = {})[transform] = "translate(0, " + this.sliderTop + "px)" : cssValue = {
                top: this.sliderTop
            }, rAF ? (cAF && this.scrollRAF && cAF(this.scrollRAF), this.scrollRAF = rAF((_this = this, 
            function() {
                return _this.scrollRAF = null, _this.slider.css(cssValue);
            }))) : this.slider.css(cssValue);
        }, NanoScroll.prototype.createEvents = function() {
            var _this;
            this.events = {
                down: function(e) {
                    return _this.isBeingDragged = !0, _this.offsetY = e.pageY - _this.slider.offset().top, 
                    _this.slider.is(e.target) || (_this.offsetY = 0), _this.pane.addClass("active"), 
                    _this.doc.bind("mousemove", _this.events.drag).bind("mouseup", _this.events.up), 
                    _this.body.bind("mouseenter", _this.events.enter), !1;
                },
                drag: function(_this) {
                    return function(e) {
                        return _this.sliderY = e.pageY - _this.$el.offset().top - _this.paneTop - (_this.offsetY || .5 * _this.sliderHeight), 
                        _this.scroll(), _this.contentScrollTop >= _this.maxScrollTop && _this.prevScrollTop !== _this.maxScrollTop ? _this.$el.trigger("scrollend") : 0 === _this.contentScrollTop && 0 !== _this.prevScrollTop && _this.$el.trigger("scrolltop"), 
                        !1;
                    };
                }(_this = this),
                up: function(_this) {
                    return function(e) {
                        return _this.isBeingDragged = !1, _this.pane.removeClass("active"), _this.doc.unbind("mousemove", _this.events.drag).unbind("mouseup", _this.events.up), 
                        _this.body.unbind("mouseenter", _this.events.enter), !1;
                    };
                }(this),
                resize: function(_this) {
                    return function(e) {
                        _this.reset();
                    };
                }(this),
                panedown: function(_this) {
                    return function(e) {
                        return _this.sliderY = (e.offsetY || e.originalEvent.layerY) - .5 * _this.sliderHeight, 
                        _this.scroll(), _this.events.down(e), !1;
                    };
                }(this),
                scroll: function(_this) {
                    return function(e) {
                        _this.updateScrollValues(), _this.isBeingDragged || (_this.iOSNativeScrolling || (_this.sliderY = _this.sliderTop, 
                        _this.setOnScrollStyles()), null != e && (_this.contentScrollTop >= _this.maxScrollTop ? (_this.options.preventPageScrolling && _this.preventScrolling(e, "down"), 
                        _this.prevScrollTop !== _this.maxScrollTop && _this.$el.trigger("scrollend")) : 0 === _this.contentScrollTop && (_this.options.preventPageScrolling && _this.preventScrolling(e, UP), 
                        0 !== _this.prevScrollTop && _this.$el.trigger("scrolltop"))));
                    };
                }(this),
                wheel: function(_this) {
                    return function(e) {
                        var delta;
                        if (null != e) return (delta = e.delta || e.wheelDelta || e.originalEvent && e.originalEvent.wheelDelta || -e.detail || e.originalEvent && -e.originalEvent.detail) && (_this.sliderY += -delta / 3), 
                        _this.scroll(), !1;
                    };
                }(this),
                enter: function(_this) {
                    return function(e) {
                        var _ref;
                        if (_this.isBeingDragged) return 1 !== (e.buttons || e.which) ? (_ref = _this.events).up.apply(_ref, arguments) : void 0;
                    };
                }(this)
            };
        }, NanoScroll.prototype.addEvents = function() {
            var events;
            this.removeEvents(), events = this.events, this.options.disableResize || this.win.bind("resize", events.resize), 
            this.iOSNativeScrolling || (this.slider.bind("mousedown", events.down), this.pane.bind("mousedown", events.panedown).bind("mousewheel " + DOMSCROLL, events.wheel)), 
            this.$content.bind("scroll mousewheel " + DOMSCROLL + " touchmove", events.scroll);
        }, NanoScroll.prototype.removeEvents = function() {
            var events;
            events = this.events, this.win.unbind("resize", events.resize), this.iOSNativeScrolling || (this.slider.unbind(), 
            this.pane.unbind()), this.$content.unbind("scroll mousewheel " + DOMSCROLL + " touchmove", events.scroll);
        }, NanoScroll.prototype.generate = function() {
            var cssRule, options, pane, paneClass, sliderClass;
            return paneClass = (options = this.options).paneClass, sliderClass = options.sliderClass, 
            options.contentClass, (pane = this.$el.children("." + paneClass)).length || pane.children("." + sliderClass).length || this.$el.append('<div class="' + paneClass + '"><div class="' + sliderClass + '" /></div>'), 
            this.pane = this.$el.children("." + paneClass), this.slider = this.pane.find("." + sliderClass), 
            0 === BROWSER_SCROLLBAR_WIDTH && isFFWithBuggyScrollbar() ? cssRule = {
                right: -14,
                paddingRight: +window.getComputedStyle(this.content, null).getPropertyValue("padding-right").replace(/[^0-9.]+/g, "") + 14
            } : BROWSER_SCROLLBAR_WIDTH && (cssRule = {
                right: -BROWSER_SCROLLBAR_WIDTH
            }, this.$el.addClass("has-scrollbar")), null != cssRule && this.$content.css(cssRule), 
            this;
        }, NanoScroll.prototype.restore = function() {
            this.stopped = !1, this.iOSNativeScrolling || this.pane.show(), this.addEvents();
        }, NanoScroll.prototype.reset = function() {
            var content, contentHeight, contentPosition, contentStyle, contentStyleOverflowY, paneHeight, paneOuterHeight, paneTop, parentMaxHeight, right, sliderHeight;
            if (!this.iOSNativeScrolling) return this.$el.find("." + this.options.paneClass).length || this.generate().stop(), 
            this.stopped && this.restore(), contentStyleOverflowY = (contentStyle = (content = this.content).style).overflowY, 
            BROWSER_IS_IE7 && this.$content.css({
                height: this.$content.height()
            }), contentHeight = content.scrollHeight + BROWSER_SCROLLBAR_WIDTH, 0 < (parentMaxHeight = parseInt(this.$el.css("max-height"), 10)) && (this.$el.height(""), 
            this.$el.height(content.scrollHeight > parentMaxHeight ? parentMaxHeight : content.scrollHeight)), 
            paneOuterHeight = (paneHeight = this.pane.outerHeight(!1)) + (paneTop = parseInt(this.pane.css("top"), 10)) + parseInt(this.pane.css("bottom"), 10), 
            (sliderHeight = Math.round(paneOuterHeight / contentHeight * paneOuterHeight)) < this.options.sliderMinHeight ? sliderHeight = this.options.sliderMinHeight : null != this.options.sliderMaxHeight && sliderHeight > this.options.sliderMaxHeight && (sliderHeight = this.options.sliderMaxHeight), 
            contentStyleOverflowY === SCROLL && contentStyle.overflowX !== SCROLL && (sliderHeight += BROWSER_SCROLLBAR_WIDTH), 
            this.maxSliderTop = paneOuterHeight - sliderHeight, this.contentHeight = contentHeight, 
            this.paneHeight = paneHeight, this.paneOuterHeight = paneOuterHeight, this.sliderHeight = sliderHeight, 
            this.paneTop = paneTop, this.slider.height(sliderHeight), this.events.scroll(), 
            this.pane.show(), this.isActive = !0, content.scrollHeight === content.clientHeight || this.pane.outerHeight(!0) >= content.scrollHeight && contentStyleOverflowY !== SCROLL ? (this.pane.hide(), 
            this.isActive = !1) : this.el.clientHeight === content.scrollHeight && contentStyleOverflowY === SCROLL ? this.slider.hide() : this.slider.show(), 
            this.pane.css({
                opacity: this.options.alwaysVisible ? 1 : "",
                visibility: this.options.alwaysVisible ? "visible" : ""
            }), "static" !== (contentPosition = this.$content.css("position")) && "relative" !== contentPosition || (right = parseInt(this.$content.css("right"), 10)) && this.$content.css({
                right: "",
                marginRight: right
            }), this;
            this.contentHeight = this.content.scrollHeight;
        }, NanoScroll.prototype.scroll = function() {
            if (this.isActive) return this.sliderY = Math.max(0, this.sliderY), this.sliderY = Math.min(this.maxSliderTop, this.sliderY), 
            this.$content.scrollTop(this.maxScrollTop * this.sliderY / this.maxSliderTop), this.iOSNativeScrolling || (this.updateScrollValues(), 
            this.setOnScrollStyles()), this;
        }, NanoScroll.prototype.scrollBottom = function(offsetY) {
            if (this.isActive) return this.$content.scrollTop(this.contentHeight - this.$content.height() - offsetY).trigger("mousewheel"), 
            this.stop().restore(), this;
        }, NanoScroll.prototype.scrollTop = function(offsetY) {
            if (this.isActive) return this.$content.scrollTop(+offsetY).trigger("mousewheel"), 
            this.stop().restore(), this;
        }, NanoScroll.prototype.scrollTo = function(node) {
            if (this.isActive) return this.scrollTop(this.$el.find(node).get(0).offsetTop), 
            this;
        }, NanoScroll.prototype.stop = function() {
            return cAF && this.scrollRAF && (cAF(this.scrollRAF), this.scrollRAF = null), this.stopped = !0, 
            this.removeEvents(), this.iOSNativeScrolling || this.pane.hide(), this;
        }, NanoScroll.prototype.destroy = function() {
            return this.stopped || this.stop(), !this.iOSNativeScrolling && this.pane.length && this.pane.remove(), 
            BROWSER_IS_IE7 && this.$content.height(""), this.$content.removeAttr("tabindex"), 
            this.$el.hasClass("has-scrollbar") && (this.$el.removeClass("has-scrollbar"), this.$content.css({
                right: ""
            })), this;
        }, NanoScroll.prototype.flash = function() {
            var _this;
            if (!this.iOSNativeScrolling && this.isActive) return this.reset(), this.pane.addClass("flashed"), 
            setTimeout(function() {
                _this.pane.removeClass("flashed");
            }, (_this = this).options.flashDelay), this;
        }, NanoScroll;
    }(), $.fn.nanoScroller = function(settings) {
        return this.each(function() {
            var options, scrollbar;
            if ((scrollbar = this.nanoscroller) || (options = $.extend({}, defaults, settings), 
            this.nanoscroller = scrollbar = new NanoScroll(this, options)), settings && "object" == typeof settings) {
                if ($.extend(scrollbar.options, settings), null != settings.scrollBottom) return scrollbar.scrollBottom(settings.scrollBottom);
                if (null != settings.scrollTop) return scrollbar.scrollTop(settings.scrollTop);
                if (settings.scrollTo) return scrollbar.scrollTo(settings.scrollTo);
                if ("bottom" === settings.scroll) return scrollbar.scrollBottom(0);
                if ("top" === settings.scroll) return scrollbar.scrollTop(0);
                if (settings.scroll && settings.scroll instanceof $) return scrollbar.scrollTo(settings.scroll);
                if (settings.stop) return scrollbar.stop();
                if (settings.destroy) return scrollbar.destroy();
                if (settings.flash) return scrollbar.flash();
            }
            return scrollbar.reset();
        });
    }, $.fn.nanoScroller.Constructor = NanoScroll;
}(jQuery, window, document), function($) {
    $.fn.addBack = $.fn.addBack || $.fn.andSelf, $.fn.extend({
        actual: function(method, options) {
            if (!this[method]) throw '$.actual => The jQuery method "' + method + '" you called does not exist';
            var fix, restore, configs = $.extend({
                absolute: !1,
                clone: !1,
                includeMargin: !1
            }, options), $target = this.eq(0);
            if (!0 === configs.clone) fix = function() {
                $target = $target.clone().attr("style", "position: absolute !important; top: -1000 !important; ").appendTo("body");
            }, restore = function() {
                $target.remove();
            }; else {
                var $hidden, tmp = [], style = "";
                fix = function() {
                    $hidden = $target.parents().addBack().filter(":hidden"), style += "visibility: hidden !important; display: block !important; ", 
                    !0 === configs.absolute && (style += "position: absolute !important; "), $hidden.each(function() {
                        var $this = $(this), thisStyle = $this.attr("style");
                        tmp.push(thisStyle), $this.attr("style", thisStyle ? thisStyle + ";" + style : style);
                    });
                }, restore = function() {
                    $hidden.each(function(i) {
                        var $this = $(this), _tmp = tmp[i];
                        void 0 === _tmp ? $this.removeAttr("style") : $this.attr("style", _tmp);
                    });
                };
            }
            fix();
            var actual = /(outer)/.test(method) ? $target[method](configs.includeMargin) : $target[method]();
            return restore(), actual;
        }
    });
}(jQuery), function() {
    "use strict";
    function a(a, b, c) {
        "addEventListener" in window ? a.addEventListener(b, c, !1) : "attachEvent" in window && a.attachEvent("on" + b, c);
    }
    function b(a) {
        return $ + "[" + ab + "] " + a;
    }
    function c(a) {
        Z && "object" == typeof window.console && console.log(b(a));
    }
    function d(a) {
        "object" == typeof window.console && console.warn(b(a));
    }
    function e() {
        function a(a) {
            return "true" === a;
        }
        var b;
        c("Initialising iFrame"), b = X.substr(_).split(":"), ab = b[0], M = void 0 !== b[1] ? Number(b[1]) : M, 
        P = void 0 !== b[2] ? a(b[2]) : P, Z = void 0 !== b[3] ? a(b[3]) : Z, Y = void 0 !== b[4] ? Number(b[4]) : Y, 
        bb = void 0 !== b[5] ? a(b[5]) : bb, J = void 0 !== b[6] ? a(b[6]) : J, N = b[7], 
        V = void 0 !== b[8] ? b[8] : V, L = b[9], O = b[10], fb = void 0 !== b[11] ? Number(b[11]) : fb, 
        void 0 === N && (N = M + "px"), function(a, b) {
            -1 !== b.indexOf("-") && (d("Negative CSS value ignored for " + a), b = "");
        }("margin", N), h("margin", N), h("background", L), h("padding", O), function() {
            var a = document.createElement("div");
            a.style.clear = "both", a.style.display = "block", document.body.appendChild(a);
        }(), m(), document.documentElement.style.height = "", document.body.style.height = "", 
        c('HTML & body height set to "auto"'), bb && (c("Enable public methods"), window.parentIFrame = {
            close: function() {
                D("close", "parentIFrame.close()", 0, 0);
            },
            getId: function() {
                return ab;
            },
            reset: function() {
                G("parentIFrame.size");
            },
            scrollTo: function(a, b) {
                H(b, a, "scrollTo");
            },
            scrollToOffset: function(a, b) {
                H(b, a, "scrollToOffset");
            },
            sendMessage: function(a, b) {
                H(0, 0, "message", JSON.stringify(a), b);
            },
            setHeightCalculationMethod: function(a) {
                V = a, m();
            },
            setTargetOrigin: function(a) {
                c("Set targetOrigin: " + a), db = a;
            },
            size: function(a, b) {
                var c = (a || "") + (b ? "," + b : "");
                E(), D("size", "parentIFrame.size(" + c + ")", a, b);
            }
        }), !0 === J ? (k(), l(), function() {
            var b = window.MutationObserver || window.WebKitMutationObserver;
            b ? (Y < 0 ? q : function() {
                var a = document.querySelector("body"), e = new b(function(a) {
                    D("mutationObserver", "mutationObserver: " + a[0].target + " " + a[0].type), r(a);
                });
                c("Enable MutationObserver"), e.observe(a, {
                    attributes: !0,
                    attributeOldValue: !1,
                    characterData: !0,
                    characterDataOldValue: !1,
                    childList: !0,
                    subtree: !0
                });
            })() : (d("MutationObserver not supported in this browser!"), q());
        }()) : c("Auto Resize disabled"), D("init", "Init message from host page");
    }
    function h(a, b) {
        void 0 !== b && "" !== b && "null" !== b && c("Body " + a + ' set to "' + (document.body.style[a] = b) + '"');
    }
    function k() {
        a(window, "resize", function() {
            D("resize", "Window resized");
        });
    }
    function l() {
        a(window, "click", function() {
            D("click", "Window clicked");
        });
    }
    function m() {
        U !== V && (V in jb || (d(V + " is not a valid option for heightCalculationMethod."), 
        V = "bodyScroll"), c('Height calculation method set to "' + V + '"'));
    }
    function q() {
        0 !== Y && (c("setInterval: " + Y + "ms"), setInterval(function() {
            D("interval", "setInterval: " + Y);
        }, Math.abs(Y)));
    }
    function r(b) {
        function d(b) {
            void 0 !== b.height && void 0 !== b.width && 0 !== b.height && 0 !== b.width || (c("Attach listerner to " + b.src), 
            a(b, "load", function() {
                D("imageLoad", "Image loaded");
            }));
        }
        b.forEach(function(a) {
            if ("attributes" === a.type && "src" === a.attributeName) d(a.target); else if ("childList" === a.type) {
                var b = a.target.querySelectorAll("img");
                Array.prototype.forEach.call(b, function(a) {
                    d(a);
                });
            }
        });
    }
    function t() {
        function a(a) {
            var c = document.body, d = 0;
            return d = "defaultView" in document && "getComputedStyle" in document.defaultView ? null !== (d = document.defaultView.getComputedStyle(c, null)) ? d[a] : 0 : function(a) {
                if (/^\d+(px)?$/i.test(a)) return parseInt(a, K);
                var d = c.style.left, e = c.runtimeStyle.left;
                return c.runtimeStyle.left = c.currentStyle.left, c.style.left = a || 0, a = c.style.pixelLeft, 
                c.style.left = d, c.runtimeStyle.left = e, a;
            }(c.currentStyle[a]), parseInt(d, K);
        }
        return document.body.offsetHeight + a("marginTop") + a("marginBottom");
    }
    function u() {
        return document.body.scrollHeight;
    }
    function v() {
        return document.documentElement.offsetHeight;
    }
    function w() {
        return document.documentElement.scrollHeight;
    }
    function y() {
        return [ t(), u(), v(), w() ];
    }
    function z() {
        return Math.max.apply(null, y());
    }
    function C() {
        return Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    }
    function D(a, b, d, e) {
        function f() {
            a in {
                reset: 1,
                resetPage: 1,
                init: 1
            } || c("Trigger event: " + b);
        }
        var n, o;
        gb && a in Q ? c("Trigger event cancelled: " + a) : function() {
            function a(a, b) {
                return !(Math.abs(a - b) <= fb);
            }
            return n = void 0 !== d ? d : jb[V](), o = void 0 !== e ? e : C(), a(S, n) || P && a(ib, o);
        }() ? (f(), E(), H(S = n, ib = o, a)) : !(a in {
            init: 1,
            interval: 1,
            size: 1
        }) && V in cb ? G(b) : a in {
            interval: 1
        } || (f(), c("No change in size detected"));
    }
    function E() {
        gb || (gb = !0, c("Trigger event lock on")), clearTimeout(hb), hb = setTimeout(function() {
            gb = !1, c("Trigger event lock off"), c("--");
        }, R);
    }
    function F(a) {
        S = jb[V](), ib = C(), H(S, ib, a);
    }
    function G(a) {
        var b = V;
        V = U, c("Reset trigger event: " + a), E(), F("reset"), V = b;
    }
    function H(a, b, d, e, f) {
        void 0 === f ? f = db : c("Message targetOrigin: " + f), function() {
            var h = ab + ":" + (a + ":" + b) + ":" + d + (void 0 !== e ? ":" + e : "");
            c("Sending message to host page (" + h + ")"), eb.postMessage($ + h, f);
        }();
    }
    var J = !0, K = 10, L = "", M = 0, N = "", O = "", P = !1, Q = {
        resize: 1,
        click: 1
    }, R = 128, S = 1, T = !0, U = "offset", V = U, W = !0, X = "", Y = 32, Z = !1, $ = "[iFrameSizer]", _ = $.length, ab = "", bb = !1, cb = {
        max: 1,
        scroll: 1,
        bodyScroll: 1,
        documentElementScroll: 1
    }, db = "*", eb = window.parent, fb = 0, gb = !1, hb = null, ib = 1, jb = {
        offset: t,
        bodyOffset: t,
        bodyScroll: u,
        documentElementOffset: v,
        scroll: w,
        documentElementScroll: w,
        max: z,
        min: function() {
            return Math.min.apply(null, y());
        },
        grow: z,
        lowestElement: function() {
            return Math.max(t(), function() {
                for (var a = document.querySelectorAll("body *"), b = a.length, d = 0, e = new Date().getTime(), f = 0; f < b; f++) a[f].getBoundingClientRect().bottom > d && (d = a[f].getBoundingClientRect().bottom);
                return e = new Date().getTime() - e, c("Parsed " + b + " HTML elements"), c("LowestElement bottom position calculated in " + e + "ms"), 
                d;
            }());
        }
    };
    a(window, "message", function(a) {
        $ === ("" + a.data).substr(0, _) && (T && a.data.split(":")[2] in {
            true: 1,
            false: 1
        } ? (X = a.data, eb = a.source, e(), T = !1, setTimeout(function() {
            W = !1;
        }, R)) : "reset" === a.data.split("]")[1] ? W ? c("Page reset ignored by init") : (c("Page size reset by host page"), 
        F("resetPage")) : a.data === X || "iFrameResize" in window || d("Unexpected message (" + a.data + ")"));
    });
}();

var t = void 0, u = !1, sjcl = {
    cipher: {},
    hash: {},
    keyexchange: {},
    mode: {},
    misc: {},
    codec: {},
    exception: {
        corrupt: function(a) {
            this.toString = function() {
                return "CORRUPT: " + this.message;
            }, this.message = a;
        },
        invalid: function(a) {
            this.toString = function() {
                return "INVALID: " + this.message;
            }, this.message = a;
        },
        bug: function(a) {
            this.toString = function() {
                return "BUG: " + this.message;
            }, this.message = a;
        },
        notReady: function(a) {
            this.toString = function() {
                return "NOT READY: " + this.message;
            }, this.message = a;
        }
    }
};

function y(a, b, c) {
    4 !== b.length && q(new sjcl.exception.invalid("invalid aes block size"));
    var d = a.a[c], e = b[0] ^ d[0], f = b[c ? 3 : 1] ^ d[1], g = b[2] ^ d[2];
    b = b[c ? 1 : 3] ^ d[3];
    var h, l, k, m, n = d.length / 4 - 2, p = 4, s = [ 0, 0, 0, 0 ];
    a = (h = a.j[c])[0];
    var r = h[1], v = h[2], w = h[3], x = h[4];
    for (m = 0; m < n; m++) h = a[e >>> 24] ^ r[f >> 16 & 255] ^ v[g >> 8 & 255] ^ w[255 & b] ^ d[p], 
    l = a[f >>> 24] ^ r[g >> 16 & 255] ^ v[b >> 8 & 255] ^ w[255 & e] ^ d[p + 1], k = a[g >>> 24] ^ r[b >> 16 & 255] ^ v[e >> 8 & 255] ^ w[255 & f] ^ d[p + 2], 
    b = a[b >>> 24] ^ r[e >> 16 & 255] ^ v[f >> 8 & 255] ^ w[255 & g] ^ d[p + 3], p += 4, 
    e = h, f = l, g = k;
    for (m = 0; m < 4; m++) s[c ? 3 & -m : m] = x[e >>> 24] << 24 ^ x[f >> 16 & 255] << 16 ^ x[g >> 8 & 255] << 8 ^ x[255 & b] ^ d[p++], 
    h = e, e = f, f = g, g = b, b = h;
    return s;
}

function z(a, b) {
    var c, d, e, f = b.slice(0), g = a.q, h = a.a, l = g[0], k = g[1], n = g[2], m = g[3], p = g[4], s = g[5], r = g[6], v = g[7];
    for (c = 0; c < 64; c++) d = (d = c < 16 ? f[c] : (d = f[c + 1 & 15], e = f[c + 14 & 15], 
    f[15 & c] = (d >>> 7 ^ d >>> 18 ^ d >>> 3 ^ d << 25 ^ d << 14) + (e >>> 17 ^ e >>> 19 ^ e >>> 10 ^ e << 15 ^ e << 13) + f[15 & c] + f[c + 9 & 15] | 0)) + v + (p >>> 6 ^ p >>> 11 ^ p >>> 25 ^ p << 26 ^ p << 21 ^ p << 7) + (r ^ p & (s ^ r)) + h[c], 
    v = r, r = s, s = p, p = m + d | 0, m = n, n = k, l = d + ((k = l) & n ^ m & (k ^ n)) + (k >>> 2 ^ k >>> 13 ^ k >>> 22 ^ k << 30 ^ k << 19 ^ k << 10) | 0;
    g[0] = g[0] + l | 0, g[1] = g[1] + k | 0, g[2] = g[2] + n | 0, g[3] = g[3] + m | 0, 
    g[4] = g[4] + p | 0, g[5] = g[5] + s | 0, g[6] = g[6] + r | 0, g[7] = g[7] + v | 0;
}

function C(a, b) {
    var c, d = sjcl.random.z[a], e = [];
    for (c in d) d.hasOwnProperty(c) && e.push(d[c]);
    for (c = 0; c < e.length; c++) e[c](b);
}

function A(a) {
    a.a = B(a).concat(B(a)), a.A = new sjcl.cipher.aes(a.a);
}

function B(a) {
    for (var b = 0; b < 4 && (a.e[b] = a.e[b] + 1 | 0, !a.e[b]); b++) ;
    return a.A.encrypt(a.e);
}

"undefined" != typeof module && module.exports && (module.exports = sjcl), sjcl.cipher.aes = function(a) {
    this.j[0][0][0] || this.D();
    var b, c, d, e, f = this.j[0][4], g = this.j[1], h = 1;
    for (4 !== (b = a.length) && 6 !== b && 8 !== b && q(new sjcl.exception.invalid("invalid aes key size")), 
    this.a = [ d = a.slice(0), e = [] ], a = b; a < 4 * b + 28; a++) c = d[a - 1], (0 == a % b || 8 === b && 4 == a % b) && (c = f[c >>> 24] << 24 ^ f[c >> 16 & 255] << 16 ^ f[c >> 8 & 255] << 8 ^ f[255 & c], 
    0 == a % b && (c = c << 8 ^ c >>> 24 ^ h << 24, h = h << 1 ^ 283 * (h >> 7))), d[a] = d[a - b] ^ c;
    for (b = 0; a; b++, a--) c = d[3 & b ? a : a - 4], e[b] = a <= 4 || b < 4 ? c : g[0][f[c >>> 24]] ^ g[1][f[c >> 16 & 255]] ^ g[2][f[c >> 8 & 255]] ^ g[3][f[255 & c]];
}, sjcl.cipher.aes.prototype = {
    encrypt: function(a) {
        return y(this, a, 0);
    },
    decrypt: function(a) {
        return y(this, a, 1);
    },
    j: [ [ [], [], [], [], [] ], [ [], [], [], [], [] ] ],
    D: function() {
        var e, f, g, k, n, m, p, a = this.j[0], b = this.j[1], c = a[4], d = b[4], h = [], l = [];
        for (e = 0; e < 256; e++) l[(h[e] = e << 1 ^ 283 * (e >> 7)) ^ e] = e;
        for (f = g = 0; !c[f]; f ^= k || 1, g = l[g] || 1) for (m = (m = g ^ g << 1 ^ g << 2 ^ g << 3 ^ g << 4) >> 8 ^ 255 & m ^ 99, 
        p = 16843009 * (n = h[e = h[k = h[d[c[f] = m] = f]]]) ^ 65537 * e ^ 257 * k ^ 16843008 * f, 
        n = 257 * h[m] ^ 16843008 * m, e = 0; e < 4; e++) a[e][f] = n = n << 24 ^ n >>> 8, 
        b[e][m] = p = p << 24 ^ p >>> 8;
        for (e = 0; e < 5; e++) a[e] = a[e].slice(0), b[e] = b[e].slice(0);
    }
}, sjcl.bitArray = {
    bitSlice: function(a, b, c) {
        return a = sjcl.bitArray.P(a.slice(b / 32), 32 - (31 & b)).slice(1), c === t ? a : sjcl.bitArray.clamp(a, c - b);
    },
    extract: function(a, b, c) {
        var d = Math.floor(-b - c & 31);
        return (-32 & (b + c - 1 ^ b) ? a[b / 32 | 0] << 32 - d ^ a[b / 32 + 1 | 0] >>> d : a[b / 32 | 0] >>> d) & (1 << c) - 1;
    },
    concat: function(a, b) {
        if (0 === a.length || 0 === b.length) return a.concat(b);
        var c = a[a.length - 1], d = sjcl.bitArray.getPartial(c);
        return 32 === d ? a.concat(b) : sjcl.bitArray.P(b, d, 0 | c, a.slice(0, a.length - 1));
    },
    bitLength: function(a) {
        var b = a.length;
        return 0 === b ? 0 : 32 * (b - 1) + sjcl.bitArray.getPartial(a[b - 1]);
    },
    clamp: function(a, b) {
        if (32 * a.length < b) return a;
        var c = (a = a.slice(0, Math.ceil(b / 32))).length;
        return b &= 31, 0 < c && b && (a[c - 1] = sjcl.bitArray.partial(b, a[c - 1] & 2147483648 >> b - 1, 1)), 
        a;
    },
    partial: function(a, b, c) {
        return 32 === a ? b : (c ? 0 | b : b << 32 - a) + 1099511627776 * a;
    },
    getPartial: function(a) {
        return Math.round(a / 1099511627776) || 32;
    },
    equal: function(a, b) {
        if (sjcl.bitArray.bitLength(a) !== sjcl.bitArray.bitLength(b)) return u;
        var d, c = 0;
        for (d = 0; d < a.length; d++) c |= a[d] ^ b[d];
        return 0 === c;
    },
    P: function(a, b, c, d) {
        var e;
        for (e = 0, d === t && (d = []); 32 <= b; b -= 32) d.push(c), c = 0;
        if (0 === b) return d.concat(a);
        for (e = 0; e < a.length; e++) d.push(c | a[e] >>> b), c = a[e] << 32 - b;
        return e = a.length ? a[a.length - 1] : 0, a = sjcl.bitArray.getPartial(e), d.push(sjcl.bitArray.partial(b + a & 31, 32 < b + a ? c : d.pop(), 1)), 
        d;
    },
    k: function(a, b) {
        return [ a[0] ^ b[0], a[1] ^ b[1], a[2] ^ b[2], a[3] ^ b[3] ];
    }
}, sjcl.codec.utf8String = {
    fromBits: function(a) {
        var d, e, b = "", c = sjcl.bitArray.bitLength(a);
        for (d = 0; d < c / 8; d++) 0 == (3 & d) && (e = a[d / 4]), b += String.fromCharCode(e >>> 24), 
        e <<= 8;
        return decodeURIComponent(escape(b));
    },
    toBits: function(a) {
        a = unescape(encodeURIComponent(a));
        var c, b = [], d = 0;
        for (c = 0; c < a.length; c++) d = d << 8 | a.charCodeAt(c), 3 == (3 & c) && (b.push(d), 
        d = 0);
        return 3 & c && b.push(sjcl.bitArray.partial(8 * (3 & c), d)), b;
    }
}, sjcl.codec.hex = {
    fromBits: function(a) {
        var c, b = "";
        for (c = 0; c < a.length; c++) b += (0xf00000000000 + (0 | a[c])).toString(16).substr(4);
        return b.substr(0, sjcl.bitArray.bitLength(a) / 4);
    },
    toBits: function(a) {
        var b, d, c = [];
        for (d = (a = a.replace(/\s|0x/g, "")).length, a += "00000000", b = 0; b < a.length; b += 8) c.push(0 ^ parseInt(a.substr(b, 8), 16));
        return sjcl.bitArray.clamp(c, 4 * d);
    }
}, sjcl.codec.base64 = {
    J: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    fromBits: function(a, b, c) {
        var d = "", e = 0, f = sjcl.codec.base64.J, g = 0, h = sjcl.bitArray.bitLength(a);
        for (c && (f = f.substr(0, 62) + "-_"), c = 0; 6 * d.length < h; ) d += f.charAt((g ^ a[c] >>> e) >>> 26), 
        e < 6 ? (g = a[c] << 6 - e, e += 26, c++) : (g <<= 6, e -= 6);
        for (;3 & d.length && !b; ) d += "=";
        return d;
    },
    toBits: function(a, b) {
        a = a.replace(/\s|=/g, "");
        var d, h, c = [], e = 0, f = sjcl.codec.base64.J, g = 0;
        for (b && (f = f.substr(0, 62) + "-_"), d = 0; d < a.length; d++) (h = f.indexOf(a.charAt(d))) < 0 && q(new sjcl.exception.invalid("this isn't base64!")), 
        26 < e ? (e -= 26, c.push(g ^ h >>> e), g = h << 32 - e) : g ^= h << 32 - (e += 6);
        return 56 & e && c.push(sjcl.bitArray.partial(56 & e, g, 1)), c;
    }
}, sjcl.codec.base64url = {
    fromBits: function(a) {
        return sjcl.codec.base64.fromBits(a, 1, 1);
    },
    toBits: function(a) {
        return sjcl.codec.base64.toBits(a, 1);
    }
}, sjcl.hash.sha256 = function(a) {
    this.a[0] || this.D(), a ? (this.q = a.q.slice(0), this.n = a.n.slice(0), this.g = a.g) : this.reset();
}, sjcl.hash.sha256.hash = function(a) {
    return new sjcl.hash.sha256().update(a).finalize();
}, sjcl.hash.sha256.prototype = {
    blockSize: 512,
    reset: function() {
        return this.q = this.N.slice(0), this.n = [], this.g = 0, this;
    },
    update: function(a) {
        "string" == typeof a && (a = sjcl.codec.utf8String.toBits(a));
        var b, c = this.n = sjcl.bitArray.concat(this.n, a);
        for (b = this.g, a = this.g = b + sjcl.bitArray.bitLength(a), b = 512 + b & -512; b <= a; b += 512) z(this, c.splice(0, 16));
        return this;
    },
    finalize: function() {
        var a, b = this.n, c = this.q;
        for (a = (b = sjcl.bitArray.concat(b, [ sjcl.bitArray.partial(1, 1) ])).length + 2; 15 & a; a++) b.push(0);
        for (b.push(Math.floor(this.g / 4294967296)), b.push(0 | this.g); b.length; ) z(this, b.splice(0, 16));
        return this.reset(), c;
    },
    N: [],
    a: [],
    D: function() {
        function a(a) {
            return 4294967296 * (a - Math.floor(a)) | 0;
        }
        var d, b = 0, c = 2;
        a: for (;b < 64; c++) {
            for (d = 2; d * d <= c; d++) if (0 == c % d) continue a;
            b < 8 && (this.N[b] = a(Math.pow(c, .5))), this.a[b] = a(Math.pow(c, 1 / 3)), b++;
        }
    }
}, sjcl.mode.ccm = {
    name: "ccm",
    encrypt: function(a, b, c, d, e) {
        var f, g = b.slice(0), h = sjcl.bitArray, l = h.bitLength(c) / 8, k = h.bitLength(g) / 8;
        for (e = e || 64, d = d || [], l < 7 && q(new sjcl.exception.invalid("ccm: iv must be at least 7 bytes")), 
        f = 2; f < 4 && k >>> 8 * f; f++) ;
        return f < 15 - l && (f = 15 - l), c = h.clamp(c, 8 * (15 - f)), b = sjcl.mode.ccm.L(a, b, c, d, e, f), 
        g = sjcl.mode.ccm.o(a, g, c, b, e, f), h.concat(g.data, g.tag);
    },
    decrypt: function(a, b, c, d, e) {
        e = e || 64, d = d || [];
        var f = sjcl.bitArray, g = f.bitLength(c) / 8, h = f.bitLength(b), l = f.clamp(b, h - e), k = f.bitSlice(b, h - e);
        h = (h - e) / 8;
        for (g < 7 && q(new sjcl.exception.invalid("ccm: iv must be at least 7 bytes")), 
        b = 2; b < 4 && h >>> 8 * b; b++) ;
        return b < 15 - g && (b = 15 - g), c = f.clamp(c, 8 * (15 - b)), l = sjcl.mode.ccm.o(a, l, c, k, e, b), 
        a = sjcl.mode.ccm.L(a, l.data, c, d, e, b), f.equal(l.tag, a) || q(new sjcl.exception.corrupt("ccm: tag doesn't match")), 
        l.data;
    },
    L: function(a, b, c, d, e, f) {
        var g = [], h = sjcl.bitArray, l = h.k;
        if (((e /= 8) % 2 || e < 4 || 16 < e) && q(new sjcl.exception.invalid("ccm: invalid tag length")), 
        (4294967295 < d.length || 4294967295 < b.length) && q(new sjcl.exception.bug("ccm: can't deal with 4GiB or more data")), 
        f = [ h.partial(8, (d.length ? 64 : 0) | e - 2 << 2 | f - 1) ], (f = h.concat(f, c))[3] |= h.bitLength(b) / 8, 
        f = a.encrypt(f), d.length) for ((c = h.bitLength(d) / 8) <= 65279 ? g = [ h.partial(16, c) ] : c <= 4294967295 && (g = h.concat([ h.partial(16, 65534) ], [ c ])), 
        g = h.concat(g, d), d = 0; d < g.length; d += 4) f = a.encrypt(l(f, g.slice(d, d + 4).concat([ 0, 0, 0 ])));
        for (d = 0; d < b.length; d += 4) f = a.encrypt(l(f, b.slice(d, d + 4).concat([ 0, 0, 0 ])));
        return h.clamp(f, 8 * e);
    },
    o: function(a, b, c, d, e, f) {
        var g, h = sjcl.bitArray;
        g = h.k;
        var l = b.length, k = h.bitLength(b);
        if (c = h.concat([ h.partial(8, f - 1) ], c).concat([ 0, 0, 0 ]).slice(0, 4), d = h.bitSlice(g(d, a.encrypt(c)), 0, e), 
        !l) return {
            tag: d,
            data: []
        };
        for (g = 0; g < l; g += 4) c[3]++, e = a.encrypt(c), b[g] ^= e[0], b[g + 1] ^= e[1], 
        b[g + 2] ^= e[2], b[g + 3] ^= e[3];
        return {
            tag: d,
            data: h.clamp(b, k)
        };
    }
}, sjcl.mode.ocb2 = {
    name: "ocb2",
    encrypt: function(a, b, c, d, e, f) {
        128 !== sjcl.bitArray.bitLength(c) && q(new sjcl.exception.invalid("ocb iv must be 128 bits"));
        var g, h = sjcl.mode.ocb2.H, l = sjcl.bitArray, k = l.k, n = [ 0, 0, 0, 0 ];
        c = h(a.encrypt(c));
        var m, p = [];
        for (d = d || [], e = e || 64, g = 0; g + 4 < b.length; g += 4) n = k(n, m = b.slice(g, g + 4)), 
        p = p.concat(k(c, a.encrypt(k(c, m)))), c = h(c);
        return m = b.slice(g), b = l.bitLength(m), g = a.encrypt(k(c, [ 0, 0, 0, b ])), 
        m = l.clamp(k(m.concat([ 0, 0, 0 ]), g), b), n = k(n, k(m.concat([ 0, 0, 0 ]), g)), 
        n = a.encrypt(k(n, k(c, h(c)))), d.length && (n = k(n, f ? d : sjcl.mode.ocb2.pmac(a, d))), 
        p.concat(l.concat(m, l.clamp(n, e)));
    },
    decrypt: function(a, b, c, d, e, f) {
        128 !== sjcl.bitArray.bitLength(c) && q(new sjcl.exception.invalid("ocb iv must be 128 bits")), 
        e = e || 64;
        var m, p, g = sjcl.mode.ocb2.H, h = sjcl.bitArray, l = h.k, k = [ 0, 0, 0, 0 ], n = g(a.encrypt(c)), s = sjcl.bitArray.bitLength(b) - e, r = [];
        for (d = d || [], c = 0; c + 4 < s / 32; c += 4) m = l(n, a.decrypt(l(n, b.slice(c, c + 4)))), 
        k = l(k, m), r = r.concat(m), n = g(n);
        return p = s - 32 * c, m = a.encrypt(l(n, [ 0, 0, 0, p ])), m = l(m, h.clamp(b.slice(c), p).concat([ 0, 0, 0 ])), 
        k = l(k, m), k = a.encrypt(l(k, l(n, g(n)))), d.length && (k = l(k, f ? d : sjcl.mode.ocb2.pmac(a, d))), 
        h.equal(h.clamp(k, e), h.bitSlice(b, s)) || q(new sjcl.exception.corrupt("ocb: tag doesn't match")), 
        r.concat(h.clamp(m, p));
    },
    pmac: function(a, b) {
        var c, d = sjcl.mode.ocb2.H, e = sjcl.bitArray, f = e.k, g = [ 0, 0, 0, 0 ], h = f(h = a.encrypt([ 0, 0, 0, 0 ]), d(d(h)));
        for (c = 0; c + 4 < b.length; c += 4) h = d(h), g = f(g, a.encrypt(f(h, b.slice(c, c + 4))));
        return c = b.slice(c), e.bitLength(c) < 128 && (h = f(h, d(h)), c = e.concat(c, [ -2147483648, 0, 0, 0 ])), 
        g = f(g, c), a.encrypt(f(d(f(h, d(h))), g));
    },
    H: function(a) {
        return [ a[0] << 1 ^ a[1] >>> 31, a[1] << 1 ^ a[2] >>> 31, a[2] << 1 ^ a[3] >>> 31, a[3] << 1 ^ 135 * (a[0] >>> 31) ];
    }
}, sjcl.mode.gcm = {
    name: "gcm",
    encrypt: function(a, b, c, d, e) {
        var f = b.slice(0);
        return b = sjcl.bitArray, d = d || [], a = sjcl.mode.gcm.o(!0, a, f, d, c, e || 128), 
        b.concat(a.data, a.tag);
    },
    decrypt: function(a, b, c, d, e) {
        var f = b.slice(0), g = sjcl.bitArray, h = g.bitLength(f);
        return d = d || [], f = (e = e || 128) <= h ? (b = g.bitSlice(f, h - e), g.bitSlice(f, 0, h - e)) : (b = f, 
        []), a = sjcl.mode.gcm.o(u, a, f, d, c, e), g.equal(a.tag, b) || q(new sjcl.exception.corrupt("gcm: tag doesn't match")), 
        a.data;
    },
    W: function(a, b) {
        var c, d, e, f, g, h = sjcl.bitArray.k;
        for (e = [ 0, 0, 0, 0 ], f = b.slice(0), c = 0; c < 128; c++) {
            for ((d = 0 != (a[Math.floor(c / 32)] & 1 << 31 - c % 32)) && (e = h(e, f)), g = 0 != (1 & f[3]), 
            d = 3; 0 < d; d--) f[d] = f[d] >>> 1 | (1 & f[d - 1]) << 31;
            f[0] >>>= 1, g && (f[0] ^= -520093696);
        }
        return e;
    },
    f: function(a, b, c) {
        var d, e = c.length;
        for (b = b.slice(0), d = 0; d < e; d += 4) b[0] ^= 4294967295 & c[d], b[1] ^= 4294967295 & c[d + 1], 
        b[2] ^= 4294967295 & c[d + 2], b[3] ^= 4294967295 & c[d + 3], b = sjcl.mode.gcm.W(b, a);
        return b;
    },
    o: function(a, b, c, d, e, f) {
        var g, h, l, k, n, m, p, s, r = sjcl.bitArray;
        for (m = c.length, p = r.bitLength(c), s = r.bitLength(d), h = r.bitLength(e), g = b.encrypt([ 0, 0, 0, 0 ]), 
        e = 96 === h ? (e = e.slice(0), r.concat(e, [ 1 ])) : (e = sjcl.mode.gcm.f(g, [ 0, 0, 0, 0 ], e), 
        sjcl.mode.gcm.f(g, e, [ 0, 0, Math.floor(h / 4294967296), 4294967295 & h ])), h = sjcl.mode.gcm.f(g, [ 0, 0, 0, 0 ], d), 
        n = e.slice(0), d = h.slice(0), a || (d = sjcl.mode.gcm.f(g, h, c)), k = 0; k < m; k += 4) n[3]++, 
        l = b.encrypt(n), c[k] ^= l[0], c[k + 1] ^= l[1], c[k + 2] ^= l[2], c[k + 3] ^= l[3];
        return c = r.clamp(c, p), a && (d = sjcl.mode.gcm.f(g, h, c)), a = [ Math.floor(s / 4294967296), 4294967295 & s, Math.floor(p / 4294967296), 4294967295 & p ], 
        d = sjcl.mode.gcm.f(g, d, a), l = b.encrypt(e), d[0] ^= l[0], d[1] ^= l[1], d[2] ^= l[2], 
        d[3] ^= l[3], {
            tag: r.bitSlice(d, 0, f),
            data: c
        };
    }
}, sjcl.misc.hmac = function(a, b) {
    this.M = b = b || sjcl.hash.sha256;
    var d, c = [ [], [] ], e = b.prototype.blockSize / 32;
    for (this.m = [ new b(), new b() ], a.length > e && (a = b.hash(a)), d = 0; d < e; d++) c[0][d] = 909522486 ^ a[d], 
    c[1][d] = 1549556828 ^ a[d];
    this.m[0].update(c[0]), this.m[1].update(c[1]), this.G = new b(this.m[0]);
}, sjcl.misc.hmac.prototype.encrypt = sjcl.misc.hmac.prototype.mac = function(a) {
    return this.Q && q(new sjcl.exception.invalid("encrypt on already updated hmac called!")), 
    this.update(a), this.digest(a);
}, sjcl.misc.hmac.prototype.reset = function() {
    this.G = new this.M(this.m[0]), this.Q = u;
}, sjcl.misc.hmac.prototype.update = function(a) {
    this.Q = !0, this.G.update(a);
}, sjcl.misc.hmac.prototype.digest = function() {
    var a = this.G.finalize();
    a = new this.M(this.m[1]).update(a).finalize();
    return this.reset(), a;
}, sjcl.misc.pbkdf2 = function(a, b, c, d, e) {
    c = c || 1e3, (d < 0 || c < 0) && q(sjcl.exception.invalid("invalid params to pbkdf2")), 
    "string" == typeof a && (a = sjcl.codec.utf8String.toBits(a)), "string" == typeof b && (b = sjcl.codec.utf8String.toBits(b)), 
    a = new (e = e || sjcl.misc.hmac)(a);
    var f, g, h, l, k = [], n = sjcl.bitArray;
    for (l = 1; 32 * k.length < (d || 1); l++) {
        for (e = f = a.encrypt(n.concat(b, [ l ])), g = 1; g < c; g++) for (f = a.encrypt(f), 
        h = 0; h < f.length; h++) e[h] ^= f[h];
        k = k.concat(e);
    }
    return d && (k = n.clamp(k, d)), k;
}, sjcl.prng = function(a) {
    this.b = [ new sjcl.hash.sha256() ], this.h = [ 0 ], this.F = 0, this.t = {}, this.C = 0, 
    this.K = {}, this.O = this.c = this.i = this.V = 0, this.a = [ 0, 0, 0, 0, 0, 0, 0, 0 ], 
    this.e = [ 0, 0, 0, 0 ], this.A = t, this.B = a, this.p = u, this.z = {
        progress: {},
        seeded: {}
    }, this.l = this.U = 0, this.u = 1, this.w = 2, this.S = 65536, this.I = [ 0, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024 ], 
    this.T = 3e4, this.R = 80;
}, sjcl.prng.prototype = {
    randomWords: function(a, b) {
        var d, e, c = [];
        if ((d = this.isReady(b)) === this.l && q(new sjcl.exception.notReady("generator isn't seeded")), 
        d & this.w) {
            d = !(d & this.u), e = [];
            var g, f = 0;
            for (this.O = e[0] = new Date().valueOf() + this.T, g = 0; g < 16; g++) e.push(4294967296 * Math.random() | 0);
            for (g = 0; g < this.b.length && (e = e.concat(this.b[g].finalize()), f += this.h[g], 
            this.h[g] = 0, d || !(this.F & 1 << g)); g++) ;
            for (this.F >= 1 << this.b.length && (this.b.push(new sjcl.hash.sha256()), this.h.push(0)), 
            this.c -= f, f > this.i && (this.i = f), this.F++, this.a = sjcl.hash.sha256.hash(this.a.concat(e)), 
            this.A = new sjcl.cipher.aes(this.a), d = 0; d < 4 && (this.e[d] = this.e[d] + 1 | 0, 
            !this.e[d]); d++) ;
        }
        for (d = 0; d < a; d += 4) 0 == (d + 1) % this.S && A(this), e = B(this), c.push(e[0], e[1], e[2], e[3]);
        return A(this), c.slice(0, a);
    },
    setDefaultParanoia: function(a) {
        this.B = a;
    },
    addEntropy: function(a, b, c) {
        c = c || "user";
        var d, e, f = new Date().valueOf(), g = this.t[c], h = this.isReady(), l = 0;
        switch ((d = this.K[c]) === t && (d = this.K[c] = this.V++), g === t && (g = this.t[c] = 0), 
        this.t[c] = (this.t[c] + 1) % this.b.length, typeof a) {
          case "number":
            b === t && (b = 1), this.b[g].update([ d, this.C++, 1, b, f, 1, 0 | a ]);
            break;

          case "object":
            if ("[object Uint32Array]" === (c = Object.prototype.toString.call(a))) {
                for (e = [], c = 0; c < a.length; c++) e.push(a[c]);
                a = e;
            } else for ("[object Array]" !== c && (l = 1), c = 0; c < a.length && !l; c++) "number" != typeof a[c] && (l = 1);
            if (!l) {
                if (b === t) for (c = b = 0; c < a.length; c++) for (e = a[c]; 0 < e; ) b++, e >>>= 1;
                this.b[g].update([ d, this.C++, 2, b, f, a.length ].concat(a));
            }
            break;

          case "string":
            b === t && (b = a.length), this.b[g].update([ d, this.C++, 3, b, f, a.length ]), 
            this.b[g].update(a);
            break;

          default:
            l = 1;
        }
        l && q(new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string")), 
        this.h[g] += b, this.c += b, h === this.l && (this.isReady() !== this.l && C("seeded", Math.max(this.i, this.c)), 
        C("progress", this.getProgress()));
    },
    isReady: function(a) {
        return a = this.I[a !== t ? a : this.B], this.i && this.i >= a ? this.h[0] > this.R && new Date().valueOf() > this.O ? this.w | this.u : this.u : this.c >= a ? this.w | this.l : this.l;
    },
    getProgress: function(a) {
        return a = this.I[a || this.B], this.i >= a || this.c > a ? 1 : this.c / a;
    },
    startCollectors: function() {
        this.p || (window.addEventListener ? (window.addEventListener("load", this.r, u), 
        window.addEventListener("mousemove", this.s, u)) : document.attachEvent ? (document.attachEvent("onload", this.r), 
        document.attachEvent("onmousemove", this.s)) : q(new sjcl.exception.bug("can't attach event")), 
        this.p = !0);
    },
    stopCollectors: function() {
        this.p && (window.removeEventListener ? (window.removeEventListener("load", this.r, u), 
        window.removeEventListener("mousemove", this.s, u)) : window.detachEvent && (window.detachEvent("onload", this.r), 
        window.detachEvent("onmousemove", this.s)), this.p = u);
    },
    addEventListener: function(a, b) {
        this.z[a][this.U++] = b;
    },
    removeEventListener: function(a, b) {
        var c, d, e = this.z[a], f = [];
        for (d in e) e.hasOwnProperty(d) && e[d] === b && f.push(d);
        for (c = 0; c < f.length; c++) delete e[d = f[c]];
    },
    s: function(a) {
        sjcl.random.addEntropy([ a.x || a.clientX || a.offsetX || 0, a.y || a.clientY || a.offsetY || 0 ], 2, "mouse");
    },
    r: function() {
        sjcl.random.addEntropy(new Date().valueOf(), 2, "loadtime");
    }
}, sjcl.random = new sjcl.prng(6);

try {
    if ("undefined" != typeof module && module.exports) {
        var D = require("crypto").randomBytes(128);
        sjcl.random.addEntropy(D, 1024, "crypto['randomBytes']");
    } else if (window && window.crypto && window.crypto.getRandomValues) {
        var E = new Uint32Array(32);
        window.crypto.getRandomValues(E), sjcl.random.addEntropy(E, 1024, "crypto['getRandomValues']");
    }
} catch (F) {}

sjcl.json = {
    defaults: {
        v: 1,
        iter: 1e3,
        ks: 128,
        ts: 64,
        mode: "ccm",
        adata: "",
        cipher: "aes"
    },
    encrypt: function(a, b, c, d) {
        c = c || {}, d = d || {};
        var g, e = sjcl.json, f = e.d({
            iv: sjcl.random.randomWords(4, 0)
        }, e.defaults);
        return e.d(f, c), c = f.adata, "string" == typeof f.salt && (f.salt = sjcl.codec.base64.toBits(f.salt)), 
        "string" == typeof f.iv && (f.iv = sjcl.codec.base64.toBits(f.iv)), (!sjcl.mode[f.mode] || !sjcl.cipher[f.cipher] || "string" == typeof a && f.iter <= 100 || 64 !== f.ts && 96 !== f.ts && 128 !== f.ts || 128 !== f.ks && 192 !== f.ks && 256 !== f.ks || f.iv.length < 2 || 4 < f.iv.length) && q(new sjcl.exception.invalid("json encrypt: invalid parameters")), 
        "string" == typeof a ? (a = (g = sjcl.misc.cachedPbkdf2(a, f)).key.slice(0, f.ks / 32), 
        f.salt = g.salt) : sjcl.ecc && a instanceof sjcl.ecc.elGamal.publicKey && (g = a.kem(), 
        f.kemtag = g.tag, a = g.key.slice(0, f.ks / 32)), "string" == typeof b && (b = sjcl.codec.utf8String.toBits(b)), 
        "string" == typeof c && (c = sjcl.codec.utf8String.toBits(c)), g = new sjcl.cipher[f.cipher](a), 
        e.d(d, f), d.key = a, f.ct = sjcl.mode[f.mode].encrypt(g, b, f.iv, c, f.ts), e.encode(f);
    },
    decrypt: function(a, b, c, d) {
        c = c || {}, d = d || {};
        var f, e = sjcl.json;
        return c = (b = e.d(e.d(e.d({}, e.defaults), e.decode(b)), c, !0)).adata, "string" == typeof b.salt && (b.salt = sjcl.codec.base64.toBits(b.salt)), 
        "string" == typeof b.iv && (b.iv = sjcl.codec.base64.toBits(b.iv)), (!sjcl.mode[b.mode] || !sjcl.cipher[b.cipher] || "string" == typeof a && b.iter <= 100 || 64 !== b.ts && 96 !== b.ts && 128 !== b.ts || 128 !== b.ks && 192 !== b.ks && 256 !== b.ks || !b.iv || b.iv.length < 2 || 4 < b.iv.length) && q(new sjcl.exception.invalid("json decrypt: invalid parameters")), 
        "string" == typeof a ? (a = (f = sjcl.misc.cachedPbkdf2(a, b)).key.slice(0, b.ks / 32), 
        b.salt = f.salt) : sjcl.ecc && a instanceof sjcl.ecc.elGamal.secretKey && (a = a.unkem(sjcl.codec.base64.toBits(b.kemtag)).slice(0, b.ks / 32)), 
        "string" == typeof c && (c = sjcl.codec.utf8String.toBits(c)), f = new sjcl.cipher[b.cipher](a), 
        c = sjcl.mode[b.mode].decrypt(f, b.ct, b.iv, c, b.ts), e.d(d, b), d.key = a, sjcl.codec.utf8String.fromBits(c);
    },
    encode: function(a) {
        var b, c = "{", d = "";
        for (b in a) if (a.hasOwnProperty(b)) switch (b.match(/^[a-z0-9]+$/i) || q(new sjcl.exception.invalid("json encode: invalid property name")), 
        c += d + '"' + b + '":', d = ",", typeof a[b]) {
          case "number":
          case "boolean":
            c += a[b];
            break;

          case "string":
            c += '"' + escape(a[b]) + '"';
            break;

          case "object":
            c += '"' + sjcl.codec.base64.fromBits(a[b], 0) + '"';
            break;

          default:
            q(new sjcl.exception.bug("json encode: unsupported type"));
        }
        return c + "}";
    },
    decode: function(a) {
        (a = a.replace(/\s/g, "")).match(/^\{.*\}$/) || q(new sjcl.exception.invalid("json decode: this isn't json!")), 
        a = a.replace(/^\{|\}$/g, "").split(/,/);
        var c, d, b = {};
        for (c = 0; c < a.length; c++) (d = a[c].match(/^(?:(["']?)([a-z][a-z0-9]*)\1):(?:(\d+)|"([a-z0-9+\/%*_.@=\-]*)")$/i)) || q(new sjcl.exception.invalid("json decode: this isn't json!")), 
        b[d[2]] = d[3] ? parseInt(d[3], 10) : d[2].match(/^(ct|salt|iv)$/) ? sjcl.codec.base64.toBits(d[4]) : unescape(d[4]);
        return b;
    },
    d: function(a, b, c) {
        if (a === t && (a = {}), b === t) return a;
        for (var d in b) b.hasOwnProperty(d) && (c && a[d] !== t && a[d] !== b[d] && q(new sjcl.exception.invalid("required parameter overridden")), 
        a[d] = b[d]);
        return a;
    },
    Z: function(a, b) {
        var d, c = {};
        for (d in a) a.hasOwnProperty(d) && a[d] !== b[d] && (c[d] = a[d]);
        return c;
    },
    Y: function(a, b) {
        var d, c = {};
        for (d = 0; d < b.length; d++) a[b[d]] !== t && (c[b[d]] = a[b[d]]);
        return c;
    }
}, sjcl.encrypt = sjcl.json.encrypt, sjcl.decrypt = sjcl.json.decrypt, sjcl.misc.X = {}, 
sjcl.misc.cachedPbkdf2 = function(a, b) {
    var d, c = sjcl.misc.X;
    return d = (b = b || {}).iter || 1e3, (d = (c = c[a] = c[a] || {})[d] = c[d] || {
        firstSalt: b.salt && b.salt.length ? b.salt.slice(0) : sjcl.random.randomWords(2, 0)
    })[c = b.salt === t ? d.firstSalt : b.salt] = d[c] || sjcl.misc.pbkdf2(a, c, b.iter), 
    {
        key: d[c].slice(0),
        salt: c.slice(0)
    };
}, Random = {
    getRandomInteger: function(max) {
        var random, bit_length = max.bitLength();
        return random = sjcl.random.randomWords(bit_length / 32, 0), new BigInt(sjcl.codec.hex.fromBits(random), 16).mod(max);
    }
};