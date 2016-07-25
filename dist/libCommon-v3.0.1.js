function uiUploader($log) {
    "use strict";
    function addFiles(files) {
        for (var i = 0; i < files.length; i++) self.files.push(files[i]);
    }
    function getFiles() {
        return self.files;
    }
    function startUpload(options) {
        self.options = options;
        for (var i = 0; i < self.files.length && self.activeUploads != self.options.concurrency; i++) self.files[i].active || ajaxUpload(self.files[i], self.options.url);
    }
    function removeFile(file) {
        self.files.splice(self.files.indexOf(file), 1);
    }
    function removeAll() {
        self.files.splice(0, self.files.length);
    }
    function getHumanSize(bytes) {
        var sizes = [ "n/a", "bytes", "KiB", "MiB", "GiB", "TB", "PB", "EiB", "ZiB", "YiB" ], i = +Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0) + " " + sizes[isNaN(bytes) ? 0 : i + 1];
    }
    function ajaxUpload(file, url) {
        var xhr, formData, prop, data = "", key = "file";
        if (self.activeUploads += 1, file.active = !0, xhr = new window.XMLHttpRequest(), 
        formData = new window.FormData(), xhr.open("POST", url), xhr.upload.onloadstart = function() {}, 
        xhr.upload.onprogress = function(event) {
            event.lengthComputable && (file.loaded = event.loaded, file.humanSize = getHumanSize(event.loaded), 
            self.options.onProgress(file));
        }, xhr.onload = function() {
            self.activeUploads -= 1, startUpload(self.options), self.options.onCompleted(file, xhr.responseText);
        }, xhr.onerror = function() {}, data) for (prop in data) data.hasOwnProperty(prop) && formData.append(prop, data[prop]);
        return formData.append(key, file, file.name), xhr.send(formData), xhr;
    }
    var self = this;
    return self.files = [], self.options = {}, self.activeUploads = 0, $log.info("uiUploader loaded"), 
    {
        addFiles: addFiles,
        getFiles: getFiles,
        files: self.files,
        startUpload: startUpload,
        removeFile: removeFile,
        removeAll: removeAll
    };
}

function RC4(seed) {
    this.s = new Array(256), this.i = 0, this.j = 0;
    for (var i = 0; i < 256; i++) this.s[i] = i;
    seed && this.mix(seed);
}

function RNG(seed) {
    null == seed ? seed = (Math.random() + Date.now()).toString() : "function" == typeof seed ? (this.uniform = seed, 
    this.nextByte = function() {
        return ~~(256 * this.uniform());
    }, seed = null) : "[object String]" !== Object.prototype.toString.call(seed) && (seed = JSON.stringify(seed)), 
    this._normal = null, seed ? this._state = new RC4(seed) : this._state = null;
}

function q(a) {
    throw a;
}

function y(a, b, c) {
    4 !== b.length && q(new sjcl.exception.invalid("invalid aes block size"));
    var d = a.a[c], e = b[0] ^ d[0], f = b[c ? 3 : 1] ^ d[1], g = b[2] ^ d[2];
    b = b[c ? 1 : 3] ^ d[3];
    var h, l, k, m, n = d.length / 4 - 2, p = 4, s = [ 0, 0, 0, 0 ];
    h = a.j[c], a = h[0];
    var r = h[1], v = h[2], w = h[3], x = h[4];
    for (m = 0; m < n; m++) h = a[e >>> 24] ^ r[f >> 16 & 255] ^ v[g >> 8 & 255] ^ w[255 & b] ^ d[p], 
    l = a[f >>> 24] ^ r[g >> 16 & 255] ^ v[b >> 8 & 255] ^ w[255 & e] ^ d[p + 1], k = a[g >>> 24] ^ r[b >> 16 & 255] ^ v[e >> 8 & 255] ^ w[255 & f] ^ d[p + 2], 
    b = a[b >>> 24] ^ r[e >> 16 & 255] ^ v[f >> 8 & 255] ^ w[255 & g] ^ d[p + 3], p += 4, 
    e = h, f = l, g = k;
    for (m = 0; 4 > m; m++) s[c ? 3 & -m : m] = x[e >>> 24] << 24 ^ x[f >> 16 & 255] << 16 ^ x[g >> 8 & 255] << 8 ^ x[255 & b] ^ d[p++], 
    h = e, e = f, f = g, g = b, b = h;
    return s;
}

function z(a, b) {
    var c, d, e, f = b.slice(0), g = a.q, h = a.a, l = g[0], k = g[1], n = g[2], m = g[3], p = g[4], s = g[5], r = g[6], v = g[7];
    for (c = 0; 64 > c; c++) 16 > c ? d = f[c] : (d = f[c + 1 & 15], e = f[c + 14 & 15], 
    d = f[15 & c] = (d >>> 7 ^ d >>> 18 ^ d >>> 3 ^ d << 25 ^ d << 14) + (e >>> 17 ^ e >>> 19 ^ e >>> 10 ^ e << 15 ^ e << 13) + f[15 & c] + f[c + 9 & 15] | 0), 
    d = d + v + (p >>> 6 ^ p >>> 11 ^ p >>> 25 ^ p << 26 ^ p << 21 ^ p << 7) + (r ^ p & (s ^ r)) + h[c], 
    v = r, r = s, s = p, p = m + d | 0, m = n, n = k, k = l, l = d + (k & n ^ m & (k ^ n)) + (k >>> 2 ^ k >>> 13 ^ k >>> 22 ^ k << 30 ^ k << 19 ^ k << 10) | 0;
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
    for (var b = 0; 4 > b && (a.e[b] = a.e[b] + 1 | 0, !a.e[b]); b++) ;
    return a.A.encrypt(a.e);
}

if ("undefined" == typeof jQuery) throw new Error("Bootstrap's JavaScript requires jQuery");

+function($) {
    "use strict";
    function transitionEnd() {
        var el = document.createElement("bootstrap"), transEndEventNames = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd otransitionend",
            transition: "transitionend"
        };
        for (var name in transEndEventNames) if (void 0 !== el.style[name]) return {
            end: transEndEventNames[name]
        };
        return !1;
    }
    $.fn.emulateTransitionEnd = function(duration) {
        var called = !1, $el = this;
        $(this).one($.support.transition.end, function() {
            called = !0;
        });
        var callback = function() {
            called || $($el).trigger($.support.transition.end);
        };
        return setTimeout(callback, duration), this;
    }, $(function() {
        $.support.transition = transitionEnd();
    });
}(jQuery), +function($) {
    "use strict";
    var dismiss = '[data-dismiss="alert"]', Alert = function(el) {
        $(el).on("click", dismiss, this.close);
    };
    Alert.prototype.close = function(e) {
        function removeElement() {
            $parent.trigger("closed.bs.alert").remove();
        }
        var $this = $(this), selector = $this.attr("data-target");
        selector || (selector = $this.attr("href"), selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ""));
        var $parent = $(selector);
        e && e.preventDefault(), $parent.length || ($parent = $this.hasClass("alert") ? $this : $this.parent()), 
        $parent.trigger(e = $.Event("close.bs.alert")), e.isDefaultPrevented() || ($parent.removeClass("in"), 
        $.support.transition && $parent.hasClass("fade") ? $parent.one($.support.transition.end, removeElement).emulateTransitionEnd(150) : removeElement());
    };
    var old = $.fn.alert;
    $.fn.alert = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.alert");
            data || $this.data("bs.alert", data = new Alert(this)), "string" == typeof option && data[option].call($this);
        });
    }, $.fn.alert.Constructor = Alert, $.fn.alert.noConflict = function() {
        return $.fn.alert = old, this;
    }, $(document).on("click.bs.alert.data-api", dismiss, Alert.prototype.close);
}(jQuery), +function($) {
    "use strict";
    var Button = function(element, options) {
        this.$element = $(element), this.options = $.extend({}, Button.DEFAULTS, options), 
        this.isLoading = !1;
    };
    Button.DEFAULTS = {
        loadingText: "loading..."
    }, Button.prototype.setState = function(state) {
        var d = "disabled", $el = this.$element, val = $el.is("input") ? "val" : "html", data = $el.data();
        state += "Text", data.resetText || $el.data("resetText", $el[val]()), $el[val](data[state] || this.options[state]), 
        setTimeout($.proxy(function() {
            "loadingText" == state ? (this.isLoading = !0, $el.addClass(d).attr(d, d)) : this.isLoading && (this.isLoading = !1, 
            $el.removeClass(d).removeAttr(d));
        }, this), 0);
    }, Button.prototype.toggle = function() {
        var changed = !0, $parent = this.$element.closest('[data-toggle="buttons"]');
        if ($parent.length) {
            var $input = this.$element.find("input");
            "radio" == $input.prop("type") && ($input.prop("checked") && this.$element.hasClass("active") ? changed = !1 : $parent.find(".active").removeClass("active")), 
            changed && $input.prop("checked", !this.$element.hasClass("active")).trigger("change");
        }
        changed && this.$element.toggleClass("active");
    };
    var old = $.fn.button;
    $.fn.button = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.button"), options = "object" == typeof option && option;
            data || $this.data("bs.button", data = new Button(this, options)), "toggle" == option ? data.toggle() : option && data.setState(option);
        });
    }, $.fn.button.Constructor = Button, $.fn.button.noConflict = function() {
        return $.fn.button = old, this;
    }, $(document).on("click.bs.button.data-api", "[data-toggle^=button]", function(e) {
        var $btn = $(e.target);
        $btn.hasClass("btn") || ($btn = $btn.closest(".btn")), $btn.button("toggle"), e.preventDefault();
    });
}(jQuery), +function($) {
    "use strict";
    var Carousel = function(element, options) {
        this.$element = $(element), this.$indicators = this.$element.find(".carousel-indicators"), 
        this.options = options, this.paused = this.sliding = this.interval = this.$active = this.$items = null, 
        "hover" == this.options.pause && this.$element.on("mouseenter", $.proxy(this.pause, this)).on("mouseleave", $.proxy(this.cycle, this));
    };
    Carousel.DEFAULTS = {
        interval: 5e3,
        pause: "hover",
        wrap: !0
    }, Carousel.prototype.cycle = function(e) {
        return e || (this.paused = !1), this.interval && clearInterval(this.interval), this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval)), 
        this;
    }, Carousel.prototype.getActiveIndex = function() {
        return this.$active = this.$element.find(".item.active"), this.$items = this.$active.parent().children(), 
        this.$items.index(this.$active);
    }, Carousel.prototype.to = function(pos) {
        var that = this, activeIndex = this.getActiveIndex();
        if (!(pos > this.$items.length - 1 || pos < 0)) return this.sliding ? this.$element.one("slid.bs.carousel", function() {
            that.to(pos);
        }) : activeIndex == pos ? this.pause().cycle() : this.slide(pos > activeIndex ? "next" : "prev", $(this.$items[pos]));
    }, Carousel.prototype.pause = function(e) {
        return e || (this.paused = !0), this.$element.find(".next, .prev").length && $.support.transition && (this.$element.trigger($.support.transition.end), 
        this.cycle(!0)), this.interval = clearInterval(this.interval), this;
    }, Carousel.prototype.next = function() {
        if (!this.sliding) return this.slide("next");
    }, Carousel.prototype.prev = function() {
        if (!this.sliding) return this.slide("prev");
    }, Carousel.prototype.slide = function(type, next) {
        var $active = this.$element.find(".item.active"), $next = next || $active[type](), isCycling = this.interval, direction = "next" == type ? "left" : "right", fallback = "next" == type ? "first" : "last", that = this;
        if (!$next.length) {
            if (!this.options.wrap) return;
            $next = this.$element.find(".item")[fallback]();
        }
        if ($next.hasClass("active")) return this.sliding = !1;
        var e = $.Event("slide.bs.carousel", {
            relatedTarget: $next[0],
            direction: direction
        });
        return this.$element.trigger(e), e.isDefaultPrevented() ? void 0 : (this.sliding = !0, 
        isCycling && this.pause(), this.$indicators.length && (this.$indicators.find(".active").removeClass("active"), 
        this.$element.one("slid.bs.carousel", function() {
            var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
            $nextIndicator && $nextIndicator.addClass("active");
        })), $.support.transition && this.$element.hasClass("slide") ? ($next.addClass(type), 
        $next[0].offsetWidth, $active.addClass(direction), $next.addClass(direction), $active.one($.support.transition.end, function() {
            $next.removeClass([ type, direction ].join(" ")).addClass("active"), $active.removeClass([ "active", direction ].join(" ")), 
            that.sliding = !1, setTimeout(function() {
                that.$element.trigger("slid.bs.carousel");
            }, 0);
        }).emulateTransitionEnd(1e3 * $active.css("transition-duration").slice(0, -1))) : ($active.removeClass("active"), 
        $next.addClass("active"), this.sliding = !1, this.$element.trigger("slid.bs.carousel")), 
        isCycling && this.cycle(), this);
    };
    var old = $.fn.carousel;
    $.fn.carousel = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.carousel"), options = $.extend({}, Carousel.DEFAULTS, $this.data(), "object" == typeof option && option), action = "string" == typeof option ? option : options.slide;
            data || $this.data("bs.carousel", data = new Carousel(this, options)), "number" == typeof option ? data.to(option) : action ? data[action]() : options.interval && data.pause().cycle();
        });
    }, $.fn.carousel.Constructor = Carousel, $.fn.carousel.noConflict = function() {
        return $.fn.carousel = old, this;
    }, $(document).on("click.bs.carousel.data-api", "[data-slide], [data-slide-to]", function(e) {
        var href, $this = $(this), $target = $($this.attr("data-target") || (href = $this.attr("href")) && href.replace(/.*(?=#[^\s]+$)/, "")), options = $.extend({}, $target.data(), $this.data()), slideIndex = $this.attr("data-slide-to");
        slideIndex && (options.interval = !1), $target.carousel(options), (slideIndex = $this.attr("data-slide-to")) && $target.data("bs.carousel").to(slideIndex), 
        e.preventDefault();
    }), $(window).on("load", function() {
        $('[data-ride="carousel"]').each(function() {
            var $carousel = $(this);
            $carousel.carousel($carousel.data());
        });
    });
}(jQuery), +function($) {
    "use strict";
    var Collapse = function(element, options) {
        this.$element = $(element), this.options = $.extend({}, Collapse.DEFAULTS, options), 
        this.transitioning = null, this.options.parent && (this.$parent = $(this.options.parent)), 
        this.options.toggle && this.toggle();
    };
    Collapse.DEFAULTS = {
        toggle: !0
    }, Collapse.prototype.dimension = function() {
        var hasWidth = this.$element.hasClass("width");
        return hasWidth ? "width" : "height";
    }, Collapse.prototype.show = function() {
        if (!this.transitioning && !this.$element.hasClass("in")) {
            var startEvent = $.Event("show.bs.collapse");
            if (this.$element.trigger(startEvent), !startEvent.isDefaultPrevented()) {
                var actives = this.$parent && this.$parent.find("> .panel > .in");
                if (actives && actives.length) {
                    var hasData = actives.data("bs.collapse");
                    if (hasData && hasData.transitioning) return;
                    actives.collapse("hide"), hasData || actives.data("bs.collapse", null);
                }
                var dimension = this.dimension();
                this.$element.removeClass("collapse").addClass("collapsing")[dimension](0), this.transitioning = 1;
                var complete = function() {
                    this.$element.removeClass("collapsing").addClass("collapse in")[dimension]("auto"), 
                    this.transitioning = 0, this.$element.trigger("shown.bs.collapse");
                };
                if (!$.support.transition) return complete.call(this);
                var scrollSize = $.camelCase([ "scroll", dimension ].join("-"));
                this.$element.one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize]);
            }
        }
    }, Collapse.prototype.hide = function() {
        if (!this.transitioning && this.$element.hasClass("in")) {
            var startEvent = $.Event("hide.bs.collapse");
            if (this.$element.trigger(startEvent), !startEvent.isDefaultPrevented()) {
                var dimension = this.dimension();
                this.$element[dimension](this.$element[dimension]())[0].offsetHeight, this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"), 
                this.transitioning = 1;
                var complete = function() {
                    this.transitioning = 0, this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse");
                };
                return $.support.transition ? void this.$element[dimension](0).one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(350) : complete.call(this);
            }
        }
    }, Collapse.prototype.toggle = function() {
        this[this.$element.hasClass("in") ? "hide" : "show"]();
    };
    var old = $.fn.collapse;
    $.fn.collapse = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.collapse"), options = $.extend({}, Collapse.DEFAULTS, $this.data(), "object" == typeof option && option);
            !data && options.toggle && "show" == option && (option = !option), data || $this.data("bs.collapse", data = new Collapse(this, options)), 
            "string" == typeof option && data[option]();
        });
    }, $.fn.collapse.Constructor = Collapse, $.fn.collapse.noConflict = function() {
        return $.fn.collapse = old, this;
    }, $(document).on("click.bs.collapse.data-api", "[data-toggle=collapse]", function(e) {
        var href, $this = $(this), target = $this.attr("data-target") || e.preventDefault() || (href = $this.attr("href")) && href.replace(/.*(?=#[^\s]+$)/, ""), $target = $(target), data = $target.data("bs.collapse"), option = data ? "toggle" : $this.data(), parent = $this.attr("data-parent"), $parent = parent && $(parent);
        data && data.transitioning || ($parent && $parent.find('[data-toggle=collapse][data-parent="' + parent + '"]').not($this).addClass("collapsed"), 
        $this[$target.hasClass("in") ? "addClass" : "removeClass"]("collapsed")), $target.collapse(option);
    });
}(jQuery), +function($) {
    "use strict";
    function clearMenus(e) {
        $(backdrop).remove(), $(toggle).each(function() {
            var $parent = getParent($(this)), relatedTarget = {
                relatedTarget: this
            };
            $parent.hasClass("open") && ($parent.trigger(e = $.Event("hide.bs.dropdown", relatedTarget)), 
            e.isDefaultPrevented() || $parent.removeClass("open").trigger("hidden.bs.dropdown", relatedTarget));
        });
    }
    function getParent($this) {
        var selector = $this.attr("data-target");
        selector || (selector = $this.attr("href"), selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ""));
        var $parent = selector && $(selector);
        return $parent && $parent.length ? $parent : $this.parent();
    }
    var backdrop = ".dropdown-backdrop", toggle = "[data-toggle=dropdown]", Dropdown = function(element) {
        $(element).on("click.bs.dropdown", this.toggle);
    };
    Dropdown.prototype.toggle = function(e) {
        var $this = $(this);
        if (!$this.is(".disabled, :disabled")) {
            var $parent = getParent($this), isActive = $parent.hasClass("open");
            if (clearMenus(), !isActive) {
                "ontouchstart" in document.documentElement && !$parent.closest(".navbar-nav").length && $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on("click", clearMenus);
                var relatedTarget = {
                    relatedTarget: this
                };
                if ($parent.trigger(e = $.Event("show.bs.dropdown", relatedTarget)), e.isDefaultPrevented()) return;
                $parent.toggleClass("open").trigger("shown.bs.dropdown", relatedTarget), $this.focus();
            }
            return !1;
        }
    }, Dropdown.prototype.keydown = function(e) {
        if (/(38|40|27)/.test(e.keyCode)) {
            var $this = $(this);
            if (e.preventDefault(), e.stopPropagation(), !$this.is(".disabled, :disabled")) {
                var $parent = getParent($this), isActive = $parent.hasClass("open");
                if (!isActive || isActive && 27 == e.keyCode) return 27 == e.which && $parent.find(toggle).focus(), 
                $this.click();
                var desc = " li:not(.divider):visible a", $items = $parent.find("[role=menu]" + desc + ", [role=listbox]" + desc);
                if ($items.length) {
                    var index = $items.index($items.filter(":focus"));
                    38 == e.keyCode && index > 0 && index--, 40 == e.keyCode && index < $items.length - 1 && index++, 
                    ~index || (index = 0), $items.eq(index).focus();
                }
            }
        }
    };
    var old = $.fn.dropdown;
    $.fn.dropdown = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.dropdown");
            data || $this.data("bs.dropdown", data = new Dropdown(this)), "string" == typeof option && data[option].call($this);
        });
    }, $.fn.dropdown.Constructor = Dropdown, $.fn.dropdown.noConflict = function() {
        return $.fn.dropdown = old, this;
    }, $(document).on("click.bs.dropdown.data-api", clearMenus).on("click.bs.dropdown.data-api", ".dropdown form", function(e) {
        e.stopPropagation();
    }).on("click.bs.dropdown.data-api", toggle, Dropdown.prototype.toggle).on("keydown.bs.dropdown.data-api", toggle + ", [role=menu], [role=listbox]", Dropdown.prototype.keydown);
}(jQuery), +function($) {
    "use strict";
    var Modal = function(element, options) {
        this.options = options, this.$element = $(element), this.$backdrop = this.isShown = null, 
        this.options.remote && this.$element.find(".modal-content").load(this.options.remote, $.proxy(function() {
            this.$element.trigger("loaded.bs.modal");
        }, this));
    };
    Modal.DEFAULTS = {
        backdrop: !0,
        keyboard: !0,
        show: !0
    }, Modal.prototype.toggle = function(_relatedTarget) {
        return this[this.isShown ? "hide" : "show"](_relatedTarget);
    }, Modal.prototype.show = function(_relatedTarget) {
        var that = this, e = $.Event("show.bs.modal", {
            relatedTarget: _relatedTarget
        });
        this.$element.trigger(e), this.isShown || e.isDefaultPrevented() || (this.isShown = !0, 
        this.escape(), this.$element.on("click.dismiss.bs.modal", '[data-dismiss="modal"]', $.proxy(this.hide, this)), 
        this.backdrop(function() {
            var transition = $.support.transition && that.$element.hasClass("fade");
            that.$element.parent().length || that.$element.appendTo(document.body), that.$element.show().scrollTop(0), 
            transition && that.$element[0].offsetWidth, that.$element.addClass("in").attr("aria-hidden", !1), 
            that.enforceFocus();
            var e = $.Event("shown.bs.modal", {
                relatedTarget: _relatedTarget
            });
            transition ? that.$element.find(".modal-dialog").one($.support.transition.end, function() {
                that.$element.focus().trigger(e);
            }).emulateTransitionEnd(300) : that.$element.focus().trigger(e);
        }));
    }, Modal.prototype.hide = function(e) {
        e && e.preventDefault(), e = $.Event("hide.bs.modal"), this.$element.trigger(e), 
        this.isShown && !e.isDefaultPrevented() && (this.isShown = !1, this.escape(), $(document).off("focusin.bs.modal"), 
        this.$element.removeClass("in").attr("aria-hidden", !0).off("click.dismiss.bs.modal"), 
        $.support.transition && this.$element.hasClass("fade") ? this.$element.one($.support.transition.end, $.proxy(this.hideModal, this)).emulateTransitionEnd(300) : this.hideModal());
    }, Modal.prototype.enforceFocus = function() {
        $(document).off("focusin.bs.modal").on("focusin.bs.modal", $.proxy(function(e) {
            this.$element[0] === e.target || this.$element.has(e.target).length || this.$element.focus();
        }, this));
    }, Modal.prototype.escape = function() {
        this.isShown && this.options.keyboard ? this.$element.on("keyup.dismiss.bs.modal", $.proxy(function(e) {
            27 == e.which && this.hide();
        }, this)) : this.isShown || this.$element.off("keyup.dismiss.bs.modal");
    }, Modal.prototype.hideModal = function() {
        var that = this;
        this.$element.hide(), this.backdrop(function() {
            that.removeBackdrop(), that.$element.trigger("hidden.bs.modal");
        });
    }, Modal.prototype.removeBackdrop = function() {
        this.$backdrop && this.$backdrop.remove(), this.$backdrop = null;
    }, Modal.prototype.backdrop = function(callback) {
        var animate = this.$element.hasClass("fade") ? "fade" : "";
        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;
            if (this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').appendTo(document.body), 
            this.$element.on("click.dismiss.bs.modal", $.proxy(function(e) {
                e.target === e.currentTarget && ("static" == this.options.backdrop ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this));
            }, this)), doAnimate && this.$backdrop[0].offsetWidth, this.$backdrop.addClass("in"), 
            !callback) return;
            doAnimate ? this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback();
        } else !this.isShown && this.$backdrop ? (this.$backdrop.removeClass("in"), $.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one($.support.transition.end, callback).emulateTransitionEnd(150) : callback()) : callback && callback();
    };
    var old = $.fn.modal;
    $.fn.modal = function(option, _relatedTarget) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.modal"), options = $.extend({}, Modal.DEFAULTS, $this.data(), "object" == typeof option && option);
            data || $this.data("bs.modal", data = new Modal(this, options)), "string" == typeof option ? data[option](_relatedTarget) : options.show && data.show(_relatedTarget);
        });
    }, $.fn.modal.Constructor = Modal, $.fn.modal.noConflict = function() {
        return $.fn.modal = old, this;
    }, $(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function(e) {
        var $this = $(this), href = $this.attr("href"), $target = $($this.attr("data-target") || href && href.replace(/.*(?=#[^\s]+$)/, "")), option = $target.data("bs.modal") ? "toggle" : $.extend({
            remote: !/#/.test(href) && href
        }, $target.data(), $this.data());
        $this.is("a") && e.preventDefault(), $target.modal(option, this).one("hide", function() {
            $this.is(":visible") && $this.focus();
        });
    }), $(document).on("show.bs.modal", ".modal", function() {
        $(document.body).addClass("modal-open");
    }).on("hidden.bs.modal", ".modal", function() {
        $(document.body).removeClass("modal-open");
    });
}(jQuery), +function($) {
    "use strict";
    var Tooltip = function(element, options) {
        this.type = this.options = this.enabled = this.timeout = this.hoverState = this.$element = null, 
        this.init("tooltip", element, options);
    };
    Tooltip.DEFAULTS = {
        animation: !0,
        placement: "top",
        selector: !1,
        template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: "hover focus",
        title: "",
        delay: 0,
        html: !1,
        container: !1
    }, Tooltip.prototype.init = function(type, element, options) {
        this.enabled = !0, this.type = type, this.$element = $(element), this.options = this.getOptions(options);
        for (var triggers = this.options.trigger.split(" "), i = triggers.length; i--; ) {
            var trigger = triggers[i];
            if ("click" == trigger) this.$element.on("click." + this.type, this.options.selector, $.proxy(this.toggle, this)); else if ("manual" != trigger) {
                var eventIn = "hover" == trigger ? "mouseenter" : "focusin", eventOut = "hover" == trigger ? "mouseleave" : "focusout";
                this.$element.on(eventIn + "." + this.type, this.options.selector, $.proxy(this.enter, this)), 
                this.$element.on(eventOut + "." + this.type, this.options.selector, $.proxy(this.leave, this));
            }
        }
        this.options.selector ? this._options = $.extend({}, this.options, {
            trigger: "manual",
            selector: ""
        }) : this.fixTitle();
    }, Tooltip.prototype.getDefaults = function() {
        return Tooltip.DEFAULTS;
    }, Tooltip.prototype.getOptions = function(options) {
        return options = $.extend({}, this.getDefaults(), this.$element.data(), options), 
        options.delay && "number" == typeof options.delay && (options.delay = {
            show: options.delay,
            hide: options.delay
        }), options;
    }, Tooltip.prototype.getDelegateOptions = function() {
        var options = {}, defaults = this.getDefaults();
        return this._options && $.each(this._options, function(key, value) {
            defaults[key] != value && (options[key] = value);
        }), options;
    }, Tooltip.prototype.enter = function(obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
        return clearTimeout(self.timeout), self.hoverState = "in", self.options.delay && self.options.delay.show ? void (self.timeout = setTimeout(function() {
            "in" == self.hoverState && self.show();
        }, self.options.delay.show)) : self.show();
    }, Tooltip.prototype.leave = function(obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
        return clearTimeout(self.timeout), self.hoverState = "out", self.options.delay && self.options.delay.hide ? void (self.timeout = setTimeout(function() {
            "out" == self.hoverState && self.hide();
        }, self.options.delay.hide)) : self.hide();
    }, Tooltip.prototype.show = function() {
        var e = $.Event("show.bs." + this.type);
        if (this.hasContent() && this.enabled) {
            if (this.$element.trigger(e), e.isDefaultPrevented()) return;
            var that = this, $tip = this.tip();
            this.setContent(), this.options.animation && $tip.addClass("fade");
            var placement = "function" == typeof this.options.placement ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement, autoToken = /\s?auto?\s?/i, autoPlace = autoToken.test(placement);
            autoPlace && (placement = placement.replace(autoToken, "") || "top"), $tip.detach().css({
                top: 0,
                left: 0,
                display: "block"
            }).addClass(placement), this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
            var pos = this.getPosition(), actualWidth = $tip[0].offsetWidth, actualHeight = $tip[0].offsetHeight;
            if (autoPlace) {
                var $parent = this.$element.parent(), orgPlacement = placement, docScroll = document.documentElement.scrollTop || document.body.scrollTop, parentWidth = "body" == this.options.container ? window.innerWidth : $parent.outerWidth(), parentHeight = "body" == this.options.container ? window.innerHeight : $parent.outerHeight(), parentLeft = "body" == this.options.container ? 0 : $parent.offset().left;
                placement = "bottom" == placement && pos.top + pos.height + actualHeight - docScroll > parentHeight ? "top" : "top" == placement && pos.top - docScroll - actualHeight < 0 ? "bottom" : "right" == placement && pos.right + actualWidth > parentWidth ? "left" : "left" == placement && pos.left - actualWidth < parentLeft ? "right" : placement, 
                $tip.removeClass(orgPlacement).addClass(placement);
            }
            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);
            this.applyPlacement(calculatedOffset, placement), this.hoverState = null;
            var complete = function() {
                that.$element.trigger("shown.bs." + that.type);
            };
            $.support.transition && this.$tip.hasClass("fade") ? $tip.one($.support.transition.end, complete).emulateTransitionEnd(150) : complete();
        }
    }, Tooltip.prototype.applyPlacement = function(offset, placement) {
        var replace, $tip = this.tip(), width = $tip[0].offsetWidth, height = $tip[0].offsetHeight, marginTop = parseInt($tip.css("margin-top"), 10), marginLeft = parseInt($tip.css("margin-left"), 10);
        isNaN(marginTop) && (marginTop = 0), isNaN(marginLeft) && (marginLeft = 0), offset.top = offset.top + marginTop, 
        offset.left = offset.left + marginLeft, $.offset.setOffset($tip[0], $.extend({
            using: function(props) {
                $tip.css({
                    top: Math.round(props.top),
                    left: Math.round(props.left)
                });
            }
        }, offset), 0), $tip.addClass("in");
        var actualWidth = $tip[0].offsetWidth, actualHeight = $tip[0].offsetHeight;
        if ("top" == placement && actualHeight != height && (replace = !0, offset.top = offset.top + height - actualHeight), 
        /bottom|top/.test(placement)) {
            var delta = 0;
            offset.left < 0 && (delta = offset.left * -2, offset.left = 0, $tip.offset(offset), 
            actualWidth = $tip[0].offsetWidth, actualHeight = $tip[0].offsetHeight), this.replaceArrow(delta - width + actualWidth, actualWidth, "left");
        } else this.replaceArrow(actualHeight - height, actualHeight, "top");
        replace && $tip.offset(offset);
    }, Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
        this.arrow().css(position, delta ? 50 * (1 - delta / dimension) + "%" : "");
    }, Tooltip.prototype.setContent = function() {
        var $tip = this.tip(), title = this.getTitle();
        $tip.find(".tooltip-inner")[this.options.html ? "html" : "text"](title), $tip.removeClass("fade in top bottom left right");
    }, Tooltip.prototype.hide = function() {
        function complete() {
            "in" != that.hoverState && $tip.detach(), that.$element.trigger("hidden.bs." + that.type);
        }
        var that = this, $tip = this.tip(), e = $.Event("hide.bs." + this.type);
        if (this.$element.trigger(e), !e.isDefaultPrevented()) return $tip.removeClass("in"), 
        $.support.transition && this.$tip.hasClass("fade") ? $tip.one($.support.transition.end, complete).emulateTransitionEnd(150) : complete(), 
        this.hoverState = null, this;
    }, Tooltip.prototype.fixTitle = function() {
        var $e = this.$element;
        ($e.attr("title") || "string" != typeof $e.attr("data-original-title")) && $e.attr("data-original-title", $e.attr("title") || "").attr("title", "");
    }, Tooltip.prototype.hasContent = function() {
        return this.getTitle();
    }, Tooltip.prototype.getPosition = function() {
        var el = this.$element[0];
        return $.extend({}, "function" == typeof el.getBoundingClientRect ? el.getBoundingClientRect() : {
            width: el.offsetWidth,
            height: el.offsetHeight
        }, this.$element.offset());
    }, Tooltip.prototype.getCalculatedOffset = function(placement, pos, actualWidth, actualHeight) {
        return "bottom" == placement ? {
            top: pos.top + pos.height,
            left: pos.left + pos.width / 2 - actualWidth / 2
        } : "top" == placement ? {
            top: pos.top - actualHeight,
            left: pos.left + pos.width / 2 - actualWidth / 2
        } : "left" == placement ? {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left - actualWidth
        } : {
            top: pos.top + pos.height / 2 - actualHeight / 2,
            left: pos.left + pos.width
        };
    }, Tooltip.prototype.getTitle = function() {
        var title, $e = this.$element, o = this.options;
        return title = $e.attr("data-original-title") || ("function" == typeof o.title ? o.title.call($e[0]) : o.title);
    }, Tooltip.prototype.tip = function() {
        return this.$tip = this.$tip || $(this.options.template);
    }, Tooltip.prototype.arrow = function() {
        return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow");
    }, Tooltip.prototype.validate = function() {
        this.$element[0].parentNode || (this.hide(), this.$element = null, this.options = null);
    }, Tooltip.prototype.enable = function() {
        this.enabled = !0;
    }, Tooltip.prototype.disable = function() {
        this.enabled = !1;
    }, Tooltip.prototype.toggleEnabled = function() {
        this.enabled = !this.enabled;
    }, Tooltip.prototype.toggle = function(e) {
        var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type) : this;
        self.tip().hasClass("in") ? self.leave(self) : self.enter(self);
    }, Tooltip.prototype.destroy = function() {
        clearTimeout(this.timeout), this.hide().$element.off("." + this.type).removeData("bs." + this.type);
    };
    var old = $.fn.tooltip;
    $.fn.tooltip = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.tooltip"), options = "object" == typeof option && option;
            (data || "destroy" != option) && (data || $this.data("bs.tooltip", data = new Tooltip(this, options)), 
            "string" == typeof option && data[option]());
        });
    }, $.fn.tooltip.Constructor = Tooltip, $.fn.tooltip.noConflict = function() {
        return $.fn.tooltip = old, this;
    };
}(jQuery), +function($) {
    "use strict";
    var Popover = function(element, options) {
        this.init("popover", element, options);
    };
    if (!$.fn.tooltip) throw new Error("Popover requires tooltip.js");
    Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
        placement: "right",
        trigger: "click",
        content: "",
        template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    }), Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype), Popover.prototype.constructor = Popover, 
    Popover.prototype.getDefaults = function() {
        return Popover.DEFAULTS;
    }, Popover.prototype.setContent = function() {
        var $tip = this.tip(), title = this.getTitle(), content = this.getContent();
        $tip.find(".popover-title")[this.options.html ? "html" : "text"](title), $tip.find(".popover-content")[this.options.html ? "string" == typeof content ? "html" : "append" : "text"](content), 
        $tip.removeClass("fade top bottom left right in"), $tip.find(".popover-title").html() || $tip.find(".popover-title").hide();
    }, Popover.prototype.hasContent = function() {
        return this.getTitle() || this.getContent();
    }, Popover.prototype.getContent = function() {
        var $e = this.$element, o = this.options;
        return $e.attr("data-content") || ("function" == typeof o.content ? o.content.call($e[0]) : o.content);
    }, Popover.prototype.arrow = function() {
        return this.$arrow = this.$arrow || this.tip().find(".arrow");
    }, Popover.prototype.tip = function() {
        return this.$tip || (this.$tip = $(this.options.template)), this.$tip;
    };
    var old = $.fn.popover;
    $.fn.popover = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.popover"), options = "object" == typeof option && option;
            (data || "destroy" != option) && (data || $this.data("bs.popover", data = new Popover(this, options)), 
            "string" == typeof option && data[option]());
        });
    }, $.fn.popover.Constructor = Popover, $.fn.popover.noConflict = function() {
        return $.fn.popover = old, this;
    };
}(jQuery), +function($) {
    "use strict";
    function ScrollSpy(element, options) {
        var href, process = $.proxy(this.process, this);
        this.$element = $($(element).is("body") ? window : element), this.$body = $("body"), 
        this.$scrollElement = this.$element.on("scroll.bs.scroll-spy.data-api", process), 
        this.options = $.extend({}, ScrollSpy.DEFAULTS, options), this.selector = (this.options.target || (href = $(element).attr("href")) && href.replace(/.*(?=#[^\s]+$)/, "") || "") + " .nav li > a", 
        this.offsets = $([]), this.targets = $([]), this.activeTarget = null, this.refresh(), 
        this.process();
    }
    ScrollSpy.DEFAULTS = {
        offset: 10
    }, ScrollSpy.prototype.refresh = function() {
        var offsetMethod = this.$element[0] == window ? "offset" : "position";
        this.offsets = $([]), this.targets = $([]);
        var self = this;
        this.$body.find(this.selector).map(function() {
            var $el = $(this), href = $el.data("target") || $el.attr("href"), $href = /^#./.test(href) && $(href);
            return $href && $href.length && $href.is(":visible") && [ [ $href[offsetMethod]().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href ] ] || null;
        }).sort(function(a, b) {
            return a[0] - b[0];
        }).each(function() {
            self.offsets.push(this[0]), self.targets.push(this[1]);
        });
    }, ScrollSpy.prototype.process = function() {
        var i, scrollTop = this.$scrollElement.scrollTop() + this.options.offset, scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight, maxScroll = scrollHeight - this.$scrollElement.height(), offsets = this.offsets, targets = this.targets, activeTarget = this.activeTarget;
        if (scrollTop >= maxScroll) return activeTarget != (i = targets.last()[0]) && this.activate(i);
        if (activeTarget && scrollTop <= offsets[0]) return activeTarget != (i = targets[0]) && this.activate(i);
        for (i = offsets.length; i--; ) activeTarget != targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1]) && this.activate(targets[i]);
    }, ScrollSpy.prototype.activate = function(target) {
        this.activeTarget = target, $(this.selector).parentsUntil(this.options.target, ".active").removeClass("active");
        var selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]', active = $(selector).parents("li").addClass("active");
        active.parent(".dropdown-menu").length && (active = active.closest("li.dropdown").addClass("active")), 
        active.trigger("activate.bs.scrollspy");
    };
    var old = $.fn.scrollspy;
    $.fn.scrollspy = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.scrollspy"), options = "object" == typeof option && option;
            data || $this.data("bs.scrollspy", data = new ScrollSpy(this, options)), "string" == typeof option && data[option]();
        });
    }, $.fn.scrollspy.Constructor = ScrollSpy, $.fn.scrollspy.noConflict = function() {
        return $.fn.scrollspy = old, this;
    }, $(window).on("load", function() {
        $('[data-spy="scroll"]').each(function() {
            var $spy = $(this);
            $spy.scrollspy($spy.data());
        });
    });
}(jQuery), +function($) {
    "use strict";
    var Tab = function(element) {
        this.element = $(element);
    };
    Tab.prototype.show = function() {
        var $this = this.element, $ul = $this.closest("ul:not(.dropdown-menu)"), selector = $this.data("target");
        if (selector || (selector = $this.attr("href"), selector = selector && selector.replace(/.*(?=#[^\s]*$)/, "")), 
        !$this.parent("li").hasClass("active")) {
            var previous = $ul.find(".active:last a")[0], e = $.Event("show.bs.tab", {
                relatedTarget: previous
            });
            if ($this.trigger(e), !e.isDefaultPrevented()) {
                var $target = $(selector);
                this.activate($this.parent("li"), $ul), this.activate($target, $target.parent(), function() {
                    $this.trigger({
                        type: "shown.bs.tab",
                        relatedTarget: previous
                    });
                });
            }
        }
    }, Tab.prototype.activate = function(element, container, callback) {
        function next() {
            $active.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"), 
            element.addClass("active"), transition ? (element[0].offsetWidth, element.addClass("in")) : element.removeClass("fade"), 
            element.parent(".dropdown-menu") && element.closest("li.dropdown").addClass("active"), 
            callback && callback();
        }
        var $active = container.find("> .active"), transition = callback && $.support.transition && $active.hasClass("fade");
        transition ? $active.one($.support.transition.end, next).emulateTransitionEnd(150) : next(), 
        $active.removeClass("in");
    };
    var old = $.fn.tab;
    $.fn.tab = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.tab");
            data || $this.data("bs.tab", data = new Tab(this)), "string" == typeof option && data[option]();
        });
    }, $.fn.tab.Constructor = Tab, $.fn.tab.noConflict = function() {
        return $.fn.tab = old, this;
    }, $(document).on("click.bs.tab.data-api", '[data-toggle="tab"], [data-toggle="pill"]', function(e) {
        e.preventDefault(), $(this).tab("show");
    });
}(jQuery), +function($) {
    "use strict";
    var Affix = function(element, options) {
        this.options = $.extend({}, Affix.DEFAULTS, options), this.$window = $(window).on("scroll.bs.affix.data-api", $.proxy(this.checkPosition, this)).on("click.bs.affix.data-api", $.proxy(this.checkPositionWithEventLoop, this)), 
        this.$element = $(element), this.affixed = this.unpin = this.pinnedOffset = null, 
        this.checkPosition();
    };
    Affix.RESET = "affix affix-top affix-bottom", Affix.DEFAULTS = {
        offset: 0
    }, Affix.prototype.getPinnedOffset = function() {
        if (this.pinnedOffset) return this.pinnedOffset;
        this.$element.removeClass(Affix.RESET).addClass("affix");
        var scrollTop = this.$window.scrollTop(), position = this.$element.offset();
        return this.pinnedOffset = position.top - scrollTop;
    }, Affix.prototype.checkPositionWithEventLoop = function() {
        setTimeout($.proxy(this.checkPosition, this), 1);
    }, Affix.prototype.checkPosition = function() {
        if (this.$element.is(":visible")) {
            var scrollHeight = $(document).height(), scrollTop = this.$window.scrollTop(), position = this.$element.offset(), offset = this.options.offset, offsetTop = offset.top, offsetBottom = offset.bottom;
            "top" == this.affixed && (position.top += scrollTop), "object" != typeof offset && (offsetBottom = offsetTop = offset), 
            "function" == typeof offsetTop && (offsetTop = offset.top(this.$element)), "function" == typeof offsetBottom && (offsetBottom = offset.bottom(this.$element));
            var affix = !(null != this.unpin && scrollTop + this.unpin <= position.top) && (null != offsetBottom && position.top + this.$element.height() >= scrollHeight - offsetBottom ? "bottom" : null != offsetTop && scrollTop <= offsetTop && "top");
            if (this.affixed !== affix) {
                this.unpin && this.$element.css("top", "");
                var affixType = "affix" + (affix ? "-" + affix : ""), e = $.Event(affixType + ".bs.affix");
                this.$element.trigger(e), e.isDefaultPrevented() || (this.affixed = affix, this.unpin = "bottom" == affix ? this.getPinnedOffset() : null, 
                this.$element.removeClass(Affix.RESET).addClass(affixType).trigger($.Event(affixType.replace("affix", "affixed"))), 
                "bottom" == affix && this.$element.offset({
                    top: scrollHeight - offsetBottom - this.$element.height()
                }));
            }
        }
    };
    var old = $.fn.affix;
    $.fn.affix = function(option) {
        return this.each(function() {
            var $this = $(this), data = $this.data("bs.affix"), options = "object" == typeof option && option;
            data || $this.data("bs.affix", data = new Affix(this, options)), "string" == typeof option && data[option]();
        });
    }, $.fn.affix.Constructor = Affix, $.fn.affix.noConflict = function() {
        return $.fn.affix = old, this;
    }, $(window).on("load", function() {
        $('[data-spy="affix"]').each(function() {
            var $spy = $(this), data = $spy.data();
            data.offset = data.offset || {}, data.offsetBottom && (data.offset.bottom = data.offsetBottom), 
            data.offsetTop && (data.offset.top = data.offsetTop), $spy.affix(data);
        });
    });
}(jQuery), function() {
    function createReduce(dir) {
        function iterator(obj, iteratee, memo, keys, index, length) {
            for (;index >= 0 && index < length; index += dir) {
                var currentKey = keys ? keys[index] : index;
                memo = iteratee(memo, obj[currentKey], currentKey, obj);
            }
            return memo;
        }
        return function(obj, iteratee, memo, context) {
            iteratee = optimizeCb(iteratee, context, 4);
            var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, index = dir > 0 ? 0 : length - 1;
            return arguments.length < 3 && (memo = obj[keys ? keys[index] : index], index += dir), 
            iterator(obj, iteratee, memo, keys, index, length);
        };
    }
    function createIndexFinder(dir) {
        return function(array, predicate, context) {
            predicate = cb(predicate, context);
            for (var length = null != array && array.length, index = dir > 0 ? 0 : length - 1; index >= 0 && index < length; index += dir) if (predicate(array[index], index, array)) return index;
            return -1;
        };
    }
    function collectNonEnumProps(obj, keys) {
        var nonEnumIdx = nonEnumerableProps.length, constructor = obj.constructor, proto = _.isFunction(constructor) && constructor.prototype || ObjProto, prop = "constructor";
        for (_.has(obj, prop) && !_.contains(keys, prop) && keys.push(prop); nonEnumIdx--; ) prop = nonEnumerableProps[nonEnumIdx], 
        prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop) && keys.push(prop);
    }
    var root = this, previousUnderscore = root._, ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype, push = ArrayProto.push, slice = ArrayProto.slice, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind, nativeCreate = Object.create, Ctor = function() {}, _ = function(obj) {
        return obj instanceof _ ? obj : this instanceof _ ? void (this._wrapped = obj) : new _(obj);
    };
    "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = _), 
    exports._ = _) : root._ = _, _.VERSION = "1.8.2";
    var optimizeCb = function(func, context, argCount) {
        if (void 0 === context) return func;
        switch (null == argCount ? 3 : argCount) {
          case 1:
            return function(value) {
                return func.call(context, value);
            };

          case 2:
            return function(value, other) {
                return func.call(context, value, other);
            };

          case 3:
            return function(value, index, collection) {
                return func.call(context, value, index, collection);
            };

          case 4:
            return function(accumulator, value, index, collection) {
                return func.call(context, accumulator, value, index, collection);
            };
        }
        return function() {
            return func.apply(context, arguments);
        };
    }, cb = function(value, context, argCount) {
        return null == value ? _.identity : _.isFunction(value) ? optimizeCb(value, context, argCount) : _.isObject(value) ? _.matcher(value) : _.property(value);
    };
    _.iteratee = function(value, context) {
        return cb(value, context, 1 / 0);
    };
    var createAssigner = function(keysFunc, undefinedOnly) {
        return function(obj) {
            var length = arguments.length;
            if (length < 2 || null == obj) return obj;
            for (var index = 1; index < length; index++) for (var source = arguments[index], keys = keysFunc(source), l = keys.length, i = 0; i < l; i++) {
                var key = keys[i];
                undefinedOnly && void 0 !== obj[key] || (obj[key] = source[key]);
            }
            return obj;
        };
    }, baseCreate = function(prototype) {
        if (!_.isObject(prototype)) return {};
        if (nativeCreate) return nativeCreate(prototype);
        Ctor.prototype = prototype;
        var result = new Ctor();
        return Ctor.prototype = null, result;
    }, MAX_ARRAY_INDEX = Math.pow(2, 53) - 1, isArrayLike = function(collection) {
        var length = collection && collection.length;
        return "number" == typeof length && length >= 0 && length <= MAX_ARRAY_INDEX;
    };
    _.each = _.forEach = function(obj, iteratee, context) {
        iteratee = optimizeCb(iteratee, context);
        var i, length;
        if (isArrayLike(obj)) for (i = 0, length = obj.length; i < length; i++) iteratee(obj[i], i, obj); else {
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) iteratee(obj[keys[i]], keys[i], obj);
        }
        return obj;
    }, _.map = _.collect = function(obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        for (var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, results = Array(length), index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            results[index] = iteratee(obj[currentKey], currentKey, obj);
        }
        return results;
    }, _.reduce = _.foldl = _.inject = createReduce(1), _.reduceRight = _.foldr = createReduce(-1), 
    _.find = _.detect = function(obj, predicate, context) {
        var key;
        if (key = isArrayLike(obj) ? _.findIndex(obj, predicate, context) : _.findKey(obj, predicate, context), 
        void 0 !== key && key !== -1) return obj[key];
    }, _.filter = _.select = function(obj, predicate, context) {
        var results = [];
        return predicate = cb(predicate, context), _.each(obj, function(value, index, list) {
            predicate(value, index, list) && results.push(value);
        }), results;
    }, _.reject = function(obj, predicate, context) {
        return _.filter(obj, _.negate(cb(predicate)), context);
    }, _.every = _.all = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        for (var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (!predicate(obj[currentKey], currentKey, obj)) return !1;
        }
        return !0;
    }, _.some = _.any = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        for (var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (predicate(obj[currentKey], currentKey, obj)) return !0;
        }
        return !1;
    }, _.contains = _.includes = _.include = function(obj, target, fromIndex) {
        return isArrayLike(obj) || (obj = _.values(obj)), _.indexOf(obj, target, "number" == typeof fromIndex && fromIndex) >= 0;
    }, _.invoke = function(obj, method) {
        var args = slice.call(arguments, 2), isFunc = _.isFunction(method);
        return _.map(obj, function(value) {
            var func = isFunc ? method : value[method];
            return null == func ? func : func.apply(value, args);
        });
    }, _.pluck = function(obj, key) {
        return _.map(obj, _.property(key));
    }, _.where = function(obj, attrs) {
        return _.filter(obj, _.matcher(attrs));
    }, _.findWhere = function(obj, attrs) {
        return _.find(obj, _.matcher(attrs));
    }, _.max = function(obj, iteratee, context) {
        var value, computed, result = -(1 / 0), lastComputed = -(1 / 0);
        if (null == iteratee && null != obj) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) value = obj[i], value > result && (result = value);
        } else iteratee = cb(iteratee, context), _.each(obj, function(value, index, list) {
            computed = iteratee(value, index, list), (computed > lastComputed || computed === -(1 / 0) && result === -(1 / 0)) && (result = value, 
            lastComputed = computed);
        });
        return result;
    }, _.min = function(obj, iteratee, context) {
        var value, computed, result = 1 / 0, lastComputed = 1 / 0;
        if (null == iteratee && null != obj) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) value = obj[i], value < result && (result = value);
        } else iteratee = cb(iteratee, context), _.each(obj, function(value, index, list) {
            computed = iteratee(value, index, list), (computed < lastComputed || computed === 1 / 0 && result === 1 / 0) && (result = value, 
            lastComputed = computed);
        });
        return result;
    }, _.shuffle = function(obj) {
        for (var rand, set = isArrayLike(obj) ? obj : _.values(obj), length = set.length, shuffled = Array(length), index = 0; index < length; index++) rand = _.random(0, index), 
        rand !== index && (shuffled[index] = shuffled[rand]), shuffled[rand] = set[index];
        return shuffled;
    }, _.sample = function(obj, n, guard) {
        return null == n || guard ? (isArrayLike(obj) || (obj = _.values(obj)), obj[_.random(obj.length - 1)]) : _.shuffle(obj).slice(0, Math.max(0, n));
    }, _.sortBy = function(obj, iteratee, context) {
        return iteratee = cb(iteratee, context), _.pluck(_.map(obj, function(value, index, list) {
            return {
                value: value,
                index: index,
                criteria: iteratee(value, index, list)
            };
        }).sort(function(left, right) {
            var a = left.criteria, b = right.criteria;
            if (a !== b) {
                if (a > b || void 0 === a) return 1;
                if (a < b || void 0 === b) return -1;
            }
            return left.index - right.index;
        }), "value");
    };
    var group = function(behavior) {
        return function(obj, iteratee, context) {
            var result = {};
            return iteratee = cb(iteratee, context), _.each(obj, function(value, index) {
                var key = iteratee(value, index, obj);
                behavior(result, value, key);
            }), result;
        };
    };
    _.groupBy = group(function(result, value, key) {
        _.has(result, key) ? result[key].push(value) : result[key] = [ value ];
    }), _.indexBy = group(function(result, value, key) {
        result[key] = value;
    }), _.countBy = group(function(result, value, key) {
        _.has(result, key) ? result[key]++ : result[key] = 1;
    }), _.toArray = function(obj) {
        return obj ? _.isArray(obj) ? slice.call(obj) : isArrayLike(obj) ? _.map(obj, _.identity) : _.values(obj) : [];
    }, _.size = function(obj) {
        return null == obj ? 0 : isArrayLike(obj) ? obj.length : _.keys(obj).length;
    }, _.partition = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        var pass = [], fail = [];
        return _.each(obj, function(value, key, obj) {
            (predicate(value, key, obj) ? pass : fail).push(value);
        }), [ pass, fail ];
    }, _.first = _.head = _.take = function(array, n, guard) {
        if (null != array) return null == n || guard ? array[0] : _.initial(array, array.length - n);
    }, _.initial = function(array, n, guard) {
        return slice.call(array, 0, Math.max(0, array.length - (null == n || guard ? 1 : n)));
    }, _.last = function(array, n, guard) {
        if (null != array) return null == n || guard ? array[array.length - 1] : _.rest(array, Math.max(0, array.length - n));
    }, _.rest = _.tail = _.drop = function(array, n, guard) {
        return slice.call(array, null == n || guard ? 1 : n);
    }, _.compact = function(array) {
        return _.filter(array, _.identity);
    };
    var flatten = function(input, shallow, strict, startIndex) {
        for (var output = [], idx = 0, i = startIndex || 0, length = input && input.length; i < length; i++) {
            var value = input[i];
            if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
                shallow || (value = flatten(value, shallow, strict));
                var j = 0, len = value.length;
                for (output.length += len; j < len; ) output[idx++] = value[j++];
            } else strict || (output[idx++] = value);
        }
        return output;
    };
    _.flatten = function(array, shallow) {
        return flatten(array, shallow, !1);
    }, _.without = function(array) {
        return _.difference(array, slice.call(arguments, 1));
    }, _.uniq = _.unique = function(array, isSorted, iteratee, context) {
        if (null == array) return [];
        _.isBoolean(isSorted) || (context = iteratee, iteratee = isSorted, isSorted = !1), 
        null != iteratee && (iteratee = cb(iteratee, context));
        for (var result = [], seen = [], i = 0, length = array.length; i < length; i++) {
            var value = array[i], computed = iteratee ? iteratee(value, i, array) : value;
            isSorted ? (i && seen === computed || result.push(value), seen = computed) : iteratee ? _.contains(seen, computed) || (seen.push(computed), 
            result.push(value)) : _.contains(result, value) || result.push(value);
        }
        return result;
    }, _.union = function() {
        return _.uniq(flatten(arguments, !0, !0));
    }, _.intersection = function(array) {
        if (null == array) return [];
        for (var result = [], argsLength = arguments.length, i = 0, length = array.length; i < length; i++) {
            var item = array[i];
            if (!_.contains(result, item)) {
                for (var j = 1; j < argsLength && _.contains(arguments[j], item); j++) ;
                j === argsLength && result.push(item);
            }
        }
        return result;
    }, _.difference = function(array) {
        var rest = flatten(arguments, !0, !0, 1);
        return _.filter(array, function(value) {
            return !_.contains(rest, value);
        });
    }, _.zip = function() {
        return _.unzip(arguments);
    }, _.unzip = function(array) {
        for (var length = array && _.max(array, "length").length || 0, result = Array(length), index = 0; index < length; index++) result[index] = _.pluck(array, index);
        return result;
    }, _.object = function(list, values) {
        for (var result = {}, i = 0, length = list && list.length; i < length; i++) values ? result[list[i]] = values[i] : result[list[i][0]] = list[i][1];
        return result;
    }, _.indexOf = function(array, item, isSorted) {
        var i = 0, length = array && array.length;
        if ("number" == typeof isSorted) i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted; else if (isSorted && length) return i = _.sortedIndex(array, item), 
        array[i] === item ? i : -1;
        if (item !== item) return _.findIndex(slice.call(array, i), _.isNaN);
        for (;i < length; i++) if (array[i] === item) return i;
        return -1;
    }, _.lastIndexOf = function(array, item, from) {
        var idx = array ? array.length : 0;
        if ("number" == typeof from && (idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1)), 
        item !== item) return _.findLastIndex(slice.call(array, 0, idx), _.isNaN);
        for (;--idx >= 0; ) if (array[idx] === item) return idx;
        return -1;
    }, _.findIndex = createIndexFinder(1), _.findLastIndex = createIndexFinder(-1), 
    _.sortedIndex = function(array, obj, iteratee, context) {
        iteratee = cb(iteratee, context, 1);
        for (var value = iteratee(obj), low = 0, high = array.length; low < high; ) {
            var mid = Math.floor((low + high) / 2);
            iteratee(array[mid]) < value ? low = mid + 1 : high = mid;
        }
        return low;
    }, _.range = function(start, stop, step) {
        arguments.length <= 1 && (stop = start || 0, start = 0), step = step || 1;
        for (var length = Math.max(Math.ceil((stop - start) / step), 0), range = Array(length), idx = 0; idx < length; idx++, 
        start += step) range[idx] = start;
        return range;
    };
    var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
        if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
        var self = baseCreate(sourceFunc.prototype), result = sourceFunc.apply(self, args);
        return _.isObject(result) ? result : self;
    };
    _.bind = function(func, context) {
        if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        if (!_.isFunction(func)) throw new TypeError("Bind must be called on a function");
        var args = slice.call(arguments, 2), bound = function() {
            return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
        };
        return bound;
    }, _.partial = function(func) {
        var boundArgs = slice.call(arguments, 1), bound = function() {
            for (var position = 0, length = boundArgs.length, args = Array(length), i = 0; i < length; i++) args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
            for (;position < arguments.length; ) args.push(arguments[position++]);
            return executeBound(func, bound, this, this, args);
        };
        return bound;
    }, _.bindAll = function(obj) {
        var i, key, length = arguments.length;
        if (length <= 1) throw new Error("bindAll must be passed function names");
        for (i = 1; i < length; i++) key = arguments[i], obj[key] = _.bind(obj[key], obj);
        return obj;
    }, _.memoize = function(func, hasher) {
        var memoize = function(key) {
            var cache = memoize.cache, address = "" + (hasher ? hasher.apply(this, arguments) : key);
            return _.has(cache, address) || (cache[address] = func.apply(this, arguments)), 
            cache[address];
        };
        return memoize.cache = {}, memoize;
    }, _.delay = function(func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function() {
            return func.apply(null, args);
        }, wait);
    }, _.defer = _.partial(_.delay, _, 1), _.throttle = function(func, wait, options) {
        var context, args, result, timeout = null, previous = 0;
        options || (options = {});
        var later = function() {
            previous = options.leading === !1 ? 0 : _.now(), timeout = null, result = func.apply(context, args), 
            timeout || (context = args = null);
        };
        return function() {
            var now = _.now();
            previous || options.leading !== !1 || (previous = now);
            var remaining = wait - (now - previous);
            return context = this, args = arguments, remaining <= 0 || remaining > wait ? (timeout && (clearTimeout(timeout), 
            timeout = null), previous = now, result = func.apply(context, args), timeout || (context = args = null)) : timeout || options.trailing === !1 || (timeout = setTimeout(later, remaining)), 
            result;
        };
    }, _.debounce = function(func, wait, immediate) {
        var timeout, args, context, timestamp, result, later = function() {
            var last = _.now() - timestamp;
            last < wait && last >= 0 ? timeout = setTimeout(later, wait - last) : (timeout = null, 
            immediate || (result = func.apply(context, args), timeout || (context = args = null)));
        };
        return function() {
            context = this, args = arguments, timestamp = _.now();
            var callNow = immediate && !timeout;
            return timeout || (timeout = setTimeout(later, wait)), callNow && (result = func.apply(context, args), 
            context = args = null), result;
        };
    }, _.wrap = function(func, wrapper) {
        return _.partial(wrapper, func);
    }, _.negate = function(predicate) {
        return function() {
            return !predicate.apply(this, arguments);
        };
    }, _.compose = function() {
        var args = arguments, start = args.length - 1;
        return function() {
            for (var i = start, result = args[start].apply(this, arguments); i--; ) result = args[i].call(this, result);
            return result;
        };
    }, _.after = function(times, func) {
        return function() {
            if (--times < 1) return func.apply(this, arguments);
        };
    }, _.before = function(times, func) {
        var memo;
        return function() {
            return --times > 0 && (memo = func.apply(this, arguments)), times <= 1 && (func = null), 
            memo;
        };
    }, _.once = _.partial(_.before, 2);
    var hasEnumBug = !{
        toString: null
    }.propertyIsEnumerable("toString"), nonEnumerableProps = [ "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString" ];
    _.keys = function(obj) {
        if (!_.isObject(obj)) return [];
        if (nativeKeys) return nativeKeys(obj);
        var keys = [];
        for (var key in obj) _.has(obj, key) && keys.push(key);
        return hasEnumBug && collectNonEnumProps(obj, keys), keys;
    }, _.allKeys = function(obj) {
        if (!_.isObject(obj)) return [];
        var keys = [];
        for (var key in obj) keys.push(key);
        return hasEnumBug && collectNonEnumProps(obj, keys), keys;
    }, _.values = function(obj) {
        for (var keys = _.keys(obj), length = keys.length, values = Array(length), i = 0; i < length; i++) values[i] = obj[keys[i]];
        return values;
    }, _.mapObject = function(obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        for (var currentKey, keys = _.keys(obj), length = keys.length, results = {}, index = 0; index < length; index++) currentKey = keys[index], 
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
        return results;
    }, _.pairs = function(obj) {
        for (var keys = _.keys(obj), length = keys.length, pairs = Array(length), i = 0; i < length; i++) pairs[i] = [ keys[i], obj[keys[i]] ];
        return pairs;
    }, _.invert = function(obj) {
        for (var result = {}, keys = _.keys(obj), i = 0, length = keys.length; i < length; i++) result[obj[keys[i]]] = keys[i];
        return result;
    }, _.functions = _.methods = function(obj) {
        var names = [];
        for (var key in obj) _.isFunction(obj[key]) && names.push(key);
        return names.sort();
    }, _.extend = createAssigner(_.allKeys), _.extendOwn = _.assign = createAssigner(_.keys), 
    _.findKey = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        for (var key, keys = _.keys(obj), i = 0, length = keys.length; i < length; i++) if (key = keys[i], 
        predicate(obj[key], key, obj)) return key;
    }, _.pick = function(object, oiteratee, context) {
        var iteratee, keys, result = {}, obj = object;
        if (null == obj) return result;
        _.isFunction(oiteratee) ? (keys = _.allKeys(obj), iteratee = optimizeCb(oiteratee, context)) : (keys = flatten(arguments, !1, !1, 1), 
        iteratee = function(value, key, obj) {
            return key in obj;
        }, obj = Object(obj));
        for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i], value = obj[key];
            iteratee(value, key, obj) && (result[key] = value);
        }
        return result;
    }, _.omit = function(obj, iteratee, context) {
        if (_.isFunction(iteratee)) iteratee = _.negate(iteratee); else {
            var keys = _.map(flatten(arguments, !1, !1, 1), String);
            iteratee = function(value, key) {
                return !_.contains(keys, key);
            };
        }
        return _.pick(obj, iteratee, context);
    }, _.defaults = createAssigner(_.allKeys, !0), _.clone = function(obj) {
        return _.isObject(obj) ? _.isArray(obj) ? obj.slice() : _.extend({}, obj) : obj;
    }, _.tap = function(obj, interceptor) {
        return interceptor(obj), obj;
    }, _.isMatch = function(object, attrs) {
        var keys = _.keys(attrs), length = keys.length;
        if (null == object) return !length;
        for (var obj = Object(object), i = 0; i < length; i++) {
            var key = keys[i];
            if (attrs[key] !== obj[key] || !(key in obj)) return !1;
        }
        return !0;
    };
    var eq = function(a, b, aStack, bStack) {
        if (a === b) return 0 !== a || 1 / a === 1 / b;
        if (null == a || null == b) return a === b;
        a instanceof _ && (a = a._wrapped), b instanceof _ && (b = b._wrapped);
        var className = toString.call(a);
        if (className !== toString.call(b)) return !1;
        switch (className) {
          case "[object RegExp]":
          case "[object String]":
            return "" + a == "" + b;

          case "[object Number]":
            return +a !== +a ? +b !== +b : 0 === +a ? 1 / +a === 1 / b : +a === +b;

          case "[object Date]":
          case "[object Boolean]":
            return +a === +b;
        }
        var areArrays = "[object Array]" === className;
        if (!areArrays) {
            if ("object" != typeof a || "object" != typeof b) return !1;
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && "constructor" in a && "constructor" in b) return !1;
        }
        aStack = aStack || [], bStack = bStack || [];
        for (var length = aStack.length; length--; ) if (aStack[length] === a) return bStack[length] === b;
        if (aStack.push(a), bStack.push(b), areArrays) {
            if (length = a.length, length !== b.length) return !1;
            for (;length--; ) if (!eq(a[length], b[length], aStack, bStack)) return !1;
        } else {
            var key, keys = _.keys(a);
            if (length = keys.length, _.keys(b).length !== length) return !1;
            for (;length--; ) if (key = keys[length], !_.has(b, key) || !eq(a[key], b[key], aStack, bStack)) return !1;
        }
        return aStack.pop(), bStack.pop(), !0;
    };
    _.isEqual = function(a, b) {
        return eq(a, b);
    }, _.isEmpty = function(obj) {
        return null == obj || (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) ? 0 === obj.length : 0 === _.keys(obj).length);
    }, _.isElement = function(obj) {
        return !(!obj || 1 !== obj.nodeType);
    }, _.isArray = nativeIsArray || function(obj) {
        return "[object Array]" === toString.call(obj);
    }, _.isObject = function(obj) {
        var type = typeof obj;
        return "function" === type || "object" === type && !!obj;
    }, _.each([ "Arguments", "Function", "String", "Number", "Date", "RegExp", "Error" ], function(name) {
        _["is" + name] = function(obj) {
            return toString.call(obj) === "[object " + name + "]";
        };
    }), _.isArguments(arguments) || (_.isArguments = function(obj) {
        return _.has(obj, "callee");
    }), "function" != typeof /./ && "object" != typeof Int8Array && (_.isFunction = function(obj) {
        return "function" == typeof obj || !1;
    }), _.isFinite = function(obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj));
    }, _.isNaN = function(obj) {
        return _.isNumber(obj) && obj !== +obj;
    }, _.isBoolean = function(obj) {
        return obj === !0 || obj === !1 || "[object Boolean]" === toString.call(obj);
    }, _.isNull = function(obj) {
        return null === obj;
    }, _.isUndefined = function(obj) {
        return void 0 === obj;
    }, _.has = function(obj, key) {
        return null != obj && hasOwnProperty.call(obj, key);
    }, _.noConflict = function() {
        return root._ = previousUnderscore, this;
    }, _.identity = function(value) {
        return value;
    }, _.constant = function(value) {
        return function() {
            return value;
        };
    }, _.noop = function() {}, _.property = function(key) {
        return function(obj) {
            return null == obj ? void 0 : obj[key];
        };
    }, _.propertyOf = function(obj) {
        return null == obj ? function() {} : function(key) {
            return obj[key];
        };
    }, _.matcher = _.matches = function(attrs) {
        return attrs = _.extendOwn({}, attrs), function(obj) {
            return _.isMatch(obj, attrs);
        };
    }, _.times = function(n, iteratee, context) {
        var accum = Array(Math.max(0, n));
        iteratee = optimizeCb(iteratee, context, 1);
        for (var i = 0; i < n; i++) accum[i] = iteratee(i);
        return accum;
    }, _.random = function(min, max) {
        return null == max && (max = min, min = 0), min + Math.floor(Math.random() * (max - min + 1));
    }, _.now = Date.now || function() {
        return new Date().getTime();
    };
    var escapeMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "`": "&#x60;"
    }, unescapeMap = _.invert(escapeMap), createEscaper = function(map) {
        var escaper = function(match) {
            return map[match];
        }, source = "(?:" + _.keys(map).join("|") + ")", testRegexp = RegExp(source), replaceRegexp = RegExp(source, "g");
        return function(string) {
            return string = null == string ? "" : "" + string, testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
        };
    };
    _.escape = createEscaper(escapeMap), _.unescape = createEscaper(unescapeMap), _.result = function(object, property, fallback) {
        var value = null == object ? void 0 : object[property];
        return void 0 === value && (value = fallback), _.isFunction(value) ? value.call(object) : value;
    };
    var idCounter = 0;
    _.uniqueId = function(prefix) {
        var id = ++idCounter + "";
        return prefix ? prefix + id : id;
    }, _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };
    var noMatch = /(.)^/, escapes = {
        "'": "'",
        "\\": "\\",
        "\r": "r",
        "\n": "n",
        "\u2028": "u2028",
        "\u2029": "u2029"
    }, escaper = /\\|'|\r|\n|\u2028|\u2029/g, escapeChar = function(match) {
        return "\\" + escapes[match];
    };
    _.template = function(text, settings, oldSettings) {
        !settings && oldSettings && (settings = oldSettings), settings = _.defaults({}, settings, _.templateSettings);
        var matcher = RegExp([ (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source ].join("|") + "|$", "g"), index = 0, source = "__p+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            return source += text.slice(index, offset).replace(escaper, escapeChar), index = offset + match.length, 
            escape ? source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'" : interpolate ? source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'" : evaluate && (source += "';\n" + evaluate + "\n__p+='"), 
            match;
        }), source += "';\n", settings.variable || (source = "with(obj||{}){\n" + source + "}\n"), 
        source = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
        try {
            var render = new Function(settings.variable || "obj", "_", source);
        } catch (e) {
            throw e.source = source, e;
        }
        var template = function(data) {
            return render.call(this, data, _);
        }, argument = settings.variable || "obj";
        return template.source = "function(" + argument + "){\n" + source + "}", template;
    }, _.chain = function(obj) {
        var instance = _(obj);
        return instance._chain = !0, instance;
    };
    var result = function(instance, obj) {
        return instance._chain ? _(obj).chain() : obj;
    };
    _.mixin = function(obj) {
        _.each(_.functions(obj), function(name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function() {
                var args = [ this._wrapped ];
                return push.apply(args, arguments), result(this, func.apply(_, args));
            };
        });
    }, _.mixin(_), _.each([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            var obj = this._wrapped;
            return method.apply(obj, arguments), "shift" !== name && "splice" !== name || 0 !== obj.length || delete obj[0], 
            result(this, obj);
        };
    }), _.each([ "concat", "join", "slice" ], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            return result(this, method.apply(this._wrapped, arguments));
        };
    }), _.prototype.value = function() {
        return this._wrapped;
    }, _.prototype.valueOf = _.prototype.toJSON = _.prototype.value, _.prototype.toString = function() {
        return "" + this._wrapped;
    }, "function" == typeof define && define.amd && define("underscore", [], function() {
        return _;
    });
}.call(this), function(window, document, undefined) {
    "use strict";
    function minErr(module) {
        return function() {
            var message, i, code = arguments[0], prefix = "[" + (module ? module + ":" : "") + code + "] ", template = arguments[1], templateArgs = arguments, stringify = function(obj) {
                return "function" == typeof obj ? obj.toString().replace(/ \{[\s\S]*$/, "") : "undefined" == typeof obj ? "undefined" : "string" != typeof obj ? JSON.stringify(obj) : obj;
            };
            for (message = prefix + template.replace(/\{\d+\}/g, function(match) {
                var arg, index = +match.slice(1, -1);
                return index + 2 < templateArgs.length ? (arg = templateArgs[index + 2], "function" == typeof arg ? arg.toString().replace(/ ?\{[\s\S]*$/, "") : "undefined" == typeof arg ? "undefined" : "string" != typeof arg ? toJson(arg) : arg) : match;
            }), message = message + "\nhttp://errors.angularjs.org/1.2.30/" + (module ? module + "/" : "") + code, 
            i = 2; i < arguments.length; i++) message = message + (2 == i ? "?" : "&") + "p" + (i - 2) + "=" + encodeURIComponent(stringify(arguments[i]));
            return new Error(message);
        };
    }
    function isArrayLike(obj) {
        if (null == obj || isWindow(obj)) return !1;
        var length = obj.length;
        return !(1 !== obj.nodeType || !length) || (isString(obj) || isArray(obj) || 0 === length || "number" == typeof length && length > 0 && length - 1 in obj);
    }
    function forEach(obj, iterator, context) {
        var key;
        if (obj) if (isFunction(obj)) for (key in obj) "prototype" == key || "length" == key || "name" == key || obj.hasOwnProperty && !obj.hasOwnProperty(key) || iterator.call(context, obj[key], key); else if (isArray(obj) || isArrayLike(obj)) for (key = 0; key < obj.length; key++) iterator.call(context, obj[key], key); else if (obj.forEach && obj.forEach !== forEach) obj.forEach(iterator, context); else for (key in obj) obj.hasOwnProperty(key) && iterator.call(context, obj[key], key);
        return obj;
    }
    function sortedKeys(obj) {
        var keys = [];
        for (var key in obj) obj.hasOwnProperty(key) && keys.push(key);
        return keys.sort();
    }
    function forEachSorted(obj, iterator, context) {
        for (var keys = sortedKeys(obj), i = 0; i < keys.length; i++) iterator.call(context, obj[keys[i]], keys[i]);
        return keys;
    }
    function reverseParams(iteratorFn) {
        return function(value, key) {
            iteratorFn(key, value);
        };
    }
    function nextUid() {
        for (var digit, index = uid.length; index; ) {
            if (index--, digit = uid[index].charCodeAt(0), 57 == digit) return uid[index] = "A", 
            uid.join("");
            if (90 != digit) return uid[index] = String.fromCharCode(digit + 1), uid.join("");
            uid[index] = "0";
        }
        return uid.unshift("0"), uid.join("");
    }
    function setHashKey(obj, h) {
        h ? obj.$$hashKey = h : delete obj.$$hashKey;
    }
    function extend(dst) {
        var h = dst.$$hashKey;
        return forEach(arguments, function(obj) {
            obj !== dst && forEach(obj, function(value, key) {
                dst[key] = value;
            });
        }), setHashKey(dst, h), dst;
    }
    function int(str) {
        return parseInt(str, 10);
    }
    function inherit(parent, extra) {
        return extend(new (extend(function() {}, {
            prototype: parent
        }))(), extra);
    }
    function noop() {}
    function identity($) {
        return $;
    }
    function valueFn(value) {
        return function() {
            return value;
        };
    }
    function isUndefined(value) {
        return "undefined" == typeof value;
    }
    function isDefined(value) {
        return "undefined" != typeof value;
    }
    function isObject(value) {
        return null != value && "object" == typeof value;
    }
    function isString(value) {
        return "string" == typeof value;
    }
    function isNumber(value) {
        return "number" == typeof value;
    }
    function isDate(value) {
        return "[object Date]" === toString.call(value);
    }
    function isFunction(value) {
        return "function" == typeof value;
    }
    function isRegExp(value) {
        return "[object RegExp]" === toString.call(value);
    }
    function isWindow(obj) {
        return obj && obj.document && obj.location && obj.alert && obj.setInterval;
    }
    function isScope(obj) {
        return obj && obj.$evalAsync && obj.$watch;
    }
    function isFile(obj) {
        return "[object File]" === toString.call(obj);
    }
    function isBlob(obj) {
        return "[object Blob]" === toString.call(obj);
    }
    function isPromiseLike(obj) {
        return obj && isFunction(obj.then);
    }
    function isElement(node) {
        return !(!node || !(node.nodeName || node.prop && node.attr && node.find));
    }
    function map(obj, iterator, context) {
        var results = [];
        return forEach(obj, function(value, index, list) {
            results.push(iterator.call(context, value, index, list));
        }), results;
    }
    function includes(array, obj) {
        return indexOf(array, obj) != -1;
    }
    function indexOf(array, obj) {
        if (array.indexOf) return array.indexOf(obj);
        for (var i = 0; i < array.length; i++) if (obj === array[i]) return i;
        return -1;
    }
    function arrayRemove(array, value) {
        var index = indexOf(array, value);
        return index >= 0 && array.splice(index, 1), value;
    }
    function copy(source, destination, stackSource, stackDest) {
        if (isWindow(source) || isScope(source)) throw ngMinErr("cpws", "Can't copy! Making copies of Window or Scope instances is not supported.");
        if (destination) {
            if (source === destination) throw ngMinErr("cpi", "Can't copy! Source and destination are identical.");
            if (stackSource = stackSource || [], stackDest = stackDest || [], isObject(source)) {
                var index = indexOf(stackSource, source);
                if (index !== -1) return stackDest[index];
                stackSource.push(source), stackDest.push(destination);
            }
            var result;
            if (isArray(source)) {
                destination.length = 0;
                for (var i = 0; i < source.length; i++) result = copy(source[i], null, stackSource, stackDest), 
                isObject(source[i]) && (stackSource.push(source[i]), stackDest.push(result)), destination.push(result);
            } else {
                var h = destination.$$hashKey;
                isArray(destination) ? destination.length = 0 : forEach(destination, function(value, key) {
                    delete destination[key];
                });
                for (var key in source) result = copy(source[key], null, stackSource, stackDest), 
                isObject(source[key]) && (stackSource.push(source[key]), stackDest.push(result)), 
                destination[key] = result;
                setHashKey(destination, h);
            }
        } else destination = source, source && (isArray(source) ? destination = copy(source, [], stackSource, stackDest) : isDate(source) ? destination = new Date(source.getTime()) : isRegExp(source) ? (destination = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]), 
        destination.lastIndex = source.lastIndex) : isObject(source) && (destination = copy(source, {}, stackSource, stackDest)));
        return destination;
    }
    function shallowCopy(src, dst) {
        if (isArray(src)) {
            dst = dst || [];
            for (var i = 0; i < src.length; i++) dst[i] = src[i];
        } else if (isObject(src)) {
            dst = dst || {};
            for (var key in src) !hasOwnProperty.call(src, key) || "$" === key.charAt(0) && "$" === key.charAt(1) || (dst[key] = src[key]);
        }
        return dst || src;
    }
    function equals(o1, o2) {
        if (o1 === o2) return !0;
        if (null === o1 || null === o2) return !1;
        if (o1 !== o1 && o2 !== o2) return !0;
        var length, key, keySet, t1 = typeof o1, t2 = typeof o2;
        if (t1 == t2 && "object" == t1) {
            if (!isArray(o1)) {
                if (isDate(o1)) return !!isDate(o2) && (isNaN(o1.getTime()) && isNaN(o2.getTime()) || o1.getTime() === o2.getTime());
                if (isRegExp(o1) && isRegExp(o2)) return o1.toString() == o2.toString();
                if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2)) return !1;
                keySet = {};
                for (key in o1) if ("$" !== key.charAt(0) && !isFunction(o1[key])) {
                    if (!equals(o1[key], o2[key])) return !1;
                    keySet[key] = !0;
                }
                for (key in o2) if (!keySet.hasOwnProperty(key) && "$" !== key.charAt(0) && o2[key] !== undefined && !isFunction(o2[key])) return !1;
                return !0;
            }
            if (!isArray(o2)) return !1;
            if ((length = o1.length) == o2.length) {
                for (key = 0; key < length; key++) if (!equals(o1[key], o2[key])) return !1;
                return !0;
            }
        }
        return !1;
    }
    function concat(array1, array2, index) {
        return array1.concat(slice.call(array2, index));
    }
    function sliceArgs(args, startIndex) {
        return slice.call(args, startIndex || 0);
    }
    function bind(self, fn) {
        var curryArgs = arguments.length > 2 ? sliceArgs(arguments, 2) : [];
        return !isFunction(fn) || fn instanceof RegExp ? fn : curryArgs.length ? function() {
            return arguments.length ? fn.apply(self, curryArgs.concat(slice.call(arguments, 0))) : fn.apply(self, curryArgs);
        } : function() {
            return arguments.length ? fn.apply(self, arguments) : fn.call(self);
        };
    }
    function toJsonReplacer(key, value) {
        var val = value;
        return "string" == typeof key && "$" === key.charAt(0) ? val = undefined : isWindow(value) ? val = "$WINDOW" : value && document === value ? val = "$DOCUMENT" : isScope(value) && (val = "$SCOPE"), 
        val;
    }
    function toJson(obj, pretty) {
        return "undefined" == typeof obj ? undefined : JSON.stringify(obj, toJsonReplacer, pretty ? "  " : null);
    }
    function fromJson(json) {
        return isString(json) ? JSON.parse(json) : json;
    }
    function toBoolean(value) {
        if ("function" == typeof value) value = !0; else if (value && 0 !== value.length) {
            var v = lowercase("" + value);
            value = !("f" == v || "0" == v || "false" == v || "no" == v || "n" == v || "[]" == v);
        } else value = !1;
        return value;
    }
    function startingTag(element) {
        element = jqLite(element).clone();
        try {
            element.empty();
        } catch (e) {}
        var TEXT_NODE = 3, elemHtml = jqLite("<div>").append(element).html();
        try {
            return element[0].nodeType === TEXT_NODE ? lowercase(elemHtml) : elemHtml.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/, function(match, nodeName) {
                return "<" + lowercase(nodeName);
            });
        } catch (e) {
            return lowercase(elemHtml);
        }
    }
    function tryDecodeURIComponent(value) {
        try {
            return decodeURIComponent(value);
        } catch (e) {}
    }
    function parseKeyValue(keyValue) {
        var key_value, key, obj = {};
        return forEach((keyValue || "").split("&"), function(keyValue) {
            if (keyValue && (key_value = keyValue.replace(/\+/g, "%20").split("="), key = tryDecodeURIComponent(key_value[0]), 
            isDefined(key))) {
                var val = !isDefined(key_value[1]) || tryDecodeURIComponent(key_value[1]);
                hasOwnProperty.call(obj, key) ? isArray(obj[key]) ? obj[key].push(val) : obj[key] = [ obj[key], val ] : obj[key] = val;
            }
        }), obj;
    }
    function toKeyValue(obj) {
        var parts = [];
        return forEach(obj, function(value, key) {
            isArray(value) ? forEach(value, function(arrayValue) {
                parts.push(encodeUriQuery(key, !0) + (arrayValue === !0 ? "" : "=" + encodeUriQuery(arrayValue, !0)));
            }) : parts.push(encodeUriQuery(key, !0) + (value === !0 ? "" : "=" + encodeUriQuery(value, !0)));
        }), parts.length ? parts.join("&") : "";
    }
    function encodeUriSegment(val) {
        return encodeUriQuery(val, !0).replace(/%26/gi, "&").replace(/%3D/gi, "=").replace(/%2B/gi, "+");
    }
    function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, pctEncodeSpaces ? "%20" : "+");
    }
    function angularInit(element, bootstrap) {
        function append(element) {
            element && elements.push(element);
        }
        var appElement, module, elements = [ element ], names = [ "ng:app", "ng-app", "x-ng-app", "data-ng-app" ], NG_APP_CLASS_REGEXP = /\sng[:\-]app(:\s*([\w\d_]+);?)?\s/;
        forEach(names, function(name) {
            names[name] = !0, append(document.getElementById(name)), name = name.replace(":", "\\:"), 
            element.querySelectorAll && (forEach(element.querySelectorAll("." + name), append), 
            forEach(element.querySelectorAll("." + name + "\\:"), append), forEach(element.querySelectorAll("[" + name + "]"), append));
        }), forEach(elements, function(element) {
            if (!appElement) {
                var className = " " + element.className + " ", match = NG_APP_CLASS_REGEXP.exec(className);
                match ? (appElement = element, module = (match[2] || "").replace(/\s+/g, ",")) : forEach(element.attributes, function(attr) {
                    !appElement && names[attr.name] && (appElement = element, module = attr.value);
                });
            }
        }), appElement && bootstrap(appElement, module ? [ module ] : []);
    }
    function bootstrap(element, modules) {
        var doBootstrap = function() {
            if (element = jqLite(element), element.injector()) {
                var tag = element[0] === document ? "document" : startingTag(element);
                throw ngMinErr("btstrpd", "App Already Bootstrapped with this Element '{0}'", tag.replace(/</, "&lt;").replace(/>/, "&gt;"));
            }
            modules = modules || [], modules.unshift([ "$provide", function($provide) {
                $provide.value("$rootElement", element);
            } ]), modules.unshift("ng");
            var injector = createInjector(modules);
            return injector.invoke([ "$rootScope", "$rootElement", "$compile", "$injector", "$animate", function(scope, element, compile, injector, animate) {
                scope.$apply(function() {
                    element.data("$injector", injector), compile(element)(scope);
                });
            } ]), injector;
        }, NG_DEFER_BOOTSTRAP = /^NG_DEFER_BOOTSTRAP!/;
        return window && !NG_DEFER_BOOTSTRAP.test(window.name) ? doBootstrap() : (window.name = window.name.replace(NG_DEFER_BOOTSTRAP, ""), 
        void (angular.resumeBootstrap = function(extraModules) {
            forEach(extraModules, function(module) {
                modules.push(module);
            }), doBootstrap();
        }));
    }
    function snake_case(name, separator) {
        return separator = separator || "_", name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
            return (pos ? separator : "") + letter.toLowerCase();
        });
    }
    function bindJQuery() {
        jQuery = window.jQuery, jQuery && jQuery.fn.on ? (jqLite = jQuery, extend(jQuery.fn, {
            scope: JQLitePrototype.scope,
            isolateScope: JQLitePrototype.isolateScope,
            controller: JQLitePrototype.controller,
            injector: JQLitePrototype.injector,
            inheritedData: JQLitePrototype.inheritedData
        }), jqLitePatchJQueryRemove("remove", !0, !0, !1), jqLitePatchJQueryRemove("empty", !1, !1, !1), 
        jqLitePatchJQueryRemove("html", !1, !1, !0)) : jqLite = JQLite, angular.element = jqLite;
    }
    function assertArg(arg, name, reason) {
        if (!arg) throw ngMinErr("areq", "Argument '{0}' is {1}", name || "?", reason || "required");
        return arg;
    }
    function assertArgFn(arg, name, acceptArrayAnnotation) {
        return acceptArrayAnnotation && isArray(arg) && (arg = arg[arg.length - 1]), assertArg(isFunction(arg), name, "not a function, got " + (arg && "object" == typeof arg ? arg.constructor.name || "Object" : typeof arg)), 
        arg;
    }
    function assertNotHasOwnProperty(name, context) {
        if ("hasOwnProperty" === name) throw ngMinErr("badname", "hasOwnProperty is not a valid {0} name", context);
    }
    function getter(obj, path, bindFnToScope) {
        if (!path) return obj;
        for (var key, keys = path.split("."), lastInstance = obj, len = keys.length, i = 0; i < len; i++) key = keys[i], 
        obj && (obj = (lastInstance = obj)[key]);
        return !bindFnToScope && isFunction(obj) ? bind(lastInstance, obj) : obj;
    }
    function getBlockElements(nodes) {
        var startNode = nodes[0], endNode = nodes[nodes.length - 1];
        if (startNode === endNode) return jqLite(startNode);
        var element = startNode, elements = [ element ];
        do {
            if (element = element.nextSibling, !element) break;
            elements.push(element);
        } while (element !== endNode);
        return jqLite(elements);
    }
    function setupModuleLoader(window) {
        function ensure(obj, name, factory) {
            return obj[name] || (obj[name] = factory());
        }
        var $injectorMinErr = minErr("$injector"), ngMinErr = minErr("ng"), angular = ensure(window, "angular", Object);
        return angular.$$minErr = angular.$$minErr || minErr, ensure(angular, "module", function() {
            var modules = {};
            return function(name, requires, configFn) {
                var assertNotHasOwnProperty = function(name, context) {
                    if ("hasOwnProperty" === name) throw ngMinErr("badname", "hasOwnProperty is not a valid {0} name", context);
                };
                return assertNotHasOwnProperty(name, "module"), requires && modules.hasOwnProperty(name) && (modules[name] = null), 
                ensure(modules, name, function() {
                    function invokeLater(provider, method, insertMethod) {
                        return function() {
                            return invokeQueue[insertMethod || "push"]([ provider, method, arguments ]), moduleInstance;
                        };
                    }
                    if (!requires) throw $injectorMinErr("nomod", "Module '{0}' is not available! You either misspelled the module name or forgot to load it. If registering a module ensure that you specify the dependencies as the second argument.", name);
                    var invokeQueue = [], runBlocks = [], config = invokeLater("$injector", "invoke"), moduleInstance = {
                        _invokeQueue: invokeQueue,
                        _runBlocks: runBlocks,
                        requires: requires,
                        name: name,
                        provider: invokeLater("$provide", "provider"),
                        factory: invokeLater("$provide", "factory"),
                        service: invokeLater("$provide", "service"),
                        value: invokeLater("$provide", "value"),
                        constant: invokeLater("$provide", "constant", "unshift"),
                        animation: invokeLater("$animateProvider", "register"),
                        filter: invokeLater("$filterProvider", "register"),
                        controller: invokeLater("$controllerProvider", "register"),
                        directive: invokeLater("$compileProvider", "directive"),
                        config: config,
                        run: function(block) {
                            return runBlocks.push(block), this;
                        }
                    };
                    return configFn && config(configFn), moduleInstance;
                });
            };
        });
    }
    function publishExternalAPI(angular) {
        extend(angular, {
            bootstrap: bootstrap,
            copy: copy,
            extend: extend,
            equals: equals,
            element: jqLite,
            forEach: forEach,
            injector: createInjector,
            noop: noop,
            bind: bind,
            toJson: toJson,
            fromJson: fromJson,
            identity: identity,
            isUndefined: isUndefined,
            isDefined: isDefined,
            isString: isString,
            isFunction: isFunction,
            isObject: isObject,
            isNumber: isNumber,
            isElement: isElement,
            isArray: isArray,
            version: version,
            isDate: isDate,
            lowercase: lowercase,
            uppercase: uppercase,
            callbacks: {
                counter: 0
            },
            $$minErr: minErr,
            $$csp: csp
        }), angularModule = setupModuleLoader(window);
        try {
            angularModule("ngLocale");
        } catch (e) {
            angularModule("ngLocale", []).provider("$locale", $LocaleProvider);
        }
        angularModule("ng", [ "ngLocale" ], [ "$provide", function($provide) {
            $provide.provider({
                $$sanitizeUri: $$SanitizeUriProvider
            }), $provide.provider("$compile", $CompileProvider).directive({
                a: htmlAnchorDirective,
                input: inputDirective,
                textarea: inputDirective,
                form: formDirective,
                script: scriptDirective,
                select: selectDirective,
                style: styleDirective,
                option: optionDirective,
                ngBind: ngBindDirective,
                ngBindHtml: ngBindHtmlDirective,
                ngBindTemplate: ngBindTemplateDirective,
                ngClass: ngClassDirective,
                ngClassEven: ngClassEvenDirective,
                ngClassOdd: ngClassOddDirective,
                ngCloak: ngCloakDirective,
                ngController: ngControllerDirective,
                ngForm: ngFormDirective,
                ngHide: ngHideDirective,
                ngIf: ngIfDirective,
                ngInclude: ngIncludeDirective,
                ngInit: ngInitDirective,
                ngNonBindable: ngNonBindableDirective,
                ngPluralize: ngPluralizeDirective,
                ngRepeat: ngRepeatDirective,
                ngShow: ngShowDirective,
                ngStyle: ngStyleDirective,
                ngSwitch: ngSwitchDirective,
                ngSwitchWhen: ngSwitchWhenDirective,
                ngSwitchDefault: ngSwitchDefaultDirective,
                ngOptions: ngOptionsDirective,
                ngTransclude: ngTranscludeDirective,
                ngModel: ngModelDirective,
                ngList: ngListDirective,
                ngChange: ngChangeDirective,
                required: requiredDirective,
                ngRequired: requiredDirective,
                ngValue: ngValueDirective
            }).directive({
                ngInclude: ngIncludeFillContentDirective
            }).directive(ngAttributeAliasDirectives).directive(ngEventDirectives), $provide.provider({
                $anchorScroll: $AnchorScrollProvider,
                $animate: $AnimateProvider,
                $browser: $BrowserProvider,
                $cacheFactory: $CacheFactoryProvider,
                $controller: $ControllerProvider,
                $document: $DocumentProvider,
                $exceptionHandler: $ExceptionHandlerProvider,
                $filter: $FilterProvider,
                $interpolate: $InterpolateProvider,
                $interval: $IntervalProvider,
                $http: $HttpProvider,
                $httpBackend: $HttpBackendProvider,
                $location: $LocationProvider,
                $log: $LogProvider,
                $parse: $ParseProvider,
                $rootScope: $RootScopeProvider,
                $q: $QProvider,
                $sce: $SceProvider,
                $sceDelegate: $SceDelegateProvider,
                $sniffer: $SnifferProvider,
                $templateCache: $TemplateCacheProvider,
                $timeout: $TimeoutProvider,
                $window: $WindowProvider,
                $$rAF: $$RAFProvider,
                $$asyncCallback: $$AsyncCallbackProvider
            });
        } ]);
    }
    function jqNextId() {
        return ++jqId;
    }
    function camelCase(name) {
        return name.replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
        }).replace(MOZ_HACK_REGEXP, "Moz$1");
    }
    function jqLitePatchJQueryRemove(name, dispatchThis, filterElems, getterIfNoArguments) {
        function removePatch(param) {
            var set, setIndex, setLength, element, childIndex, childLength, children, list = filterElems && param ? [ this.filter(param) ] : [ this ], fireEvent = dispatchThis;
            if (!getterIfNoArguments || null != param) for (;list.length; ) for (set = list.shift(), 
            setIndex = 0, setLength = set.length; setIndex < setLength; setIndex++) for (element = jqLite(set[setIndex]), 
            fireEvent ? element.triggerHandler("$destroy") : fireEvent = !fireEvent, childIndex = 0, 
            childLength = (children = element.children()).length; childIndex < childLength; childIndex++) list.push(jQuery(children[childIndex]));
            return originalJqFn.apply(this, arguments);
        }
        var originalJqFn = jQuery.fn[name];
        originalJqFn = originalJqFn.$original || originalJqFn, removePatch.$original = originalJqFn, 
        jQuery.fn[name] = removePatch;
    }
    function jqLiteIsTextNode(html) {
        return !HTML_REGEXP.test(html);
    }
    function jqLiteBuildFragment(html, context) {
        var tmp, tag, wrap, i, j, jj, fragment = context.createDocumentFragment(), nodes = [];
        if (jqLiteIsTextNode(html)) nodes.push(context.createTextNode(html)); else {
            for (tmp = fragment.appendChild(context.createElement("div")), tag = (TAG_NAME_REGEXP.exec(html) || [ "", "" ])[1].toLowerCase(), 
            wrap = wrapMap[tag] || wrapMap._default, tmp.innerHTML = "<div>&#160;</div>" + wrap[1] + html.replace(XHTML_TAG_REGEXP, "<$1></$2>") + wrap[2], 
            tmp.removeChild(tmp.firstChild), i = wrap[0]; i--; ) tmp = tmp.lastChild;
            for (j = 0, jj = tmp.childNodes.length; j < jj; ++j) nodes.push(tmp.childNodes[j]);
            tmp = fragment.firstChild, tmp.textContent = "";
        }
        return fragment.textContent = "", fragment.innerHTML = "", nodes;
    }
    function jqLiteParseHTML(html, context) {
        context = context || document;
        var parsed;
        return (parsed = SINGLE_TAG_REGEXP.exec(html)) ? [ context.createElement(parsed[1]) ] : jqLiteBuildFragment(html, context);
    }
    function JQLite(element) {
        if (element instanceof JQLite) return element;
        if (isString(element) && (element = trim(element)), !(this instanceof JQLite)) {
            if (isString(element) && "<" != element.charAt(0)) throw jqLiteMinErr("nosel", "Looking up elements via selectors is not supported by jqLite! See: http://docs.angularjs.org/api/angular.element");
            return new JQLite(element);
        }
        if (isString(element)) {
            jqLiteAddNodes(this, jqLiteParseHTML(element));
            var fragment = jqLite(document.createDocumentFragment());
            fragment.append(this);
        } else jqLiteAddNodes(this, element);
    }
    function jqLiteClone(element) {
        return element.cloneNode(!0);
    }
    function jqLiteDealoc(element) {
        jqLiteRemoveData(element);
        for (var i = 0, children = element.childNodes || []; i < children.length; i++) jqLiteDealoc(children[i]);
    }
    function jqLiteOff(element, type, fn, unsupported) {
        if (isDefined(unsupported)) throw jqLiteMinErr("offargs", "jqLite#off() does not support the `selector` argument");
        var events = jqLiteExpandoStore(element, "events"), handle = jqLiteExpandoStore(element, "handle");
        handle && (isUndefined(type) ? forEach(events, function(eventHandler, type) {
            removeEventListenerFn(element, type, eventHandler), delete events[type];
        }) : forEach(type.split(" "), function(type) {
            isUndefined(fn) ? (removeEventListenerFn(element, type, events[type]), delete events[type]) : arrayRemove(events[type] || [], fn);
        }));
    }
    function jqLiteRemoveData(element, name) {
        var expandoId = element.ng339, expandoStore = jqCache[expandoId];
        if (expandoStore) {
            if (name) return void delete jqCache[expandoId].data[name];
            expandoStore.handle && (expandoStore.events.$destroy && expandoStore.handle({}, "$destroy"), 
            jqLiteOff(element)), delete jqCache[expandoId], element.ng339 = undefined;
        }
    }
    function jqLiteExpandoStore(element, key, value) {
        var expandoId = element.ng339, expandoStore = jqCache[expandoId || -1];
        return isDefined(value) ? (expandoStore || (element.ng339 = expandoId = jqNextId(), 
        expandoStore = jqCache[expandoId] = {}), void (expandoStore[key] = value)) : expandoStore && expandoStore[key];
    }
    function jqLiteData(element, key, value) {
        var data = jqLiteExpandoStore(element, "data"), isSetter = isDefined(value), keyDefined = !isSetter && isDefined(key), isSimpleGetter = keyDefined && !isObject(key);
        if (data || isSimpleGetter || jqLiteExpandoStore(element, "data", data = {}), isSetter) data[key] = value; else {
            if (!keyDefined) return data;
            if (isSimpleGetter) return data && data[key];
            extend(data, key);
        }
    }
    function jqLiteHasClass(element, selector) {
        return !!element.getAttribute && (" " + (element.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ").indexOf(" " + selector + " ") > -1;
    }
    function jqLiteRemoveClass(element, cssClasses) {
        cssClasses && element.setAttribute && forEach(cssClasses.split(" "), function(cssClass) {
            element.setAttribute("class", trim((" " + (element.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ").replace(" " + trim(cssClass) + " ", " ")));
        });
    }
    function jqLiteAddClass(element, cssClasses) {
        if (cssClasses && element.setAttribute) {
            var existingClasses = (" " + (element.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ");
            forEach(cssClasses.split(" "), function(cssClass) {
                cssClass = trim(cssClass), existingClasses.indexOf(" " + cssClass + " ") === -1 && (existingClasses += cssClass + " ");
            }), element.setAttribute("class", trim(existingClasses));
        }
    }
    function jqLiteAddNodes(root, elements) {
        if (elements) {
            elements = elements.nodeName || !isDefined(elements.length) || isWindow(elements) ? [ elements ] : elements;
            for (var i = 0; i < elements.length; i++) root.push(elements[i]);
        }
    }
    function jqLiteController(element, name) {
        return jqLiteInheritedData(element, "$" + (name || "ngController") + "Controller");
    }
    function jqLiteInheritedData(element, name, value) {
        9 == element.nodeType && (element = element.documentElement);
        for (var names = isArray(name) ? name : [ name ]; element; ) {
            for (var i = 0, ii = names.length; i < ii; i++) if ((value = jqLite.data(element, names[i])) !== undefined) return value;
            element = element.parentNode || 11 === element.nodeType && element.host;
        }
    }
    function jqLiteEmpty(element) {
        for (var i = 0, childNodes = element.childNodes; i < childNodes.length; i++) jqLiteDealoc(childNodes[i]);
        for (;element.firstChild; ) element.removeChild(element.firstChild);
    }
    function getBooleanAttrName(element, name) {
        var booleanAttr = BOOLEAN_ATTR[name.toLowerCase()];
        return booleanAttr && BOOLEAN_ELEMENTS[element.nodeName] && booleanAttr;
    }
    function createEventHandler(element, events) {
        var eventHandler = function(event, type) {
            if (event.preventDefault || (event.preventDefault = function() {
                event.returnValue = !1;
            }), event.stopPropagation || (event.stopPropagation = function() {
                event.cancelBubble = !0;
            }), event.target || (event.target = event.srcElement || document), isUndefined(event.defaultPrevented)) {
                var prevent = event.preventDefault;
                event.preventDefault = function() {
                    event.defaultPrevented = !0, prevent.call(event);
                }, event.defaultPrevented = !1;
            }
            event.isDefaultPrevented = function() {
                return event.defaultPrevented || event.returnValue === !1;
            };
            var eventHandlersCopy = shallowCopy(events[type || event.type] || []);
            forEach(eventHandlersCopy, function(fn) {
                fn.call(element, event);
            }), msie <= 8 ? (event.preventDefault = null, event.stopPropagation = null, event.isDefaultPrevented = null) : (delete event.preventDefault, 
            delete event.stopPropagation, delete event.isDefaultPrevented);
        };
        return eventHandler.elem = element, eventHandler;
    }
    function hashKey(obj, nextUidFn) {
        var key, objType = typeof obj;
        return "function" == objType || "object" == objType && null !== obj ? "function" == typeof (key = obj.$$hashKey) ? key = obj.$$hashKey() : key === undefined && (key = obj.$$hashKey = (nextUidFn || nextUid)()) : key = obj, 
        objType + ":" + key;
    }
    function HashMap(array, isolatedUid) {
        if (isolatedUid) {
            var uid = 0;
            this.nextUid = function() {
                return ++uid;
            };
        }
        forEach(array, this.put, this);
    }
    function annotate(fn) {
        var $inject, fnText, argDecl, last;
        return "function" == typeof fn ? ($inject = fn.$inject) || ($inject = [], fn.length && (fnText = fn.toString().replace(STRIP_COMMENTS, ""), 
        argDecl = fnText.match(FN_ARGS), forEach(argDecl[1].split(FN_ARG_SPLIT), function(arg) {
            arg.replace(FN_ARG, function(all, underscore, name) {
                $inject.push(name);
            });
        })), fn.$inject = $inject) : isArray(fn) ? (last = fn.length - 1, assertArgFn(fn[last], "fn"), 
        $inject = fn.slice(0, last)) : assertArgFn(fn, "fn", !0), $inject;
    }
    function createInjector(modulesToLoad) {
        function supportObject(delegate) {
            return function(key, value) {
                return isObject(key) ? void forEach(key, reverseParams(delegate)) : delegate(key, value);
            };
        }
        function provider(name, provider_) {
            if (assertNotHasOwnProperty(name, "service"), (isFunction(provider_) || isArray(provider_)) && (provider_ = providerInjector.instantiate(provider_)), 
            !provider_.$get) throw $injectorMinErr("pget", "Provider '{0}' must define $get factory method.", name);
            return providerCache[name + providerSuffix] = provider_;
        }
        function factory(name, factoryFn) {
            return provider(name, {
                $get: factoryFn
            });
        }
        function service(name, constructor) {
            return factory(name, [ "$injector", function($injector) {
                return $injector.instantiate(constructor);
            } ]);
        }
        function value(name, val) {
            return factory(name, valueFn(val));
        }
        function constant(name, value) {
            assertNotHasOwnProperty(name, "constant"), providerCache[name] = value, instanceCache[name] = value;
        }
        function decorator(serviceName, decorFn) {
            var origProvider = providerInjector.get(serviceName + providerSuffix), orig$get = origProvider.$get;
            origProvider.$get = function() {
                var origInstance = instanceInjector.invoke(orig$get, origProvider);
                return instanceInjector.invoke(decorFn, null, {
                    $delegate: origInstance
                });
            };
        }
        function loadModules(modulesToLoad) {
            var moduleFn, invokeQueue, i, ii, runBlocks = [];
            return forEach(modulesToLoad, function(module) {
                if (!loadedModules.get(module)) {
                    loadedModules.put(module, !0);
                    try {
                        if (isString(module)) for (moduleFn = angularModule(module), runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks), 
                        invokeQueue = moduleFn._invokeQueue, i = 0, ii = invokeQueue.length; i < ii; i++) {
                            var invokeArgs = invokeQueue[i], provider = providerInjector.get(invokeArgs[0]);
                            provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
                        } else isFunction(module) ? runBlocks.push(providerInjector.invoke(module)) : isArray(module) ? runBlocks.push(providerInjector.invoke(module)) : assertArgFn(module, "module");
                    } catch (e) {
                        throw isArray(module) && (module = module[module.length - 1]), e.message && e.stack && e.stack.indexOf(e.message) == -1 && (e = e.message + "\n" + e.stack), 
                        $injectorMinErr("modulerr", "Failed to instantiate module {0} due to:\n{1}", module, e.stack || e.message || e);
                    }
                }
            }), runBlocks;
        }
        function createInternalInjector(cache, factory) {
            function getService(serviceName) {
                if (cache.hasOwnProperty(serviceName)) {
                    if (cache[serviceName] === INSTANTIATING) throw $injectorMinErr("cdep", "Circular dependency found: {0}", serviceName + " <- " + path.join(" <- "));
                    return cache[serviceName];
                }
                try {
                    return path.unshift(serviceName), cache[serviceName] = INSTANTIATING, cache[serviceName] = factory(serviceName);
                } catch (err) {
                    throw cache[serviceName] === INSTANTIATING && delete cache[serviceName], err;
                } finally {
                    path.shift();
                }
            }
            function invoke(fn, self, locals) {
                var length, i, key, args = [], $inject = annotate(fn);
                for (i = 0, length = $inject.length; i < length; i++) {
                    if (key = $inject[i], "string" != typeof key) throw $injectorMinErr("itkn", "Incorrect injection token! Expected service name as string, got {0}", key);
                    args.push(locals && locals.hasOwnProperty(key) ? locals[key] : getService(key));
                }
                return isArray(fn) && (fn = fn[length]), fn.apply(self, args);
            }
            function instantiate(Type, locals) {
                var instance, returnedValue, Constructor = function() {};
                return Constructor.prototype = (isArray(Type) ? Type[Type.length - 1] : Type).prototype, 
                instance = new Constructor(), returnedValue = invoke(Type, instance, locals), isObject(returnedValue) || isFunction(returnedValue) ? returnedValue : instance;
            }
            return {
                invoke: invoke,
                instantiate: instantiate,
                get: getService,
                annotate: annotate,
                has: function(name) {
                    return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
                }
            };
        }
        var INSTANTIATING = {}, providerSuffix = "Provider", path = [], loadedModules = new HashMap([], (!0)), providerCache = {
            $provide: {
                provider: supportObject(provider),
                factory: supportObject(factory),
                service: supportObject(service),
                value: supportObject(value),
                constant: supportObject(constant),
                decorator: decorator
            }
        }, providerInjector = providerCache.$injector = createInternalInjector(providerCache, function() {
            throw $injectorMinErr("unpr", "Unknown provider: {0}", path.join(" <- "));
        }), instanceCache = {}, instanceInjector = instanceCache.$injector = createInternalInjector(instanceCache, function(servicename) {
            var provider = providerInjector.get(servicename + providerSuffix);
            return instanceInjector.invoke(provider.$get, provider);
        });
        return forEach(loadModules(modulesToLoad), function(fn) {
            instanceInjector.invoke(fn || noop);
        }), instanceInjector;
    }
    function $AnchorScrollProvider() {
        var autoScrollingEnabled = !0;
        this.disableAutoScrolling = function() {
            autoScrollingEnabled = !1;
        }, this.$get = [ "$window", "$location", "$rootScope", function($window, $location, $rootScope) {
            function getFirstAnchor(list) {
                var result = null;
                return forEach(list, function(element) {
                    result || "a" !== lowercase(element.nodeName) || (result = element);
                }), result;
            }
            function scroll() {
                var elm, hash = $location.hash();
                hash ? (elm = document.getElementById(hash)) ? elm.scrollIntoView() : (elm = getFirstAnchor(document.getElementsByName(hash))) ? elm.scrollIntoView() : "top" === hash && $window.scrollTo(0, 0) : $window.scrollTo(0, 0);
            }
            var document = $window.document;
            return autoScrollingEnabled && $rootScope.$watch(function() {
                return $location.hash();
            }, function() {
                $rootScope.$evalAsync(scroll);
            }), scroll;
        } ];
    }
    function $$AsyncCallbackProvider() {
        this.$get = [ "$$rAF", "$timeout", function($$rAF, $timeout) {
            return $$rAF.supported ? function(fn) {
                return $$rAF(fn);
            } : function(fn) {
                return $timeout(fn, 0, !1);
            };
        } ];
    }
    function Browser(window, document, $log, $sniffer) {
        function completeOutstandingRequest(fn) {
            try {
                fn.apply(null, sliceArgs(arguments, 1));
            } finally {
                if (outstandingRequestCount--, 0 === outstandingRequestCount) for (;outstandingRequestCallbacks.length; ) try {
                    outstandingRequestCallbacks.pop()();
                } catch (e) {
                    $log.error(e);
                }
            }
        }
        function getHash(url) {
            var index = url.indexOf("#");
            return index === -1 ? "" : url.substr(index + 1);
        }
        function startPoller(interval, setTimeout) {
            !function check() {
                forEach(pollFns, function(pollFn) {
                    pollFn();
                }), pollTimeout = setTimeout(check, interval);
            }();
        }
        function fireUrlChange() {
            lastBrowserUrl != self.url() && (lastBrowserUrl = self.url(), forEach(urlChangeListeners, function(listener) {
                listener(self.url());
            }));
        }
        var self = this, rawDocument = document[0], location = window.location, history = window.history, setTimeout = window.setTimeout, clearTimeout = window.clearTimeout, pendingDeferIds = {};
        self.isMock = !1;
        var outstandingRequestCount = 0, outstandingRequestCallbacks = [];
        self.$$completeOutstandingRequest = completeOutstandingRequest, self.$$incOutstandingRequestCount = function() {
            outstandingRequestCount++;
        }, self.notifyWhenNoOutstandingRequests = function(callback) {
            forEach(pollFns, function(pollFn) {
                pollFn();
            }), 0 === outstandingRequestCount ? callback() : outstandingRequestCallbacks.push(callback);
        };
        var pollTimeout, pollFns = [];
        self.addPollFn = function(fn) {
            return isUndefined(pollTimeout) && startPoller(100, setTimeout), pollFns.push(fn), 
            fn;
        };
        var lastBrowserUrl = location.href, baseElement = document.find("base"), reloadLocation = null;
        self.url = function(url, replace) {
            if (location !== window.location && (location = window.location), history !== window.history && (history = window.history), 
            url) {
                if (lastBrowserUrl == url) return;
                var sameBase = lastBrowserUrl && stripHash(lastBrowserUrl) === stripHash(url);
                return lastBrowserUrl = url, !sameBase && $sniffer.history ? replace ? history.replaceState(null, "", url) : (history.pushState(null, "", url), 
                baseElement.attr("href", baseElement.attr("href"))) : (sameBase || (reloadLocation = url), 
                replace ? location.replace(url) : sameBase ? location.hash = getHash(url) : location.href = url), 
                self;
            }
            return reloadLocation || location.href.replace(/%27/g, "'");
        };
        var urlChangeListeners = [], urlChangeInit = !1;
        self.onUrlChange = function(callback) {
            return urlChangeInit || ($sniffer.history && jqLite(window).on("popstate", fireUrlChange), 
            $sniffer.hashchange ? jqLite(window).on("hashchange", fireUrlChange) : self.addPollFn(fireUrlChange), 
            urlChangeInit = !0), urlChangeListeners.push(callback), callback;
        }, self.$$checkUrlChange = fireUrlChange, self.baseHref = function() {
            var href = baseElement.attr("href");
            return href ? href.replace(/^(https?\:)?\/\/[^\/]*/, "") : "";
        };
        var lastCookies = {}, lastCookieString = "", cookiePath = self.baseHref();
        self.cookies = function(name, value) {
            var cookieLength, cookieArray, cookie, i, index;
            if (!name) {
                if (rawDocument.cookie !== lastCookieString) for (lastCookieString = rawDocument.cookie, 
                cookieArray = lastCookieString.split("; "), lastCookies = {}, i = 0; i < cookieArray.length; i++) cookie = cookieArray[i], 
                index = cookie.indexOf("="), index > 0 && (name = unescape(cookie.substring(0, index)), 
                lastCookies[name] === undefined && (lastCookies[name] = unescape(cookie.substring(index + 1))));
                return lastCookies;
            }
            value === undefined ? rawDocument.cookie = escape(name) + "=;path=" + cookiePath + ";expires=Thu, 01 Jan 1970 00:00:00 GMT" : isString(value) && (cookieLength = (rawDocument.cookie = escape(name) + "=" + escape(value) + ";path=" + cookiePath).length + 1, 
            cookieLength > 4096 && $log.warn("Cookie '" + name + "' possibly not set or overflowed because it was too large (" + cookieLength + " > 4096 bytes)!"));
        }, self.defer = function(fn, delay) {
            var timeoutId;
            return outstandingRequestCount++, timeoutId = setTimeout(function() {
                delete pendingDeferIds[timeoutId], completeOutstandingRequest(fn);
            }, delay || 0), pendingDeferIds[timeoutId] = !0, timeoutId;
        }, self.defer.cancel = function(deferId) {
            return !!pendingDeferIds[deferId] && (delete pendingDeferIds[deferId], clearTimeout(deferId), 
            completeOutstandingRequest(noop), !0);
        };
    }
    function $BrowserProvider() {
        this.$get = [ "$window", "$log", "$sniffer", "$document", function($window, $log, $sniffer, $document) {
            return new Browser($window, $document, $log, $sniffer);
        } ];
    }
    function $CacheFactoryProvider() {
        this.$get = function() {
            function cacheFactory(cacheId, options) {
                function refresh(entry) {
                    entry != freshEnd && (staleEnd ? staleEnd == entry && (staleEnd = entry.n) : staleEnd = entry, 
                    link(entry.n, entry.p), link(entry, freshEnd), freshEnd = entry, freshEnd.n = null);
                }
                function link(nextEntry, prevEntry) {
                    nextEntry != prevEntry && (nextEntry && (nextEntry.p = prevEntry), prevEntry && (prevEntry.n = nextEntry));
                }
                if (cacheId in caches) throw minErr("$cacheFactory")("iid", "CacheId '{0}' is already taken!", cacheId);
                var size = 0, stats = extend({}, options, {
                    id: cacheId
                }), data = {}, capacity = options && options.capacity || Number.MAX_VALUE, lruHash = {}, freshEnd = null, staleEnd = null;
                return caches[cacheId] = {
                    put: function(key, value) {
                        if (capacity < Number.MAX_VALUE) {
                            var lruEntry = lruHash[key] || (lruHash[key] = {
                                key: key
                            });
                            refresh(lruEntry);
                        }
                        if (!isUndefined(value)) return key in data || size++, data[key] = value, size > capacity && this.remove(staleEnd.key), 
                        value;
                    },
                    get: function(key) {
                        if (capacity < Number.MAX_VALUE) {
                            var lruEntry = lruHash[key];
                            if (!lruEntry) return;
                            refresh(lruEntry);
                        }
                        return data[key];
                    },
                    remove: function(key) {
                        if (capacity < Number.MAX_VALUE) {
                            var lruEntry = lruHash[key];
                            if (!lruEntry) return;
                            lruEntry == freshEnd && (freshEnd = lruEntry.p), lruEntry == staleEnd && (staleEnd = lruEntry.n), 
                            link(lruEntry.n, lruEntry.p), delete lruHash[key];
                        }
                        delete data[key], size--;
                    },
                    removeAll: function() {
                        data = {}, size = 0, lruHash = {}, freshEnd = staleEnd = null;
                    },
                    destroy: function() {
                        data = null, stats = null, lruHash = null, delete caches[cacheId];
                    },
                    info: function() {
                        return extend({}, stats, {
                            size: size
                        });
                    }
                };
            }
            var caches = {};
            return cacheFactory.info = function() {
                var info = {};
                return forEach(caches, function(cache, cacheId) {
                    info[cacheId] = cache.info();
                }), info;
            }, cacheFactory.get = function(cacheId) {
                return caches[cacheId];
            }, cacheFactory;
        };
    }
    function $TemplateCacheProvider() {
        this.$get = [ "$cacheFactory", function($cacheFactory) {
            return $cacheFactory("templates");
        } ];
    }
    function $CompileProvider($provide, $$sanitizeUriProvider) {
        var hasDirectives = {}, Suffix = "Directive", COMMENT_DIRECTIVE_REGEXP = /^\s*directive\:\s*([\d\w_\-]+)\s+(.*)$/, CLASS_DIRECTIVE_REGEXP = /(([\d\w_\-]+)(?:\:([^;]+))?;?)/, EVENT_HANDLER_ATTR_REGEXP = /^(on[a-z]+|formaction)$/;
        this.directive = function registerDirective(name, directiveFactory) {
            return assertNotHasOwnProperty(name, "directive"), isString(name) ? (assertArg(directiveFactory, "directiveFactory"), 
            hasDirectives.hasOwnProperty(name) || (hasDirectives[name] = [], $provide.factory(name + Suffix, [ "$injector", "$exceptionHandler", function($injector, $exceptionHandler) {
                var directives = [];
                return forEach(hasDirectives[name], function(directiveFactory, index) {
                    try {
                        var directive = $injector.invoke(directiveFactory);
                        isFunction(directive) ? directive = {
                            compile: valueFn(directive)
                        } : !directive.compile && directive.link && (directive.compile = valueFn(directive.link)), 
                        directive.priority = directive.priority || 0, directive.index = index, directive.name = directive.name || name, 
                        directive.require = directive.require || directive.controller && directive.name, 
                        directive.restrict = directive.restrict || "A", directives.push(directive);
                    } catch (e) {
                        $exceptionHandler(e);
                    }
                }), directives;
            } ])), hasDirectives[name].push(directiveFactory)) : forEach(name, reverseParams(registerDirective)), 
            this;
        }, this.aHrefSanitizationWhitelist = function(regexp) {
            return isDefined(regexp) ? ($$sanitizeUriProvider.aHrefSanitizationWhitelist(regexp), 
            this) : $$sanitizeUriProvider.aHrefSanitizationWhitelist();
        }, this.imgSrcSanitizationWhitelist = function(regexp) {
            return isDefined(regexp) ? ($$sanitizeUriProvider.imgSrcSanitizationWhitelist(regexp), 
            this) : $$sanitizeUriProvider.imgSrcSanitizationWhitelist();
        }, this.$get = [ "$injector", "$interpolate", "$exceptionHandler", "$http", "$templateCache", "$parse", "$controller", "$rootScope", "$document", "$sce", "$animate", "$$sanitizeUri", function($injector, $interpolate, $exceptionHandler, $http, $templateCache, $parse, $controller, $rootScope, $document, $sce, $animate, $$sanitizeUri) {
            function compile($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext) {
                $compileNodes instanceof jqLite || ($compileNodes = jqLite($compileNodes)), forEach($compileNodes, function(node, index) {
                    3 == node.nodeType && node.nodeValue.match(/\S+/) && ($compileNodes[index] = node = jqLite(node).wrap("<span></span>").parent()[0]);
                });
                var compositeLinkFn = compileNodes($compileNodes, transcludeFn, $compileNodes, maxPriority, ignoreDirective, previousCompileContext);
                return safeAddClass($compileNodes, "ng-scope"), function(scope, cloneConnectFn, transcludeControllers, parentBoundTranscludeFn) {
                    assertArg(scope, "scope");
                    var $linkNode = cloneConnectFn ? JQLitePrototype.clone.call($compileNodes) : $compileNodes;
                    forEach(transcludeControllers, function(instance, name) {
                        $linkNode.data("$" + name + "Controller", instance);
                    });
                    for (var i = 0, ii = $linkNode.length; i < ii; i++) {
                        var node = $linkNode[i], nodeType = node.nodeType;
                        1 !== nodeType && 9 !== nodeType || $linkNode.eq(i).data("$scope", scope);
                    }
                    return cloneConnectFn && cloneConnectFn($linkNode, scope), compositeLinkFn && compositeLinkFn(scope, $linkNode, $linkNode, parentBoundTranscludeFn), 
                    $linkNode;
                };
            }
            function safeAddClass($element, className) {
                try {
                    $element.addClass(className);
                } catch (e) {}
            }
            function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext) {
                function compositeLinkFn(scope, nodeList, $rootElement, parentBoundTranscludeFn) {
                    var nodeLinkFn, childLinkFn, node, childScope, i, ii, n, childBoundTranscludeFn, nodeListLength = nodeList.length, stableNodeList = new Array(nodeListLength);
                    for (i = 0; i < nodeListLength; i++) stableNodeList[i] = nodeList[i];
                    for (i = 0, n = 0, ii = linkFns.length; i < ii; n++) node = stableNodeList[n], nodeLinkFn = linkFns[i++], 
                    childLinkFn = linkFns[i++], nodeLinkFn ? (nodeLinkFn.scope ? (childScope = scope.$new(), 
                    jqLite.data(node, "$scope", childScope)) : childScope = scope, childBoundTranscludeFn = nodeLinkFn.transcludeOnThisElement ? createBoundTranscludeFn(scope, nodeLinkFn.transclude, parentBoundTranscludeFn) : !nodeLinkFn.templateOnThisElement && parentBoundTranscludeFn ? parentBoundTranscludeFn : !parentBoundTranscludeFn && transcludeFn ? createBoundTranscludeFn(scope, transcludeFn) : null, 
                    nodeLinkFn(childLinkFn, childScope, node, $rootElement, childBoundTranscludeFn)) : childLinkFn && childLinkFn(scope, node.childNodes, undefined, parentBoundTranscludeFn);
                }
                for (var attrs, directives, nodeLinkFn, childNodes, childLinkFn, linkFnFound, linkFns = [], i = 0; i < nodeList.length; i++) attrs = new Attributes(), 
                directives = collectDirectives(nodeList[i], [], attrs, 0 === i ? maxPriority : undefined, ignoreDirective), 
                nodeLinkFn = directives.length ? applyDirectivesToNode(directives, nodeList[i], attrs, transcludeFn, $rootElement, null, [], [], previousCompileContext) : null, 
                nodeLinkFn && nodeLinkFn.scope && safeAddClass(attrs.$$element, "ng-scope"), childLinkFn = nodeLinkFn && nodeLinkFn.terminal || !(childNodes = nodeList[i].childNodes) || !childNodes.length ? null : compileNodes(childNodes, nodeLinkFn ? (nodeLinkFn.transcludeOnThisElement || !nodeLinkFn.templateOnThisElement) && nodeLinkFn.transclude : transcludeFn), 
                linkFns.push(nodeLinkFn, childLinkFn), linkFnFound = linkFnFound || nodeLinkFn || childLinkFn, 
                previousCompileContext = null;
                return linkFnFound ? compositeLinkFn : null;
            }
            function createBoundTranscludeFn(scope, transcludeFn, previousBoundTranscludeFn) {
                var boundTranscludeFn = function(transcludedScope, cloneFn, controllers) {
                    var scopeCreated = !1;
                    transcludedScope || (transcludedScope = scope.$new(), transcludedScope.$$transcluded = !0, 
                    scopeCreated = !0);
                    var clone = transcludeFn(transcludedScope, cloneFn, controllers, previousBoundTranscludeFn);
                    return scopeCreated && clone.on("$destroy", function() {
                        transcludedScope.$destroy();
                    }), clone;
                };
                return boundTranscludeFn;
            }
            function collectDirectives(node, directives, attrs, maxPriority, ignoreDirective) {
                var match, className, nodeType = node.nodeType, attrsMap = attrs.$attr;
                switch (nodeType) {
                  case 1:
                    addDirective(directives, directiveNormalize(nodeName_(node).toLowerCase()), "E", maxPriority, ignoreDirective);
                    for (var attr, name, nName, ngAttrName, value, isNgAttr, nAttrs = node.attributes, j = 0, jj = nAttrs && nAttrs.length; j < jj; j++) {
                        var attrStartName = !1, attrEndName = !1;
                        if (attr = nAttrs[j], !msie || msie >= 8 || attr.specified) {
                            name = attr.name, value = trim(attr.value), ngAttrName = directiveNormalize(name), 
                            (isNgAttr = NG_ATTR_BINDING.test(ngAttrName)) && (name = snake_case(ngAttrName.substr(6), "-"));
                            var directiveNName = ngAttrName.replace(/(Start|End)$/, "");
                            ngAttrName === directiveNName + "Start" && (attrStartName = name, attrEndName = name.substr(0, name.length - 5) + "end", 
                            name = name.substr(0, name.length - 6)), nName = directiveNormalize(name.toLowerCase()), 
                            attrsMap[nName] = name, !isNgAttr && attrs.hasOwnProperty(nName) || (attrs[nName] = value, 
                            getBooleanAttrName(node, nName) && (attrs[nName] = !0)), addAttrInterpolateDirective(node, directives, value, nName), 
                            addDirective(directives, nName, "A", maxPriority, ignoreDirective, attrStartName, attrEndName);
                        }
                    }
                    if (className = node.className, isString(className) && "" !== className) for (;match = CLASS_DIRECTIVE_REGEXP.exec(className); ) nName = directiveNormalize(match[2]), 
                    addDirective(directives, nName, "C", maxPriority, ignoreDirective) && (attrs[nName] = trim(match[3])), 
                    className = className.substr(match.index + match[0].length);
                    break;

                  case 3:
                    if (11 === msie) for (;node.parentNode && node.nextSibling && 3 === node.nextSibling.nodeType; ) node.nodeValue = node.nodeValue + node.nextSibling.nodeValue, 
                    node.parentNode.removeChild(node.nextSibling);
                    addTextInterpolateDirective(directives, node.nodeValue);
                    break;

                  case 8:
                    try {
                        match = COMMENT_DIRECTIVE_REGEXP.exec(node.nodeValue), match && (nName = directiveNormalize(match[1]), 
                        addDirective(directives, nName, "M", maxPriority, ignoreDirective) && (attrs[nName] = trim(match[2])));
                    } catch (e) {}
                }
                return directives.sort(byPriority), directives;
            }
            function groupScan(node, attrStart, attrEnd) {
                var nodes = [], depth = 0;
                if (attrStart && node.hasAttribute && node.hasAttribute(attrStart)) {
                    do {
                        if (!node) throw $compileMinErr("uterdir", "Unterminated attribute, found '{0}' but no matching '{1}' found.", attrStart, attrEnd);
                        1 == node.nodeType && (node.hasAttribute(attrStart) && depth++, node.hasAttribute(attrEnd) && depth--), 
                        nodes.push(node), node = node.nextSibling;
                    } while (depth > 0);
                } else nodes.push(node);
                return jqLite(nodes);
            }
            function groupElementsLinkFnWrapper(linkFn, attrStart, attrEnd) {
                return function(scope, element, attrs, controllers, transcludeFn) {
                    return element = groupScan(element[0], attrStart, attrEnd), linkFn(scope, element, attrs, controllers, transcludeFn);
                };
            }
            function applyDirectivesToNode(directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns, previousCompileContext) {
                function addLinkFns(pre, post, attrStart, attrEnd) {
                    pre && (attrStart && (pre = groupElementsLinkFnWrapper(pre, attrStart, attrEnd)), 
                    pre.require = directive.require, pre.directiveName = directiveName, (newIsolateScopeDirective === directive || directive.$$isolateScope) && (pre = cloneAndAnnotateFn(pre, {
                        isolateScope: !0
                    })), preLinkFns.push(pre)), post && (attrStart && (post = groupElementsLinkFnWrapper(post, attrStart, attrEnd)), 
                    post.require = directive.require, post.directiveName = directiveName, (newIsolateScopeDirective === directive || directive.$$isolateScope) && (post = cloneAndAnnotateFn(post, {
                        isolateScope: !0
                    })), postLinkFns.push(post));
                }
                function getControllers(directiveName, require, $element, elementControllers) {
                    var value, retrievalMethod = "data", optional = !1;
                    if (isString(require)) {
                        for (;"^" == (value = require.charAt(0)) || "?" == value; ) require = require.substr(1), 
                        "^" == value && (retrievalMethod = "inheritedData"), optional = optional || "?" == value;
                        if (value = null, elementControllers && "data" === retrievalMethod && (value = elementControllers[require]), 
                        value = value || $element[retrievalMethod]("$" + require + "Controller"), !value && !optional) throw $compileMinErr("ctreq", "Controller '{0}', required by directive '{1}', can't be found!", require, directiveName);
                        return value;
                    }
                    return isArray(require) && (value = [], forEach(require, function(require) {
                        value.push(getControllers(directiveName, require, $element, elementControllers));
                    })), value;
                }
                function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement, boundTranscludeFn) {
                    function controllersBoundTransclude(scope, cloneAttachFn) {
                        var transcludeControllers;
                        return arguments.length < 2 && (cloneAttachFn = scope, scope = undefined), hasElementTranscludeDirective && (transcludeControllers = elementControllers), 
                        boundTranscludeFn(scope, cloneAttachFn, transcludeControllers);
                    }
                    var attrs, $element, i, ii, linkFn, controller, isolateScope, transcludeFn, elementControllers = {};
                    if (attrs = compileNode === linkNode ? templateAttrs : shallowCopy(templateAttrs, new Attributes(jqLite(linkNode), templateAttrs.$attr)), 
                    $element = attrs.$$element, newIsolateScopeDirective) {
                        var LOCAL_REGEXP = /^\s*([@=&])(\??)\s*(\w*)\s*$/;
                        isolateScope = scope.$new(!0), !templateDirective || templateDirective !== newIsolateScopeDirective && templateDirective !== newIsolateScopeDirective.$$originalDirective ? $element.data("$isolateScopeNoTemplate", isolateScope) : $element.data("$isolateScope", isolateScope), 
                        safeAddClass($element, "ng-isolate-scope"), forEach(newIsolateScopeDirective.scope, function(definition, scopeName) {
                            var lastValue, parentGet, parentSet, compare, match = definition.match(LOCAL_REGEXP) || [], attrName = match[3] || scopeName, optional = "?" == match[2], mode = match[1];
                            switch (isolateScope.$$isolateBindings[scopeName] = mode + attrName, mode) {
                              case "@":
                                attrs.$observe(attrName, function(value) {
                                    isolateScope[scopeName] = value;
                                }), attrs.$$observers[attrName].$$scope = scope, attrs[attrName] && (isolateScope[scopeName] = $interpolate(attrs[attrName])(scope));
                                break;

                              case "=":
                                if (optional && !attrs[attrName]) return;
                                parentGet = $parse(attrs[attrName]), compare = parentGet.literal ? equals : function(a, b) {
                                    return a === b || a !== a && b !== b;
                                }, parentSet = parentGet.assign || function() {
                                    throw lastValue = isolateScope[scopeName] = parentGet(scope), $compileMinErr("nonassign", "Expression '{0}' used with directive '{1}' is non-assignable!", attrs[attrName], newIsolateScopeDirective.name);
                                }, lastValue = isolateScope[scopeName] = parentGet(scope), isolateScope.$watch(function() {
                                    var parentValue = parentGet(scope);
                                    return compare(parentValue, isolateScope[scopeName]) || (compare(parentValue, lastValue) ? parentSet(scope, parentValue = isolateScope[scopeName]) : isolateScope[scopeName] = parentValue), 
                                    lastValue = parentValue;
                                }, null, parentGet.literal);
                                break;

                              case "&":
                                parentGet = $parse(attrs[attrName]), isolateScope[scopeName] = function(locals) {
                                    return parentGet(scope, locals);
                                };
                                break;

                              default:
                                throw $compileMinErr("iscp", "Invalid isolate scope definition for directive '{0}'. Definition: {... {1}: '{2}' ...}", newIsolateScopeDirective.name, scopeName, definition);
                            }
                        });
                    }
                    for (transcludeFn = boundTranscludeFn && controllersBoundTransclude, controllerDirectives && forEach(controllerDirectives, function(directive) {
                        var controllerInstance, locals = {
                            $scope: directive === newIsolateScopeDirective || directive.$$isolateScope ? isolateScope : scope,
                            $element: $element,
                            $attrs: attrs,
                            $transclude: transcludeFn
                        };
                        controller = directive.controller, "@" == controller && (controller = attrs[directive.name]), 
                        controllerInstance = $controller(controller, locals), elementControllers[directive.name] = controllerInstance, 
                        hasElementTranscludeDirective || $element.data("$" + directive.name + "Controller", controllerInstance), 
                        directive.controllerAs && (locals.$scope[directive.controllerAs] = controllerInstance);
                    }), i = 0, ii = preLinkFns.length; i < ii; i++) try {
                        linkFn = preLinkFns[i], linkFn(linkFn.isolateScope ? isolateScope : scope, $element, attrs, linkFn.require && getControllers(linkFn.directiveName, linkFn.require, $element, elementControllers), transcludeFn);
                    } catch (e) {
                        $exceptionHandler(e, startingTag($element));
                    }
                    var scopeToChild = scope;
                    for (newIsolateScopeDirective && (newIsolateScopeDirective.template || null === newIsolateScopeDirective.templateUrl) && (scopeToChild = isolateScope), 
                    childLinkFn && childLinkFn(scopeToChild, linkNode.childNodes, undefined, boundTranscludeFn), 
                    i = postLinkFns.length - 1; i >= 0; i--) try {
                        linkFn = postLinkFns[i], linkFn(linkFn.isolateScope ? isolateScope : scope, $element, attrs, linkFn.require && getControllers(linkFn.directiveName, linkFn.require, $element, elementControllers), transcludeFn);
                    } catch (e) {
                        $exceptionHandler(e, startingTag($element));
                    }
                }
                previousCompileContext = previousCompileContext || {};
                for (var newScopeDirective, directive, directiveName, $template, linkFn, directiveValue, terminalPriority = -Number.MAX_VALUE, controllerDirectives = previousCompileContext.controllerDirectives, newIsolateScopeDirective = previousCompileContext.newIsolateScopeDirective, templateDirective = previousCompileContext.templateDirective, nonTlbTranscludeDirective = previousCompileContext.nonTlbTranscludeDirective, hasTranscludeDirective = !1, hasTemplate = !1, hasElementTranscludeDirective = previousCompileContext.hasElementTranscludeDirective, $compileNode = templateAttrs.$$element = jqLite(compileNode), replaceDirective = originalReplaceDirective, childTranscludeFn = transcludeFn, i = 0, ii = directives.length; i < ii; i++) {
                    directive = directives[i];
                    var attrStart = directive.$$start, attrEnd = directive.$$end;
                    if (attrStart && ($compileNode = groupScan(compileNode, attrStart, attrEnd)), $template = undefined, 
                    terminalPriority > directive.priority) break;
                    if ((directiveValue = directive.scope) && (newScopeDirective = newScopeDirective || directive, 
                    directive.templateUrl || (assertNoDuplicate("new/isolated scope", newIsolateScopeDirective, directive, $compileNode), 
                    isObject(directiveValue) && (newIsolateScopeDirective = directive))), directiveName = directive.name, 
                    !directive.templateUrl && directive.controller && (directiveValue = directive.controller, 
                    controllerDirectives = controllerDirectives || {}, assertNoDuplicate("'" + directiveName + "' controller", controllerDirectives[directiveName], directive, $compileNode), 
                    controllerDirectives[directiveName] = directive), (directiveValue = directive.transclude) && (hasTranscludeDirective = !0, 
                    directive.$$tlb || (assertNoDuplicate("transclusion", nonTlbTranscludeDirective, directive, $compileNode), 
                    nonTlbTranscludeDirective = directive), "element" == directiveValue ? (hasElementTranscludeDirective = !0, 
                    terminalPriority = directive.priority, $template = $compileNode, $compileNode = templateAttrs.$$element = jqLite(document.createComment(" " + directiveName + ": " + templateAttrs[directiveName] + " ")), 
                    compileNode = $compileNode[0], replaceWith(jqCollection, sliceArgs($template), compileNode), 
                    childTranscludeFn = compile($template, transcludeFn, terminalPriority, replaceDirective && replaceDirective.name, {
                        nonTlbTranscludeDirective: nonTlbTranscludeDirective
                    })) : ($template = jqLite(jqLiteClone(compileNode)).contents(), $compileNode.empty(), 
                    childTranscludeFn = compile($template, transcludeFn))), directive.template) if (hasTemplate = !0, 
                    assertNoDuplicate("template", templateDirective, directive, $compileNode), templateDirective = directive, 
                    directiveValue = isFunction(directive.template) ? directive.template($compileNode, templateAttrs) : directive.template, 
                    directiveValue = denormalizeTemplate(directiveValue), directive.replace) {
                        if (replaceDirective = directive, $template = jqLiteIsTextNode(directiveValue) ? [] : jqLite(trim(directiveValue)), 
                        compileNode = $template[0], 1 != $template.length || 1 !== compileNode.nodeType) throw $compileMinErr("tplrt", "Template for directive '{0}' must have exactly one root element. {1}", directiveName, "");
                        replaceWith(jqCollection, $compileNode, compileNode);
                        var newTemplateAttrs = {
                            $attr: {}
                        }, templateDirectives = collectDirectives(compileNode, [], newTemplateAttrs), unprocessedDirectives = directives.splice(i + 1, directives.length - (i + 1));
                        newIsolateScopeDirective && markDirectivesAsIsolate(templateDirectives), directives = directives.concat(templateDirectives).concat(unprocessedDirectives), 
                        mergeTemplateAttributes(templateAttrs, newTemplateAttrs), ii = directives.length;
                    } else $compileNode.html(directiveValue);
                    if (directive.templateUrl) hasTemplate = !0, assertNoDuplicate("template", templateDirective, directive, $compileNode), 
                    templateDirective = directive, directive.replace && (replaceDirective = directive), 
                    nodeLinkFn = compileTemplateUrl(directives.splice(i, directives.length - i), $compileNode, templateAttrs, jqCollection, hasTranscludeDirective && childTranscludeFn, preLinkFns, postLinkFns, {
                        controllerDirectives: controllerDirectives,
                        newIsolateScopeDirective: newIsolateScopeDirective,
                        templateDirective: templateDirective,
                        nonTlbTranscludeDirective: nonTlbTranscludeDirective
                    }), ii = directives.length; else if (directive.compile) try {
                        linkFn = directive.compile($compileNode, templateAttrs, childTranscludeFn), isFunction(linkFn) ? addLinkFns(null, linkFn, attrStart, attrEnd) : linkFn && addLinkFns(linkFn.pre, linkFn.post, attrStart, attrEnd);
                    } catch (e) {
                        $exceptionHandler(e, startingTag($compileNode));
                    }
                    directive.terminal && (nodeLinkFn.terminal = !0, terminalPriority = Math.max(terminalPriority, directive.priority));
                }
                return nodeLinkFn.scope = newScopeDirective && newScopeDirective.scope === !0, nodeLinkFn.transcludeOnThisElement = hasTranscludeDirective, 
                nodeLinkFn.templateOnThisElement = hasTemplate, nodeLinkFn.transclude = childTranscludeFn, 
                previousCompileContext.hasElementTranscludeDirective = hasElementTranscludeDirective, 
                nodeLinkFn;
            }
            function markDirectivesAsIsolate(directives) {
                for (var j = 0, jj = directives.length; j < jj; j++) directives[j] = inherit(directives[j], {
                    $$isolateScope: !0
                });
            }
            function addDirective(tDirectives, name, location, maxPriority, ignoreDirective, startAttrName, endAttrName) {
                if (name === ignoreDirective) return null;
                var match = null;
                if (hasDirectives.hasOwnProperty(name)) for (var directive, directives = $injector.get(name + Suffix), i = 0, ii = directives.length; i < ii; i++) try {
                    directive = directives[i], (maxPriority === undefined || maxPriority > directive.priority) && directive.restrict.indexOf(location) != -1 && (startAttrName && (directive = inherit(directive, {
                        $$start: startAttrName,
                        $$end: endAttrName
                    })), tDirectives.push(directive), match = directive);
                } catch (e) {
                    $exceptionHandler(e);
                }
                return match;
            }
            function mergeTemplateAttributes(dst, src) {
                var srcAttr = src.$attr, dstAttr = dst.$attr, $element = dst.$$element;
                forEach(dst, function(value, key) {
                    "$" != key.charAt(0) && (src[key] && src[key] !== value && (value += ("style" === key ? ";" : " ") + src[key]), 
                    dst.$set(key, value, !0, srcAttr[key]));
                }), forEach(src, function(value, key) {
                    "class" == key ? (safeAddClass($element, value), dst.class = (dst.class ? dst.class + " " : "") + value) : "style" == key ? ($element.attr("style", $element.attr("style") + ";" + value), 
                    dst.style = (dst.style ? dst.style + ";" : "") + value) : "$" == key.charAt(0) || dst.hasOwnProperty(key) || (dst[key] = value, 
                    dstAttr[key] = srcAttr[key]);
                });
            }
            function compileTemplateUrl(directives, $compileNode, tAttrs, $rootElement, childTranscludeFn, preLinkFns, postLinkFns, previousCompileContext) {
                var afterTemplateNodeLinkFn, afterTemplateChildLinkFn, linkQueue = [], beforeTemplateCompileNode = $compileNode[0], origAsyncDirective = directives.shift(), derivedSyncDirective = extend({}, origAsyncDirective, {
                    templateUrl: null,
                    transclude: null,
                    replace: null,
                    $$originalDirective: origAsyncDirective
                }), templateUrl = isFunction(origAsyncDirective.templateUrl) ? origAsyncDirective.templateUrl($compileNode, tAttrs) : origAsyncDirective.templateUrl;
                return $compileNode.empty(), $http.get($sce.getTrustedResourceUrl(templateUrl), {
                    cache: $templateCache
                }).success(function(content) {
                    var compileNode, tempTemplateAttrs, $template, childBoundTranscludeFn;
                    if (content = denormalizeTemplate(content), origAsyncDirective.replace) {
                        if ($template = jqLiteIsTextNode(content) ? [] : jqLite(trim(content)), compileNode = $template[0], 
                        1 != $template.length || 1 !== compileNode.nodeType) throw $compileMinErr("tplrt", "Template for directive '{0}' must have exactly one root element. {1}", origAsyncDirective.name, templateUrl);
                        tempTemplateAttrs = {
                            $attr: {}
                        }, replaceWith($rootElement, $compileNode, compileNode);
                        var templateDirectives = collectDirectives(compileNode, [], tempTemplateAttrs);
                        isObject(origAsyncDirective.scope) && markDirectivesAsIsolate(templateDirectives), 
                        directives = templateDirectives.concat(directives), mergeTemplateAttributes(tAttrs, tempTemplateAttrs);
                    } else compileNode = beforeTemplateCompileNode, $compileNode.html(content);
                    for (directives.unshift(derivedSyncDirective), afterTemplateNodeLinkFn = applyDirectivesToNode(directives, compileNode, tAttrs, childTranscludeFn, $compileNode, origAsyncDirective, preLinkFns, postLinkFns, previousCompileContext), 
                    forEach($rootElement, function(node, i) {
                        node == compileNode && ($rootElement[i] = $compileNode[0]);
                    }), afterTemplateChildLinkFn = compileNodes($compileNode[0].childNodes, childTranscludeFn); linkQueue.length; ) {
                        var scope = linkQueue.shift(), beforeTemplateLinkNode = linkQueue.shift(), linkRootElement = linkQueue.shift(), boundTranscludeFn = linkQueue.shift(), linkNode = $compileNode[0];
                        if (beforeTemplateLinkNode !== beforeTemplateCompileNode) {
                            var oldClasses = beforeTemplateLinkNode.className;
                            previousCompileContext.hasElementTranscludeDirective && origAsyncDirective.replace || (linkNode = jqLiteClone(compileNode)), 
                            replaceWith(linkRootElement, jqLite(beforeTemplateLinkNode), linkNode), safeAddClass(jqLite(linkNode), oldClasses);
                        }
                        childBoundTranscludeFn = afterTemplateNodeLinkFn.transcludeOnThisElement ? createBoundTranscludeFn(scope, afterTemplateNodeLinkFn.transclude, boundTranscludeFn) : boundTranscludeFn, 
                        afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, linkNode, $rootElement, childBoundTranscludeFn);
                    }
                    linkQueue = null;
                }).error(function(response, code, headers, config) {
                    throw $compileMinErr("tpload", "Failed to load template: {0}", config.url);
                }), function(ignoreChildLinkFn, scope, node, rootElement, boundTranscludeFn) {
                    var childBoundTranscludeFn = boundTranscludeFn;
                    linkQueue ? (linkQueue.push(scope), linkQueue.push(node), linkQueue.push(rootElement), 
                    linkQueue.push(childBoundTranscludeFn)) : (afterTemplateNodeLinkFn.transcludeOnThisElement && (childBoundTranscludeFn = createBoundTranscludeFn(scope, afterTemplateNodeLinkFn.transclude, boundTranscludeFn)), 
                    afterTemplateNodeLinkFn(afterTemplateChildLinkFn, scope, node, rootElement, childBoundTranscludeFn));
                };
            }
            function byPriority(a, b) {
                var diff = b.priority - a.priority;
                return 0 !== diff ? diff : a.name !== b.name ? a.name < b.name ? -1 : 1 : a.index - b.index;
            }
            function assertNoDuplicate(what, previousDirective, directive, element) {
                if (previousDirective) throw $compileMinErr("multidir", "Multiple directives [{0}, {1}] asking for {2} on: {3}", previousDirective.name, directive.name, what, startingTag(element));
            }
            function addTextInterpolateDirective(directives, text) {
                var interpolateFn = $interpolate(text, !0);
                interpolateFn && directives.push({
                    priority: 0,
                    compile: function(templateNode) {
                        var parent = templateNode.parent(), hasCompileParent = parent.length;
                        return hasCompileParent && safeAddClass(templateNode.parent(), "ng-binding"), function(scope, node) {
                            var parent = node.parent(), bindings = parent.data("$binding") || [];
                            bindings.push(interpolateFn), parent.data("$binding", bindings), hasCompileParent || safeAddClass(parent, "ng-binding"), 
                            scope.$watch(interpolateFn, function(value) {
                                node[0].nodeValue = value;
                            });
                        };
                    }
                });
            }
            function getTrustedContext(node, attrNormalizedName) {
                if ("srcdoc" == attrNormalizedName) return $sce.HTML;
                var tag = nodeName_(node);
                return "xlinkHref" == attrNormalizedName || "FORM" == tag && "action" == attrNormalizedName || "LINK" == tag && "href" == attrNormalizedName || "IMG" != tag && ("src" == attrNormalizedName || "ngSrc" == attrNormalizedName) ? $sce.RESOURCE_URL : void 0;
            }
            function addAttrInterpolateDirective(node, directives, value, name) {
                var interpolateFn = $interpolate(value, !0);
                if (interpolateFn) {
                    if ("multiple" === name && "SELECT" === nodeName_(node)) throw $compileMinErr("selmulti", "Binding to the 'multiple' attribute is not supported. Element: {0}", startingTag(node));
                    directives.push({
                        priority: 100,
                        compile: function() {
                            return {
                                pre: function(scope, element, attr) {
                                    var $$observers = attr.$$observers || (attr.$$observers = {});
                                    if (EVENT_HANDLER_ATTR_REGEXP.test(name)) throw $compileMinErr("nodomevents", "Interpolations for HTML DOM event attributes are disallowed.  Please use the ng- versions (such as ng-click instead of onclick) instead.");
                                    interpolateFn = $interpolate(attr[name], !0, getTrustedContext(node, name)), interpolateFn && (attr[name] = interpolateFn(scope), 
                                    ($$observers[name] || ($$observers[name] = [])).$$inter = !0, (attr.$$observers && attr.$$observers[name].$$scope || scope).$watch(interpolateFn, function(newValue, oldValue) {
                                        "class" === name && newValue != oldValue ? attr.$updateClass(newValue, oldValue) : attr.$set(name, newValue);
                                    }));
                                }
                            };
                        }
                    });
                }
            }
            function replaceWith($rootElement, elementsToRemove, newNode) {
                var i, ii, firstElementToRemove = elementsToRemove[0], removeCount = elementsToRemove.length, parent = firstElementToRemove.parentNode;
                if ($rootElement) for (i = 0, ii = $rootElement.length; i < ii; i++) if ($rootElement[i] == firstElementToRemove) {
                    $rootElement[i++] = newNode;
                    for (var j = i, j2 = j + removeCount - 1, jj = $rootElement.length; j < jj; j++, 
                    j2++) j2 < jj ? $rootElement[j] = $rootElement[j2] : delete $rootElement[j];
                    $rootElement.length -= removeCount - 1;
                    break;
                }
                parent && parent.replaceChild(newNode, firstElementToRemove);
                var fragment = document.createDocumentFragment();
                fragment.appendChild(firstElementToRemove), newNode[jqLite.expando] = firstElementToRemove[jqLite.expando];
                for (var k = 1, kk = elementsToRemove.length; k < kk; k++) {
                    var element = elementsToRemove[k];
                    jqLite(element).remove(), fragment.appendChild(element), delete elementsToRemove[k];
                }
                elementsToRemove[0] = newNode, elementsToRemove.length = 1;
            }
            function cloneAndAnnotateFn(fn, annotation) {
                return extend(function() {
                    return fn.apply(null, arguments);
                }, fn, annotation);
            }
            var Attributes = function(element, attr) {
                this.$$element = element, this.$attr = attr || {};
            };
            Attributes.prototype = {
                $normalize: directiveNormalize,
                $addClass: function(classVal) {
                    classVal && classVal.length > 0 && $animate.addClass(this.$$element, classVal);
                },
                $removeClass: function(classVal) {
                    classVal && classVal.length > 0 && $animate.removeClass(this.$$element, classVal);
                },
                $updateClass: function(newClasses, oldClasses) {
                    var toAdd = tokenDifference(newClasses, oldClasses), toRemove = tokenDifference(oldClasses, newClasses);
                    0 === toAdd.length ? $animate.removeClass(this.$$element, toRemove) : 0 === toRemove.length ? $animate.addClass(this.$$element, toAdd) : $animate.setClass(this.$$element, toAdd, toRemove);
                },
                $set: function(key, value, writeAttr, attrName) {
                    var nodeName, booleanKey = getBooleanAttrName(this.$$element[0], key);
                    booleanKey && (this.$$element.prop(key, value), attrName = booleanKey), this[key] = value, 
                    attrName ? this.$attr[key] = attrName : (attrName = this.$attr[key], attrName || (this.$attr[key] = attrName = snake_case(key, "-"))), 
                    nodeName = nodeName_(this.$$element).toUpperCase(), ("A" === nodeName && ("href" === key || "xlinkHref" === key) || "IMG" === nodeName && "src" === key) && (this[key] = value = $$sanitizeUri(value, "src" === key)), 
                    writeAttr !== !1 && (null === value || value === undefined ? this.$$element.removeAttr(attrName) : this.$$element.attr(attrName, value));
                    var $$observers = this.$$observers;
                    $$observers && forEach($$observers[key], function(fn) {
                        try {
                            fn(value);
                        } catch (e) {
                            $exceptionHandler(e);
                        }
                    });
                },
                $observe: function(key, fn) {
                    var attrs = this, $$observers = attrs.$$observers || (attrs.$$observers = {}), listeners = $$observers[key] || ($$observers[key] = []);
                    return listeners.push(fn), $rootScope.$evalAsync(function() {
                        listeners.$$inter || fn(attrs[key]);
                    }), fn;
                }
            };
            var startSymbol = $interpolate.startSymbol(), endSymbol = $interpolate.endSymbol(), denormalizeTemplate = "{{" == startSymbol || "}}" == endSymbol ? identity : function(template) {
                return template.replace(/\{\{/g, startSymbol).replace(/}}/g, endSymbol);
            }, NG_ATTR_BINDING = /^ngAttr[A-Z]/;
            return compile;
        } ];
    }
    function directiveNormalize(name) {
        return camelCase(name.replace(PREFIX_REGEXP, ""));
    }
    function tokenDifference(str1, str2) {
        var values = "", tokens1 = str1.split(/\s+/), tokens2 = str2.split(/\s+/);
        outer: for (var i = 0; i < tokens1.length; i++) {
            for (var token = tokens1[i], j = 0; j < tokens2.length; j++) if (token == tokens2[j]) continue outer;
            values += (values.length > 0 ? " " : "") + token;
        }
        return values;
    }
    function $ControllerProvider() {
        var controllers = {}, CNTRL_REG = /^(\S+)(\s+as\s+(\w+))?$/;
        this.register = function(name, constructor) {
            assertNotHasOwnProperty(name, "controller"), isObject(name) ? extend(controllers, name) : controllers[name] = constructor;
        }, this.$get = [ "$injector", "$window", function($injector, $window) {
            return function(expression, locals) {
                var instance, match, constructor, identifier;
                if (isString(expression) && (match = expression.match(CNTRL_REG), constructor = match[1], 
                identifier = match[3], expression = controllers.hasOwnProperty(constructor) ? controllers[constructor] : getter(locals.$scope, constructor, !0) || getter($window, constructor, !0), 
                assertArgFn(expression, constructor, !0)), instance = $injector.instantiate(expression, locals), 
                identifier) {
                    if (!locals || "object" != typeof locals.$scope) throw minErr("$controller")("noscp", "Cannot export controller '{0}' as '{1}'! No $scope object provided via `locals`.", constructor || expression.name, identifier);
                    locals.$scope[identifier] = instance;
                }
                return instance;
            };
        } ];
    }
    function $DocumentProvider() {
        this.$get = [ "$window", function(window) {
            return jqLite(window.document);
        } ];
    }
    function $ExceptionHandlerProvider() {
        this.$get = [ "$log", function($log) {
            return function(exception, cause) {
                $log.error.apply($log, arguments);
            };
        } ];
    }
    function parseHeaders(headers) {
        var key, val, i, parsed = {};
        return headers ? (forEach(headers.split("\n"), function(line) {
            i = line.indexOf(":"), key = lowercase(trim(line.substr(0, i))), val = trim(line.substr(i + 1)), 
            key && (parsed[key] = parsed[key] ? parsed[key] + ", " + val : val);
        }), parsed) : parsed;
    }
    function headersGetter(headers) {
        var headersObj = isObject(headers) ? headers : undefined;
        return function(name) {
            return headersObj || (headersObj = parseHeaders(headers)), name ? headersObj[lowercase(name)] || null : headersObj;
        };
    }
    function transformData(data, headers, fns) {
        return isFunction(fns) ? fns(data, headers) : (forEach(fns, function(fn) {
            data = fn(data, headers);
        }), data);
    }
    function isSuccess(status) {
        return 200 <= status && status < 300;
    }
    function $HttpProvider() {
        var JSON_START = /^\s*(\[|\{[^\{])/, JSON_END = /[\}\]]\s*$/, PROTECTION_PREFIX = /^\)\]\}',?\n/, CONTENT_TYPE_APPLICATION_JSON = {
            "Content-Type": "application/json;charset=utf-8"
        }, defaults = this.defaults = {
            transformResponse: [ function(data) {
                return isString(data) && (data = data.replace(PROTECTION_PREFIX, ""), JSON_START.test(data) && JSON_END.test(data) && (data = fromJson(data))), 
                data;
            } ],
            transformRequest: [ function(d) {
                return !isObject(d) || isFile(d) || isBlob(d) ? d : toJson(d);
            } ],
            headers: {
                common: {
                    Accept: "application/json, text/plain, */*"
                },
                post: shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
                put: shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
                patch: shallowCopy(CONTENT_TYPE_APPLICATION_JSON)
            },
            xsrfCookieName: "XSRF-TOKEN",
            xsrfHeaderName: "X-XSRF-TOKEN"
        }, interceptorFactories = this.interceptors = [], responseInterceptorFactories = this.responseInterceptors = [];
        this.$get = [ "$httpBackend", "$browser", "$cacheFactory", "$rootScope", "$q", "$injector", function($httpBackend, $browser, $cacheFactory, $rootScope, $q, $injector) {
            function $http(requestConfig) {
                function transformResponse(response) {
                    var resp = extend({}, response, {
                        data: transformData(response.data, response.headers, config.transformResponse)
                    });
                    return isSuccess(response.status) ? resp : $q.reject(resp);
                }
                function mergeHeaders(config) {
                    function execHeaders(headers) {
                        var headerContent;
                        forEach(headers, function(headerFn, header) {
                            isFunction(headerFn) && (headerContent = headerFn(), null != headerContent ? headers[header] = headerContent : delete headers[header]);
                        });
                    }
                    var defHeaderName, lowercaseDefHeaderName, reqHeaderName, defHeaders = defaults.headers, reqHeaders = extend({}, config.headers);
                    defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);
                    defaultHeadersIteration: for (defHeaderName in defHeaders) {
                        lowercaseDefHeaderName = lowercase(defHeaderName);
                        for (reqHeaderName in reqHeaders) if (lowercase(reqHeaderName) === lowercaseDefHeaderName) continue defaultHeadersIteration;
                        reqHeaders[defHeaderName] = defHeaders[defHeaderName];
                    }
                    return execHeaders(reqHeaders), reqHeaders;
                }
                var config = {
                    method: "get",
                    transformRequest: defaults.transformRequest,
                    transformResponse: defaults.transformResponse
                }, headers = mergeHeaders(requestConfig);
                extend(config, requestConfig), config.headers = headers, config.method = uppercase(config.method);
                var serverRequest = function(config) {
                    headers = config.headers;
                    var reqData = transformData(config.data, headersGetter(headers), config.transformRequest);
                    return isUndefined(reqData) && forEach(headers, function(value, header) {
                        "content-type" === lowercase(header) && delete headers[header];
                    }), isUndefined(config.withCredentials) && !isUndefined(defaults.withCredentials) && (config.withCredentials = defaults.withCredentials), 
                    sendReq(config, reqData, headers).then(transformResponse, transformResponse);
                }, chain = [ serverRequest, undefined ], promise = $q.when(config);
                for (forEach(reversedInterceptors, function(interceptor) {
                    (interceptor.request || interceptor.requestError) && chain.unshift(interceptor.request, interceptor.requestError), 
                    (interceptor.response || interceptor.responseError) && chain.push(interceptor.response, interceptor.responseError);
                }); chain.length; ) {
                    var thenFn = chain.shift(), rejectFn = chain.shift();
                    promise = promise.then(thenFn, rejectFn);
                }
                return promise.success = function(fn) {
                    return promise.then(function(response) {
                        fn(response.data, response.status, response.headers, config);
                    }), promise;
                }, promise.error = function(fn) {
                    return promise.then(null, function(response) {
                        fn(response.data, response.status, response.headers, config);
                    }), promise;
                }, promise;
            }
            function createShortMethods(names) {
                forEach(arguments, function(name) {
                    $http[name] = function(url, config) {
                        return $http(extend(config || {}, {
                            method: name,
                            url: url
                        }));
                    };
                });
            }
            function createShortMethodsWithData(name) {
                forEach(arguments, function(name) {
                    $http[name] = function(url, data, config) {
                        return $http(extend(config || {}, {
                            method: name,
                            url: url,
                            data: data
                        }));
                    };
                });
            }
            function sendReq(config, reqData, reqHeaders) {
                function done(status, response, headersString, statusText) {
                    cache && (isSuccess(status) ? cache.put(url, [ status, response, parseHeaders(headersString), statusText ]) : cache.remove(url)), 
                    resolvePromise(response, status, headersString, statusText), $rootScope.$$phase || $rootScope.$apply();
                }
                function resolvePromise(response, status, headers, statusText) {
                    status = Math.max(status, 0), (isSuccess(status) ? deferred.resolve : deferred.reject)({
                        data: response,
                        status: status,
                        headers: headersGetter(headers),
                        config: config,
                        statusText: statusText
                    });
                }
                function removePendingReq() {
                    var idx = indexOf($http.pendingRequests, config);
                    idx !== -1 && $http.pendingRequests.splice(idx, 1);
                }
                var cache, cachedResp, deferred = $q.defer(), promise = deferred.promise, url = buildUrl(config.url, config.params);
                if ($http.pendingRequests.push(config), promise.then(removePendingReq, removePendingReq), 
                !config.cache && !defaults.cache || config.cache === !1 || "GET" !== config.method && "JSONP" !== config.method || (cache = isObject(config.cache) ? config.cache : isObject(defaults.cache) ? defaults.cache : defaultCache), 
                cache) if (cachedResp = cache.get(url), isDefined(cachedResp)) {
                    if (isPromiseLike(cachedResp)) return cachedResp.then(removePendingReq, removePendingReq), 
                    cachedResp;
                    isArray(cachedResp) ? resolvePromise(cachedResp[1], cachedResp[0], shallowCopy(cachedResp[2]), cachedResp[3]) : resolvePromise(cachedResp, 200, {}, "OK");
                } else cache.put(url, promise);
                if (isUndefined(cachedResp)) {
                    var xsrfValue = urlIsSameOrigin(config.url) ? $browser.cookies()[config.xsrfCookieName || defaults.xsrfCookieName] : undefined;
                    xsrfValue && (reqHeaders[config.xsrfHeaderName || defaults.xsrfHeaderName] = xsrfValue), 
                    $httpBackend(config.method, url, reqData, done, reqHeaders, config.timeout, config.withCredentials, config.responseType);
                }
                return promise;
            }
            function buildUrl(url, params) {
                if (!params) return url;
                var parts = [];
                return forEachSorted(params, function(value, key) {
                    null === value || isUndefined(value) || (isArray(value) || (value = [ value ]), 
                    forEach(value, function(v) {
                        isObject(v) && (v = isDate(v) ? v.toISOString() : toJson(v)), parts.push(encodeUriQuery(key) + "=" + encodeUriQuery(v));
                    }));
                }), parts.length > 0 && (url += (url.indexOf("?") == -1 ? "?" : "&") + parts.join("&")), 
                url;
            }
            var defaultCache = $cacheFactory("$http"), reversedInterceptors = [];
            return forEach(interceptorFactories, function(interceptorFactory) {
                reversedInterceptors.unshift(isString(interceptorFactory) ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory));
            }), forEach(responseInterceptorFactories, function(interceptorFactory, index) {
                var responseFn = isString(interceptorFactory) ? $injector.get(interceptorFactory) : $injector.invoke(interceptorFactory);
                reversedInterceptors.splice(index, 0, {
                    response: function(response) {
                        return responseFn($q.when(response));
                    },
                    responseError: function(response) {
                        return responseFn($q.reject(response));
                    }
                });
            }), $http.pendingRequests = [], createShortMethods("get", "delete", "head", "jsonp"), 
            createShortMethodsWithData("post", "put", "patch"), $http.defaults = defaults, $http;
        } ];
    }
    function createXhr(method) {
        if (msie <= 8 && (!method.match(/^(get|post|head|put|delete|options)$/i) || !window.XMLHttpRequest)) return new window.ActiveXObject("Microsoft.XMLHTTP");
        if (window.XMLHttpRequest) return new window.XMLHttpRequest();
        throw minErr("$httpBackend")("noxhr", "This browser does not support XMLHttpRequest.");
    }
    function $HttpBackendProvider() {
        this.$get = [ "$browser", "$window", "$document", function($browser, $window, $document) {
            return createHttpBackend($browser, createXhr, $browser.defer, $window.angular.callbacks, $document[0]);
        } ];
    }
    function createHttpBackend($browser, createXhr, $browserDefer, callbacks, rawDocument) {
        function jsonpReq(url, callbackId, done) {
            var script = rawDocument.createElement("script"), callback = null;
            return script.type = "text/javascript", script.src = url, script.async = !0, callback = function(event) {
                removeEventListenerFn(script, "load", callback), removeEventListenerFn(script, "error", callback), 
                rawDocument.body.removeChild(script), script = null;
                var status = -1, text = "unknown";
                event && ("load" !== event.type || callbacks[callbackId].called || (event = {
                    type: "error"
                }), text = event.type, status = "error" === event.type ? 404 : 200), done && done(status, text);
            }, addEventListenerFn(script, "load", callback), addEventListenerFn(script, "error", callback), 
            msie <= 8 && (script.onreadystatechange = function() {
                isString(script.readyState) && /loaded|complete/.test(script.readyState) && (script.onreadystatechange = null, 
                callback({
                    type: "load"
                }));
            }), rawDocument.body.appendChild(script), callback;
        }
        var ABORTED = -1;
        return function(method, url, post, callback, headers, timeout, withCredentials, responseType) {
            function timeoutRequest() {
                status = ABORTED, jsonpDone && jsonpDone(), xhr && xhr.abort();
            }
            function completeRequest(callback, status, response, headersString, statusText) {
                timeoutId && $browserDefer.cancel(timeoutId), jsonpDone = xhr = null, 0 === status && (status = response ? 200 : "file" == urlResolve(url).protocol ? 404 : 0), 
                status = 1223 === status ? 204 : status, statusText = statusText || "", callback(status, response, headersString, statusText), 
                $browser.$$completeOutstandingRequest(noop);
            }
            var status;
            if ($browser.$$incOutstandingRequestCount(), url = url || $browser.url(), "jsonp" == lowercase(method)) {
                var callbackId = "_" + (callbacks.counter++).toString(36);
                callbacks[callbackId] = function(data) {
                    callbacks[callbackId].data = data, callbacks[callbackId].called = !0;
                };
                var jsonpDone = jsonpReq(url.replace("JSON_CALLBACK", "angular.callbacks." + callbackId), callbackId, function(status, text) {
                    completeRequest(callback, status, callbacks[callbackId].data, "", text), callbacks[callbackId] = noop;
                });
            } else {
                var xhr = createXhr(method);
                if (xhr.open(method, url, !0), forEach(headers, function(value, key) {
                    isDefined(value) && xhr.setRequestHeader(key, value);
                }), xhr.onreadystatechange = function() {
                    if (xhr && 4 == xhr.readyState) {
                        var responseHeaders = null, response = null, statusText = "";
                        status !== ABORTED && (responseHeaders = xhr.getAllResponseHeaders(), response = "response" in xhr ? xhr.response : xhr.responseText), 
                        status === ABORTED && msie < 10 || (statusText = xhr.statusText), completeRequest(callback, status || xhr.status, response, responseHeaders, statusText);
                    }
                }, withCredentials && (xhr.withCredentials = !0), responseType) try {
                    xhr.responseType = responseType;
                } catch (e) {
                    if ("json" !== responseType) throw e;
                }
                xhr.send(post || null);
            }
            if (timeout > 0) var timeoutId = $browserDefer(timeoutRequest, timeout); else isPromiseLike(timeout) && timeout.then(timeoutRequest);
        };
    }
    function $InterpolateProvider() {
        var startSymbol = "{{", endSymbol = "}}";
        this.startSymbol = function(value) {
            return value ? (startSymbol = value, this) : startSymbol;
        }, this.endSymbol = function(value) {
            return value ? (endSymbol = value, this) : endSymbol;
        }, this.$get = [ "$parse", "$exceptionHandler", "$sce", function($parse, $exceptionHandler, $sce) {
            function $interpolate(text, mustHaveExpression, trustedContext) {
                for (var startIndex, endIndex, fn, exp, index = 0, parts = [], length = text.length, hasInterpolation = !1, concat = []; index < length; ) (startIndex = text.indexOf(startSymbol, index)) != -1 && (endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) != -1 ? (index != startIndex && parts.push(text.substring(index, startIndex)), 
                parts.push(fn = $parse(exp = text.substring(startIndex + startSymbolLength, endIndex))), 
                fn.exp = exp, index = endIndex + endSymbolLength, hasInterpolation = !0) : (index != length && parts.push(text.substring(index)), 
                index = length);
                if ((length = parts.length) || (parts.push(""), length = 1), trustedContext && parts.length > 1) throw $interpolateMinErr("noconcat", "Error while interpolating: {0}\nStrict Contextual Escaping disallows interpolations that concatenate multiple expressions when a trusted value is required.  See http://docs.angularjs.org/api/ng.$sce", text);
                if (!mustHaveExpression || hasInterpolation) return concat.length = length, fn = function(context) {
                    try {
                        for (var part, i = 0, ii = length; i < ii; i++) {
                            if ("function" == typeof (part = parts[i])) if (part = part(context), part = trustedContext ? $sce.getTrusted(trustedContext, part) : $sce.valueOf(part), 
                            null == part) part = ""; else switch (typeof part) {
                              case "string":
                                break;

                              case "number":
                                part = "" + part;
                                break;

                              default:
                                part = toJson(part);
                            }
                            concat[i] = part;
                        }
                        return concat.join("");
                    } catch (err) {
                        var newErr = $interpolateMinErr("interr", "Can't interpolate: {0}\n{1}", text, err.toString());
                        $exceptionHandler(newErr);
                    }
                }, fn.exp = text, fn.parts = parts, fn;
            }
            var startSymbolLength = startSymbol.length, endSymbolLength = endSymbol.length;
            return $interpolate.startSymbol = function() {
                return startSymbol;
            }, $interpolate.endSymbol = function() {
                return endSymbol;
            }, $interpolate;
        } ];
    }
    function $IntervalProvider() {
        this.$get = [ "$rootScope", "$window", "$q", function($rootScope, $window, $q) {
            function interval(fn, delay, count, invokeApply) {
                var setInterval = $window.setInterval, clearInterval = $window.clearInterval, deferred = $q.defer(), promise = deferred.promise, iteration = 0, skipApply = isDefined(invokeApply) && !invokeApply;
                return count = isDefined(count) ? count : 0, promise.then(null, null, fn), promise.$$intervalId = setInterval(function() {
                    deferred.notify(iteration++), count > 0 && iteration >= count && (deferred.resolve(iteration), 
                    clearInterval(promise.$$intervalId), delete intervals[promise.$$intervalId]), skipApply || $rootScope.$apply();
                }, delay), intervals[promise.$$intervalId] = deferred, promise;
            }
            var intervals = {};
            return interval.cancel = function(promise) {
                return !!(promise && promise.$$intervalId in intervals) && (intervals[promise.$$intervalId].reject("canceled"), 
                $window.clearInterval(promise.$$intervalId), delete intervals[promise.$$intervalId], 
                !0);
            }, interval;
        } ];
    }
    function $LocaleProvider() {
        this.$get = function() {
            return {
                id: "en-us",
                NUMBER_FORMATS: {
                    DECIMAL_SEP: ".",
                    GROUP_SEP: ",",
                    PATTERNS: [ {
                        minInt: 1,
                        minFrac: 0,
                        maxFrac: 3,
                        posPre: "",
                        posSuf: "",
                        negPre: "-",
                        negSuf: "",
                        gSize: 3,
                        lgSize: 3
                    }, {
                        minInt: 1,
                        minFrac: 2,
                        maxFrac: 2,
                        posPre: "¤",
                        posSuf: "",
                        negPre: "(¤",
                        negSuf: ")",
                        gSize: 3,
                        lgSize: 3
                    } ],
                    CURRENCY_SYM: "$"
                },
                DATETIME_FORMATS: {
                    MONTH: "January,February,March,April,May,June,July,August,September,October,November,December".split(","),
                    SHORTMONTH: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
                    DAY: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),
                    SHORTDAY: "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(","),
                    AMPMS: [ "AM", "PM" ],
                    medium: "MMM d, y h:mm:ss a",
                    short: "M/d/yy h:mm a",
                    fullDate: "EEEE, MMMM d, y",
                    longDate: "MMMM d, y",
                    mediumDate: "MMM d, y",
                    shortDate: "M/d/yy",
                    mediumTime: "h:mm:ss a",
                    shortTime: "h:mm a"
                },
                pluralCat: function(num) {
                    return 1 === num ? "one" : "other";
                }
            };
        };
    }
    function encodePath(path) {
        for (var segments = path.split("/"), i = segments.length; i--; ) segments[i] = encodeUriSegment(segments[i]);
        return segments.join("/");
    }
    function parseAbsoluteUrl(absoluteUrl, locationObj, appBase) {
        var parsedUrl = urlResolve(absoluteUrl, appBase);
        locationObj.$$protocol = parsedUrl.protocol, locationObj.$$host = parsedUrl.hostname, 
        locationObj.$$port = int(parsedUrl.port) || DEFAULT_PORTS[parsedUrl.protocol] || null;
    }
    function parseAppUrl(relativeUrl, locationObj, appBase) {
        var prefixed = "/" !== relativeUrl.charAt(0);
        prefixed && (relativeUrl = "/" + relativeUrl);
        var match = urlResolve(relativeUrl, appBase);
        locationObj.$$path = decodeURIComponent(prefixed && "/" === match.pathname.charAt(0) ? match.pathname.substring(1) : match.pathname), 
        locationObj.$$search = parseKeyValue(match.search), locationObj.$$hash = decodeURIComponent(match.hash), 
        locationObj.$$path && "/" != locationObj.$$path.charAt(0) && (locationObj.$$path = "/" + locationObj.$$path);
    }
    function beginsWith(begin, whole) {
        if (0 === whole.indexOf(begin)) return whole.substr(begin.length);
    }
    function stripHash(url) {
        var index = url.indexOf("#");
        return index == -1 ? url : url.substr(0, index);
    }
    function trimEmptyHash(url) {
        return url.replace(/(#.+)|#$/, "$1");
    }
    function stripFile(url) {
        return url.substr(0, stripHash(url).lastIndexOf("/") + 1);
    }
    function serverBase(url) {
        return url.substring(0, url.indexOf("/", url.indexOf("//") + 2));
    }
    function LocationHtml5Url(appBase, basePrefix) {
        this.$$html5 = !0, basePrefix = basePrefix || "";
        var appBaseNoFile = stripFile(appBase);
        parseAbsoluteUrl(appBase, this, appBase), this.$$parse = function(url) {
            var pathUrl = beginsWith(appBaseNoFile, url);
            if (!isString(pathUrl)) throw $locationMinErr("ipthprfx", 'Invalid url "{0}", missing path prefix "{1}".', url, appBaseNoFile);
            parseAppUrl(pathUrl, this, appBase), this.$$path || (this.$$path = "/"), this.$$compose();
        }, this.$$compose = function() {
            var search = toKeyValue(this.$$search), hash = this.$$hash ? "#" + encodeUriSegment(this.$$hash) : "";
            this.$$url = encodePath(this.$$path) + (search ? "?" + search : "") + hash, this.$$absUrl = appBaseNoFile + this.$$url.substr(1);
        }, this.$$parseLinkUrl = function(url, relHref) {
            var appUrl, prevAppUrl, rewrittenUrl;
            return (appUrl = beginsWith(appBase, url)) !== undefined ? (prevAppUrl = appUrl, 
            rewrittenUrl = (appUrl = beginsWith(basePrefix, appUrl)) !== undefined ? appBaseNoFile + (beginsWith("/", appUrl) || appUrl) : appBase + prevAppUrl) : (appUrl = beginsWith(appBaseNoFile, url)) !== undefined ? rewrittenUrl = appBaseNoFile + appUrl : appBaseNoFile == url + "/" && (rewrittenUrl = appBaseNoFile), 
            rewrittenUrl && this.$$parse(rewrittenUrl), !!rewrittenUrl;
        };
    }
    function LocationHashbangUrl(appBase, hashPrefix) {
        var appBaseNoFile = stripFile(appBase);
        parseAbsoluteUrl(appBase, this, appBase), this.$$parse = function(url) {
            function removeWindowsDriveName(path, url, base) {
                var firstPathSegmentMatch, windowsFilePathExp = /^\/[A-Z]:(\/.*)/;
                return 0 === url.indexOf(base) && (url = url.replace(base, "")), windowsFilePathExp.exec(url) ? path : (firstPathSegmentMatch = windowsFilePathExp.exec(path), 
                firstPathSegmentMatch ? firstPathSegmentMatch[1] : path);
            }
            var withoutBaseUrl = beginsWith(appBase, url) || beginsWith(appBaseNoFile, url), withoutHashUrl = "#" == withoutBaseUrl.charAt(0) ? beginsWith(hashPrefix, withoutBaseUrl) : this.$$html5 ? withoutBaseUrl : "";
            if (!isString(withoutHashUrl)) throw $locationMinErr("ihshprfx", 'Invalid url "{0}", missing hash prefix "{1}".', url, hashPrefix);
            parseAppUrl(withoutHashUrl, this, appBase), this.$$path = removeWindowsDriveName(this.$$path, withoutHashUrl, appBase), 
            this.$$compose();
        }, this.$$compose = function() {
            var search = toKeyValue(this.$$search), hash = this.$$hash ? "#" + encodeUriSegment(this.$$hash) : "";
            this.$$url = encodePath(this.$$path) + (search ? "?" + search : "") + hash, this.$$absUrl = appBase + (this.$$url ? hashPrefix + this.$$url : "");
        }, this.$$parseLinkUrl = function(url, relHref) {
            return stripHash(appBase) == stripHash(url) && (this.$$parse(url), !0);
        };
    }
    function LocationHashbangInHtml5Url(appBase, hashPrefix) {
        this.$$html5 = !0, LocationHashbangUrl.apply(this, arguments);
        var appBaseNoFile = stripFile(appBase);
        this.$$parseLinkUrl = function(url, relHref) {
            var rewrittenUrl, appUrl;
            return appBase == stripHash(url) ? rewrittenUrl = url : (appUrl = beginsWith(appBaseNoFile, url)) ? rewrittenUrl = appBase + hashPrefix + appUrl : appBaseNoFile === url + "/" && (rewrittenUrl = appBaseNoFile), 
            rewrittenUrl && this.$$parse(rewrittenUrl), !!rewrittenUrl;
        }, this.$$compose = function() {
            var search = toKeyValue(this.$$search), hash = this.$$hash ? "#" + encodeUriSegment(this.$$hash) : "";
            this.$$url = encodePath(this.$$path) + (search ? "?" + search : "") + hash, this.$$absUrl = appBase + hashPrefix + this.$$url;
        };
    }
    function locationGetter(property) {
        return function() {
            return this[property];
        };
    }
    function locationGetterSetter(property, preprocess) {
        return function(value) {
            return isUndefined(value) ? this[property] : (this[property] = preprocess(value), 
            this.$$compose(), this);
        };
    }
    function $LocationProvider() {
        var hashPrefix = "", html5Mode = !1;
        this.hashPrefix = function(prefix) {
            return isDefined(prefix) ? (hashPrefix = prefix, this) : hashPrefix;
        }, this.html5Mode = function(mode) {
            return isDefined(mode) ? (html5Mode = mode, this) : html5Mode;
        }, this.$get = [ "$rootScope", "$browser", "$sniffer", "$rootElement", function($rootScope, $browser, $sniffer, $rootElement) {
            function afterLocationChange(oldUrl) {
                $rootScope.$broadcast("$locationChangeSuccess", $location.absUrl(), oldUrl);
            }
            var $location, LocationMode, appBase, baseHref = $browser.baseHref(), initialUrl = $browser.url();
            html5Mode ? (appBase = serverBase(initialUrl) + (baseHref || "/"), LocationMode = $sniffer.history ? LocationHtml5Url : LocationHashbangInHtml5Url) : (appBase = stripHash(initialUrl), 
            LocationMode = LocationHashbangUrl), $location = new LocationMode(appBase, "#" + hashPrefix), 
            $location.$$parseLinkUrl(initialUrl, initialUrl);
            var IGNORE_URI_REGEXP = /^\s*(javascript|mailto):/i;
            $rootElement.on("click", function(event) {
                if (!event.ctrlKey && !event.metaKey && 2 != event.which) {
                    for (var elm = jqLite(event.target); "a" !== lowercase(elm[0].nodeName); ) if (elm[0] === $rootElement[0] || !(elm = elm.parent())[0]) return;
                    var absHref = elm.prop("href"), relHref = elm.attr("href") || elm.attr("xlink:href");
                    isObject(absHref) && "[object SVGAnimatedString]" === absHref.toString() && (absHref = urlResolve(absHref.animVal).href), 
                    IGNORE_URI_REGEXP.test(absHref) || !absHref || elm.attr("target") || event.isDefaultPrevented() || $location.$$parseLinkUrl(absHref, relHref) && (event.preventDefault(), 
                    $location.absUrl() != $browser.url() && ($rootScope.$apply(), window.angular["ff-684208-preventDefault"] = !0));
                }
            }), $location.absUrl() != initialUrl && $browser.url($location.absUrl(), !0), $browser.onUrlChange(function(newUrl) {
                $location.absUrl() != newUrl && ($rootScope.$evalAsync(function() {
                    var oldUrl = $location.absUrl();
                    $location.$$parse(newUrl), $rootScope.$broadcast("$locationChangeStart", newUrl, oldUrl).defaultPrevented ? ($location.$$parse(oldUrl), 
                    $browser.url(oldUrl)) : afterLocationChange(oldUrl);
                }), $rootScope.$$phase || $rootScope.$digest());
            });
            var changeCounter = 0;
            return $rootScope.$watch(function() {
                var oldUrl = trimEmptyHash($browser.url()), newUrl = trimEmptyHash($location.absUrl()), currentReplace = $location.$$replace;
                return changeCounter && oldUrl == newUrl || (changeCounter++, $rootScope.$evalAsync(function() {
                    $rootScope.$broadcast("$locationChangeStart", $location.absUrl(), oldUrl).defaultPrevented ? $location.$$parse(oldUrl) : ($browser.url($location.absUrl(), currentReplace), 
                    afterLocationChange(oldUrl));
                })), $location.$$replace = !1, changeCounter;
            }), $location;
        } ];
    }
    function $LogProvider() {
        var debug = !0, self = this;
        this.debugEnabled = function(flag) {
            return isDefined(flag) ? (debug = flag, this) : debug;
        }, this.$get = [ "$window", function($window) {
            function formatError(arg) {
                return arg instanceof Error && (arg.stack ? arg = arg.message && arg.stack.indexOf(arg.message) === -1 ? "Error: " + arg.message + "\n" + arg.stack : arg.stack : arg.sourceURL && (arg = arg.message + "\n" + arg.sourceURL + ":" + arg.line)), 
                arg;
            }
            function consoleLog(type) {
                var console = $window.console || {}, logFn = console[type] || console.log || noop, hasApply = !1;
                try {
                    hasApply = !!logFn.apply;
                } catch (e) {}
                return hasApply ? function() {
                    var args = [];
                    return forEach(arguments, function(arg) {
                        args.push(formatError(arg));
                    }), logFn.apply(console, args);
                } : function(arg1, arg2) {
                    logFn(arg1, null == arg2 ? "" : arg2);
                };
            }
            return {
                log: consoleLog("log"),
                info: consoleLog("info"),
                warn: consoleLog("warn"),
                error: consoleLog("error"),
                debug: function() {
                    var fn = consoleLog("debug");
                    return function() {
                        debug && fn.apply(self, arguments);
                    };
                }()
            };
        } ];
    }
    function ensureSafeMemberName(name, fullExpression) {
        if ("__defineGetter__" === name || "__defineSetter__" === name || "__lookupGetter__" === name || "__lookupSetter__" === name || "__proto__" === name) throw $parseMinErr("isecfld", "Attempting to access a disallowed field in Angular expressions! Expression: {0}", fullExpression);
        return name;
    }
    function getStringValue(name, fullExpression) {
        if (name += "", !isString(name)) throw $parseMinErr("iseccst", "Cannot convert object to primitive value! Expression: {0}", fullExpression);
        return name;
    }
    function ensureSafeObject(obj, fullExpression) {
        if (obj) {
            if (obj.constructor === obj) throw $parseMinErr("isecfn", "Referencing Function in Angular expressions is disallowed! Expression: {0}", fullExpression);
            if (obj.document && obj.location && obj.alert && obj.setInterval) throw $parseMinErr("isecwindow", "Referencing the Window in Angular expressions is disallowed! Expression: {0}", fullExpression);
            if (obj.children && (obj.nodeName || obj.prop && obj.attr && obj.find)) throw $parseMinErr("isecdom", "Referencing DOM nodes in Angular expressions is disallowed! Expression: {0}", fullExpression);
            if (obj === Object) throw $parseMinErr("isecobj", "Referencing Object in Angular expressions is disallowed! Expression: {0}", fullExpression);
        }
        return obj;
    }
    function ensureSafeFunction(obj, fullExpression) {
        if (obj) {
            if (obj.constructor === obj) throw $parseMinErr("isecfn", "Referencing Function in Angular expressions is disallowed! Expression: {0}", fullExpression);
            if (obj === CALL || obj === APPLY || BIND && obj === BIND) throw $parseMinErr("isecff", "Referencing call, apply or bind in Angular expressions is disallowed! Expression: {0}", fullExpression);
        }
    }
    function setter(obj, path, setValue, fullExp, options) {
        ensureSafeObject(obj, fullExp), options = options || {};
        for (var key, element = path.split("."), i = 0; element.length > 1; i++) {
            key = ensureSafeMemberName(element.shift(), fullExp);
            var propertyObj = ensureSafeObject(obj[key], fullExp);
            propertyObj || (propertyObj = {}, obj[key] = propertyObj), obj = propertyObj, obj.then && options.unwrapPromises && (promiseWarning(fullExp), 
            "$$v" in obj || !function(promise) {
                promise.then(function(val) {
                    promise.$$v = val;
                });
            }(obj), obj.$$v === undefined && (obj.$$v = {}), obj = obj.$$v);
        }
        return key = ensureSafeMemberName(element.shift(), fullExp), ensureSafeObject(obj[key], fullExp), 
        obj[key] = setValue, setValue;
    }
    function isPossiblyDangerousMemberName(name) {
        return "constructor" == name;
    }
    function cspSafeGetterFn(key0, key1, key2, key3, key4, fullExp, options) {
        ensureSafeMemberName(key0, fullExp), ensureSafeMemberName(key1, fullExp), ensureSafeMemberName(key2, fullExp), 
        ensureSafeMemberName(key3, fullExp), ensureSafeMemberName(key4, fullExp);
        var eso = function(o) {
            return ensureSafeObject(o, fullExp);
        }, expensiveChecks = options.expensiveChecks, eso0 = expensiveChecks || isPossiblyDangerousMemberName(key0) ? eso : identity, eso1 = expensiveChecks || isPossiblyDangerousMemberName(key1) ? eso : identity, eso2 = expensiveChecks || isPossiblyDangerousMemberName(key2) ? eso : identity, eso3 = expensiveChecks || isPossiblyDangerousMemberName(key3) ? eso : identity, eso4 = expensiveChecks || isPossiblyDangerousMemberName(key4) ? eso : identity;
        return options.unwrapPromises ? function(scope, locals) {
            var promise, pathVal = locals && locals.hasOwnProperty(key0) ? locals : scope;
            return null == pathVal ? pathVal : (pathVal = eso0(pathVal[key0]), pathVal && pathVal.then && (promiseWarning(fullExp), 
            "$$v" in pathVal || (promise = pathVal, promise.$$v = undefined, promise.then(function(val) {
                promise.$$v = eso0(val);
            })), pathVal = eso0(pathVal.$$v)), key1 ? null == pathVal ? undefined : (pathVal = eso1(pathVal[key1]), 
            pathVal && pathVal.then && (promiseWarning(fullExp), "$$v" in pathVal || (promise = pathVal, 
            promise.$$v = undefined, promise.then(function(val) {
                promise.$$v = eso1(val);
            })), pathVal = eso1(pathVal.$$v)), key2 ? null == pathVal ? undefined : (pathVal = eso2(pathVal[key2]), 
            pathVal && pathVal.then && (promiseWarning(fullExp), "$$v" in pathVal || (promise = pathVal, 
            promise.$$v = undefined, promise.then(function(val) {
                promise.$$v = eso2(val);
            })), pathVal = eso2(pathVal.$$v)), key3 ? null == pathVal ? undefined : (pathVal = eso3(pathVal[key3]), 
            pathVal && pathVal.then && (promiseWarning(fullExp), "$$v" in pathVal || (promise = pathVal, 
            promise.$$v = undefined, promise.then(function(val) {
                promise.$$v = eso3(val);
            })), pathVal = eso3(pathVal.$$v)), key4 ? null == pathVal ? undefined : (pathVal = eso4(pathVal[key4]), 
            pathVal && pathVal.then && (promiseWarning(fullExp), "$$v" in pathVal || (promise = pathVal, 
            promise.$$v = undefined, promise.then(function(val) {
                promise.$$v = eso4(val);
            })), pathVal = eso4(pathVal.$$v)), pathVal) : pathVal) : pathVal) : pathVal) : pathVal);
        } : function(scope, locals) {
            var pathVal = locals && locals.hasOwnProperty(key0) ? locals : scope;
            return null == pathVal ? pathVal : (pathVal = eso0(pathVal[key0]), key1 ? null == pathVal ? undefined : (pathVal = eso1(pathVal[key1]), 
            key2 ? null == pathVal ? undefined : (pathVal = eso2(pathVal[key2]), key3 ? null == pathVal ? undefined : (pathVal = eso3(pathVal[key3]), 
            key4 ? null == pathVal ? undefined : pathVal = eso4(pathVal[key4]) : pathVal) : pathVal) : pathVal) : pathVal);
        };
    }
    function getterFnWithExtraArgs(fn, fullExpression) {
        return function(s, l) {
            return fn(s, l, promiseWarning, ensureSafeObject, fullExpression);
        };
    }
    function getterFn(path, options, fullExp) {
        var expensiveChecks = options.expensiveChecks, getterFnCache = expensiveChecks ? getterFnCacheExpensive : getterFnCacheDefault;
        if (getterFnCache.hasOwnProperty(path)) return getterFnCache[path];
        var fn, pathKeys = path.split("."), pathKeysLength = pathKeys.length;
        if (options.csp) fn = pathKeysLength < 6 ? cspSafeGetterFn(pathKeys[0], pathKeys[1], pathKeys[2], pathKeys[3], pathKeys[4], fullExp, options) : function(scope, locals) {
            var val, i = 0;
            do val = cspSafeGetterFn(pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++], pathKeys[i++], fullExp, options)(scope, locals), 
            locals = undefined, scope = val; while (i < pathKeysLength);
            return val;
        }; else {
            var code = "var p;\n";
            expensiveChecks && (code += "s = eso(s, fe);\nl = eso(l, fe);\n");
            var needsEnsureSafeObject = expensiveChecks;
            forEach(pathKeys, function(key, index) {
                ensureSafeMemberName(key, fullExp);
                var lookupJs = (index ? "s" : '((l&&l.hasOwnProperty("' + key + '"))?l:s)') + '["' + key + '"]', wrapWithEso = expensiveChecks || isPossiblyDangerousMemberName(key);
                wrapWithEso && (lookupJs = "eso(" + lookupJs + ", fe)", needsEnsureSafeObject = !0), 
                code += "if(s == null) return undefined;\ns=" + lookupJs + ";\n", options.unwrapPromises && (code += 'if (s && s.then) {\n pw("' + fullExp.replace(/(["\r\n])/g, "\\$1") + '");\n if (!("$$v" in s)) {\n p=s;\n p.$$v = undefined;\n p.then(function(v) {p.$$v=' + (wrapWithEso ? "eso(v)" : "v") + ";});\n}\n s=" + (wrapWithEso ? "eso(s.$$v)" : "s.$$v") + "\n}\n");
            }), code += "return s;";
            var evaledFnGetter = new Function("s", "l", "pw", "eso", "fe", code);
            evaledFnGetter.toString = valueFn(code), (needsEnsureSafeObject || options.unwrapPromises) && (evaledFnGetter = getterFnWithExtraArgs(evaledFnGetter, fullExp)), 
            fn = evaledFnGetter;
        }
        return "hasOwnProperty" !== path && (getterFnCache[path] = fn), fn;
    }
    function $ParseProvider() {
        var cacheDefault = {}, cacheExpensive = {}, $parseOptions = {
            csp: !1,
            unwrapPromises: !1,
            logPromiseWarnings: !0,
            expensiveChecks: !1
        };
        this.unwrapPromises = function(value) {
            return isDefined(value) ? ($parseOptions.unwrapPromises = !!value, this) : $parseOptions.unwrapPromises;
        }, this.logPromiseWarnings = function(value) {
            return isDefined(value) ? ($parseOptions.logPromiseWarnings = value, this) : $parseOptions.logPromiseWarnings;
        }, this.$get = [ "$filter", "$sniffer", "$log", function($filter, $sniffer, $log) {
            $parseOptions.csp = $sniffer.csp;
            var $parseOptionsExpensive = {
                csp: $parseOptions.csp,
                unwrapPromises: $parseOptions.unwrapPromises,
                logPromiseWarnings: $parseOptions.logPromiseWarnings,
                expensiveChecks: !0
            };
            return promiseWarning = function(fullExp) {
                $parseOptions.logPromiseWarnings && !promiseWarningCache.hasOwnProperty(fullExp) && (promiseWarningCache[fullExp] = !0, 
                $log.warn("[$parse] Promise found in the expression `" + fullExp + "`. Automatic unwrapping of promises in Angular expressions is deprecated."));
            }, function(exp, expensiveChecks) {
                var parsedExpression;
                switch (typeof exp) {
                  case "string":
                    var cache = expensiveChecks ? cacheExpensive : cacheDefault;
                    if (cache.hasOwnProperty(exp)) return cache[exp];
                    var parseOptions = expensiveChecks ? $parseOptionsExpensive : $parseOptions, lexer = new Lexer(parseOptions), parser = new Parser(lexer, $filter, parseOptions);
                    return parsedExpression = parser.parse(exp), "hasOwnProperty" !== exp && (cache[exp] = parsedExpression), 
                    parsedExpression;

                  case "function":
                    return exp;

                  default:
                    return noop;
                }
            };
        } ];
    }
    function $QProvider() {
        this.$get = [ "$rootScope", "$exceptionHandler", function($rootScope, $exceptionHandler) {
            return qFactory(function(callback) {
                $rootScope.$evalAsync(callback);
            }, $exceptionHandler);
        } ];
    }
    function qFactory(nextTick, exceptionHandler) {
        function defaultCallback(value) {
            return value;
        }
        function defaultErrback(reason) {
            return reject(reason);
        }
        function all(promises) {
            var deferred = defer(), counter = 0, results = isArray(promises) ? [] : {};
            return forEach(promises, function(promise, key) {
                counter++, ref(promise).then(function(value) {
                    results.hasOwnProperty(key) || (results[key] = value, --counter || deferred.resolve(results));
                }, function(reason) {
                    results.hasOwnProperty(key) || deferred.reject(reason);
                });
            }), 0 === counter && deferred.resolve(results), deferred.promise;
        }
        var defer = function() {
            var value, deferred, pending = [];
            return deferred = {
                resolve: function(val) {
                    if (pending) {
                        var callbacks = pending;
                        pending = undefined, value = ref(val), callbacks.length && nextTick(function() {
                            for (var callback, i = 0, ii = callbacks.length; i < ii; i++) callback = callbacks[i], 
                            value.then(callback[0], callback[1], callback[2]);
                        });
                    }
                },
                reject: function(reason) {
                    deferred.resolve(createInternalRejectedPromise(reason));
                },
                notify: function(progress) {
                    if (pending) {
                        var callbacks = pending;
                        pending.length && nextTick(function() {
                            for (var callback, i = 0, ii = callbacks.length; i < ii; i++) callback = callbacks[i], 
                            callback[2](progress);
                        });
                    }
                },
                promise: {
                    then: function(callback, errback, progressback) {
                        var result = defer(), wrappedCallback = function(value) {
                            try {
                                result.resolve((isFunction(callback) ? callback : defaultCallback)(value));
                            } catch (e) {
                                result.reject(e), exceptionHandler(e);
                            }
                        }, wrappedErrback = function(reason) {
                            try {
                                result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
                            } catch (e) {
                                result.reject(e), exceptionHandler(e);
                            }
                        }, wrappedProgressback = function(progress) {
                            try {
                                result.notify((isFunction(progressback) ? progressback : defaultCallback)(progress));
                            } catch (e) {
                                exceptionHandler(e);
                            }
                        };
                        return pending ? pending.push([ wrappedCallback, wrappedErrback, wrappedProgressback ]) : value.then(wrappedCallback, wrappedErrback, wrappedProgressback), 
                        result.promise;
                    },
                    catch: function(callback) {
                        return this.then(null, callback);
                    },
                    finally: function(callback) {
                        function makePromise(value, resolved) {
                            var result = defer();
                            return resolved ? result.resolve(value) : result.reject(value), result.promise;
                        }
                        function handleCallback(value, isResolved) {
                            var callbackOutput = null;
                            try {
                                callbackOutput = (callback || defaultCallback)();
                            } catch (e) {
                                return makePromise(e, !1);
                            }
                            return isPromiseLike(callbackOutput) ? callbackOutput.then(function() {
                                return makePromise(value, isResolved);
                            }, function(error) {
                                return makePromise(error, !1);
                            }) : makePromise(value, isResolved);
                        }
                        return this.then(function(value) {
                            return handleCallback(value, !0);
                        }, function(error) {
                            return handleCallback(error, !1);
                        });
                    }
                }
            };
        }, ref = function(value) {
            return isPromiseLike(value) ? value : {
                then: function(callback) {
                    var result = defer();
                    return nextTick(function() {
                        result.resolve(callback(value));
                    }), result.promise;
                }
            };
        }, reject = function(reason) {
            var result = defer();
            return result.reject(reason), result.promise;
        }, createInternalRejectedPromise = function(reason) {
            return {
                then: function(callback, errback) {
                    var result = defer();
                    return nextTick(function() {
                        try {
                            result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
                        } catch (e) {
                            result.reject(e), exceptionHandler(e);
                        }
                    }), result.promise;
                }
            };
        }, when = function(value, callback, errback, progressback) {
            var done, result = defer(), wrappedCallback = function(value) {
                try {
                    return (isFunction(callback) ? callback : defaultCallback)(value);
                } catch (e) {
                    return exceptionHandler(e), reject(e);
                }
            }, wrappedErrback = function(reason) {
                try {
                    return (isFunction(errback) ? errback : defaultErrback)(reason);
                } catch (e) {
                    return exceptionHandler(e), reject(e);
                }
            }, wrappedProgressback = function(progress) {
                try {
                    return (isFunction(progressback) ? progressback : defaultCallback)(progress);
                } catch (e) {
                    exceptionHandler(e);
                }
            };
            return nextTick(function() {
                ref(value).then(function(value) {
                    done || (done = !0, result.resolve(ref(value).then(wrappedCallback, wrappedErrback, wrappedProgressback)));
                }, function(reason) {
                    done || (done = !0, result.resolve(wrappedErrback(reason)));
                }, function(progress) {
                    done || result.notify(wrappedProgressback(progress));
                });
            }), result.promise;
        };
        return {
            defer: defer,
            reject: reject,
            when: when,
            all: all
        };
    }
    function $$RAFProvider() {
        this.$get = [ "$window", "$timeout", function($window, $timeout) {
            var requestAnimationFrame = $window.requestAnimationFrame || $window.webkitRequestAnimationFrame || $window.mozRequestAnimationFrame, cancelAnimationFrame = $window.cancelAnimationFrame || $window.webkitCancelAnimationFrame || $window.mozCancelAnimationFrame || $window.webkitCancelRequestAnimationFrame, rafSupported = !!requestAnimationFrame, raf = rafSupported ? function(fn) {
                var id = requestAnimationFrame(fn);
                return function() {
                    cancelAnimationFrame(id);
                };
            } : function(fn) {
                var timer = $timeout(fn, 16.66, !1);
                return function() {
                    $timeout.cancel(timer);
                };
            };
            return raf.supported = rafSupported, raf;
        } ];
    }
    function $RootScopeProvider() {
        var TTL = 10, $rootScopeMinErr = minErr("$rootScope"), lastDirtyWatch = null;
        this.digestTtl = function(value) {
            return arguments.length && (TTL = value), TTL;
        }, this.$get = [ "$injector", "$exceptionHandler", "$parse", "$browser", function($injector, $exceptionHandler, $parse, $browser) {
            function Scope() {
                this.$id = nextUid(), this.$$phase = this.$parent = this.$$watchers = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null, 
                this.this = this.$root = this, this.$$destroyed = !1, this.$$asyncQueue = [], this.$$postDigestQueue = [], 
                this.$$listeners = {}, this.$$listenerCount = {}, this.$$isolateBindings = {};
            }
            function beginPhase(phase) {
                if ($rootScope.$$phase) throw $rootScopeMinErr("inprog", "{0} already in progress", $rootScope.$$phase);
                $rootScope.$$phase = phase;
            }
            function clearPhase() {
                $rootScope.$$phase = null;
            }
            function compileToFn(exp, name) {
                var fn = $parse(exp);
                return assertArgFn(fn, name), fn;
            }
            function decrementListenerCount(current, count, name) {
                do current.$$listenerCount[name] -= count, 0 === current.$$listenerCount[name] && delete current.$$listenerCount[name]; while (current = current.$parent);
            }
            function initWatchVal() {}
            Scope.prototype = {
                constructor: Scope,
                $new: function(isolate) {
                    var child;
                    return isolate ? (child = new Scope(), child.$root = this.$root, child.$$asyncQueue = this.$$asyncQueue, 
                    child.$$postDigestQueue = this.$$postDigestQueue) : (this.$$childScopeClass || (this.$$childScopeClass = function() {
                        this.$$watchers = this.$$nextSibling = this.$$childHead = this.$$childTail = null, 
                        this.$$listeners = {}, this.$$listenerCount = {}, this.$id = nextUid(), this.$$childScopeClass = null;
                    }, this.$$childScopeClass.prototype = this), child = new this.$$childScopeClass()), 
                    child.this = child, child.$parent = this, child.$$prevSibling = this.$$childTail, 
                    this.$$childHead ? (this.$$childTail.$$nextSibling = child, this.$$childTail = child) : this.$$childHead = this.$$childTail = child, 
                    child;
                },
                $watch: function(watchExp, listener, objectEquality) {
                    var scope = this, get = compileToFn(watchExp, "watch"), array = scope.$$watchers, watcher = {
                        fn: listener,
                        last: initWatchVal,
                        get: get,
                        exp: watchExp,
                        eq: !!objectEquality
                    };
                    if (lastDirtyWatch = null, !isFunction(listener)) {
                        var listenFn = compileToFn(listener || noop, "listener");
                        watcher.fn = function(newVal, oldVal, scope) {
                            listenFn(scope);
                        };
                    }
                    if ("string" == typeof watchExp && get.constant) {
                        var originalFn = watcher.fn;
                        watcher.fn = function(newVal, oldVal, scope) {
                            originalFn.call(this, newVal, oldVal, scope), arrayRemove(array, watcher);
                        };
                    }
                    return array || (array = scope.$$watchers = []), array.unshift(watcher), function() {
                        arrayRemove(array, watcher), lastDirtyWatch = null;
                    };
                },
                $watchCollection: function(obj, listener) {
                    function $watchCollectionWatch() {
                        newValue = objGetter(self);
                        var newLength, key, bothNaN;
                        if (isObject(newValue)) if (isArrayLike(newValue)) {
                            oldValue !== internalArray && (oldValue = internalArray, oldLength = oldValue.length = 0, 
                            changeDetected++), newLength = newValue.length, oldLength !== newLength && (changeDetected++, 
                            oldValue.length = oldLength = newLength);
                            for (var i = 0; i < newLength; i++) bothNaN = oldValue[i] !== oldValue[i] && newValue[i] !== newValue[i], 
                            bothNaN || oldValue[i] === newValue[i] || (changeDetected++, oldValue[i] = newValue[i]);
                        } else {
                            oldValue !== internalObject && (oldValue = internalObject = {}, oldLength = 0, changeDetected++), 
                            newLength = 0;
                            for (key in newValue) newValue.hasOwnProperty(key) && (newLength++, oldValue.hasOwnProperty(key) ? (bothNaN = oldValue[key] !== oldValue[key] && newValue[key] !== newValue[key], 
                            bothNaN || oldValue[key] === newValue[key] || (changeDetected++, oldValue[key] = newValue[key])) : (oldLength++, 
                            oldValue[key] = newValue[key], changeDetected++));
                            if (oldLength > newLength) {
                                changeDetected++;
                                for (key in oldValue) oldValue.hasOwnProperty(key) && !newValue.hasOwnProperty(key) && (oldLength--, 
                                delete oldValue[key]);
                            }
                        } else oldValue !== newValue && (oldValue = newValue, changeDetected++);
                        return changeDetected;
                    }
                    function $watchCollectionAction() {
                        if (initRun ? (initRun = !1, listener(newValue, newValue, self)) : listener(newValue, veryOldValue, self), 
                        trackVeryOldValue) if (isObject(newValue)) if (isArrayLike(newValue)) {
                            veryOldValue = new Array(newValue.length);
                            for (var i = 0; i < newValue.length; i++) veryOldValue[i] = newValue[i];
                        } else {
                            veryOldValue = {};
                            for (var key in newValue) hasOwnProperty.call(newValue, key) && (veryOldValue[key] = newValue[key]);
                        } else veryOldValue = newValue;
                    }
                    var newValue, oldValue, veryOldValue, self = this, trackVeryOldValue = listener.length > 1, changeDetected = 0, objGetter = $parse(obj), internalArray = [], internalObject = {}, initRun = !0, oldLength = 0;
                    return this.$watch($watchCollectionWatch, $watchCollectionAction);
                },
                $digest: function() {
                    var watch, value, last, watchers, length, dirty, next, current, logIdx, logMsg, asyncTask, asyncQueue = this.$$asyncQueue, postDigestQueue = this.$$postDigestQueue, ttl = TTL, target = this, watchLog = [];
                    beginPhase("$digest"), $browser.$$checkUrlChange(), lastDirtyWatch = null;
                    do {
                        for (dirty = !1, current = target; asyncQueue.length; ) {
                            try {
                                asyncTask = asyncQueue.shift(), asyncTask.scope.$eval(asyncTask.expression);
                            } catch (e) {
                                clearPhase(), $exceptionHandler(e);
                            }
                            lastDirtyWatch = null;
                        }
                        traverseScopesLoop: do {
                            if (watchers = current.$$watchers) for (length = watchers.length; length--; ) try {
                                if (watch = watchers[length]) if ((value = watch.get(current)) === (last = watch.last) || (watch.eq ? equals(value, last) : "number" == typeof value && "number" == typeof last && isNaN(value) && isNaN(last))) {
                                    if (watch === lastDirtyWatch) {
                                        dirty = !1;
                                        break traverseScopesLoop;
                                    }
                                } else dirty = !0, lastDirtyWatch = watch, watch.last = watch.eq ? copy(value, null) : value, 
                                watch.fn(value, last === initWatchVal ? value : last, current), ttl < 5 && (logIdx = 4 - ttl, 
                                watchLog[logIdx] || (watchLog[logIdx] = []), logMsg = isFunction(watch.exp) ? "fn: " + (watch.exp.name || watch.exp.toString()) : watch.exp, 
                                logMsg += "; newVal: " + toJson(value) + "; oldVal: " + toJson(last), watchLog[logIdx].push(logMsg));
                            } catch (e) {
                                clearPhase(), $exceptionHandler(e);
                            }
                            if (!(next = current.$$childHead || current !== target && current.$$nextSibling)) for (;current !== target && !(next = current.$$nextSibling); ) current = current.$parent;
                        } while (current = next);
                        if ((dirty || asyncQueue.length) && !ttl--) throw clearPhase(), $rootScopeMinErr("infdig", "{0} $digest() iterations reached. Aborting!\nWatchers fired in the last 5 iterations: {1}", TTL, toJson(watchLog));
                    } while (dirty || asyncQueue.length);
                    for (clearPhase(); postDigestQueue.length; ) try {
                        postDigestQueue.shift()();
                    } catch (e) {
                        $exceptionHandler(e);
                    }
                },
                $destroy: function() {
                    if (!this.$$destroyed) {
                        var parent = this.$parent;
                        this.$broadcast("$destroy"), this.$$destroyed = !0, this !== $rootScope && (forEach(this.$$listenerCount, bind(null, decrementListenerCount, this)), 
                        parent.$$childHead == this && (parent.$$childHead = this.$$nextSibling), parent.$$childTail == this && (parent.$$childTail = this.$$prevSibling), 
                        this.$$prevSibling && (this.$$prevSibling.$$nextSibling = this.$$nextSibling), this.$$nextSibling && (this.$$nextSibling.$$prevSibling = this.$$prevSibling), 
                        this.$parent = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = this.$root = null, 
                        this.$$listeners = {}, this.$$watchers = this.$$asyncQueue = this.$$postDigestQueue = [], 
                        this.$destroy = this.$digest = this.$apply = noop, this.$on = this.$watch = function() {
                            return noop;
                        });
                    }
                },
                $eval: function(expr, locals) {
                    return $parse(expr)(this, locals);
                },
                $evalAsync: function(expr) {
                    $rootScope.$$phase || $rootScope.$$asyncQueue.length || $browser.defer(function() {
                        $rootScope.$$asyncQueue.length && $rootScope.$digest();
                    }), this.$$asyncQueue.push({
                        scope: this,
                        expression: expr
                    });
                },
                $$postDigest: function(fn) {
                    this.$$postDigestQueue.push(fn);
                },
                $apply: function(expr) {
                    try {
                        return beginPhase("$apply"), this.$eval(expr);
                    } catch (e) {
                        $exceptionHandler(e);
                    } finally {
                        clearPhase();
                        try {
                            $rootScope.$digest();
                        } catch (e) {
                            throw $exceptionHandler(e), e;
                        }
                    }
                },
                $on: function(name, listener) {
                    var namedListeners = this.$$listeners[name];
                    namedListeners || (this.$$listeners[name] = namedListeners = []), namedListeners.push(listener);
                    var current = this;
                    do current.$$listenerCount[name] || (current.$$listenerCount[name] = 0), current.$$listenerCount[name]++; while (current = current.$parent);
                    var self = this;
                    return function() {
                        var indexOfListener = indexOf(namedListeners, listener);
                        indexOfListener !== -1 && (namedListeners[indexOfListener] = null, decrementListenerCount(self, 1, name));
                    };
                },
                $emit: function(name, args) {
                    var namedListeners, i, length, empty = [], scope = this, stopPropagation = !1, event = {
                        name: name,
                        targetScope: scope,
                        stopPropagation: function() {
                            stopPropagation = !0;
                        },
                        preventDefault: function() {
                            event.defaultPrevented = !0;
                        },
                        defaultPrevented: !1
                    }, listenerArgs = concat([ event ], arguments, 1);
                    do {
                        for (namedListeners = scope.$$listeners[name] || empty, event.currentScope = scope, 
                        i = 0, length = namedListeners.length; i < length; i++) if (namedListeners[i]) try {
                            namedListeners[i].apply(null, listenerArgs);
                        } catch (e) {
                            $exceptionHandler(e);
                        } else namedListeners.splice(i, 1), i--, length--;
                        if (stopPropagation) return event;
                        scope = scope.$parent;
                    } while (scope);
                    return event;
                },
                $broadcast: function(name, args) {
                    for (var listeners, i, length, target = this, current = target, next = target, event = {
                        name: name,
                        targetScope: target,
                        preventDefault: function() {
                            event.defaultPrevented = !0;
                        },
                        defaultPrevented: !1
                    }, listenerArgs = concat([ event ], arguments, 1); current = next; ) {
                        for (event.currentScope = current, listeners = current.$$listeners[name] || [], 
                        i = 0, length = listeners.length; i < length; i++) if (listeners[i]) try {
                            listeners[i].apply(null, listenerArgs);
                        } catch (e) {
                            $exceptionHandler(e);
                        } else listeners.splice(i, 1), i--, length--;
                        if (!(next = current.$$listenerCount[name] && current.$$childHead || current !== target && current.$$nextSibling)) for (;current !== target && !(next = current.$$nextSibling); ) current = current.$parent;
                    }
                    return event;
                }
            };
            var $rootScope = new Scope();
            return $rootScope;
        } ];
    }
    function $$SanitizeUriProvider() {
        var aHrefSanitizationWhitelist = /^\s*(https?|ftp|mailto|tel|file):/, imgSrcSanitizationWhitelist = /^\s*((https?|ftp|file):|data:image\/)/;
        this.aHrefSanitizationWhitelist = function(regexp) {
            return isDefined(regexp) ? (aHrefSanitizationWhitelist = regexp, this) : aHrefSanitizationWhitelist;
        }, this.imgSrcSanitizationWhitelist = function(regexp) {
            return isDefined(regexp) ? (imgSrcSanitizationWhitelist = regexp, this) : imgSrcSanitizationWhitelist;
        }, this.$get = function() {
            return function(uri, isImage) {
                var normalizedVal, regex = isImage ? imgSrcSanitizationWhitelist : aHrefSanitizationWhitelist;
                return msie && !(msie >= 8) || (normalizedVal = urlResolve(uri).href, "" === normalizedVal || normalizedVal.match(regex)) ? uri : "unsafe:" + normalizedVal;
            };
        };
    }
    function escapeForRegexp(s) {
        return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
    }
    function adjustMatcher(matcher) {
        if ("self" === matcher) return matcher;
        if (isString(matcher)) {
            if (matcher.indexOf("***") > -1) throw $sceMinErr("iwcard", "Illegal sequence *** in string matcher.  String: {0}", matcher);
            return matcher = escapeForRegexp(matcher).replace("\\*\\*", ".*").replace("\\*", "[^:/.?&;]*"), 
            new RegExp("^" + matcher + "$");
        }
        if (isRegExp(matcher)) return new RegExp("^" + matcher.source + "$");
        throw $sceMinErr("imatcher", 'Matchers may only be "self", string patterns or RegExp objects');
    }
    function adjustMatchers(matchers) {
        var adjustedMatchers = [];
        return isDefined(matchers) && forEach(matchers, function(matcher) {
            adjustedMatchers.push(adjustMatcher(matcher));
        }), adjustedMatchers;
    }
    function $SceDelegateProvider() {
        this.SCE_CONTEXTS = SCE_CONTEXTS;
        var resourceUrlWhitelist = [ "self" ], resourceUrlBlacklist = [];
        this.resourceUrlWhitelist = function(value) {
            return arguments.length && (resourceUrlWhitelist = adjustMatchers(value)), resourceUrlWhitelist;
        }, this.resourceUrlBlacklist = function(value) {
            return arguments.length && (resourceUrlBlacklist = adjustMatchers(value)), resourceUrlBlacklist;
        }, this.$get = [ "$injector", function($injector) {
            function matchUrl(matcher, parsedUrl) {
                return "self" === matcher ? urlIsSameOrigin(parsedUrl) : !!matcher.exec(parsedUrl.href);
            }
            function isResourceUrlAllowedByPolicy(url) {
                var i, n, parsedUrl = urlResolve(url.toString()), allowed = !1;
                for (i = 0, n = resourceUrlWhitelist.length; i < n; i++) if (matchUrl(resourceUrlWhitelist[i], parsedUrl)) {
                    allowed = !0;
                    break;
                }
                if (allowed) for (i = 0, n = resourceUrlBlacklist.length; i < n; i++) if (matchUrl(resourceUrlBlacklist[i], parsedUrl)) {
                    allowed = !1;
                    break;
                }
                return allowed;
            }
            function generateHolderType(Base) {
                var holderType = function(trustedValue) {
                    this.$$unwrapTrustedValue = function() {
                        return trustedValue;
                    };
                };
                return Base && (holderType.prototype = new Base()), holderType.prototype.valueOf = function() {
                    return this.$$unwrapTrustedValue();
                }, holderType.prototype.toString = function() {
                    return this.$$unwrapTrustedValue().toString();
                }, holderType;
            }
            function trustAs(type, trustedValue) {
                var Constructor = byType.hasOwnProperty(type) ? byType[type] : null;
                if (!Constructor) throw $sceMinErr("icontext", "Attempted to trust a value in invalid context. Context: {0}; Value: {1}", type, trustedValue);
                if (null === trustedValue || trustedValue === undefined || "" === trustedValue) return trustedValue;
                if ("string" != typeof trustedValue) throw $sceMinErr("itype", "Attempted to trust a non-string value in a content requiring a string: Context: {0}", type);
                return new Constructor(trustedValue);
            }
            function valueOf(maybeTrusted) {
                return maybeTrusted instanceof trustedValueHolderBase ? maybeTrusted.$$unwrapTrustedValue() : maybeTrusted;
            }
            function getTrusted(type, maybeTrusted) {
                if (null === maybeTrusted || maybeTrusted === undefined || "" === maybeTrusted) return maybeTrusted;
                var constructor = byType.hasOwnProperty(type) ? byType[type] : null;
                if (constructor && maybeTrusted instanceof constructor) return maybeTrusted.$$unwrapTrustedValue();
                if (type === SCE_CONTEXTS.RESOURCE_URL) {
                    if (isResourceUrlAllowedByPolicy(maybeTrusted)) return maybeTrusted;
                    throw $sceMinErr("insecurl", "Blocked loading resource from url not allowed by $sceDelegate policy.  URL: {0}", maybeTrusted.toString());
                }
                if (type === SCE_CONTEXTS.HTML) return htmlSanitizer(maybeTrusted);
                throw $sceMinErr("unsafe", "Attempting to use an unsafe value in a safe context.");
            }
            var htmlSanitizer = function(html) {
                throw $sceMinErr("unsafe", "Attempting to use an unsafe value in a safe context.");
            };
            $injector.has("$sanitize") && (htmlSanitizer = $injector.get("$sanitize"));
            var trustedValueHolderBase = generateHolderType(), byType = {};
            return byType[SCE_CONTEXTS.HTML] = generateHolderType(trustedValueHolderBase), byType[SCE_CONTEXTS.CSS] = generateHolderType(trustedValueHolderBase), 
            byType[SCE_CONTEXTS.URL] = generateHolderType(trustedValueHolderBase), byType[SCE_CONTEXTS.JS] = generateHolderType(trustedValueHolderBase), 
            byType[SCE_CONTEXTS.RESOURCE_URL] = generateHolderType(byType[SCE_CONTEXTS.URL]), 
            {
                trustAs: trustAs,
                getTrusted: getTrusted,
                valueOf: valueOf
            };
        } ];
    }
    function $SceProvider() {
        var enabled = !0;
        this.enabled = function(value) {
            return arguments.length && (enabled = !!value), enabled;
        }, this.$get = [ "$parse", "$sniffer", "$sceDelegate", function($parse, $sniffer, $sceDelegate) {
            if (enabled && $sniffer.msie && $sniffer.msieDocumentMode < 8) throw $sceMinErr("iequirks", "Strict Contextual Escaping does not support Internet Explorer version < 9 in quirks mode.  You can fix this by adding the text <!doctype html> to the top of your HTML document.  See http://docs.angularjs.org/api/ng.$sce for more information.");
            var sce = shallowCopy(SCE_CONTEXTS);
            sce.isEnabled = function() {
                return enabled;
            }, sce.trustAs = $sceDelegate.trustAs, sce.getTrusted = $sceDelegate.getTrusted, 
            sce.valueOf = $sceDelegate.valueOf, enabled || (sce.trustAs = sce.getTrusted = function(type, value) {
                return value;
            }, sce.valueOf = identity), sce.parseAs = function(type, expr) {
                var parsed = $parse(expr);
                return parsed.literal && parsed.constant ? parsed : function(self, locals) {
                    return sce.getTrusted(type, parsed(self, locals));
                };
            };
            var parse = sce.parseAs, getTrusted = sce.getTrusted, trustAs = sce.trustAs;
            return forEach(SCE_CONTEXTS, function(enumValue, name) {
                var lName = lowercase(name);
                sce[camelCase("parse_as_" + lName)] = function(expr) {
                    return parse(enumValue, expr);
                }, sce[camelCase("get_trusted_" + lName)] = function(value) {
                    return getTrusted(enumValue, value);
                }, sce[camelCase("trust_as_" + lName)] = function(value) {
                    return trustAs(enumValue, value);
                };
            }), sce;
        } ];
    }
    function $SnifferProvider() {
        this.$get = [ "$window", "$document", function($window, $document) {
            var vendorPrefix, match, eventSupport = {}, android = int((/android (\d+)/.exec(lowercase(($window.navigator || {}).userAgent)) || [])[1]), boxee = /Boxee/i.test(($window.navigator || {}).userAgent), document = $document[0] || {}, documentMode = document.documentMode, vendorRegex = /^(Moz|webkit|O|ms)(?=[A-Z])/, bodyStyle = document.body && document.body.style, transitions = !1, animations = !1;
            if (bodyStyle) {
                for (var prop in bodyStyle) if (match = vendorRegex.exec(prop)) {
                    vendorPrefix = match[0], vendorPrefix = vendorPrefix.substr(0, 1).toUpperCase() + vendorPrefix.substr(1);
                    break;
                }
                vendorPrefix || (vendorPrefix = "WebkitOpacity" in bodyStyle && "webkit"), transitions = !!("transition" in bodyStyle || vendorPrefix + "Transition" in bodyStyle), 
                animations = !!("animation" in bodyStyle || vendorPrefix + "Animation" in bodyStyle), 
                !android || transitions && animations || (transitions = isString(document.body.style.webkitTransition), 
                animations = isString(document.body.style.webkitAnimation));
            }
            return {
                history: !(!$window.history || !$window.history.pushState || android < 4 || boxee),
                hashchange: "onhashchange" in $window && (!documentMode || documentMode > 7),
                hasEvent: function(event) {
                    if ("input" == event && 9 == msie) return !1;
                    if (isUndefined(eventSupport[event])) {
                        var divElm = document.createElement("div");
                        eventSupport[event] = "on" + event in divElm;
                    }
                    return eventSupport[event];
                },
                csp: csp(),
                vendorPrefix: vendorPrefix,
                transitions: transitions,
                animations: animations,
                android: android,
                msie: msie,
                msieDocumentMode: documentMode
            };
        } ];
    }
    function $TimeoutProvider() {
        this.$get = [ "$rootScope", "$browser", "$q", "$exceptionHandler", function($rootScope, $browser, $q, $exceptionHandler) {
            function timeout(fn, delay, invokeApply) {
                var timeoutId, deferred = $q.defer(), promise = deferred.promise, skipApply = isDefined(invokeApply) && !invokeApply;
                return timeoutId = $browser.defer(function() {
                    try {
                        deferred.resolve(fn());
                    } catch (e) {
                        deferred.reject(e), $exceptionHandler(e);
                    } finally {
                        delete deferreds[promise.$$timeoutId];
                    }
                    skipApply || $rootScope.$apply();
                }, delay), promise.$$timeoutId = timeoutId, deferreds[timeoutId] = deferred, promise;
            }
            var deferreds = {};
            return timeout.cancel = function(promise) {
                return !!(promise && promise.$$timeoutId in deferreds) && (deferreds[promise.$$timeoutId].reject("canceled"), 
                delete deferreds[promise.$$timeoutId], $browser.defer.cancel(promise.$$timeoutId));
            }, timeout;
        } ];
    }
    function urlResolve(url, base) {
        var href = url;
        return msie && (urlParsingNode.setAttribute("href", href), href = urlParsingNode.href), 
        urlParsingNode.setAttribute("href", href), {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: "/" === urlParsingNode.pathname.charAt(0) ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
        };
    }
    function urlIsSameOrigin(requestUrl) {
        var parsed = isString(requestUrl) ? urlResolve(requestUrl) : requestUrl;
        return parsed.protocol === originUrl.protocol && parsed.host === originUrl.host;
    }
    function $WindowProvider() {
        this.$get = valueFn(window);
    }
    function $FilterProvider($provide) {
        function register(name, factory) {
            if (isObject(name)) {
                var filters = {};
                return forEach(name, function(filter, key) {
                    filters[key] = register(key, filter);
                }), filters;
            }
            return $provide.factory(name + suffix, factory);
        }
        var suffix = "Filter";
        this.register = register, this.$get = [ "$injector", function($injector) {
            return function(name) {
                return $injector.get(name + suffix);
            };
        } ], register("currency", currencyFilter), register("date", dateFilter), register("filter", filterFilter), 
        register("json", jsonFilter), register("limitTo", limitToFilter), register("lowercase", lowercaseFilter), 
        register("number", numberFilter), register("orderBy", orderByFilter), register("uppercase", uppercaseFilter);
    }
    function filterFilter() {
        return function(array, expression, comparator) {
            if (!isArray(array)) return array;
            var comparatorType = typeof comparator, predicates = [];
            predicates.check = function(value) {
                for (var j = 0; j < predicates.length; j++) if (!predicates[j](value)) return !1;
                return !0;
            }, "function" !== comparatorType && (comparator = "boolean" === comparatorType && comparator ? function(obj, text) {
                return angular.equals(obj, text);
            } : function(obj, text) {
                if (obj && text && "object" == typeof obj && "object" == typeof text) {
                    for (var objKey in obj) if ("$" !== objKey.charAt(0) && hasOwnProperty.call(obj, objKey) && comparator(obj[objKey], text[objKey])) return !0;
                    return !1;
                }
                return text = ("" + text).toLowerCase(), ("" + obj).toLowerCase().indexOf(text) > -1;
            });
            var search = function(obj, text) {
                if ("string" == typeof text && "!" === text.charAt(0)) return !search(obj, text.substr(1));
                switch (typeof obj) {
                  case "boolean":
                  case "number":
                  case "string":
                    return comparator(obj, text);

                  case "object":
                    switch (typeof text) {
                      case "object":
                        return comparator(obj, text);

                      default:
                        for (var objKey in obj) if ("$" !== objKey.charAt(0) && search(obj[objKey], text)) return !0;
                    }
                    return !1;

                  case "array":
                    for (var i = 0; i < obj.length; i++) if (search(obj[i], text)) return !0;
                    return !1;

                  default:
                    return !1;
                }
            };
            switch (typeof expression) {
              case "boolean":
              case "number":
              case "string":
                expression = {
                    $: expression
                };

              case "object":
                for (var key in expression) !function(path) {
                    "undefined" != typeof expression[path] && predicates.push(function(value) {
                        return search("$" == path ? value : value && value[path], expression[path]);
                    });
                }(key);
                break;

              case "function":
                predicates.push(expression);
                break;

              default:
                return array;
            }
            for (var filtered = [], j = 0; j < array.length; j++) {
                var value = array[j];
                predicates.check(value) && filtered.push(value);
            }
            return filtered;
        };
    }
    function currencyFilter($locale) {
        var formats = $locale.NUMBER_FORMATS;
        return function(amount, currencySymbol) {
            return isUndefined(currencySymbol) && (currencySymbol = formats.CURRENCY_SYM), formatNumber(amount, formats.PATTERNS[1], formats.GROUP_SEP, formats.DECIMAL_SEP, 2).replace(/\u00A4/g, currencySymbol);
        };
    }
    function numberFilter($locale) {
        var formats = $locale.NUMBER_FORMATS;
        return function(number, fractionSize) {
            return formatNumber(number, formats.PATTERNS[0], formats.GROUP_SEP, formats.DECIMAL_SEP, fractionSize);
        };
    }
    function formatNumber(number, pattern, groupSep, decimalSep, fractionSize) {
        if (null == number || !isFinite(number) || isObject(number)) return "";
        var isNegative = number < 0;
        number = Math.abs(number);
        var numStr = number + "", formatedText = "", parts = [], hasExponent = !1;
        if (numStr.indexOf("e") !== -1) {
            var match = numStr.match(/([\d\.]+)e(-?)(\d+)/);
            match && "-" == match[2] && match[3] > fractionSize + 1 ? (numStr = "0", number = 0) : (formatedText = numStr, 
            hasExponent = !0);
        }
        if (hasExponent) fractionSize > 0 && number > -1 && number < 1 && (formatedText = number.toFixed(fractionSize)); else {
            var fractionLen = (numStr.split(DECIMAL_SEP)[1] || "").length;
            isUndefined(fractionSize) && (fractionSize = Math.min(Math.max(pattern.minFrac, fractionLen), pattern.maxFrac)), 
            number = +(Math.round(+(number.toString() + "e" + fractionSize)).toString() + "e" + -fractionSize), 
            0 === number && (isNegative = !1);
            var fraction = ("" + number).split(DECIMAL_SEP), whole = fraction[0];
            fraction = fraction[1] || "";
            var i, pos = 0, lgroup = pattern.lgSize, group = pattern.gSize;
            if (whole.length >= lgroup + group) for (pos = whole.length - lgroup, i = 0; i < pos; i++) (pos - i) % group === 0 && 0 !== i && (formatedText += groupSep), 
            formatedText += whole.charAt(i);
            for (i = pos; i < whole.length; i++) (whole.length - i) % lgroup === 0 && 0 !== i && (formatedText += groupSep), 
            formatedText += whole.charAt(i);
            for (;fraction.length < fractionSize; ) fraction += "0";
            fractionSize && "0" !== fractionSize && (formatedText += decimalSep + fraction.substr(0, fractionSize));
        }
        return parts.push(isNegative ? pattern.negPre : pattern.posPre), parts.push(formatedText), 
        parts.push(isNegative ? pattern.negSuf : pattern.posSuf), parts.join("");
    }
    function padNumber(num, digits, trim) {
        var neg = "";
        for (num < 0 && (neg = "-", num = -num), num = "" + num; num.length < digits; ) num = "0" + num;
        return trim && (num = num.substr(num.length - digits)), neg + num;
    }
    function dateGetter(name, size, offset, trim) {
        return offset = offset || 0, function(date) {
            var value = date["get" + name]();
            return (offset > 0 || value > -offset) && (value += offset), 0 === value && offset == -12 && (value = 12), 
            padNumber(value, size, trim);
        };
    }
    function dateStrGetter(name, shortForm) {
        return function(date, formats) {
            var value = date["get" + name](), get = uppercase(shortForm ? "SHORT" + name : name);
            return formats[get][value];
        };
    }
    function timeZoneGetter(date) {
        var zone = -1 * date.getTimezoneOffset(), paddedZone = zone >= 0 ? "+" : "";
        return paddedZone += padNumber(Math[zone > 0 ? "floor" : "ceil"](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2);
    }
    function ampmGetter(date, formats) {
        return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1];
    }
    function dateFilter($locale) {
        function jsonStringToDate(string) {
            var match;
            if (match = string.match(R_ISO8601_STR)) {
                var date = new Date(0), tzHour = 0, tzMin = 0, dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear, timeSetter = match[8] ? date.setUTCHours : date.setHours;
                match[9] && (tzHour = int(match[9] + match[10]), tzMin = int(match[9] + match[11])), 
                dateSetter.call(date, int(match[1]), int(match[2]) - 1, int(match[3]));
                var h = int(match[4] || 0) - tzHour, m = int(match[5] || 0) - tzMin, s = int(match[6] || 0), ms = Math.round(1e3 * parseFloat("0." + (match[7] || 0)));
                return timeSetter.call(date, h, m, s, ms), date;
            }
            return string;
        }
        var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
        return function(date, format) {
            var fn, match, text = "", parts = [];
            if (format = format || "mediumDate", format = $locale.DATETIME_FORMATS[format] || format, 
            isString(date) && (date = NUMBER_STRING.test(date) ? int(date) : jsonStringToDate(date)), 
            isNumber(date) && (date = new Date(date)), !isDate(date)) return date;
            for (;format; ) match = DATE_FORMATS_SPLIT.exec(format), match ? (parts = concat(parts, match, 1), 
            format = parts.pop()) : (parts.push(format), format = null);
            return forEach(parts, function(value) {
                fn = DATE_FORMATS[value], text += fn ? fn(date, $locale.DATETIME_FORMATS) : value.replace(/(^'|'$)/g, "").replace(/''/g, "'");
            }), text;
        };
    }
    function jsonFilter() {
        return function(object) {
            return toJson(object, !0);
        };
    }
    function limitToFilter() {
        return function(input, limit) {
            return isArray(input) || isString(input) ? (limit = Math.abs(Number(limit)) === 1 / 0 ? Number(limit) : int(limit), 
            limit ? limit > 0 ? input.slice(0, limit) : input.slice(limit) : isString(input) ? "" : []) : input;
        };
    }
    function orderByFilter($parse) {
        return function(array, sortPredicate, reverseOrder) {
            function comparator(o1, o2) {
                for (var i = 0; i < sortPredicate.length; i++) {
                    var comp = sortPredicate[i](o1, o2);
                    if (0 !== comp) return comp;
                }
                return 0;
            }
            function reverseComparator(comp, descending) {
                return toBoolean(descending) ? function(a, b) {
                    return comp(b, a);
                } : comp;
            }
            function compare(v1, v2) {
                var t1 = typeof v1, t2 = typeof v2;
                return t1 == t2 ? (isDate(v1) && isDate(v2) && (v1 = v1.valueOf(), v2 = v2.valueOf()), 
                "string" == t1 && (v1 = v1.toLowerCase(), v2 = v2.toLowerCase()), v1 === v2 ? 0 : v1 < v2 ? -1 : 1) : t1 < t2 ? -1 : 1;
            }
            return isArrayLike(array) ? (sortPredicate = isArray(sortPredicate) ? sortPredicate : [ sortPredicate ], 
            0 === sortPredicate.length && (sortPredicate = [ "+" ]), sortPredicate = map(sortPredicate, function(predicate) {
                var descending = !1, get = predicate || identity;
                if (isString(predicate)) {
                    if ("+" != predicate.charAt(0) && "-" != predicate.charAt(0) || (descending = "-" == predicate.charAt(0), 
                    predicate = predicate.substring(1)), "" === predicate) return reverseComparator(function(a, b) {
                        return compare(a, b);
                    }, descending);
                    if (get = $parse(predicate), get.constant) {
                        var key = get();
                        return reverseComparator(function(a, b) {
                            return compare(a[key], b[key]);
                        }, descending);
                    }
                }
                return reverseComparator(function(a, b) {
                    return compare(get(a), get(b));
                }, descending);
            }), slice.call(array).sort(reverseComparator(comparator, reverseOrder))) : array;
        };
    }
    function ngDirective(directive) {
        return isFunction(directive) && (directive = {
            link: directive
        }), directive.restrict = directive.restrict || "AC", valueFn(directive);
    }
    function FormController(element, attrs, $scope, $animate) {
        function toggleValidCss(isValid, validationErrorKey) {
            validationErrorKey = validationErrorKey ? "-" + snake_case(validationErrorKey, "-") : "", 
            $animate.setClass(element, (isValid ? VALID_CLASS : INVALID_CLASS) + validationErrorKey, (isValid ? INVALID_CLASS : VALID_CLASS) + validationErrorKey);
        }
        var form = this, parentForm = element.parent().controller("form") || nullFormCtrl, invalidCount = 0, errors = form.$error = {}, controls = [];
        form.$name = attrs.name || attrs.ngForm, form.$dirty = !1, form.$pristine = !0, 
        form.$valid = !0, form.$invalid = !1, parentForm.$addControl(form), element.addClass(PRISTINE_CLASS), 
        toggleValidCss(!0), form.$addControl = function(control) {
            assertNotHasOwnProperty(control.$name, "input"), controls.push(control), control.$name && (form[control.$name] = control);
        }, form.$removeControl = function(control) {
            control.$name && form[control.$name] === control && delete form[control.$name], 
            forEach(errors, function(queue, validationToken) {
                form.$setValidity(validationToken, !0, control);
            }), arrayRemove(controls, control);
        }, form.$setValidity = function(validationToken, isValid, control) {
            var queue = errors[validationToken];
            if (isValid) queue && (arrayRemove(queue, control), queue.length || (invalidCount--, 
            invalidCount || (toggleValidCss(isValid), form.$valid = !0, form.$invalid = !1), 
            errors[validationToken] = !1, toggleValidCss(!0, validationToken), parentForm.$setValidity(validationToken, !0, form))); else {
                if (invalidCount || toggleValidCss(isValid), queue) {
                    if (includes(queue, control)) return;
                } else errors[validationToken] = queue = [], invalidCount++, toggleValidCss(!1, validationToken), 
                parentForm.$setValidity(validationToken, !1, form);
                queue.push(control), form.$valid = !1, form.$invalid = !0;
            }
        }, form.$setDirty = function() {
            $animate.removeClass(element, PRISTINE_CLASS), $animate.addClass(element, DIRTY_CLASS), 
            form.$dirty = !0, form.$pristine = !1, parentForm.$setDirty();
        }, form.$setPristine = function() {
            $animate.removeClass(element, DIRTY_CLASS), $animate.addClass(element, PRISTINE_CLASS), 
            form.$dirty = !1, form.$pristine = !0, forEach(controls, function(control) {
                control.$setPristine();
            });
        };
    }
    function validate(ctrl, validatorName, validity, value) {
        return ctrl.$setValidity(validatorName, validity), validity ? value : undefined;
    }
    function testFlags(validity, flags) {
        var i, flag;
        if (flags) for (i = 0; i < flags.length; ++i) if (flag = flags[i], validity[flag]) return !0;
        return !1;
    }
    function addNativeHtml5Validators(ctrl, validatorName, badFlags, ignoreFlags, validity) {
        if (isObject(validity)) {
            ctrl.$$hasNativeValidators = !0;
            var validator = function(value) {
                return ctrl.$error[validatorName] || testFlags(validity, ignoreFlags) || !testFlags(validity, badFlags) ? value : void ctrl.$setValidity(validatorName, !1);
            };
            ctrl.$parsers.push(validator);
        }
    }
    function textInputType(scope, element, attr, ctrl, $sniffer, $browser) {
        var validity = element.prop(VALIDITY_STATE_PROPERTY), placeholder = element[0].placeholder, noevent = {}, type = lowercase(element[0].type);
        if (ctrl.$$validityState = validity, !$sniffer.android) {
            var composing = !1;
            element.on("compositionstart", function(data) {
                composing = !0;
            }), element.on("compositionend", function() {
                composing = !1, listener();
            });
        }
        var listener = function(ev) {
            if (!composing) {
                var value = element.val();
                if (msie && "input" === (ev || noevent).type && element[0].placeholder !== placeholder) return void (placeholder = element[0].placeholder);
                "password" !== type && toBoolean(attr.ngTrim || "T") && (value = trim(value));
                var revalidate = validity && ctrl.$$hasNativeValidators;
                (ctrl.$viewValue !== value || "" === value && revalidate) && (scope.$root.$$phase ? ctrl.$setViewValue(value) : scope.$apply(function() {
                    ctrl.$setViewValue(value);
                }));
            }
        };
        if ($sniffer.hasEvent("input")) element.on("input", listener); else {
            var timeout, deferListener = function() {
                timeout || (timeout = $browser.defer(function() {
                    listener(), timeout = null;
                }));
            };
            element.on("keydown", function(event) {
                var key = event.keyCode;
                91 === key || 15 < key && key < 19 || 37 <= key && key <= 40 || deferListener();
            }), $sniffer.hasEvent("paste") && element.on("paste cut", deferListener);
        }
        element.on("change", listener), ctrl.$render = function() {
            element.val(ctrl.$isEmpty(ctrl.$viewValue) ? "" : ctrl.$viewValue);
        };
        var patternValidator, match, pattern = attr.ngPattern;
        if (pattern) {
            var validateRegex = function(regexp, value) {
                return validate(ctrl, "pattern", ctrl.$isEmpty(value) || regexp.test(value), value);
            };
            match = pattern.match(/^\/(.*)\/([gim]*)$/), match ? (pattern = new RegExp(match[1], match[2]), 
            patternValidator = function(value) {
                return validateRegex(pattern, value);
            }) : patternValidator = function(value) {
                var patternObj = scope.$eval(pattern);
                if (!patternObj || !patternObj.test) throw minErr("ngPattern")("noregexp", "Expected {0} to be a RegExp but was {1}. Element: {2}", pattern, patternObj, startingTag(element));
                return validateRegex(patternObj, value);
            }, ctrl.$formatters.push(patternValidator), ctrl.$parsers.push(patternValidator);
        }
        if (attr.ngMinlength) {
            var minlength = int(attr.ngMinlength), minLengthValidator = function(value) {
                return validate(ctrl, "minlength", ctrl.$isEmpty(value) || value.length >= minlength, value);
            };
            ctrl.$parsers.push(minLengthValidator), ctrl.$formatters.push(minLengthValidator);
        }
        if (attr.ngMaxlength) {
            var maxlength = int(attr.ngMaxlength), maxLengthValidator = function(value) {
                return validate(ctrl, "maxlength", ctrl.$isEmpty(value) || value.length <= maxlength, value);
            };
            ctrl.$parsers.push(maxLengthValidator), ctrl.$formatters.push(maxLengthValidator);
        }
    }
    function numberInputType(scope, element, attr, ctrl, $sniffer, $browser) {
        if (textInputType(scope, element, attr, ctrl, $sniffer, $browser), ctrl.$parsers.push(function(value) {
            var empty = ctrl.$isEmpty(value);
            return empty || NUMBER_REGEXP.test(value) ? (ctrl.$setValidity("number", !0), "" === value ? null : empty ? value : parseFloat(value)) : (ctrl.$setValidity("number", !1), 
            undefined);
        }), addNativeHtml5Validators(ctrl, "number", numberBadFlags, null, ctrl.$$validityState), 
        ctrl.$formatters.push(function(value) {
            return ctrl.$isEmpty(value) ? "" : "" + value;
        }), attr.min) {
            var minValidator = function(value) {
                var min = parseFloat(attr.min);
                return validate(ctrl, "min", ctrl.$isEmpty(value) || value >= min, value);
            };
            ctrl.$parsers.push(minValidator), ctrl.$formatters.push(minValidator);
        }
        if (attr.max) {
            var maxValidator = function(value) {
                var max = parseFloat(attr.max);
                return validate(ctrl, "max", ctrl.$isEmpty(value) || value <= max, value);
            };
            ctrl.$parsers.push(maxValidator), ctrl.$formatters.push(maxValidator);
        }
        ctrl.$formatters.push(function(value) {
            return validate(ctrl, "number", ctrl.$isEmpty(value) || isNumber(value), value);
        });
    }
    function urlInputType(scope, element, attr, ctrl, $sniffer, $browser) {
        textInputType(scope, element, attr, ctrl, $sniffer, $browser);
        var urlValidator = function(value) {
            return validate(ctrl, "url", ctrl.$isEmpty(value) || URL_REGEXP.test(value), value);
        };
        ctrl.$formatters.push(urlValidator), ctrl.$parsers.push(urlValidator);
    }
    function emailInputType(scope, element, attr, ctrl, $sniffer, $browser) {
        textInputType(scope, element, attr, ctrl, $sniffer, $browser);
        var emailValidator = function(value) {
            return validate(ctrl, "email", ctrl.$isEmpty(value) || EMAIL_REGEXP.test(value), value);
        };
        ctrl.$formatters.push(emailValidator), ctrl.$parsers.push(emailValidator);
    }
    function radioInputType(scope, element, attr, ctrl) {
        isUndefined(attr.name) && element.attr("name", nextUid()), element.on("click", function() {
            element[0].checked && scope.$apply(function() {
                ctrl.$setViewValue(attr.value);
            });
        }), ctrl.$render = function() {
            var value = attr.value;
            element[0].checked = value == ctrl.$viewValue;
        }, attr.$observe("value", ctrl.$render);
    }
    function checkboxInputType(scope, element, attr, ctrl) {
        var trueValue = attr.ngTrueValue, falseValue = attr.ngFalseValue;
        isString(trueValue) || (trueValue = !0), isString(falseValue) || (falseValue = !1), 
        element.on("click", function() {
            scope.$apply(function() {
                ctrl.$setViewValue(element[0].checked);
            });
        }), ctrl.$render = function() {
            element[0].checked = ctrl.$viewValue;
        }, ctrl.$isEmpty = function(value) {
            return value !== trueValue;
        }, ctrl.$formatters.push(function(value) {
            return value === trueValue;
        }), ctrl.$parsers.push(function(value) {
            return value ? trueValue : falseValue;
        });
    }
    function classDirective(name, selector) {
        return name = "ngClass" + name, [ "$animate", function($animate) {
            function arrayDifference(tokens1, tokens2) {
                var values = [];
                outer: for (var i = 0; i < tokens1.length; i++) {
                    for (var token = tokens1[i], j = 0; j < tokens2.length; j++) if (token == tokens2[j]) continue outer;
                    values.push(token);
                }
                return values;
            }
            function arrayClasses(classVal) {
                if (isArray(classVal)) return classVal;
                if (isString(classVal)) return classVal.split(" ");
                if (isObject(classVal)) {
                    var classes = [];
                    return forEach(classVal, function(v, k) {
                        v && (classes = classes.concat(k.split(" ")));
                    }), classes;
                }
                return classVal;
            }
            return {
                restrict: "AC",
                link: function(scope, element, attr) {
                    function addClasses(classes) {
                        var newClasses = digestClassCounts(classes, 1);
                        attr.$addClass(newClasses);
                    }
                    function removeClasses(classes) {
                        var newClasses = digestClassCounts(classes, -1);
                        attr.$removeClass(newClasses);
                    }
                    function digestClassCounts(classes, count) {
                        var classCounts = element.data("$classCounts") || {}, classesToUpdate = [];
                        return forEach(classes, function(className) {
                            (count > 0 || classCounts[className]) && (classCounts[className] = (classCounts[className] || 0) + count, 
                            classCounts[className] === +(count > 0) && classesToUpdate.push(className));
                        }), element.data("$classCounts", classCounts), classesToUpdate.join(" ");
                    }
                    function updateClasses(oldClasses, newClasses) {
                        var toAdd = arrayDifference(newClasses, oldClasses), toRemove = arrayDifference(oldClasses, newClasses);
                        toRemove = digestClassCounts(toRemove, -1), toAdd = digestClassCounts(toAdd, 1), 
                        0 === toAdd.length ? $animate.removeClass(element, toRemove) : 0 === toRemove.length ? $animate.addClass(element, toAdd) : $animate.setClass(element, toAdd, toRemove);
                    }
                    function ngClassWatchAction(newVal) {
                        if (selector === !0 || scope.$index % 2 === selector) {
                            var newClasses = arrayClasses(newVal || []);
                            if (oldVal) {
                                if (!equals(newVal, oldVal)) {
                                    var oldClasses = arrayClasses(oldVal);
                                    updateClasses(oldClasses, newClasses);
                                }
                            } else addClasses(newClasses);
                        }
                        oldVal = shallowCopy(newVal);
                    }
                    var oldVal;
                    scope.$watch(attr[name], ngClassWatchAction, !0), attr.$observe("class", function(value) {
                        ngClassWatchAction(scope.$eval(attr[name]));
                    }), "ngClass" !== name && scope.$watch("$index", function($index, old$index) {
                        var mod = 1 & $index;
                        if (mod !== (1 & old$index)) {
                            var classes = arrayClasses(scope.$eval(attr[name]));
                            mod === selector ? addClasses(classes) : removeClasses(classes);
                        }
                    });
                }
            };
        } ];
    }
    var VALIDITY_STATE_PROPERTY = "validity", lowercase = function(string) {
        return isString(string) ? string.toLowerCase() : string;
    }, hasOwnProperty = Object.prototype.hasOwnProperty, uppercase = function(string) {
        return isString(string) ? string.toUpperCase() : string;
    }, manualLowercase = function(s) {
        return isString(s) ? s.replace(/[A-Z]/g, function(ch) {
            return String.fromCharCode(32 | ch.charCodeAt(0));
        }) : s;
    }, manualUppercase = function(s) {
        return isString(s) ? s.replace(/[a-z]/g, function(ch) {
            return String.fromCharCode(ch.charCodeAt(0) & -33);
        }) : s;
    };
    "i" !== "I".toLowerCase() && (lowercase = manualLowercase, uppercase = manualUppercase);
    var msie, jqLite, jQuery, angularModule, nodeName_, slice = [].slice, push = [].push, toString = Object.prototype.toString, ngMinErr = minErr("ng"), angular = window.angular || (window.angular = {}), uid = [ "0", "0", "0" ];
    msie = int((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]), isNaN(msie) && (msie = int((/trident\/.*; rv:(\d+)/.exec(lowercase(navigator.userAgent)) || [])[1])), 
    noop.$inject = [], identity.$inject = [];
    var isArray = function() {
        return isFunction(Array.isArray) ? Array.isArray : function(value) {
            return "[object Array]" === toString.call(value);
        };
    }(), trim = function() {
        return String.prototype.trim ? function(value) {
            return isString(value) ? value.trim() : value;
        } : function(value) {
            return isString(value) ? value.replace(/^\s\s*/, "").replace(/\s\s*$/, "") : value;
        };
    }();
    nodeName_ = msie < 9 ? function(element) {
        return element = element.nodeName ? element : element[0], element.scopeName && "HTML" != element.scopeName ? uppercase(element.scopeName + ":" + element.nodeName) : element.nodeName;
    } : function(element) {
        return element.nodeName ? element.nodeName : element[0].nodeName;
    };
    var csp = function() {
        if (isDefined(csp.isActive_)) return csp.isActive_;
        var active = !(!document.querySelector("[ng-csp]") && !document.querySelector("[data-ng-csp]"));
        if (!active) try {
            new Function("");
        } catch (e) {
            active = !0;
        }
        return csp.isActive_ = active;
    }, SNAKE_CASE_REGEXP = /[A-Z]/g, version = {
        full: "1.2.30",
        major: 1,
        minor: 2,
        dot: 30,
        codeName: "patronal-resurrection"
    };
    JQLite.expando = "ng339";
    var jqCache = JQLite.cache = {}, jqId = 1, addEventListenerFn = window.document.addEventListener ? function(element, type, fn) {
        element.addEventListener(type, fn, !1);
    } : function(element, type, fn) {
        element.attachEvent("on" + type, fn);
    }, removeEventListenerFn = window.document.removeEventListener ? function(element, type, fn) {
        element.removeEventListener(type, fn, !1);
    } : function(element, type, fn) {
        element.detachEvent("on" + type, fn);
    }, SPECIAL_CHARS_REGEXP = (JQLite._data = function(node) {
        return this.cache[node[this.expando]] || {};
    }, /([\:\-\_]+(.))/g), MOZ_HACK_REGEXP = /^moz([A-Z])/, jqLiteMinErr = minErr("jqLite"), SINGLE_TAG_REGEXP = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, HTML_REGEXP = /<|&#?\w+;/, TAG_NAME_REGEXP = /<([\w:]+)/, XHTML_TAG_REGEXP = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, wrapMap = {
        option: [ 1, '<select multiple="multiple">', "</select>" ],
        thead: [ 1, "<table>", "</table>" ],
        col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
        _default: [ 0, "", "" ]
    };
    wrapMap.optgroup = wrapMap.option, wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead, 
    wrapMap.th = wrapMap.td;
    var JQLitePrototype = JQLite.prototype = {
        ready: function(fn) {
            function trigger() {
                fired || (fired = !0, fn());
            }
            var fired = !1;
            "complete" === document.readyState ? setTimeout(trigger) : (this.on("DOMContentLoaded", trigger), 
            JQLite(window).on("load", trigger));
        },
        toString: function() {
            var value = [];
            return forEach(this, function(e) {
                value.push("" + e);
            }), "[" + value.join(", ") + "]";
        },
        eq: function(index) {
            return jqLite(index >= 0 ? this[index] : this[this.length + index]);
        },
        length: 0,
        push: push,
        sort: [].sort,
        splice: [].splice
    }, BOOLEAN_ATTR = {};
    forEach("multiple,selected,checked,disabled,readOnly,required,open".split(","), function(value) {
        BOOLEAN_ATTR[lowercase(value)] = value;
    });
    var BOOLEAN_ELEMENTS = {};
    forEach("input,select,option,textarea,button,form,details".split(","), function(value) {
        BOOLEAN_ELEMENTS[uppercase(value)] = !0;
    }), forEach({
        data: jqLiteData,
        removeData: jqLiteRemoveData
    }, function(fn, name) {
        JQLite[name] = fn;
    }), forEach({
        data: jqLiteData,
        inheritedData: jqLiteInheritedData,
        scope: function(element) {
            return jqLite.data(element, "$scope") || jqLiteInheritedData(element.parentNode || element, [ "$isolateScope", "$scope" ]);
        },
        isolateScope: function(element) {
            return jqLite.data(element, "$isolateScope") || jqLite.data(element, "$isolateScopeNoTemplate");
        },
        controller: jqLiteController,
        injector: function(element) {
            return jqLiteInheritedData(element, "$injector");
        },
        removeAttr: function(element, name) {
            element.removeAttribute(name);
        },
        hasClass: jqLiteHasClass,
        css: function(element, name, value) {
            if (name = camelCase(name), !isDefined(value)) {
                var val;
                return msie <= 8 && (val = element.currentStyle && element.currentStyle[name], "" === val && (val = "auto")), 
                val = val || element.style[name], msie <= 8 && (val = "" === val ? undefined : val), 
                val;
            }
            element.style[name] = value;
        },
        attr: function(element, name, value) {
            var lowercasedName = lowercase(name);
            if (BOOLEAN_ATTR[lowercasedName]) {
                if (!isDefined(value)) return element[name] || (element.attributes.getNamedItem(name) || noop).specified ? lowercasedName : undefined;
                value ? (element[name] = !0, element.setAttribute(name, lowercasedName)) : (element[name] = !1, 
                element.removeAttribute(lowercasedName));
            } else if (isDefined(value)) element.setAttribute(name, value); else if (element.getAttribute) {
                var ret = element.getAttribute(name, 2);
                return null === ret ? undefined : ret;
            }
        },
        prop: function(element, name, value) {
            return isDefined(value) ? void (element[name] = value) : element[name];
        },
        text: function() {
            function getText(element, value) {
                var textProp = NODE_TYPE_TEXT_PROPERTY[element.nodeType];
                return isUndefined(value) ? textProp ? element[textProp] : "" : void (element[textProp] = value);
            }
            var NODE_TYPE_TEXT_PROPERTY = [];
            return msie < 9 ? (NODE_TYPE_TEXT_PROPERTY[1] = "innerText", NODE_TYPE_TEXT_PROPERTY[3] = "nodeValue") : NODE_TYPE_TEXT_PROPERTY[1] = NODE_TYPE_TEXT_PROPERTY[3] = "textContent", 
            getText.$dv = "", getText;
        }(),
        val: function(element, value) {
            if (isUndefined(value)) {
                if ("SELECT" === nodeName_(element) && element.multiple) {
                    var result = [];
                    return forEach(element.options, function(option) {
                        option.selected && result.push(option.value || option.text);
                    }), 0 === result.length ? null : result;
                }
                return element.value;
            }
            element.value = value;
        },
        html: function(element, value) {
            if (isUndefined(value)) return element.innerHTML;
            for (var i = 0, childNodes = element.childNodes; i < childNodes.length; i++) jqLiteDealoc(childNodes[i]);
            element.innerHTML = value;
        },
        empty: jqLiteEmpty
    }, function(fn, name) {
        JQLite.prototype[name] = function(arg1, arg2) {
            var i, key, nodeCount = this.length;
            if (fn !== jqLiteEmpty && (2 == fn.length && fn !== jqLiteHasClass && fn !== jqLiteController ? arg1 : arg2) === undefined) {
                if (isObject(arg1)) {
                    for (i = 0; i < nodeCount; i++) if (fn === jqLiteData) fn(this[i], arg1); else for (key in arg1) fn(this[i], key, arg1[key]);
                    return this;
                }
                for (var value = fn.$dv, jj = value === undefined ? Math.min(nodeCount, 1) : nodeCount, j = 0; j < jj; j++) {
                    var nodeValue = fn(this[j], arg1, arg2);
                    value = value ? value + nodeValue : nodeValue;
                }
                return value;
            }
            for (i = 0; i < nodeCount; i++) fn(this[i], arg1, arg2);
            return this;
        };
    }), forEach({
        removeData: jqLiteRemoveData,
        dealoc: jqLiteDealoc,
        on: function onFn(element, type, fn, unsupported) {
            if (isDefined(unsupported)) throw jqLiteMinErr("onargs", "jqLite#on() does not support the `selector` or `eventData` parameters");
            var events = jqLiteExpandoStore(element, "events"), handle = jqLiteExpandoStore(element, "handle");
            events || jqLiteExpandoStore(element, "events", events = {}), handle || jqLiteExpandoStore(element, "handle", handle = createEventHandler(element, events)), 
            forEach(type.split(" "), function(type) {
                var eventFns = events[type];
                if (!eventFns) {
                    if ("mouseenter" == type || "mouseleave" == type) {
                        var contains = document.body.contains || document.body.compareDocumentPosition ? function(a, b) {
                            var adown = 9 === a.nodeType ? a.documentElement : a, bup = b && b.parentNode;
                            return a === bup || !(!bup || 1 !== bup.nodeType || !(adown.contains ? adown.contains(bup) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(bup)));
                        } : function(a, b) {
                            if (b) for (;b = b.parentNode; ) if (b === a) return !0;
                            return !1;
                        };
                        events[type] = [];
                        var eventmap = {
                            mouseleave: "mouseout",
                            mouseenter: "mouseover"
                        };
                        onFn(element, eventmap[type], function(event) {
                            var target = this, related = event.relatedTarget;
                            related && (related === target || contains(target, related)) || handle(event, type);
                        });
                    } else addEventListenerFn(element, type, handle), events[type] = [];
                    eventFns = events[type];
                }
                eventFns.push(fn);
            });
        },
        off: jqLiteOff,
        one: function(element, type, fn) {
            element = jqLite(element), element.on(type, function onFn() {
                element.off(type, fn), element.off(type, onFn);
            }), element.on(type, fn);
        },
        replaceWith: function(element, replaceNode) {
            var index, parent = element.parentNode;
            jqLiteDealoc(element), forEach(new JQLite(replaceNode), function(node) {
                index ? parent.insertBefore(node, index.nextSibling) : parent.replaceChild(node, element), 
                index = node;
            });
        },
        children: function(element) {
            var children = [];
            return forEach(element.childNodes, function(element) {
                1 === element.nodeType && children.push(element);
            }), children;
        },
        contents: function(element) {
            return element.contentDocument || element.childNodes || [];
        },
        append: function(element, node) {
            forEach(new JQLite(node), function(child) {
                1 !== element.nodeType && 11 !== element.nodeType || element.appendChild(child);
            });
        },
        prepend: function(element, node) {
            if (1 === element.nodeType) {
                var index = element.firstChild;
                forEach(new JQLite(node), function(child) {
                    element.insertBefore(child, index);
                });
            }
        },
        wrap: function(element, wrapNode) {
            wrapNode = jqLite(wrapNode)[0];
            var parent = element.parentNode;
            parent && parent.replaceChild(wrapNode, element), wrapNode.appendChild(element);
        },
        remove: function(element) {
            jqLiteDealoc(element);
            var parent = element.parentNode;
            parent && parent.removeChild(element);
        },
        after: function(element, newElement) {
            var index = element, parent = element.parentNode;
            forEach(new JQLite(newElement), function(node) {
                parent.insertBefore(node, index.nextSibling), index = node;
            });
        },
        addClass: jqLiteAddClass,
        removeClass: jqLiteRemoveClass,
        toggleClass: function(element, selector, condition) {
            selector && forEach(selector.split(" "), function(className) {
                var classCondition = condition;
                isUndefined(classCondition) && (classCondition = !jqLiteHasClass(element, className)), 
                (classCondition ? jqLiteAddClass : jqLiteRemoveClass)(element, className);
            });
        },
        parent: function(element) {
            var parent = element.parentNode;
            return parent && 11 !== parent.nodeType ? parent : null;
        },
        next: function(element) {
            if (element.nextElementSibling) return element.nextElementSibling;
            for (var elm = element.nextSibling; null != elm && 1 !== elm.nodeType; ) elm = elm.nextSibling;
            return elm;
        },
        find: function(element, selector) {
            return element.getElementsByTagName ? element.getElementsByTagName(selector) : [];
        },
        clone: jqLiteClone,
        triggerHandler: function(element, event, extraParameters) {
            var dummyEvent, eventFnsCopy, handlerArgs, eventName = event.type || event, eventFns = (jqLiteExpandoStore(element, "events") || {})[eventName];
            eventFns && (dummyEvent = {
                preventDefault: function() {
                    this.defaultPrevented = !0;
                },
                isDefaultPrevented: function() {
                    return this.defaultPrevented === !0;
                },
                stopPropagation: noop,
                type: eventName,
                target: element
            }, event.type && (dummyEvent = extend(dummyEvent, event)), eventFnsCopy = shallowCopy(eventFns), 
            handlerArgs = extraParameters ? [ dummyEvent ].concat(extraParameters) : [ dummyEvent ], 
            forEach(eventFnsCopy, function(fn) {
                fn.apply(element, handlerArgs);
            }));
        }
    }, function(fn, name) {
        JQLite.prototype[name] = function(arg1, arg2, arg3) {
            for (var value, i = 0; i < this.length; i++) isUndefined(value) ? (value = fn(this[i], arg1, arg2, arg3), 
            isDefined(value) && (value = jqLite(value))) : jqLiteAddNodes(value, fn(this[i], arg1, arg2, arg3));
            return isDefined(value) ? value : this;
        }, JQLite.prototype.bind = JQLite.prototype.on, JQLite.prototype.unbind = JQLite.prototype.off;
    }), HashMap.prototype = {
        put: function(key, value) {
            this[hashKey(key, this.nextUid)] = value;
        },
        get: function(key) {
            return this[hashKey(key, this.nextUid)];
        },
        remove: function(key) {
            var value = this[key = hashKey(key, this.nextUid)];
            return delete this[key], value;
        }
    };
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m, FN_ARG_SPLIT = /,/, FN_ARG = /^\s*(_?)(\S+?)\1\s*$/, STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm, $injectorMinErr = minErr("$injector"), $animateMinErr = minErr("$animate"), $AnimateProvider = [ "$provide", function($provide) {
        this.$$selectors = {}, this.register = function(name, factory) {
            var key = name + "-animation";
            if (name && "." != name.charAt(0)) throw $animateMinErr("notcsel", "Expecting class selector starting with '.' got '{0}'.", name);
            this.$$selectors[name.substr(1)] = key, $provide.factory(key, factory);
        }, this.classNameFilter = function(expression) {
            return 1 === arguments.length && (this.$$classNameFilter = expression instanceof RegExp ? expression : null), 
            this.$$classNameFilter;
        }, this.$get = [ "$timeout", "$$asyncCallback", function($timeout, $$asyncCallback) {
            function async(fn) {
                fn && $$asyncCallback(fn);
            }
            return {
                enter: function(element, parent, after, done) {
                    after ? after.after(element) : (parent && parent[0] || (parent = after.parent()), 
                    parent.append(element)), async(done);
                },
                leave: function(element, done) {
                    element.remove(), async(done);
                },
                move: function(element, parent, after, done) {
                    this.enter(element, parent, after, done);
                },
                addClass: function(element, className, done) {
                    className = isString(className) ? className : isArray(className) ? className.join(" ") : "", 
                    forEach(element, function(element) {
                        jqLiteAddClass(element, className);
                    }), async(done);
                },
                removeClass: function(element, className, done) {
                    className = isString(className) ? className : isArray(className) ? className.join(" ") : "", 
                    forEach(element, function(element) {
                        jqLiteRemoveClass(element, className);
                    }), async(done);
                },
                setClass: function(element, add, remove, done) {
                    forEach(element, function(element) {
                        jqLiteAddClass(element, add), jqLiteRemoveClass(element, remove);
                    }), async(done);
                },
                enabled: noop
            };
        } ];
    } ], $compileMinErr = minErr("$compile");
    $CompileProvider.$inject = [ "$provide", "$$sanitizeUriProvider" ];
    var PREFIX_REGEXP = /^(x[\:\-_]|data[\:\-_])/i, $interpolateMinErr = minErr("$interpolate"), PATH_MATCH = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/, DEFAULT_PORTS = {
        http: 80,
        https: 443,
        ftp: 21
    }, $locationMinErr = minErr("$location");
    LocationHashbangInHtml5Url.prototype = LocationHashbangUrl.prototype = LocationHtml5Url.prototype = {
        $$html5: !1,
        $$replace: !1,
        absUrl: locationGetter("$$absUrl"),
        url: function(url) {
            if (isUndefined(url)) return this.$$url;
            var match = PATH_MATCH.exec(url);
            return match[1] && this.path(decodeURIComponent(match[1])), (match[2] || match[1]) && this.search(match[3] || ""), 
            this.hash(match[5] || ""), this;
        },
        protocol: locationGetter("$$protocol"),
        host: locationGetter("$$host"),
        port: locationGetter("$$port"),
        path: locationGetterSetter("$$path", function(path) {
            return path = null !== path ? path.toString() : "", "/" == path.charAt(0) ? path : "/" + path;
        }),
        search: function(search, paramValue) {
            switch (arguments.length) {
              case 0:
                return this.$$search;

              case 1:
                if (isString(search) || isNumber(search)) search = search.toString(), this.$$search = parseKeyValue(search); else {
                    if (!isObject(search)) throw $locationMinErr("isrcharg", "The first argument of the `$location#search()` call must be a string or an object.");
                    forEach(search, function(value, key) {
                        null == value && delete search[key];
                    }), this.$$search = search;
                }
                break;

              default:
                isUndefined(paramValue) || null === paramValue ? delete this.$$search[search] : this.$$search[search] = paramValue;
            }
            return this.$$compose(), this;
        },
        hash: locationGetterSetter("$$hash", function(hash) {
            return null !== hash ? hash.toString() : "";
        }),
        replace: function() {
            return this.$$replace = !0, this;
        }
    };
    var promiseWarning, $parseMinErr = minErr("$parse"), promiseWarningCache = {}, CALL = Function.prototype.call, APPLY = Function.prototype.apply, BIND = Function.prototype.bind, OPERATORS = {
        null: function() {
            return null;
        },
        true: function() {
            return !0;
        },
        false: function() {
            return !1;
        },
        undefined: noop,
        "+": function(self, locals, a, b) {
            return a = a(self, locals), b = b(self, locals), isDefined(a) ? isDefined(b) ? a + b : a : isDefined(b) ? b : undefined;
        },
        "-": function(self, locals, a, b) {
            return a = a(self, locals), b = b(self, locals), (isDefined(a) ? a : 0) - (isDefined(b) ? b : 0);
        },
        "*": function(self, locals, a, b) {
            return a(self, locals) * b(self, locals);
        },
        "/": function(self, locals, a, b) {
            return a(self, locals) / b(self, locals);
        },
        "%": function(self, locals, a, b) {
            return a(self, locals) % b(self, locals);
        },
        "^": function(self, locals, a, b) {
            return a(self, locals) ^ b(self, locals);
        },
        "=": noop,
        "===": function(self, locals, a, b) {
            return a(self, locals) === b(self, locals);
        },
        "!==": function(self, locals, a, b) {
            return a(self, locals) !== b(self, locals);
        },
        "==": function(self, locals, a, b) {
            return a(self, locals) == b(self, locals);
        },
        "!=": function(self, locals, a, b) {
            return a(self, locals) != b(self, locals);
        },
        "<": function(self, locals, a, b) {
            return a(self, locals) < b(self, locals);
        },
        ">": function(self, locals, a, b) {
            return a(self, locals) > b(self, locals);
        },
        "<=": function(self, locals, a, b) {
            return a(self, locals) <= b(self, locals);
        },
        ">=": function(self, locals, a, b) {
            return a(self, locals) >= b(self, locals);
        },
        "&&": function(self, locals, a, b) {
            return a(self, locals) && b(self, locals);
        },
        "||": function(self, locals, a, b) {
            return a(self, locals) || b(self, locals);
        },
        "&": function(self, locals, a, b) {
            return a(self, locals) & b(self, locals);
        },
        "|": function(self, locals, a, b) {
            return b(self, locals)(self, locals, a(self, locals));
        },
        "!": function(self, locals, a) {
            return !a(self, locals);
        }
    }, ESCAPE = {
        n: "\n",
        f: "\f",
        r: "\r",
        t: "\t",
        v: "\v",
        "'": "'",
        '"': '"'
    }, Lexer = function(options) {
        this.options = options;
    };
    Lexer.prototype = {
        constructor: Lexer,
        lex: function(text) {
            for (this.text = text, this.index = 0, this.ch = undefined, this.lastCh = ":", this.tokens = []; this.index < this.text.length; ) {
                if (this.ch = this.text.charAt(this.index), this.is("\"'")) this.readString(this.ch); else if (this.isNumber(this.ch) || this.is(".") && this.isNumber(this.peek())) this.readNumber(); else if (this.isIdent(this.ch)) this.readIdent(); else if (this.is("(){}[].,;:?")) this.tokens.push({
                    index: this.index,
                    text: this.ch
                }), this.index++; else {
                    if (this.isWhitespace(this.ch)) {
                        this.index++;
                        continue;
                    }
                    var ch2 = this.ch + this.peek(), ch3 = ch2 + this.peek(2), fn = OPERATORS[this.ch], fn2 = OPERATORS[ch2], fn3 = OPERATORS[ch3];
                    fn3 ? (this.tokens.push({
                        index: this.index,
                        text: ch3,
                        fn: fn3
                    }), this.index += 3) : fn2 ? (this.tokens.push({
                        index: this.index,
                        text: ch2,
                        fn: fn2
                    }), this.index += 2) : fn ? (this.tokens.push({
                        index: this.index,
                        text: this.ch,
                        fn: fn
                    }), this.index += 1) : this.throwError("Unexpected next character ", this.index, this.index + 1);
                }
                this.lastCh = this.ch;
            }
            return this.tokens;
        },
        is: function(chars) {
            return chars.indexOf(this.ch) !== -1;
        },
        was: function(chars) {
            return chars.indexOf(this.lastCh) !== -1;
        },
        peek: function(i) {
            var num = i || 1;
            return this.index + num < this.text.length && this.text.charAt(this.index + num);
        },
        isNumber: function(ch) {
            return "0" <= ch && ch <= "9";
        },
        isWhitespace: function(ch) {
            return " " === ch || "\r" === ch || "\t" === ch || "\n" === ch || "\v" === ch || " " === ch;
        },
        isIdent: function(ch) {
            return "a" <= ch && ch <= "z" || "A" <= ch && ch <= "Z" || "_" === ch || "$" === ch;
        },
        isExpOperator: function(ch) {
            return "-" === ch || "+" === ch || this.isNumber(ch);
        },
        throwError: function(error, start, end) {
            end = end || this.index;
            var colStr = isDefined(start) ? "s " + start + "-" + this.index + " [" + this.text.substring(start, end) + "]" : " " + end;
            throw $parseMinErr("lexerr", "Lexer Error: {0} at column{1} in expression [{2}].", error, colStr, this.text);
        },
        readNumber: function() {
            for (var number = "", start = this.index; this.index < this.text.length; ) {
                var ch = lowercase(this.text.charAt(this.index));
                if ("." == ch || this.isNumber(ch)) number += ch; else {
                    var peekCh = this.peek();
                    if ("e" == ch && this.isExpOperator(peekCh)) number += ch; else if (this.isExpOperator(ch) && peekCh && this.isNumber(peekCh) && "e" == number.charAt(number.length - 1)) number += ch; else {
                        if (!this.isExpOperator(ch) || peekCh && this.isNumber(peekCh) || "e" != number.charAt(number.length - 1)) break;
                        this.throwError("Invalid exponent");
                    }
                }
                this.index++;
            }
            number = 1 * number, this.tokens.push({
                index: start,
                text: number,
                literal: !0,
                constant: !0,
                fn: function() {
                    return number;
                }
            });
        },
        readIdent: function() {
            for (var lastDot, peekIndex, methodName, ch, parser = this, ident = "", start = this.index; this.index < this.text.length && (ch = this.text.charAt(this.index), 
            "." === ch || this.isIdent(ch) || this.isNumber(ch)); ) "." === ch && (lastDot = this.index), 
            ident += ch, this.index++;
            if (lastDot) for (peekIndex = this.index; peekIndex < this.text.length; ) {
                if (ch = this.text.charAt(peekIndex), "(" === ch) {
                    methodName = ident.substr(lastDot - start + 1), ident = ident.substr(0, lastDot - start), 
                    this.index = peekIndex;
                    break;
                }
                if (!this.isWhitespace(ch)) break;
                peekIndex++;
            }
            var token = {
                index: start,
                text: ident
            };
            if (OPERATORS.hasOwnProperty(ident)) token.fn = OPERATORS[ident], token.literal = !0, 
            token.constant = !0; else {
                var getter = getterFn(ident, this.options, this.text);
                token.fn = extend(function(self, locals) {
                    return getter(self, locals);
                }, {
                    assign: function(self, value) {
                        return setter(self, ident, value, parser.text, parser.options);
                    }
                });
            }
            this.tokens.push(token), methodName && (this.tokens.push({
                index: lastDot,
                text: "."
            }), this.tokens.push({
                index: lastDot + 1,
                text: methodName
            }));
        },
        readString: function(quote) {
            var start = this.index;
            this.index++;
            for (var string = "", rawString = quote, escape = !1; this.index < this.text.length; ) {
                var ch = this.text.charAt(this.index);
                if (rawString += ch, escape) {
                    if ("u" === ch) {
                        var hex = this.text.substring(this.index + 1, this.index + 5);
                        hex.match(/[\da-f]{4}/i) || this.throwError("Invalid unicode escape [\\u" + hex + "]"), 
                        this.index += 4, string += String.fromCharCode(parseInt(hex, 16));
                    } else {
                        var rep = ESCAPE[ch];
                        string += rep || ch;
                    }
                    escape = !1;
                } else if ("\\" === ch) escape = !0; else {
                    if (ch === quote) return this.index++, void this.tokens.push({
                        index: start,
                        text: rawString,
                        string: string,
                        literal: !0,
                        constant: !0,
                        fn: function() {
                            return string;
                        }
                    });
                    string += ch;
                }
                this.index++;
            }
            this.throwError("Unterminated quote", start);
        }
    };
    var Parser = function(lexer, $filter, options) {
        this.lexer = lexer, this.$filter = $filter, this.options = options;
    };
    Parser.ZERO = extend(function() {
        return 0;
    }, {
        constant: !0
    }), Parser.prototype = {
        constructor: Parser,
        parse: function(text) {
            this.text = text, this.tokens = this.lexer.lex(text);
            var value = this.statements();
            return 0 !== this.tokens.length && this.throwError("is an unexpected token", this.tokens[0]), 
            value.literal = !!value.literal, value.constant = !!value.constant, value;
        },
        primary: function() {
            var primary;
            if (this.expect("(")) primary = this.filterChain(), this.consume(")"); else if (this.expect("[")) primary = this.arrayDeclaration(); else if (this.expect("{")) primary = this.object(); else {
                var token = this.expect();
                primary = token.fn, primary || this.throwError("not a primary expression", token), 
                primary.literal = !!token.literal, primary.constant = !!token.constant;
            }
            for (var next, context; next = this.expect("(", "[", "."); ) "(" === next.text ? (primary = this.functionCall(primary, context), 
            context = null) : "[" === next.text ? (context = primary, primary = this.objectIndex(primary)) : "." === next.text ? (context = primary, 
            primary = this.fieldAccess(primary)) : this.throwError("IMPOSSIBLE");
            return primary;
        },
        throwError: function(msg, token) {
            throw $parseMinErr("syntax", "Syntax Error: Token '{0}' {1} at column {2} of the expression [{3}] starting at [{4}].", token.text, msg, token.index + 1, this.text, this.text.substring(token.index));
        },
        peekToken: function() {
            if (0 === this.tokens.length) throw $parseMinErr("ueoe", "Unexpected end of expression: {0}", this.text);
            return this.tokens[0];
        },
        peek: function(e1, e2, e3, e4) {
            if (this.tokens.length > 0) {
                var token = this.tokens[0], t = token.text;
                if (t === e1 || t === e2 || t === e3 || t === e4 || !e1 && !e2 && !e3 && !e4) return token;
            }
            return !1;
        },
        expect: function(e1, e2, e3, e4) {
            var token = this.peek(e1, e2, e3, e4);
            return !!token && (this.tokens.shift(), token);
        },
        consume: function(e1) {
            this.expect(e1) || this.throwError("is unexpected, expecting [" + e1 + "]", this.peek());
        },
        unaryFn: function(fn, right) {
            return extend(function(self, locals) {
                return fn(self, locals, right);
            }, {
                constant: right.constant
            });
        },
        ternaryFn: function(left, middle, right) {
            return extend(function(self, locals) {
                return left(self, locals) ? middle(self, locals) : right(self, locals);
            }, {
                constant: left.constant && middle.constant && right.constant
            });
        },
        binaryFn: function(left, fn, right) {
            return extend(function(self, locals) {
                return fn(self, locals, left, right);
            }, {
                constant: left.constant && right.constant
            });
        },
        statements: function() {
            for (var statements = []; ;) if (this.tokens.length > 0 && !this.peek("}", ")", ";", "]") && statements.push(this.filterChain()), 
            !this.expect(";")) return 1 === statements.length ? statements[0] : function(self, locals) {
                for (var value, i = 0; i < statements.length; i++) {
                    var statement = statements[i];
                    statement && (value = statement(self, locals));
                }
                return value;
            };
        },
        filterChain: function() {
            for (var token, left = this.expression(); ;) {
                if (!(token = this.expect("|"))) return left;
                left = this.binaryFn(left, token.fn, this.filter());
            }
        },
        filter: function() {
            for (var token = this.expect(), fn = this.$filter(token.text), argsFn = []; ;) {
                if (!(token = this.expect(":"))) {
                    var fnInvoke = function(self, locals, input) {
                        for (var args = [ input ], i = 0; i < argsFn.length; i++) args.push(argsFn[i](self, locals));
                        return fn.apply(self, args);
                    };
                    return function() {
                        return fnInvoke;
                    };
                }
                argsFn.push(this.expression());
            }
        },
        expression: function() {
            return this.assignment();
        },
        assignment: function() {
            var right, token, left = this.ternary();
            return (token = this.expect("=")) ? (left.assign || this.throwError("implies assignment but [" + this.text.substring(0, token.index) + "] can not be assigned to", token), 
            right = this.ternary(), function(scope, locals) {
                return left.assign(scope, right(scope, locals), locals);
            }) : left;
        },
        ternary: function() {
            var middle, token, left = this.logicalOR();
            return (token = this.expect("?")) ? (middle = this.assignment(), (token = this.expect(":")) ? this.ternaryFn(left, middle, this.assignment()) : void this.throwError("expected :", token)) : left;
        },
        logicalOR: function() {
            for (var token, left = this.logicalAND(); ;) {
                if (!(token = this.expect("||"))) return left;
                left = this.binaryFn(left, token.fn, this.logicalAND());
            }
        },
        logicalAND: function() {
            var token, left = this.equality();
            return (token = this.expect("&&")) && (left = this.binaryFn(left, token.fn, this.logicalAND())), 
            left;
        },
        equality: function() {
            var token, left = this.relational();
            return (token = this.expect("==", "!=", "===", "!==")) && (left = this.binaryFn(left, token.fn, this.equality())), 
            left;
        },
        relational: function() {
            var token, left = this.additive();
            return (token = this.expect("<", ">", "<=", ">=")) && (left = this.binaryFn(left, token.fn, this.relational())), 
            left;
        },
        additive: function() {
            for (var token, left = this.multiplicative(); token = this.expect("+", "-"); ) left = this.binaryFn(left, token.fn, this.multiplicative());
            return left;
        },
        multiplicative: function() {
            for (var token, left = this.unary(); token = this.expect("*", "/", "%"); ) left = this.binaryFn(left, token.fn, this.unary());
            return left;
        },
        unary: function() {
            var token;
            return this.expect("+") ? this.primary() : (token = this.expect("-")) ? this.binaryFn(Parser.ZERO, token.fn, this.unary()) : (token = this.expect("!")) ? this.unaryFn(token.fn, this.unary()) : this.primary();
        },
        fieldAccess: function(object) {
            var parser = this, field = this.expect().text, getter = getterFn(field, this.options, this.text);
            return extend(function(scope, locals, self) {
                return getter(self || object(scope, locals));
            }, {
                assign: function(scope, value, locals) {
                    var o = object(scope, locals);
                    return o || object.assign(scope, o = {}), setter(o, field, value, parser.text, parser.options);
                }
            });
        },
        objectIndex: function(obj) {
            var parser = this, indexFn = this.expression();
            return this.consume("]"), extend(function(self, locals) {
                var v, p, o = obj(self, locals), i = getStringValue(indexFn(self, locals), parser.text);
                return ensureSafeMemberName(i, parser.text), o ? (v = ensureSafeObject(o[i], parser.text), 
                v && v.then && parser.options.unwrapPromises && (p = v, "$$v" in v || (p.$$v = undefined, 
                p.then(function(val) {
                    p.$$v = val;
                })), v = v.$$v), v) : undefined;
            }, {
                assign: function(self, value, locals) {
                    var key = ensureSafeMemberName(getStringValue(indexFn(self, locals), parser.text), parser.text), o = ensureSafeObject(obj(self, locals), parser.text);
                    return o || obj.assign(self, o = {}), o[key] = value;
                }
            });
        },
        functionCall: function(fn, contextGetter) {
            var argsFn = [];
            if (")" !== this.peekToken().text) do argsFn.push(this.expression()); while (this.expect(","));
            this.consume(")");
            var parser = this;
            return function(scope, locals) {
                for (var args = [], context = contextGetter ? contextGetter(scope, locals) : scope, i = 0; i < argsFn.length; i++) args.push(ensureSafeObject(argsFn[i](scope, locals), parser.text));
                var fnPtr = fn(scope, locals, context) || noop;
                ensureSafeObject(context, parser.text), ensureSafeFunction(fnPtr, parser.text);
                var v = fnPtr.apply ? fnPtr.apply(context, args) : fnPtr(args[0], args[1], args[2], args[3], args[4]);
                return ensureSafeObject(v, parser.text);
            };
        },
        arrayDeclaration: function() {
            var elementFns = [], allConstant = !0;
            if ("]" !== this.peekToken().text) do {
                if (this.peek("]")) break;
                var elementFn = this.expression();
                elementFns.push(elementFn), elementFn.constant || (allConstant = !1);
            } while (this.expect(","));
            return this.consume("]"), extend(function(self, locals) {
                for (var array = [], i = 0; i < elementFns.length; i++) array.push(elementFns[i](self, locals));
                return array;
            }, {
                literal: !0,
                constant: allConstant
            });
        },
        object: function() {
            var keyValues = [], allConstant = !0;
            if ("}" !== this.peekToken().text) do {
                if (this.peek("}")) break;
                var token = this.expect(), key = token.string || token.text;
                this.consume(":");
                var value = this.expression();
                keyValues.push({
                    key: key,
                    value: value
                }), value.constant || (allConstant = !1);
            } while (this.expect(","));
            return this.consume("}"), extend(function(self, locals) {
                for (var object = {}, i = 0; i < keyValues.length; i++) {
                    var keyValue = keyValues[i];
                    object[keyValue.key] = keyValue.value(self, locals);
                }
                return object;
            }, {
                literal: !0,
                constant: allConstant
            });
        }
    };
    var getterFnCacheDefault = {}, getterFnCacheExpensive = {}, $sceMinErr = minErr("$sce"), SCE_CONTEXTS = {
        HTML: "html",
        CSS: "css",
        URL: "url",
        RESOURCE_URL: "resourceUrl",
        JS: "js"
    }, urlParsingNode = document.createElement("a"), originUrl = urlResolve(window.location.href, !0);
    $FilterProvider.$inject = [ "$provide" ], currencyFilter.$inject = [ "$locale" ], 
    numberFilter.$inject = [ "$locale" ];
    var DECIMAL_SEP = ".", DATE_FORMATS = {
        yyyy: dateGetter("FullYear", 4),
        yy: dateGetter("FullYear", 2, 0, !0),
        y: dateGetter("FullYear", 1),
        MMMM: dateStrGetter("Month"),
        MMM: dateStrGetter("Month", !0),
        MM: dateGetter("Month", 2, 1),
        M: dateGetter("Month", 1, 1),
        dd: dateGetter("Date", 2),
        d: dateGetter("Date", 1),
        HH: dateGetter("Hours", 2),
        H: dateGetter("Hours", 1),
        hh: dateGetter("Hours", 2, -12),
        h: dateGetter("Hours", 1, -12),
        mm: dateGetter("Minutes", 2),
        m: dateGetter("Minutes", 1),
        ss: dateGetter("Seconds", 2),
        s: dateGetter("Seconds", 1),
        sss: dateGetter("Milliseconds", 3),
        EEEE: dateStrGetter("Day"),
        EEE: dateStrGetter("Day", !0),
        a: ampmGetter,
        Z: timeZoneGetter
    }, DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/, NUMBER_STRING = /^\-?\d+$/;
    dateFilter.$inject = [ "$locale" ];
    var lowercaseFilter = valueFn(lowercase), uppercaseFilter = valueFn(uppercase);
    orderByFilter.$inject = [ "$parse" ];
    var htmlAnchorDirective = valueFn({
        restrict: "E",
        compile: function(element, attr) {
            if (msie <= 8 && (attr.href || attr.name || attr.$set("href", ""), element.append(document.createComment("IE fix"))), 
            !attr.href && !attr.xlinkHref && !attr.name) return function(scope, element) {
                var href = "[object SVGAnimatedString]" === toString.call(element.prop("href")) ? "xlink:href" : "href";
                element.on("click", function(event) {
                    element.attr(href) || event.preventDefault();
                });
            };
        }
    }), ngAttributeAliasDirectives = {};
    forEach(BOOLEAN_ATTR, function(propName, attrName) {
        if ("multiple" != propName) {
            var normalized = directiveNormalize("ng-" + attrName);
            ngAttributeAliasDirectives[normalized] = function() {
                return {
                    priority: 100,
                    link: function(scope, element, attr) {
                        scope.$watch(attr[normalized], function(value) {
                            attr.$set(attrName, !!value);
                        });
                    }
                };
            };
        }
    }), forEach([ "src", "srcset", "href" ], function(attrName) {
        var normalized = directiveNormalize("ng-" + attrName);
        ngAttributeAliasDirectives[normalized] = function() {
            return {
                priority: 99,
                link: function(scope, element, attr) {
                    var propName = attrName, name = attrName;
                    "href" === attrName && "[object SVGAnimatedString]" === toString.call(element.prop("href")) && (name = "xlinkHref", 
                    attr.$attr[name] = "xlink:href", propName = null), attr.$observe(normalized, function(value) {
                        return value ? (attr.$set(name, value), void (msie && propName && element.prop(propName, attr[name]))) : void ("href" === attrName && attr.$set(name, null));
                    });
                }
            };
        };
    });
    var nullFormCtrl = {
        $addControl: noop,
        $removeControl: noop,
        $setValidity: noop,
        $setDirty: noop,
        $setPristine: noop
    };
    FormController.$inject = [ "$element", "$attrs", "$scope", "$animate" ];
    var formDirectiveFactory = function(isNgForm) {
        return [ "$timeout", function($timeout) {
            var formDirective = {
                name: "form",
                restrict: isNgForm ? "EAC" : "E",
                controller: FormController,
                compile: function() {
                    return {
                        pre: function(scope, formElement, attr, controller) {
                            if (!attr.action) {
                                var preventDefaultListener = function(event) {
                                    event.preventDefault ? event.preventDefault() : event.returnValue = !1;
                                };
                                addEventListenerFn(formElement[0], "submit", preventDefaultListener), formElement.on("$destroy", function() {
                                    $timeout(function() {
                                        removeEventListenerFn(formElement[0], "submit", preventDefaultListener);
                                    }, 0, !1);
                                });
                            }
                            var parentFormCtrl = formElement.parent().controller("form"), alias = attr.name || attr.ngForm;
                            alias && setter(scope, alias, controller, alias), parentFormCtrl && formElement.on("$destroy", function() {
                                parentFormCtrl.$removeControl(controller), alias && setter(scope, alias, undefined, alias), 
                                extend(controller, nullFormCtrl);
                            });
                        }
                    };
                }
            };
            return formDirective;
        } ];
    }, formDirective = formDirectiveFactory(), ngFormDirective = formDirectiveFactory(!0), URL_REGEXP = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/, EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i, NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/, inputType = {
        text: textInputType,
        number: numberInputType,
        url: urlInputType,
        email: emailInputType,
        radio: radioInputType,
        checkbox: checkboxInputType,
        hidden: noop,
        button: noop,
        submit: noop,
        reset: noop,
        file: noop
    }, numberBadFlags = [ "badInput" ], inputDirective = [ "$browser", "$sniffer", function($browser, $sniffer) {
        return {
            restrict: "E",
            require: "?ngModel",
            link: function(scope, element, attr, ctrl) {
                ctrl && (inputType[lowercase(attr.type)] || inputType.text)(scope, element, attr, ctrl, $sniffer, $browser);
            }
        };
    } ], VALID_CLASS = "ng-valid", INVALID_CLASS = "ng-invalid", PRISTINE_CLASS = "ng-pristine", DIRTY_CLASS = "ng-dirty", NgModelController = [ "$scope", "$exceptionHandler", "$attrs", "$element", "$parse", "$animate", function($scope, $exceptionHandler, $attr, $element, $parse, $animate) {
        function toggleValidCss(isValid, validationErrorKey) {
            validationErrorKey = validationErrorKey ? "-" + snake_case(validationErrorKey, "-") : "", 
            $animate.removeClass($element, (isValid ? INVALID_CLASS : VALID_CLASS) + validationErrorKey), 
            $animate.addClass($element, (isValid ? VALID_CLASS : INVALID_CLASS) + validationErrorKey);
        }
        this.$viewValue = Number.NaN, this.$modelValue = Number.NaN, this.$parsers = [], 
        this.$formatters = [], this.$viewChangeListeners = [], this.$pristine = !0, this.$dirty = !1, 
        this.$valid = !0, this.$invalid = !1, this.$name = $attr.name;
        var ngModelGet = $parse($attr.ngModel), ngModelSet = ngModelGet.assign;
        if (!ngModelSet) throw minErr("ngModel")("nonassign", "Expression '{0}' is non-assignable. Element: {1}", $attr.ngModel, startingTag($element));
        this.$render = noop, this.$isEmpty = function(value) {
            return isUndefined(value) || "" === value || null === value || value !== value;
        };
        var parentForm = $element.inheritedData("$formController") || nullFormCtrl, invalidCount = 0, $error = this.$error = {};
        $element.addClass(PRISTINE_CLASS), toggleValidCss(!0), this.$setValidity = function(validationErrorKey, isValid) {
            $error[validationErrorKey] !== !isValid && (isValid ? ($error[validationErrorKey] && invalidCount--, 
            invalidCount || (toggleValidCss(!0), this.$valid = !0, this.$invalid = !1)) : (toggleValidCss(!1), 
            this.$invalid = !0, this.$valid = !1, invalidCount++), $error[validationErrorKey] = !isValid, 
            toggleValidCss(isValid, validationErrorKey), parentForm.$setValidity(validationErrorKey, isValid, this));
        }, this.$setPristine = function() {
            this.$dirty = !1, this.$pristine = !0, $animate.removeClass($element, DIRTY_CLASS), 
            $animate.addClass($element, PRISTINE_CLASS);
        }, this.$setViewValue = function(value) {
            this.$viewValue = value, this.$pristine && (this.$dirty = !0, this.$pristine = !1, 
            $animate.removeClass($element, PRISTINE_CLASS), $animate.addClass($element, DIRTY_CLASS), 
            parentForm.$setDirty()), forEach(this.$parsers, function(fn) {
                value = fn(value);
            }), this.$modelValue !== value && (this.$modelValue = value, ngModelSet($scope, value), 
            forEach(this.$viewChangeListeners, function(listener) {
                try {
                    listener();
                } catch (e) {
                    $exceptionHandler(e);
                }
            }));
        };
        var ctrl = this;
        $scope.$watch(function() {
            var value = ngModelGet($scope);
            if (ctrl.$modelValue !== value) {
                var formatters = ctrl.$formatters, idx = formatters.length;
                for (ctrl.$modelValue = value; idx--; ) value = formatters[idx](value);
                ctrl.$viewValue !== value && (ctrl.$viewValue = value, ctrl.$render());
            }
            return value;
        });
    } ], ngModelDirective = function() {
        return {
            require: [ "ngModel", "^?form" ],
            controller: NgModelController,
            link: function(scope, element, attr, ctrls) {
                var modelCtrl = ctrls[0], formCtrl = ctrls[1] || nullFormCtrl;
                formCtrl.$addControl(modelCtrl), scope.$on("$destroy", function() {
                    formCtrl.$removeControl(modelCtrl);
                });
            }
        };
    }, ngChangeDirective = valueFn({
        require: "ngModel",
        link: function(scope, element, attr, ctrl) {
            ctrl.$viewChangeListeners.push(function() {
                scope.$eval(attr.ngChange);
            });
        }
    }), requiredDirective = function() {
        return {
            require: "?ngModel",
            link: function(scope, elm, attr, ctrl) {
                if (ctrl) {
                    attr.required = !0;
                    var validator = function(value) {
                        return attr.required && ctrl.$isEmpty(value) ? void ctrl.$setValidity("required", !1) : (ctrl.$setValidity("required", !0), 
                        value);
                    };
                    ctrl.$formatters.push(validator), ctrl.$parsers.unshift(validator), attr.$observe("required", function() {
                        validator(ctrl.$viewValue);
                    });
                }
            }
        };
    }, ngListDirective = function() {
        return {
            require: "ngModel",
            link: function(scope, element, attr, ctrl) {
                var match = /\/(.*)\//.exec(attr.ngList), separator = match && new RegExp(match[1]) || attr.ngList || ",", parse = function(viewValue) {
                    if (!isUndefined(viewValue)) {
                        var list = [];
                        return viewValue && forEach(viewValue.split(separator), function(value) {
                            value && list.push(trim(value));
                        }), list;
                    }
                };
                ctrl.$parsers.push(parse), ctrl.$formatters.push(function(value) {
                    return isArray(value) ? value.join(", ") : undefined;
                }), ctrl.$isEmpty = function(value) {
                    return !value || !value.length;
                };
            }
        };
    }, CONSTANT_VALUE_REGEXP = /^(true|false|\d+)$/, ngValueDirective = function() {
        return {
            priority: 100,
            compile: function(tpl, tplAttr) {
                return CONSTANT_VALUE_REGEXP.test(tplAttr.ngValue) ? function(scope, elm, attr) {
                    attr.$set("value", scope.$eval(attr.ngValue));
                } : function(scope, elm, attr) {
                    scope.$watch(attr.ngValue, function(value) {
                        attr.$set("value", value);
                    });
                };
            }
        };
    }, ngBindDirective = ngDirective({
        compile: function(templateElement) {
            return templateElement.addClass("ng-binding"), function(scope, element, attr) {
                element.data("$binding", attr.ngBind), scope.$watch(attr.ngBind, function(value) {
                    element.text(value == undefined ? "" : value);
                });
            };
        }
    }), ngBindTemplateDirective = [ "$interpolate", function($interpolate) {
        return function(scope, element, attr) {
            var interpolateFn = $interpolate(element.attr(attr.$attr.ngBindTemplate));
            element.addClass("ng-binding").data("$binding", interpolateFn), attr.$observe("ngBindTemplate", function(value) {
                element.text(value);
            });
        };
    } ], ngBindHtmlDirective = [ "$sce", "$parse", function($sce, $parse) {
        return {
            compile: function(tElement) {
                return tElement.addClass("ng-binding"), function(scope, element, attr) {
                    function getStringValue() {
                        return (parsed(scope) || "").toString();
                    }
                    element.data("$binding", attr.ngBindHtml);
                    var parsed = $parse(attr.ngBindHtml);
                    scope.$watch(getStringValue, function(value) {
                        element.html($sce.getTrustedHtml(parsed(scope)) || "");
                    });
                };
            }
        };
    } ], ngClassDirective = classDirective("", !0), ngClassOddDirective = classDirective("Odd", 0), ngClassEvenDirective = classDirective("Even", 1), ngCloakDirective = ngDirective({
        compile: function(element, attr) {
            attr.$set("ngCloak", undefined), element.removeClass("ng-cloak");
        }
    }), ngControllerDirective = [ function() {
        return {
            scope: !0,
            controller: "@",
            priority: 500
        };
    } ], ngEventDirectives = {}, forceAsyncEvents = {
        blur: !0,
        focus: !0
    };
    forEach("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "), function(eventName) {
        var directiveName = directiveNormalize("ng-" + eventName);
        ngEventDirectives[directiveName] = [ "$parse", "$rootScope", function($parse, $rootScope) {
            return {
                compile: function($element, attr) {
                    var fn = $parse(attr[directiveName], !0);
                    return function(scope, element) {
                        element.on(eventName, function(event) {
                            var callback = function() {
                                fn(scope, {
                                    $event: event
                                });
                            };
                            forceAsyncEvents[eventName] && $rootScope.$$phase ? scope.$evalAsync(callback) : scope.$apply(callback);
                        });
                    };
                }
            };
        } ];
    });
    var ngIfDirective = [ "$animate", function($animate) {
        return {
            transclude: "element",
            priority: 600,
            terminal: !0,
            restrict: "A",
            $$tlb: !0,
            link: function($scope, $element, $attr, ctrl, $transclude) {
                var block, childScope, previousElements;
                $scope.$watch($attr.ngIf, function(value) {
                    toBoolean(value) ? childScope || (childScope = $scope.$new(), $transclude(childScope, function(clone) {
                        clone[clone.length++] = document.createComment(" end ngIf: " + $attr.ngIf + " "), 
                        block = {
                            clone: clone
                        }, $animate.enter(clone, $element.parent(), $element);
                    })) : (previousElements && (previousElements.remove(), previousElements = null), 
                    childScope && (childScope.$destroy(), childScope = null), block && (previousElements = getBlockElements(block.clone), 
                    $animate.leave(previousElements, function() {
                        previousElements = null;
                    }), block = null));
                });
            }
        };
    } ], ngIncludeDirective = [ "$http", "$templateCache", "$anchorScroll", "$animate", "$sce", function($http, $templateCache, $anchorScroll, $animate, $sce) {
        return {
            restrict: "ECA",
            priority: 400,
            terminal: !0,
            transclude: "element",
            controller: angular.noop,
            compile: function(element, attr) {
                var srcExp = attr.ngInclude || attr.src, onloadExp = attr.onload || "", autoScrollExp = attr.autoscroll;
                return function(scope, $element, $attr, ctrl, $transclude) {
                    var currentScope, previousElement, currentElement, changeCounter = 0, cleanupLastIncludeContent = function() {
                        previousElement && (previousElement.remove(), previousElement = null), currentScope && (currentScope.$destroy(), 
                        currentScope = null), currentElement && ($animate.leave(currentElement, function() {
                            previousElement = null;
                        }), previousElement = currentElement, currentElement = null);
                    };
                    scope.$watch($sce.parseAsResourceUrl(srcExp), function(src) {
                        var afterAnimation = function() {
                            !isDefined(autoScrollExp) || autoScrollExp && !scope.$eval(autoScrollExp) || $anchorScroll();
                        }, thisChangeId = ++changeCounter;
                        src ? ($http.get(src, {
                            cache: $templateCache
                        }).success(function(response) {
                            if (thisChangeId === changeCounter) {
                                var newScope = scope.$new();
                                ctrl.template = response;
                                var clone = $transclude(newScope, function(clone) {
                                    cleanupLastIncludeContent(), $animate.enter(clone, null, $element, afterAnimation);
                                });
                                currentScope = newScope, currentElement = clone, currentScope.$emit("$includeContentLoaded"), 
                                scope.$eval(onloadExp);
                            }
                        }).error(function() {
                            thisChangeId === changeCounter && cleanupLastIncludeContent();
                        }), scope.$emit("$includeContentRequested")) : (cleanupLastIncludeContent(), ctrl.template = null);
                    });
                };
            }
        };
    } ], ngIncludeFillContentDirective = [ "$compile", function($compile) {
        return {
            restrict: "ECA",
            priority: -400,
            require: "ngInclude",
            link: function(scope, $element, $attr, ctrl) {
                $element.html(ctrl.template), $compile($element.contents())(scope);
            }
        };
    } ], ngInitDirective = ngDirective({
        priority: 450,
        compile: function() {
            return {
                pre: function(scope, element, attrs) {
                    scope.$eval(attrs.ngInit);
                }
            };
        }
    }), ngNonBindableDirective = ngDirective({
        terminal: !0,
        priority: 1e3
    }), ngPluralizeDirective = [ "$locale", "$interpolate", function($locale, $interpolate) {
        var BRACE = /{}/g;
        return {
            restrict: "EA",
            link: function(scope, element, attr) {
                var numberExp = attr.count, whenExp = attr.$attr.when && element.attr(attr.$attr.when), offset = attr.offset || 0, whens = scope.$eval(whenExp) || {}, whensExpFns = {}, startSymbol = $interpolate.startSymbol(), endSymbol = $interpolate.endSymbol(), isWhen = /^when(Minus)?(.+)$/;
                forEach(attr, function(expression, attributeName) {
                    isWhen.test(attributeName) && (whens[lowercase(attributeName.replace("when", "").replace("Minus", "-"))] = element.attr(attr.$attr[attributeName]));
                }), forEach(whens, function(expression, key) {
                    whensExpFns[key] = $interpolate(expression.replace(BRACE, startSymbol + numberExp + "-" + offset + endSymbol));
                }), scope.$watch(function() {
                    var value = parseFloat(scope.$eval(numberExp));
                    return isNaN(value) ? "" : (value in whens || (value = $locale.pluralCat(value - offset)), 
                    whensExpFns[value](scope, element, !0));
                }, function(newVal) {
                    element.text(newVal);
                });
            }
        };
    } ], ngRepeatDirective = [ "$parse", "$animate", function($parse, $animate) {
        function getBlockStart(block) {
            return block.clone[0];
        }
        function getBlockEnd(block) {
            return block.clone[block.clone.length - 1];
        }
        var NG_REMOVED = "$$NG_REMOVED", ngRepeatMinErr = minErr("ngRepeat");
        return {
            transclude: "element",
            priority: 1e3,
            terminal: !0,
            $$tlb: !0,
            link: function($scope, $element, $attr, ctrl, $transclude) {
                var trackByExp, trackByExpGetter, trackByIdExpFn, trackByIdArrayFn, trackByIdObjFn, lhs, rhs, valueIdentifier, keyIdentifier, expression = $attr.ngRepeat, match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/), hashFnLocals = {
                    $id: hashKey
                };
                if (!match) throw ngRepeatMinErr("iexp", "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.", expression);
                if (lhs = match[1], rhs = match[2], trackByExp = match[3], trackByExp ? (trackByExpGetter = $parse(trackByExp), 
                trackByIdExpFn = function(key, value, index) {
                    return keyIdentifier && (hashFnLocals[keyIdentifier] = key), hashFnLocals[valueIdentifier] = value, 
                    hashFnLocals.$index = index, trackByExpGetter($scope, hashFnLocals);
                }) : (trackByIdArrayFn = function(key, value) {
                    return hashKey(value);
                }, trackByIdObjFn = function(key) {
                    return key;
                }), match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/), !match) throw ngRepeatMinErr("iidexp", "'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.", lhs);
                valueIdentifier = match[3] || match[1], keyIdentifier = match[2];
                var lastBlockMap = {};
                $scope.$watchCollection(rhs, function(collection) {
                    var index, length, nextNode, arrayLength, childScope, key, value, trackById, trackByIdFn, collectionKeys, block, elementsToRemove, previousNode = $element[0], nextBlockMap = {}, nextBlockOrder = [];
                    if (isArrayLike(collection)) collectionKeys = collection, trackByIdFn = trackByIdExpFn || trackByIdArrayFn; else {
                        trackByIdFn = trackByIdExpFn || trackByIdObjFn, collectionKeys = [];
                        for (key in collection) collection.hasOwnProperty(key) && "$" != key.charAt(0) && collectionKeys.push(key);
                        collectionKeys.sort();
                    }
                    for (arrayLength = collectionKeys.length, length = nextBlockOrder.length = collectionKeys.length, 
                    index = 0; index < length; index++) if (key = collection === collectionKeys ? index : collectionKeys[index], 
                    value = collection[key], trackById = trackByIdFn(key, value, index), assertNotHasOwnProperty(trackById, "`track by` id"), 
                    lastBlockMap.hasOwnProperty(trackById)) block = lastBlockMap[trackById], delete lastBlockMap[trackById], 
                    nextBlockMap[trackById] = block, nextBlockOrder[index] = block; else {
                        if (nextBlockMap.hasOwnProperty(trackById)) throw forEach(nextBlockOrder, function(block) {
                            block && block.scope && (lastBlockMap[block.id] = block);
                        }), ngRepeatMinErr("dupes", "Duplicates in a repeater are not allowed. Use 'track by' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}, Duplicate value: {2}", expression, trackById, toJson(value));
                        nextBlockOrder[index] = {
                            id: trackById
                        }, nextBlockMap[trackById] = !1;
                    }
                    for (key in lastBlockMap) lastBlockMap.hasOwnProperty(key) && (block = lastBlockMap[key], 
                    elementsToRemove = getBlockElements(block.clone), $animate.leave(elementsToRemove), 
                    forEach(elementsToRemove, function(element) {
                        element[NG_REMOVED] = !0;
                    }), block.scope.$destroy());
                    for (index = 0, length = collectionKeys.length; index < length; index++) {
                        if (key = collection === collectionKeys ? index : collectionKeys[index], value = collection[key], 
                        block = nextBlockOrder[index], nextBlockOrder[index - 1] && (previousNode = getBlockEnd(nextBlockOrder[index - 1])), 
                        block.scope) {
                            childScope = block.scope, nextNode = previousNode;
                            do nextNode = nextNode.nextSibling; while (nextNode && nextNode[NG_REMOVED]);
                            getBlockStart(block) != nextNode && $animate.move(getBlockElements(block.clone), null, jqLite(previousNode)), 
                            previousNode = getBlockEnd(block);
                        } else childScope = $scope.$new();
                        childScope[valueIdentifier] = value, keyIdentifier && (childScope[keyIdentifier] = key), 
                        childScope.$index = index, childScope.$first = 0 === index, childScope.$last = index === arrayLength - 1, 
                        childScope.$middle = !(childScope.$first || childScope.$last), childScope.$odd = !(childScope.$even = 0 === (1 & index)), 
                        block.scope || $transclude(childScope, function(clone) {
                            clone[clone.length++] = document.createComment(" end ngRepeat: " + expression + " "), 
                            $animate.enter(clone, null, jqLite(previousNode)), previousNode = clone, block.scope = childScope, 
                            block.clone = clone, nextBlockMap[block.id] = block;
                        });
                    }
                    lastBlockMap = nextBlockMap;
                });
            }
        };
    } ], ngShowDirective = [ "$animate", function($animate) {
        return function(scope, element, attr) {
            scope.$watch(attr.ngShow, function(value) {
                $animate[toBoolean(value) ? "removeClass" : "addClass"](element, "ng-hide");
            });
        };
    } ], ngHideDirective = [ "$animate", function($animate) {
        return function(scope, element, attr) {
            scope.$watch(attr.ngHide, function(value) {
                $animate[toBoolean(value) ? "addClass" : "removeClass"](element, "ng-hide");
            });
        };
    } ], ngStyleDirective = ngDirective(function(scope, element, attr) {
        scope.$watch(attr.ngStyle, function(newStyles, oldStyles) {
            oldStyles && newStyles !== oldStyles && forEach(oldStyles, function(val, style) {
                element.css(style, "");
            }), newStyles && element.css(newStyles);
        }, !0);
    }), ngSwitchDirective = [ "$animate", function($animate) {
        return {
            restrict: "EA",
            require: "ngSwitch",
            controller: [ "$scope", function() {
                this.cases = {};
            } ],
            link: function(scope, element, attr, ngSwitchController) {
                var watchExpr = attr.ngSwitch || attr.on, selectedTranscludes = [], selectedElements = [], previousElements = [], selectedScopes = [];
                scope.$watch(watchExpr, function(value) {
                    var i, ii;
                    for (i = 0, ii = previousElements.length; i < ii; ++i) previousElements[i].remove();
                    for (previousElements.length = 0, i = 0, ii = selectedScopes.length; i < ii; ++i) {
                        var selected = selectedElements[i];
                        selectedScopes[i].$destroy(), previousElements[i] = selected, $animate.leave(selected, function() {
                            previousElements.splice(i, 1);
                        });
                    }
                    selectedElements.length = 0, selectedScopes.length = 0, (selectedTranscludes = ngSwitchController.cases["!" + value] || ngSwitchController.cases["?"]) && (scope.$eval(attr.change), 
                    forEach(selectedTranscludes, function(selectedTransclude) {
                        var selectedScope = scope.$new();
                        selectedScopes.push(selectedScope), selectedTransclude.transclude(selectedScope, function(caseElement) {
                            var anchor = selectedTransclude.element;
                            selectedElements.push(caseElement), $animate.enter(caseElement, anchor.parent(), anchor);
                        });
                    }));
                });
            }
        };
    } ], ngSwitchWhenDirective = ngDirective({
        transclude: "element",
        priority: 800,
        require: "^ngSwitch",
        link: function(scope, element, attrs, ctrl, $transclude) {
            ctrl.cases["!" + attrs.ngSwitchWhen] = ctrl.cases["!" + attrs.ngSwitchWhen] || [], 
            ctrl.cases["!" + attrs.ngSwitchWhen].push({
                transclude: $transclude,
                element: element
            });
        }
    }), ngSwitchDefaultDirective = ngDirective({
        transclude: "element",
        priority: 800,
        require: "^ngSwitch",
        link: function(scope, element, attr, ctrl, $transclude) {
            ctrl.cases["?"] = ctrl.cases["?"] || [], ctrl.cases["?"].push({
                transclude: $transclude,
                element: element
            });
        }
    }), ngTranscludeDirective = ngDirective({
        link: function($scope, $element, $attrs, controller, $transclude) {
            if (!$transclude) throw minErr("ngTransclude")("orphan", "Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found. Element: {0}", startingTag($element));
            $transclude(function(clone) {
                $element.empty(), $element.append(clone);
            });
        }
    }), scriptDirective = [ "$templateCache", function($templateCache) {
        return {
            restrict: "E",
            terminal: !0,
            compile: function(element, attr) {
                if ("text/ng-template" == attr.type) {
                    var templateUrl = attr.id, text = element[0].text;
                    $templateCache.put(templateUrl, text);
                }
            }
        };
    } ], ngOptionsMinErr = minErr("ngOptions"), ngOptionsDirective = valueFn({
        terminal: !0
    }), selectDirective = [ "$compile", "$parse", function($compile, $parse) {
        var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/, nullModelCtrl = {
            $setViewValue: noop
        };
        return {
            restrict: "E",
            require: [ "select", "?ngModel" ],
            controller: [ "$element", "$scope", "$attrs", function($element, $scope, $attrs) {
                var nullOption, unknownOption, self = this, optionsMap = {}, ngModelCtrl = nullModelCtrl;
                self.databound = $attrs.ngModel, self.init = function(ngModelCtrl_, nullOption_, unknownOption_) {
                    ngModelCtrl = ngModelCtrl_, nullOption = nullOption_, unknownOption = unknownOption_;
                }, self.addOption = function(value) {
                    assertNotHasOwnProperty(value, '"option value"'), optionsMap[value] = !0, ngModelCtrl.$viewValue == value && ($element.val(value), 
                    unknownOption.parent() && unknownOption.remove());
                }, self.removeOption = function(value) {
                    this.hasOption(value) && (delete optionsMap[value], ngModelCtrl.$viewValue == value && this.renderUnknownOption(value));
                }, self.renderUnknownOption = function(val) {
                    var unknownVal = "? " + hashKey(val) + " ?";
                    unknownOption.val(unknownVal), $element.prepend(unknownOption), $element.val(unknownVal), 
                    unknownOption.prop("selected", !0);
                }, self.hasOption = function(value) {
                    return optionsMap.hasOwnProperty(value);
                }, $scope.$on("$destroy", function() {
                    self.renderUnknownOption = noop;
                });
            } ],
            link: function(scope, element, attr, ctrls) {
                function setupAsSingle(scope, selectElement, ngModelCtrl, selectCtrl) {
                    ngModelCtrl.$render = function() {
                        var viewValue = ngModelCtrl.$viewValue;
                        selectCtrl.hasOption(viewValue) ? (unknownOption.parent() && unknownOption.remove(), 
                        selectElement.val(viewValue), "" === viewValue && emptyOption.prop("selected", !0)) : isUndefined(viewValue) && emptyOption ? selectElement.val("") : selectCtrl.renderUnknownOption(viewValue);
                    }, selectElement.on("change", function() {
                        scope.$apply(function() {
                            unknownOption.parent() && unknownOption.remove(), ngModelCtrl.$setViewValue(selectElement.val());
                        });
                    });
                }
                function setupAsMultiple(scope, selectElement, ctrl) {
                    var lastView;
                    ctrl.$render = function() {
                        var items = new HashMap(ctrl.$viewValue);
                        forEach(selectElement.find("option"), function(option) {
                            option.selected = isDefined(items.get(option.value));
                        });
                    }, scope.$watch(function() {
                        equals(lastView, ctrl.$viewValue) || (lastView = shallowCopy(ctrl.$viewValue), ctrl.$render());
                    }), selectElement.on("change", function() {
                        scope.$apply(function() {
                            var array = [];
                            forEach(selectElement.find("option"), function(option) {
                                option.selected && array.push(option.value);
                            }), ctrl.$setViewValue(array);
                        });
                    });
                }
                function setupAsOptions(scope, selectElement, ctrl) {
                    function getSelectedSet() {
                        var selectedSet = !1;
                        if (multiple) {
                            var modelValue = ctrl.$modelValue;
                            if (trackFn && isArray(modelValue)) {
                                selectedSet = new HashMap([]);
                                for (var locals = {}, trackIndex = 0; trackIndex < modelValue.length; trackIndex++) locals[valueName] = modelValue[trackIndex], 
                                selectedSet.put(trackFn(scope, locals), modelValue[trackIndex]);
                            } else selectedSet = new HashMap(modelValue);
                        }
                        return selectedSet;
                    }
                    function render() {
                        var optionGroupName, optionGroup, option, existingParent, existingOptions, existingOption, key, groupLength, length, groupIndex, index, selected, lastElement, element, label, optionGroups = {
                            "": []
                        }, optionGroupNames = [ "" ], modelValue = ctrl.$modelValue, values = valuesFn(scope) || [], keys = keyName ? sortedKeys(values) : values, locals = {}, selectedSet = getSelectedSet();
                        for (index = 0; length = keys.length, index < length; index++) {
                            if (key = index, keyName) {
                                if (key = keys[index], "$" === key.charAt(0)) continue;
                                locals[keyName] = key;
                            }
                            if (locals[valueName] = values[key], optionGroupName = groupByFn(scope, locals) || "", 
                            (optionGroup = optionGroups[optionGroupName]) || (optionGroup = optionGroups[optionGroupName] = [], 
                            optionGroupNames.push(optionGroupName)), multiple) selected = isDefined(selectedSet.remove(trackFn ? trackFn(scope, locals) : valueFn(scope, locals))); else {
                                if (trackFn) {
                                    var modelCast = {};
                                    modelCast[valueName] = modelValue, selected = trackFn(scope, modelCast) === trackFn(scope, locals);
                                } else selected = modelValue === valueFn(scope, locals);
                                selectedSet = selectedSet || selected;
                            }
                            label = displayFn(scope, locals), label = isDefined(label) ? label : "", optionGroup.push({
                                id: trackFn ? trackFn(scope, locals) : keyName ? keys[index] : index,
                                label: label,
                                selected: selected
                            });
                        }
                        for (multiple || (nullOption || null === modelValue ? optionGroups[""].unshift({
                            id: "",
                            label: "",
                            selected: !selectedSet
                        }) : selectedSet || optionGroups[""].unshift({
                            id: "?",
                            label: "",
                            selected: !0
                        })), groupIndex = 0, groupLength = optionGroupNames.length; groupIndex < groupLength; groupIndex++) {
                            for (optionGroupName = optionGroupNames[groupIndex], optionGroup = optionGroups[optionGroupName], 
                            optionGroupsCache.length <= groupIndex ? (existingParent = {
                                element: optGroupTemplate.clone().attr("label", optionGroupName),
                                label: optionGroup.label
                            }, existingOptions = [ existingParent ], optionGroupsCache.push(existingOptions), 
                            selectElement.append(existingParent.element)) : (existingOptions = optionGroupsCache[groupIndex], 
                            existingParent = existingOptions[0], existingParent.label != optionGroupName && existingParent.element.attr("label", existingParent.label = optionGroupName)), 
                            lastElement = null, index = 0, length = optionGroup.length; index < length; index++) option = optionGroup[index], 
                            (existingOption = existingOptions[index + 1]) ? (lastElement = existingOption.element, 
                            existingOption.label !== option.label && (lastElement.text(existingOption.label = option.label), 
                            lastElement.prop("label", existingOption.label)), existingOption.id !== option.id && lastElement.val(existingOption.id = option.id), 
                            lastElement[0].selected !== option.selected && (lastElement.prop("selected", existingOption.selected = option.selected), 
                            msie && lastElement.prop("selected", existingOption.selected))) : ("" === option.id && nullOption ? element = nullOption : (element = optionTemplate.clone()).val(option.id).prop("selected", option.selected).attr("selected", option.selected).prop("label", option.label).text(option.label), 
                            existingOptions.push(existingOption = {
                                element: element,
                                label: option.label,
                                id: option.id,
                                selected: option.selected
                            }), selectCtrl.addOption(option.label, element), lastElement ? lastElement.after(element) : existingParent.element.append(element), 
                            lastElement = element);
                            for (index++; existingOptions.length > index; ) option = existingOptions.pop(), 
                            selectCtrl.removeOption(option.label), option.element.remove();
                        }
                        for (;optionGroupsCache.length > groupIndex; ) optionGroupsCache.pop()[0].element.remove();
                    }
                    var match;
                    if (!(match = optionsExp.match(NG_OPTIONS_REGEXP))) throw ngOptionsMinErr("iexp", "Expected expression in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_' but got '{0}'. Element: {1}", optionsExp, startingTag(selectElement));
                    var displayFn = $parse(match[2] || match[1]), valueName = match[4] || match[6], keyName = match[5], groupByFn = $parse(match[3] || ""), valueFn = $parse(match[2] ? match[1] : valueName), valuesFn = $parse(match[7]), track = match[8], trackFn = track ? $parse(match[8]) : null, optionGroupsCache = [ [ {
                        element: selectElement,
                        label: ""
                    } ] ];
                    nullOption && ($compile(nullOption)(scope), nullOption.removeClass("ng-scope"), 
                    nullOption.remove()), selectElement.empty(), selectElement.on("change", function() {
                        scope.$apply(function() {
                            var optionGroup, key, value, optionElement, index, groupIndex, length, groupLength, trackIndex, collection = valuesFn(scope) || [], locals = {};
                            if (multiple) {
                                for (value = [], groupIndex = 0, groupLength = optionGroupsCache.length; groupIndex < groupLength; groupIndex++) for (optionGroup = optionGroupsCache[groupIndex], 
                                index = 1, length = optionGroup.length; index < length; index++) if ((optionElement = optionGroup[index].element)[0].selected) {
                                    if (key = optionElement.val(), keyName && (locals[keyName] = key), trackFn) for (trackIndex = 0; trackIndex < collection.length && (locals[valueName] = collection[trackIndex], 
                                    trackFn(scope, locals) != key); trackIndex++) ; else locals[valueName] = collection[key];
                                    value.push(valueFn(scope, locals));
                                }
                            } else if (key = selectElement.val(), "?" == key) value = undefined; else if ("" === key) value = null; else if (trackFn) {
                                for (trackIndex = 0; trackIndex < collection.length; trackIndex++) if (locals[valueName] = collection[trackIndex], 
                                trackFn(scope, locals) == key) {
                                    value = valueFn(scope, locals);
                                    break;
                                }
                            } else locals[valueName] = collection[key], keyName && (locals[keyName] = key), 
                            value = valueFn(scope, locals);
                            ctrl.$setViewValue(value), render();
                        });
                    }), ctrl.$render = render, scope.$watchCollection(valuesFn, render), scope.$watchCollection(function() {
                        var locals = {}, values = valuesFn(scope);
                        if (values) {
                            for (var toDisplay = new Array(values.length), i = 0, ii = values.length; i < ii; i++) locals[valueName] = values[i], 
                            toDisplay[i] = displayFn(scope, locals);
                            return toDisplay;
                        }
                    }, render), multiple && scope.$watchCollection(function() {
                        return ctrl.$modelValue;
                    }, render);
                }
                if (ctrls[1]) {
                    for (var emptyOption, selectCtrl = ctrls[0], ngModelCtrl = ctrls[1], multiple = attr.multiple, optionsExp = attr.ngOptions, nullOption = !1, optionTemplate = jqLite(document.createElement("option")), optGroupTemplate = jqLite(document.createElement("optgroup")), unknownOption = optionTemplate.clone(), i = 0, children = element.children(), ii = children.length; i < ii; i++) if ("" === children[i].value) {
                        emptyOption = nullOption = children.eq(i);
                        break;
                    }
                    selectCtrl.init(ngModelCtrl, nullOption, unknownOption), multiple && (ngModelCtrl.$isEmpty = function(value) {
                        return !value || 0 === value.length;
                    }), optionsExp ? setupAsOptions(scope, element, ngModelCtrl) : multiple ? setupAsMultiple(scope, element, ngModelCtrl) : setupAsSingle(scope, element, ngModelCtrl, selectCtrl);
                }
            }
        };
    } ], optionDirective = [ "$interpolate", function($interpolate) {
        var nullSelectCtrl = {
            addOption: noop,
            removeOption: noop
        };
        return {
            restrict: "E",
            priority: 100,
            compile: function(element, attr) {
                if (isUndefined(attr.value)) {
                    var interpolateFn = $interpolate(element.text(), !0);
                    interpolateFn || attr.$set("value", element.text());
                }
                return function(scope, element, attr) {
                    var selectCtrlName = "$selectController", parent = element.parent(), selectCtrl = parent.data(selectCtrlName) || parent.parent().data(selectCtrlName);
                    selectCtrl && selectCtrl.databound ? element.prop("selected", !1) : selectCtrl = nullSelectCtrl, 
                    interpolateFn ? scope.$watch(interpolateFn, function(newVal, oldVal) {
                        attr.$set("value", newVal), newVal !== oldVal && selectCtrl.removeOption(oldVal), 
                        selectCtrl.addOption(newVal);
                    }) : selectCtrl.addOption(attr.value), element.on("$destroy", function() {
                        selectCtrl.removeOption(attr.value);
                    });
                };
            }
        };
    } ], styleDirective = valueFn({
        restrict: "E",
        terminal: !0
    });
    return window.angular.bootstrap ? void console.log("WARNING: Tried to load angular more than once.") : (bindJQuery(), 
    publishExternalAPI(angular), void jqLite(document).ready(function() {
        angularInit(document, bootstrap);
    }));
}(window, document), !window.angular.$$csp() && window.angular.element(document).find("head").prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide{display:none !important;}ng\\:form{display:block;}.ng-animate-block-transitions{transition:0s all!important;-webkit-transition:0s all!important;}.ng-hide-add-active,.ng-hide-remove{display:block!important;}</style>'), 
function(window, angular, undefined) {
    "use strict";
    function $SanitizeProvider() {
        this.$get = [ "$$sanitizeUri", function($$sanitizeUri) {
            return function(html) {
                var buf = [];
                return htmlParser(html, htmlSanitizeWriter(buf, function(uri, isImage) {
                    return !/^unsafe/.test($$sanitizeUri(uri, isImage));
                })), buf.join("");
            };
        } ];
    }
    function sanitizeText(chars) {
        var buf = [], writer = htmlSanitizeWriter(buf, angular.noop);
        return writer.chars(chars), buf.join("");
    }
    function makeMap(str) {
        var i, obj = {}, items = str.split(",");
        for (i = 0; i < items.length; i++) obj[items[i]] = !0;
        return obj;
    }
    function htmlParser(html, handler) {
        function parseStartTag(tag, tagName, rest, unary) {
            if (tagName = angular.lowercase(tagName), blockElements[tagName]) for (;stack.last() && inlineElements[stack.last()]; ) parseEndTag("", stack.last());
            optionalEndTagElements[tagName] && stack.last() == tagName && parseEndTag("", tagName), 
            unary = voidElements[tagName] || !!unary, unary || stack.push(tagName);
            var attrs = {};
            rest.replace(ATTR_REGEXP, function(match, name, doubleQuotedValue, singleQuotedValue, unquotedValue) {
                var value = doubleQuotedValue || singleQuotedValue || unquotedValue || "";
                attrs[name] = decodeEntities(value);
            }), handler.start && handler.start(tagName, attrs, unary);
        }
        function parseEndTag(tag, tagName) {
            var i, pos = 0;
            if (tagName = angular.lowercase(tagName)) for (pos = stack.length - 1; pos >= 0 && stack[pos] != tagName; pos--) ;
            if (pos >= 0) {
                for (i = stack.length - 1; i >= pos; i--) handler.end && handler.end(stack[i]);
                stack.length = pos;
            }
        }
        "string" != typeof html && (html = null === html || "undefined" == typeof html ? "" : "" + html);
        var index, chars, match, text, stack = [], last = html;
        for (stack.last = function() {
            return stack[stack.length - 1];
        }; html; ) {
            if (text = "", chars = !0, stack.last() && specialElements[stack.last()] ? (html = html.replace(new RegExp("(.*)<\\s*\\/\\s*" + stack.last() + "[^>]*>", "i"), function(all, text) {
                return text = text.replace(COMMENT_REGEXP, "$1").replace(CDATA_REGEXP, "$1"), handler.chars && handler.chars(decodeEntities(text)), 
                "";
            }), parseEndTag("", stack.last())) : (0 === html.indexOf("<!--") ? (index = html.indexOf("--", 4), 
            index >= 0 && html.lastIndexOf("-->", index) === index && (handler.comment && handler.comment(html.substring(4, index)), 
            html = html.substring(index + 3), chars = !1)) : DOCTYPE_REGEXP.test(html) ? (match = html.match(DOCTYPE_REGEXP), 
            match && (html = html.replace(match[0], ""), chars = !1)) : BEGING_END_TAGE_REGEXP.test(html) ? (match = html.match(END_TAG_REGEXP), 
            match && (html = html.substring(match[0].length), match[0].replace(END_TAG_REGEXP, parseEndTag), 
            chars = !1)) : BEGIN_TAG_REGEXP.test(html) && (match = html.match(START_TAG_REGEXP), 
            match ? (match[4] && (html = html.substring(match[0].length), match[0].replace(START_TAG_REGEXP, parseStartTag)), 
            chars = !1) : (text += "<", html = html.substring(1))), chars && (index = html.indexOf("<"), 
            text += index < 0 ? html : html.substring(0, index), html = index < 0 ? "" : html.substring(index), 
            handler.chars && handler.chars(decodeEntities(text)))), html == last) throw $sanitizeMinErr("badparse", "The sanitizer was unable to parse the following block of html: {0}", html);
            last = html;
        }
        parseEndTag();
    }
    function decodeEntities(value) {
        if (!value) return "";
        var parts = spaceRe.exec(value), spaceBefore = parts[1], spaceAfter = parts[3], content = parts[2];
        return content && (hiddenPre.innerHTML = content.replace(/</g, "&lt;"), content = "textContent" in hiddenPre ? hiddenPre.textContent : hiddenPre.innerText), 
        spaceBefore + content + spaceAfter;
    }
    function encodeEntities(value) {
        return value.replace(/&/g, "&amp;").replace(SURROGATE_PAIR_REGEXP, function(value) {
            var hi = value.charCodeAt(0), low = value.charCodeAt(1);
            return "&#" + (1024 * (hi - 55296) + (low - 56320) + 65536) + ";";
        }).replace(NON_ALPHANUMERIC_REGEXP, function(value) {
            return "&#" + value.charCodeAt(0) + ";";
        }).replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function htmlSanitizeWriter(buf, uriValidator) {
        var ignore = !1, out = angular.bind(buf, buf.push);
        return {
            start: function(tag, attrs, unary) {
                tag = angular.lowercase(tag), !ignore && specialElements[tag] && (ignore = tag), 
                ignore || validElements[tag] !== !0 || (out("<"), out(tag), angular.forEach(attrs, function(value, key) {
                    var lkey = angular.lowercase(key), isImage = "img" === tag && "src" === lkey || "background" === lkey;
                    validAttrs[lkey] !== !0 || uriAttrs[lkey] === !0 && !uriValidator(value, isImage) || (out(" "), 
                    out(key), out('="'), out(encodeEntities(value)), out('"'));
                }), out(unary ? "/>" : ">"));
            },
            end: function(tag) {
                tag = angular.lowercase(tag), ignore || validElements[tag] !== !0 || (out("</"), 
                out(tag), out(">")), tag == ignore && (ignore = !1);
            },
            chars: function(chars) {
                ignore || out(encodeEntities(chars));
            }
        };
    }
    var $sanitizeMinErr = angular.$$minErr("$sanitize"), START_TAG_REGEXP = /^<((?:[a-zA-Z])[\w:-]*)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*(>?)/, END_TAG_REGEXP = /^<\/\s*([\w:-]+)[^>]*>/, ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g, BEGIN_TAG_REGEXP = /^</, BEGING_END_TAGE_REGEXP = /^<\//, COMMENT_REGEXP = /<!--(.*?)-->/g, DOCTYPE_REGEXP = /<!DOCTYPE([^>]*?)>/i, CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g, SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g, NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g, voidElements = makeMap("area,br,col,hr,img,wbr"), optionalEndTagBlockElements = makeMap("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"), optionalEndTagInlineElements = makeMap("rp,rt"), optionalEndTagElements = angular.extend({}, optionalEndTagInlineElements, optionalEndTagBlockElements), blockElements = angular.extend({}, optionalEndTagBlockElements, makeMap("address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul")), inlineElements = angular.extend({}, optionalEndTagInlineElements, makeMap("a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var")), specialElements = makeMap("script,style"), validElements = angular.extend({}, voidElements, blockElements, inlineElements, optionalEndTagElements), uriAttrs = makeMap("background,cite,href,longdesc,src"), validAttrs = angular.extend({}, uriAttrs, makeMap("abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,summary,target,title,type,valign,value,vspace,width")), hiddenPre = document.createElement("pre"), spaceRe = /^(\s*)([\s\S]*?)(\s*)$/;
    angular.module("ngSanitize", []).provider("$sanitize", $SanitizeProvider), angular.module("ngSanitize").filter("linky", [ "$sanitize", function($sanitize) {
        var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"]/, MAILTO_REGEXP = /^mailto:/;
        return function(text, target) {
            function addText(text) {
                text && html.push(sanitizeText(text));
            }
            function addLink(url, text) {
                html.push("<a "), angular.isDefined(target) && (html.push('target="'), html.push(target), 
                html.push('" ')), html.push('href="', url.replace('"', "&quot;"), '">'), addText(text), 
                html.push("</a>");
            }
            if (!text) return text;
            for (var match, url, i, raw = text, html = []; match = raw.match(LINKY_URL_REGEXP); ) url = match[0], 
            match[2] == match[3] && (url = "mailto:" + url), i = match.index, addText(raw.substr(0, i)), 
            addLink(url, match[0].replace(MAILTO_REGEXP, "")), raw = raw.substring(i + match[0].length);
            return addText(raw), $sanitize(html.join(""));
        };
    } ]);
}(window, window.angular), function(undefined) {
    function defaultParsingFlags() {
        return {
            empty: !1,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: !1,
            invalidMonth: null,
            invalidFormat: !1,
            userInvalidated: !1,
            iso: !1
        };
    }
    function padToken(func, count) {
        return function(a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function(a) {
            return this.lang().ordinal(func.call(this, a), period);
        };
    }
    function Language() {}
    function Moment(config) {
        checkOverflow(config), extend(this, config);
    }
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration), years = normalizedInput.year || 0, months = normalizedInput.month || 0, weeks = normalizedInput.week || 0, days = normalizedInput.day || 0, hours = normalizedInput.hour || 0, minutes = normalizedInput.minute || 0, seconds = normalizedInput.second || 0, milliseconds = normalizedInput.millisecond || 0;
        this._milliseconds = +milliseconds + 1e3 * seconds + 6e4 * minutes + 36e5 * hours, 
        this._days = +days + 7 * weeks, this._months = +months + 12 * years, this._data = {}, 
        this._bubble();
    }
    function extend(a, b) {
        for (var i in b) b.hasOwnProperty(i) && (a[i] = b[i]);
        return b.hasOwnProperty("toString") && (a.toString = b.toString), b.hasOwnProperty("valueOf") && (a.valueOf = b.valueOf), 
        a;
    }
    function cloneMoment(m) {
        var i, result = {};
        for (i in m) m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i) && (result[i] = m[i]);
        return result;
    }
    function absRound(number) {
        return number < 0 ? Math.ceil(number) : Math.floor(number);
    }
    function leftZeroFill(number, targetLength, forceSign) {
        for (var output = "" + Math.abs(number), sign = number >= 0; output.length < targetLength; ) output = "0" + output;
        return (sign ? forceSign ? "+" : "" : "-") + output;
    }
    function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset) {
        var minutes, hours, milliseconds = duration._milliseconds, days = duration._days, months = duration._months;
        milliseconds && mom._d.setTime(+mom._d + milliseconds * isAdding), (days || months) && (minutes = mom.minute(), 
        hours = mom.hour()), days && mom.date(mom.date() + days * isAdding), months && mom.month(mom.month() + months * isAdding), 
        milliseconds && !ignoreUpdateOffset && moment.updateOffset(mom), (days || months) && (mom.minute(minutes), 
        mom.hour(hours));
    }
    function isArray(input) {
        return "[object Array]" === Object.prototype.toString.call(input);
    }
    function isDate(input) {
        return "[object Date]" === Object.prototype.toString.call(input) || input instanceof Date;
    }
    function compareArrays(array1, array2, dontConvert) {
        var i, len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0;
        for (i = 0; i < len; i++) (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) && diffs++;
        return diffs + lengthDiff;
    }
    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, "$1");
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }
    function normalizeObjectUnits(inputObject) {
        var normalizedProp, prop, normalizedInput = {};
        for (prop in inputObject) inputObject.hasOwnProperty(prop) && (normalizedProp = normalizeUnits(prop), 
        normalizedProp && (normalizedInput[normalizedProp] = inputObject[prop]));
        return normalizedInput;
    }
    function makeList(field) {
        var count, setter;
        if (0 === field.indexOf("week")) count = 7, setter = "day"; else {
            if (0 !== field.indexOf("month")) return;
            count = 12, setter = "month";
        }
        moment[field] = function(format, index) {
            var i, getter, method = moment.fn._lang[field], results = [];
            if ("number" == typeof format && (index = format, format = undefined), getter = function(i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment.fn._lang, m, format || "");
            }, null != index) return getter(index);
            for (i = 0; i < count; i++) results.push(getter(i));
            return results;
        };
    }
    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion, value = 0;
        return 0 !== coercedNumber && isFinite(coercedNumber) && (value = coercedNumber >= 0 ? Math.floor(coercedNumber) : Math.ceil(coercedNumber)), 
        value;
    }
    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }
    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }
    function isLeapYear(year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    }
    function checkOverflow(m) {
        var overflow;
        m._a && m._pf.overflow === -2 && (overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1, 
        m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE) && (overflow = DATE), 
        m._pf.overflow = overflow);
    }
    function isValid(m) {
        return null == m._isValid && (m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated, 
        m._strict && (m._isValid = m._isValid && 0 === m._pf.charsLeftOver && 0 === m._pf.unusedTokens.length)), 
        m._isValid;
    }
    function normalizeLanguage(key) {
        return key ? key.toLowerCase().replace("_", "-") : key;
    }
    function makeAs(input, model) {
        return model._isUTC ? moment(input).zone(model._offset || 0) : moment(input).local();
    }
    function loadLang(key, values) {
        return values.abbr = key, languages[key] || (languages[key] = new Language()), languages[key].set(values), 
        languages[key];
    }
    function unloadLang(key) {
        delete languages[key];
    }
    function getLangDefinition(key) {
        var j, lang, next, split, i = 0, get = function(k) {
            if (!languages[k] && hasModule) try {
                require("./lang/" + k);
            } catch (e) {}
            return languages[k];
        };
        if (!key) return moment.fn._lang;
        if (!isArray(key)) {
            if (lang = get(key)) return lang;
            key = [ key ];
        }
        for (;i < key.length; ) {
            for (split = normalizeLanguage(key[i]).split("-"), j = split.length, next = normalizeLanguage(key[i + 1]), 
            next = next ? next.split("-") : null; j > 0; ) {
                if (lang = get(split.slice(0, j).join("-"))) return lang;
                if (next && next.length >= j && compareArrays(split, next, !0) >= j - 1) break;
                j--;
            }
            i++;
        }
        return moment.fn._lang;
    }
    function removeFormattingTokens(input) {
        return input.match(/\[[\s\S]/) ? input.replace(/^\[|\]$/g, "") : input.replace(/\\/g, "");
    }
    function makeFormatFunction(format) {
        var i, length, array = format.match(formattingTokens);
        for (i = 0, length = array.length; i < length; i++) formatTokenFunctions[array[i]] ? array[i] = formatTokenFunctions[array[i]] : array[i] = removeFormattingTokens(array[i]);
        return function(mom) {
            var output = "";
            for (i = 0; i < length; i++) output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            return output;
        };
    }
    function formatMoment(m, format) {
        return m.isValid() ? (format = expandFormat(format, m.lang()), formatFunctions[format] || (formatFunctions[format] = makeFormatFunction(format)), 
        formatFunctions[format](m)) : m.lang().invalidDate();
    }
    function expandFormat(format, lang) {
        function replaceLongDateFormatTokens(input) {
            return lang.longDateFormat(input) || input;
        }
        var i = 5;
        for (localFormattingTokens.lastIndex = 0; i >= 0 && localFormattingTokens.test(format); ) format = format.replace(localFormattingTokens, replaceLongDateFormatTokens), 
        localFormattingTokens.lastIndex = 0, i -= 1;
        return format;
    }
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
          case "DDDD":
            return parseTokenThreeDigits;

          case "YYYY":
          case "GGGG":
          case "gggg":
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;

          case "Y":
          case "G":
          case "g":
            return parseTokenSignedNumber;

          case "YYYYYY":
          case "YYYYY":
          case "GGGGG":
          case "ggggg":
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;

          case "S":
            if (strict) return parseTokenOneDigit;

          case "SS":
            if (strict) return parseTokenTwoDigits;

          case "SSS":
            if (strict) return parseTokenThreeDigits;

          case "DDD":
            return parseTokenOneToThreeDigits;

          case "MMM":
          case "MMMM":
          case "dd":
          case "ddd":
          case "dddd":
            return parseTokenWord;

          case "a":
          case "A":
            return getLangDefinition(config._l)._meridiemParse;

          case "X":
            return parseTokenTimestampMs;

          case "Z":
          case "ZZ":
            return parseTokenTimezone;

          case "T":
            return parseTokenT;

          case "SSSS":
            return parseTokenDigits;

          case "MM":
          case "DD":
          case "YY":
          case "GG":
          case "gg":
          case "HH":
          case "hh":
          case "mm":
          case "ss":
          case "ww":
          case "WW":
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;

          case "M":
          case "D":
          case "d":
          case "H":
          case "h":
          case "m":
          case "s":
          case "w":
          case "W":
          case "e":
          case "E":
            return parseTokenOneOrTwoDigits;

          default:
            return a = new RegExp(regexpEscape(unescapeFormat(token.replace("\\", "")), "i"));
        }
    }
    function timezoneMinutesFromString(string) {
        string = string || "";
        var possibleTzMatches = string.match(parseTokenTimezone) || [], tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [], parts = (tzChunk + "").match(parseTimezoneChunker) || [ "-", 0, 0 ], minutes = +(60 * parts[1]) + toInt(parts[2]);
        return "+" === parts[0] ? -minutes : minutes;
    }
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;
        switch (token) {
          case "M":
          case "MM":
            null != input && (datePartArray[MONTH] = toInt(input) - 1);
            break;

          case "MMM":
          case "MMMM":
            a = getLangDefinition(config._l).monthsParse(input), null != a ? datePartArray[MONTH] = a : config._pf.invalidMonth = input;
            break;

          case "D":
          case "DD":
            null != input && (datePartArray[DATE] = toInt(input));
            break;

          case "DDD":
          case "DDDD":
            null != input && (config._dayOfYear = toInt(input));
            break;

          case "YY":
            datePartArray[YEAR] = toInt(input) + (toInt(input) > 68 ? 1900 : 2e3);
            break;

          case "YYYY":
          case "YYYYY":
          case "YYYYYY":
            datePartArray[YEAR] = toInt(input);
            break;

          case "a":
          case "A":
            config._isPm = getLangDefinition(config._l).isPM(input);
            break;

          case "H":
          case "HH":
          case "h":
          case "hh":
            datePartArray[HOUR] = toInt(input);
            break;

          case "m":
          case "mm":
            datePartArray[MINUTE] = toInt(input);
            break;

          case "s":
          case "ss":
            datePartArray[SECOND] = toInt(input);
            break;

          case "S":
          case "SS":
          case "SSS":
          case "SSSS":
            datePartArray[MILLISECOND] = toInt(1e3 * ("0." + input));
            break;

          case "X":
            config._d = new Date(1e3 * parseFloat(input));
            break;

          case "Z":
          case "ZZ":
            config._useUTC = !0, config._tzm = timezoneMinutesFromString(input);
            break;

          case "w":
          case "ww":
          case "W":
          case "WW":
          case "d":
          case "dd":
          case "ddd":
          case "dddd":
          case "e":
          case "E":
            token = token.substr(0, 1);

          case "gg":
          case "gggg":
          case "GG":
          case "GGGG":
          case "GGGGG":
            token = token.substr(0, 2), input && (config._w = config._w || {}, config._w[token] = input);
        }
    }
    function dateFromConfig(config) {
        var i, date, currentDate, yearToUse, fixYear, w, temp, lang, weekday, week, input = [];
        if (!config._d) {
            for (currentDate = currentDateArray(config), config._w && null == config._a[DATE] && null == config._a[MONTH] && (fixYear = function(val) {
                var int_val = parseInt(val, 10);
                return val ? val.length < 3 ? int_val > 68 ? 1900 + int_val : 2e3 + int_val : int_val : null == config._a[YEAR] ? moment().weekYear() : config._a[YEAR];
            }, w = config._w, null != w.GG || null != w.W || null != w.E ? temp = dayOfYearFromWeeks(fixYear(w.GG), w.W || 1, w.E, 4, 1) : (lang = getLangDefinition(config._l), 
            weekday = null != w.d ? parseWeekday(w.d, lang) : null != w.e ? parseInt(w.e, 10) + lang._week.dow : 0, 
            week = parseInt(w.w, 10) || 1, null != w.d && weekday < lang._week.dow && week++, 
            temp = dayOfYearFromWeeks(fixYear(w.gg), week, weekday, lang._week.doy, lang._week.dow)), 
            config._a[YEAR] = temp.year, config._dayOfYear = temp.dayOfYear), config._dayOfYear && (yearToUse = null == config._a[YEAR] ? currentDate[YEAR] : config._a[YEAR], 
            config._dayOfYear > daysInYear(yearToUse) && (config._pf._overflowDayOfYear = !0), 
            date = makeUTCDate(yearToUse, 0, config._dayOfYear), config._a[MONTH] = date.getUTCMonth(), 
            config._a[DATE] = date.getUTCDate()), i = 0; i < 3 && null == config._a[i]; ++i) config._a[i] = input[i] = currentDate[i];
            for (;i < 7; i++) config._a[i] = input[i] = null == config._a[i] ? 2 === i ? 1 : 0 : config._a[i];
            input[HOUR] += toInt((config._tzm || 0) / 60), input[MINUTE] += toInt((config._tzm || 0) % 60), 
            config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
        }
    }
    function dateFromObject(config) {
        var normalizedInput;
        config._d || (normalizedInput = normalizeObjectUnits(config._i), config._a = [ normalizedInput.year, normalizedInput.month, normalizedInput.day, normalizedInput.hour, normalizedInput.minute, normalizedInput.second, normalizedInput.millisecond ], 
        dateFromConfig(config));
    }
    function currentDateArray(config) {
        var now = new Date();
        return config._useUTC ? [ now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() ] : [ now.getFullYear(), now.getMonth(), now.getDate() ];
    }
    function makeDateFromStringAndFormat(config) {
        config._a = [], config._pf.empty = !0;
        var i, parsedInput, tokens, token, skipped, lang = getLangDefinition(config._l), string = "" + config._i, stringLength = string.length, totalParsedInputLength = 0;
        for (tokens = expandFormat(config._f, lang).match(formattingTokens) || [], i = 0; i < tokens.length; i++) token = tokens[i], 
        parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0], parsedInput && (skipped = string.substr(0, string.indexOf(parsedInput)), 
        skipped.length > 0 && config._pf.unusedInput.push(skipped), string = string.slice(string.indexOf(parsedInput) + parsedInput.length), 
        totalParsedInputLength += parsedInput.length), formatTokenFunctions[token] ? (parsedInput ? config._pf.empty = !1 : config._pf.unusedTokens.push(token), 
        addTimeToArrayFromToken(token, parsedInput, config)) : config._strict && !parsedInput && config._pf.unusedTokens.push(token);
        config._pf.charsLeftOver = stringLength - totalParsedInputLength, string.length > 0 && config._pf.unusedInput.push(string), 
        config._isPm && config._a[HOUR] < 12 && (config._a[HOUR] += 12), config._isPm === !1 && 12 === config._a[HOUR] && (config._a[HOUR] = 0), 
        dateFromConfig(config), checkOverflow(config);
    }
    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    function makeDateFromStringAndArray(config) {
        var tempConfig, bestMoment, scoreToBeat, i, currentScore;
        if (0 === config._f.length) return config._pf.invalidFormat = !0, void (config._d = new Date(NaN));
        for (i = 0; i < config._f.length; i++) currentScore = 0, tempConfig = extend({}, config), 
        tempConfig._pf = defaultParsingFlags(), tempConfig._f = config._f[i], makeDateFromStringAndFormat(tempConfig), 
        isValid(tempConfig) && (currentScore += tempConfig._pf.charsLeftOver, currentScore += 10 * tempConfig._pf.unusedTokens.length, 
        tempConfig._pf.score = currentScore, (null == scoreToBeat || currentScore < scoreToBeat) && (scoreToBeat = currentScore, 
        bestMoment = tempConfig));
        extend(config, bestMoment || tempConfig);
    }
    function makeDateFromString(config) {
        var i, l, string = config._i, match = isoRegex.exec(string);
        if (match) {
            for (config._pf.iso = !0, i = 0, l = isoDates.length; i < l; i++) if (isoDates[i][1].exec(string)) {
                config._f = isoDates[i][0] + (match[6] || " ");
                break;
            }
            for (i = 0, l = isoTimes.length; i < l; i++) if (isoTimes[i][1].exec(string)) {
                config._f += isoTimes[i][0];
                break;
            }
            string.match(parseTokenTimezone) && (config._f += "Z"), makeDateFromStringAndFormat(config);
        } else config._d = new Date(string);
    }
    function makeDateFromInput(config) {
        var input = config._i, matched = aspNetJsonRegex.exec(input);
        input === undefined ? config._d = new Date() : matched ? config._d = new Date((+matched[1])) : "string" == typeof input ? makeDateFromString(config) : isArray(input) ? (config._a = input.slice(0), 
        dateFromConfig(config)) : isDate(input) ? config._d = new Date((+input)) : "object" == typeof input ? dateFromObject(config) : config._d = new Date(input);
    }
    function makeDate(y, m, d, h, M, s, ms) {
        var date = new Date(y, m, d, h, M, s, ms);
        return y < 1970 && date.setFullYear(y), date;
    }
    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        return y < 1970 && date.setUTCFullYear(y), date;
    }
    function parseWeekday(input, language) {
        if ("string" == typeof input) if (isNaN(input)) {
            if (input = language.weekdaysParse(input), "number" != typeof input) return null;
        } else input = parseInt(input, 10);
        return input;
    }
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }
    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1e3), minutes = round(seconds / 60), hours = round(minutes / 60), days = round(hours / 24), years = round(days / 365), args = seconds < 45 && [ "s", seconds ] || 1 === minutes && [ "m" ] || minutes < 45 && [ "mm", minutes ] || 1 === hours && [ "h" ] || hours < 22 && [ "hh", hours ] || 1 === days && [ "d" ] || days <= 25 && [ "dd", days ] || days <= 45 && [ "M" ] || days < 345 && [ "MM", round(days / 30) ] || 1 === years && [ "y" ] || [ "yy", years ];
        return args[2] = withoutSuffix, args[3] = milliseconds > 0, args[4] = lang, substituteTimeAgo.apply({}, args);
    }
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var adjustedMoment, end = firstDayOfWeekOfYear - firstDayOfWeek, daysToDayOfWeek = firstDayOfWeekOfYear - mom.day();
        return daysToDayOfWeek > end && (daysToDayOfWeek -= 7), daysToDayOfWeek < end - 7 && (daysToDayOfWeek += 7), 
        adjustedMoment = moment(mom).add("d", daysToDayOfWeek), {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var daysToAdd, dayOfYear, d = makeUTCDate(year, 0, 1).getUTCDay();
        return weekday = null != weekday ? weekday : firstDayOfWeek, daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0), 
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1, {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }
    function makeMoment(config) {
        var input = config._i, format = config._f;
        return null === input ? moment.invalid({
            nullInput: !0
        }) : ("string" == typeof input && (config._i = input = getLangDefinition().preparse(input)), 
        moment.isMoment(input) ? (config = cloneMoment(input), config._d = new Date((+input._d))) : format ? isArray(format) ? makeDateFromStringAndArray(config) : makeDateFromStringAndFormat(config) : makeDateFromInput(config), 
        new Moment(config));
    }
    function makeGetterAndSetter(name, key) {
        moment.fn[name] = moment.fn[name + "s"] = function(input) {
            var utc = this._isUTC ? "UTC" : "";
            return null != input ? (this._d["set" + utc + key](input), moment.updateOffset(this), 
            this) : this._d["get" + utc + key]();
        };
    }
    function makeDurationGetter(name) {
        moment.duration.fn[name] = function() {
            return this._data[name];
        };
    }
    function makeDurationAsGetter(name, factor) {
        moment.duration.fn["as" + name] = function() {
            return +this / factor;
        };
    }
    function makeGlobal(deprecate) {
        var warned = !1, local_moment = moment;
        "undefined" == typeof ender && (deprecate ? (global.moment = function() {
            return !warned && console && console.warn && (warned = !0, console.warn("Accessing Moment through the global scope is deprecated, and will be removed in an upcoming release.")), 
            local_moment.apply(null, arguments);
        }, extend(global.moment, local_moment)) : global.moment = moment);
    }
    for (var moment, i, VERSION = "2.5.1", global = this, round = Math.round, YEAR = 0, MONTH = 1, DATE = 2, HOUR = 3, MINUTE = 4, SECOND = 5, MILLISECOND = 6, languages = {}, momentProperties = {
        _isAMomentObject: null,
        _i: null,
        _f: null,
        _l: null,
        _strict: null,
        _isUTC: null,
        _offset: null,
        _pf: null,
        _lang: null
    }, hasModule = "undefined" != typeof module && module.exports && "undefined" != typeof require, aspNetJsonRegex = /^\/?Date\((\-?\d+)/i, aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/, isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/, formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, parseTokenOneOrTwoDigits = /\d\d?/, parseTokenOneToThreeDigits = /\d{1,3}/, parseTokenOneToFourDigits = /\d{1,4}/, parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, parseTokenDigits = /\d+/, parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, parseTokenT = /T/i, parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, parseTokenOneDigit = /\d/, parseTokenTwoDigits = /\d\d/, parseTokenThreeDigits = /\d{3}/, parseTokenFourDigits = /\d{4}/, parseTokenSixDigits = /[+-]?\d{6}/, parseTokenSignedNumber = /[+-]?\d+/, isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, isoFormat = "YYYY-MM-DDTHH:mm:ssZ", isoDates = [ [ "YYYYYY-MM-DD", /[+-]\d{6}-\d{2}-\d{2}/ ], [ "YYYY-MM-DD", /\d{4}-\d{2}-\d{2}/ ], [ "GGGG-[W]WW-E", /\d{4}-W\d{2}-\d/ ], [ "GGGG-[W]WW", /\d{4}-W\d{2}/ ], [ "YYYY-DDD", /\d{4}-\d{3}/ ] ], isoTimes = [ [ "HH:mm:ss.SSSS", /(T| )\d\d:\d\d:\d\d\.\d{1,3}/ ], [ "HH:mm:ss", /(T| )\d\d:\d\d:\d\d/ ], [ "HH:mm", /(T| )\d\d:\d\d/ ], [ "HH", /(T| )\d\d/ ] ], parseTimezoneChunker = /([\+\-]|\d\d)/gi, proxyGettersAndSetters = "Date|Hours|Minutes|Seconds|Milliseconds".split("|"), unitMillisecondFactors = {
        Milliseconds: 1,
        Seconds: 1e3,
        Minutes: 6e4,
        Hours: 36e5,
        Days: 864e5,
        Months: 2592e6,
        Years: 31536e6
    }, unitAliases = {
        ms: "millisecond",
        s: "second",
        m: "minute",
        h: "hour",
        d: "day",
        D: "date",
        w: "week",
        W: "isoWeek",
        M: "month",
        y: "year",
        DDD: "dayOfYear",
        e: "weekday",
        E: "isoWeekday",
        gg: "weekYear",
        GG: "isoWeekYear"
    }, camelFunctions = {
        dayofyear: "dayOfYear",
        isoweekday: "isoWeekday",
        isoweek: "isoWeek",
        weekyear: "weekYear",
        isoweekyear: "isoWeekYear"
    }, formatFunctions = {}, ordinalizeTokens = "DDD w W M D d".split(" "), paddedTokens = "M D H h m s w W".split(" "), formatTokenFunctions = {
        M: function() {
            return this.month() + 1;
        },
        MMM: function(format) {
            return this.lang().monthsShort(this, format);
        },
        MMMM: function(format) {
            return this.lang().months(this, format);
        },
        D: function() {
            return this.date();
        },
        DDD: function() {
            return this.dayOfYear();
        },
        d: function() {
            return this.day();
        },
        dd: function(format) {
            return this.lang().weekdaysMin(this, format);
        },
        ddd: function(format) {
            return this.lang().weekdaysShort(this, format);
        },
        dddd: function(format) {
            return this.lang().weekdays(this, format);
        },
        w: function() {
            return this.week();
        },
        W: function() {
            return this.isoWeek();
        },
        YY: function() {
            return leftZeroFill(this.year() % 100, 2);
        },
        YYYY: function() {
            return leftZeroFill(this.year(), 4);
        },
        YYYYY: function() {
            return leftZeroFill(this.year(), 5);
        },
        YYYYYY: function() {
            var y = this.year(), sign = y >= 0 ? "+" : "-";
            return sign + leftZeroFill(Math.abs(y), 6);
        },
        gg: function() {
            return leftZeroFill(this.weekYear() % 100, 2);
        },
        gggg: function() {
            return leftZeroFill(this.weekYear(), 4);
        },
        ggggg: function() {
            return leftZeroFill(this.weekYear(), 5);
        },
        GG: function() {
            return leftZeroFill(this.isoWeekYear() % 100, 2);
        },
        GGGG: function() {
            return leftZeroFill(this.isoWeekYear(), 4);
        },
        GGGGG: function() {
            return leftZeroFill(this.isoWeekYear(), 5);
        },
        e: function() {
            return this.weekday();
        },
        E: function() {
            return this.isoWeekday();
        },
        a: function() {
            return this.lang().meridiem(this.hours(), this.minutes(), !0);
        },
        A: function() {
            return this.lang().meridiem(this.hours(), this.minutes(), !1);
        },
        H: function() {
            return this.hours();
        },
        h: function() {
            return this.hours() % 12 || 12;
        },
        m: function() {
            return this.minutes();
        },
        s: function() {
            return this.seconds();
        },
        S: function() {
            return toInt(this.milliseconds() / 100);
        },
        SS: function() {
            return leftZeroFill(toInt(this.milliseconds() / 10), 2);
        },
        SSS: function() {
            return leftZeroFill(this.milliseconds(), 3);
        },
        SSSS: function() {
            return leftZeroFill(this.milliseconds(), 3);
        },
        Z: function() {
            var a = -this.zone(), b = "+";
            return a < 0 && (a = -a, b = "-"), b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2);
        },
        ZZ: function() {
            var a = -this.zone(), b = "+";
            return a < 0 && (a = -a, b = "-"), b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
        },
        z: function() {
            return this.zoneAbbr();
        },
        zz: function() {
            return this.zoneName();
        },
        X: function() {
            return this.unix();
        },
        Q: function() {
            return this.quarter();
        }
    }, lists = [ "months", "monthsShort", "weekdays", "weekdaysShort", "weekdaysMin" ]; ordinalizeTokens.length; ) i = ordinalizeTokens.pop(), 
    formatTokenFunctions[i + "o"] = ordinalizeToken(formatTokenFunctions[i], i);
    for (;paddedTokens.length; ) i = paddedTokens.pop(), formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    for (formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3), extend(Language.prototype, {
        set: function(config) {
            var prop, i;
            for (i in config) prop = config[i], "function" == typeof prop ? this[i] = prop : this["_" + i] = prop;
        },
        _months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        months: function(m) {
            return this._months[m.month()];
        },
        _monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        monthsShort: function(m) {
            return this._monthsShort[m.month()];
        },
        monthsParse: function(monthName) {
            var i, mom, regex;
            for (this._monthsParse || (this._monthsParse = []), i = 0; i < 12; i++) if (this._monthsParse[i] || (mom = moment.utc([ 2e3, i ]), 
            regex = "^" + this.months(mom, "") + "|^" + this.monthsShort(mom, ""), this._monthsParse[i] = new RegExp(regex.replace(".", ""), "i")), 
            this._monthsParse[i].test(monthName)) return i;
        },
        _weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdays: function(m) {
            return this._weekdays[m.day()];
        },
        _weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysShort: function(m) {
            return this._weekdaysShort[m.day()];
        },
        _weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        weekdaysMin: function(m) {
            return this._weekdaysMin[m.day()];
        },
        weekdaysParse: function(weekdayName) {
            var i, mom, regex;
            for (this._weekdaysParse || (this._weekdaysParse = []), i = 0; i < 7; i++) if (this._weekdaysParse[i] || (mom = moment([ 2e3, 1 ]).day(i), 
            regex = "^" + this.weekdays(mom, "") + "|^" + this.weekdaysShort(mom, "") + "|^" + this.weekdaysMin(mom, ""), 
            this._weekdaysParse[i] = new RegExp(regex.replace(".", ""), "i")), this._weekdaysParse[i].test(weekdayName)) return i;
        },
        _longDateFormat: {
            LT: "h:mm A",
            L: "MM/DD/YYYY",
            LL: "MMMM D YYYY",
            LLL: "MMMM D YYYY LT",
            LLLL: "dddd, MMMM D YYYY LT"
        },
        longDateFormat: function(key) {
            var output = this._longDateFormat[key];
            return !output && this._longDateFormat[key.toUpperCase()] && (output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function(val) {
                return val.slice(1);
            }), this._longDateFormat[key] = output), output;
        },
        isPM: function(input) {
            return "p" === (input + "").toLowerCase().charAt(0);
        },
        _meridiemParse: /[ap]\.?m?\.?/i,
        meridiem: function(hours, minutes, isLower) {
            return hours > 11 ? isLower ? "pm" : "PM" : isLower ? "am" : "AM";
        },
        _calendar: {
            sameDay: "[Today at] LT",
            nextDay: "[Tomorrow at] LT",
            nextWeek: "dddd [at] LT",
            lastDay: "[Yesterday at] LT",
            lastWeek: "[Last] dddd [at] LT",
            sameElse: "L"
        },
        calendar: function(key, mom) {
            var output = this._calendar[key];
            return "function" == typeof output ? output.apply(mom) : output;
        },
        _relativeTime: {
            future: "in %s",
            past: "%s ago",
            s: "a few seconds",
            m: "a minute",
            mm: "%d minutes",
            h: "an hour",
            hh: "%d hours",
            d: "a day",
            dd: "%d days",
            M: "a month",
            MM: "%d months",
            y: "a year",
            yy: "%d years"
        },
        relativeTime: function(number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return "function" == typeof output ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
        },
        pastFuture: function(diff, output) {
            var format = this._relativeTime[diff > 0 ? "future" : "past"];
            return "function" == typeof format ? format(output) : format.replace(/%s/i, output);
        },
        ordinal: function(number) {
            return this._ordinal.replace("%d", number);
        },
        _ordinal: "%d",
        preparse: function(string) {
            return string;
        },
        postformat: function(string) {
            return string;
        },
        week: function(mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },
        _week: {
            dow: 0,
            doy: 6
        },
        _invalidDate: "Invalid date",
        invalidDate: function() {
            return this._invalidDate;
        }
    }), moment = function(input, format, lang, strict) {
        var c;
        return "boolean" == typeof lang && (strict = lang, lang = undefined), c = {}, c._isAMomentObject = !0, 
        c._i = input, c._f = format, c._l = lang, c._strict = strict, c._isUTC = !1, c._pf = defaultParsingFlags(), 
        makeMoment(c);
    }, moment.utc = function(input, format, lang, strict) {
        var c;
        return "boolean" == typeof lang && (strict = lang, lang = undefined), c = {}, c._isAMomentObject = !0, 
        c._useUTC = !0, c._isUTC = !0, c._l = lang, c._i = input, c._f = format, c._strict = strict, 
        c._pf = defaultParsingFlags(), makeMoment(c).utc();
    }, moment.unix = function(input) {
        return moment(1e3 * input);
    }, moment.duration = function(input, key) {
        var sign, ret, parseIso, duration = input, match = null;
        return moment.isDuration(input) ? duration = {
            ms: input._milliseconds,
            d: input._days,
            M: input._months
        } : "number" == typeof input ? (duration = {}, key ? duration[key] = input : duration.milliseconds = input) : (match = aspNetTimeSpanJsonRegex.exec(input)) ? (sign = "-" === match[1] ? -1 : 1, 
        duration = {
            y: 0,
            d: toInt(match[DATE]) * sign,
            h: toInt(match[HOUR]) * sign,
            m: toInt(match[MINUTE]) * sign,
            s: toInt(match[SECOND]) * sign,
            ms: toInt(match[MILLISECOND]) * sign
        }) : (match = isoDurationRegex.exec(input)) && (sign = "-" === match[1] ? -1 : 1, 
        parseIso = function(inp) {
            var res = inp && parseFloat(inp.replace(",", "."));
            return (isNaN(res) ? 0 : res) * sign;
        }, duration = {
            y: parseIso(match[2]),
            M: parseIso(match[3]),
            d: parseIso(match[4]),
            h: parseIso(match[5]),
            m: parseIso(match[6]),
            s: parseIso(match[7]),
            w: parseIso(match[8])
        }), ret = new Duration(duration), moment.isDuration(input) && input.hasOwnProperty("_lang") && (ret._lang = input._lang), 
        ret;
    }, moment.version = VERSION, moment.defaultFormat = isoFormat, moment.updateOffset = function() {}, 
    moment.lang = function(key, values) {
        var r;
        return key ? (values ? loadLang(normalizeLanguage(key), values) : null === values ? (unloadLang(key), 
        key = "en") : languages[key] || getLangDefinition(key), r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key), 
        r._abbr) : moment.fn._lang._abbr;
    }, moment.langData = function(key) {
        return key && key._lang && key._lang._abbr && (key = key._lang._abbr), getLangDefinition(key);
    }, moment.isMoment = function(obj) {
        return obj instanceof Moment || null != obj && obj.hasOwnProperty("_isAMomentObject");
    }, moment.isDuration = function(obj) {
        return obj instanceof Duration;
    }, i = lists.length - 1; i >= 0; --i) makeList(lists[i]);
    for (moment.normalizeUnits = function(units) {
        return normalizeUnits(units);
    }, moment.invalid = function(flags) {
        var m = moment.utc(NaN);
        return null != flags ? extend(m._pf, flags) : m._pf.userInvalidated = !0, m;
    }, moment.parseZone = function(input) {
        return moment(input).parseZone();
    }, extend(moment.fn = Moment.prototype, {
        clone: function() {
            return moment(this);
        },
        valueOf: function() {
            return +this._d + 6e4 * (this._offset || 0);
        },
        unix: function() {
            return Math.floor(+this / 1e3);
        },
        toString: function() {
            return this.clone().lang("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },
        toDate: function() {
            return this._offset ? new Date((+this)) : this._d;
        },
        toISOString: function() {
            var m = moment(this).utc();
            return 0 < m.year() && m.year() <= 9999 ? formatMoment(m, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : formatMoment(m, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
        },
        toArray: function() {
            var m = this;
            return [ m.year(), m.month(), m.date(), m.hours(), m.minutes(), m.seconds(), m.milliseconds() ];
        },
        isValid: function() {
            return isValid(this);
        },
        isDSTShifted: function() {
            return !!this._a && (this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0);
        },
        parsingFlags: function() {
            return extend({}, this._pf);
        },
        invalidAt: function() {
            return this._pf.overflow;
        },
        utc: function() {
            return this.zone(0);
        },
        local: function() {
            return this.zone(0), this._isUTC = !1, this;
        },
        format: function(inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.lang().postformat(output);
        },
        add: function(input, val) {
            var dur;
            return dur = "string" == typeof input ? moment.duration(+val, input) : moment.duration(input, val), 
            addOrSubtractDurationFromMoment(this, dur, 1), this;
        },
        subtract: function(input, val) {
            var dur;
            return dur = "string" == typeof input ? moment.duration(+val, input) : moment.duration(input, val), 
            addOrSubtractDurationFromMoment(this, dur, -1), this;
        },
        diff: function(input, units, asFloat) {
            var diff, output, that = makeAs(input, this), zoneDiff = 6e4 * (this.zone() - that.zone());
            return units = normalizeUnits(units), "year" === units || "month" === units ? (diff = 432e5 * (this.daysInMonth() + that.daysInMonth()), 
            output = 12 * (this.year() - that.year()) + (this.month() - that.month()), output += (this - moment(this).startOf("month") - (that - moment(that).startOf("month"))) / diff, 
            output -= 6e4 * (this.zone() - moment(this).startOf("month").zone() - (that.zone() - moment(that).startOf("month").zone())) / diff, 
            "year" === units && (output /= 12)) : (diff = this - that, output = "second" === units ? diff / 1e3 : "minute" === units ? diff / 6e4 : "hour" === units ? diff / 36e5 : "day" === units ? (diff - zoneDiff) / 864e5 : "week" === units ? (diff - zoneDiff) / 6048e5 : diff), 
            asFloat ? output : absRound(output);
        },
        from: function(time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
        },
        fromNow: function(withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },
        calendar: function() {
            var sod = makeAs(moment(), this).startOf("day"), diff = this.diff(sod, "days", !0), format = diff < -6 ? "sameElse" : diff < -1 ? "lastWeek" : diff < 0 ? "lastDay" : diff < 1 ? "sameDay" : diff < 2 ? "nextDay" : diff < 7 ? "nextWeek" : "sameElse";
            return this.format(this.lang().calendar(format, this));
        },
        isLeapYear: function() {
            return isLeapYear(this.year());
        },
        isDST: function() {
            return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone();
        },
        day: function(input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            return null != input ? (input = parseWeekday(input, this.lang()), this.add({
                d: input - day
            })) : day;
        },
        month: function(input) {
            var dayOfMonth, utc = this._isUTC ? "UTC" : "";
            return null != input ? "string" == typeof input && (input = this.lang().monthsParse(input), 
            "number" != typeof input) ? this : (dayOfMonth = this.date(), this.date(1), this._d["set" + utc + "Month"](input), 
            this.date(Math.min(dayOfMonth, this.daysInMonth())), moment.updateOffset(this), 
            this) : this._d["get" + utc + "Month"]();
        },
        startOf: function(units) {
            switch (units = normalizeUnits(units)) {
              case "year":
                this.month(0);

              case "month":
                this.date(1);

              case "week":
              case "isoWeek":
              case "day":
                this.hours(0);

              case "hour":
                this.minutes(0);

              case "minute":
                this.seconds(0);

              case "second":
                this.milliseconds(0);
            }
            return "week" === units ? this.weekday(0) : "isoWeek" === units && this.isoWeekday(1), 
            this;
        },
        endOf: function(units) {
            return units = normalizeUnits(units), this.startOf(units).add("isoWeek" === units ? "week" : units, 1).subtract("ms", 1);
        },
        isAfter: function(input, units) {
            return units = "undefined" != typeof units ? units : "millisecond", +this.clone().startOf(units) > +moment(input).startOf(units);
        },
        isBefore: function(input, units) {
            return units = "undefined" != typeof units ? units : "millisecond", +this.clone().startOf(units) < +moment(input).startOf(units);
        },
        isSame: function(input, units) {
            return units = units || "ms", +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
        },
        min: function(other) {
            return other = moment.apply(null, arguments), other < this ? this : other;
        },
        max: function(other) {
            return other = moment.apply(null, arguments), other > this ? this : other;
        },
        zone: function(input) {
            var offset = this._offset || 0;
            return null == input ? this._isUTC ? offset : this._d.getTimezoneOffset() : ("string" == typeof input && (input = timezoneMinutesFromString(input)), 
            Math.abs(input) < 16 && (input = 60 * input), this._offset = input, this._isUTC = !0, 
            offset !== input && addOrSubtractDurationFromMoment(this, moment.duration(offset - input, "m"), 1, !0), 
            this);
        },
        zoneAbbr: function() {
            return this._isUTC ? "UTC" : "";
        },
        zoneName: function() {
            return this._isUTC ? "Coordinated Universal Time" : "";
        },
        parseZone: function() {
            return this._tzm ? this.zone(this._tzm) : "string" == typeof this._i && this.zone(this._i), 
            this;
        },
        hasAlignedHourOffset: function(input) {
            return input = input ? moment(input).zone() : 0, (this.zone() - input) % 60 === 0;
        },
        daysInMonth: function() {
            return daysInMonth(this.year(), this.month());
        },
        dayOfYear: function(input) {
            var dayOfYear = round((moment(this).startOf("day") - moment(this).startOf("year")) / 864e5) + 1;
            return null == input ? dayOfYear : this.add("d", input - dayOfYear);
        },
        quarter: function() {
            return Math.ceil((this.month() + 1) / 3);
        },
        weekYear: function(input) {
            var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
            return null == input ? year : this.add("y", input - year);
        },
        isoWeekYear: function(input) {
            var year = weekOfYear(this, 1, 4).year;
            return null == input ? year : this.add("y", input - year);
        },
        week: function(input) {
            var week = this.lang().week(this);
            return null == input ? week : this.add("d", 7 * (input - week));
        },
        isoWeek: function(input) {
            var week = weekOfYear(this, 1, 4).week;
            return null == input ? week : this.add("d", 7 * (input - week));
        },
        weekday: function(input) {
            var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
            return null == input ? weekday : this.add("d", input - weekday);
        },
        isoWeekday: function(input) {
            return null == input ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },
        get: function(units) {
            return units = normalizeUnits(units), this[units]();
        },
        set: function(units, value) {
            return units = normalizeUnits(units), "function" == typeof this[units] && this[units](value), 
            this;
        },
        lang: function(key) {
            return key === undefined ? this._lang : (this._lang = getLangDefinition(key), this);
        }
    }), i = 0; i < proxyGettersAndSetters.length; i++) makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ""), proxyGettersAndSetters[i]);
    makeGetterAndSetter("year", "FullYear"), moment.fn.days = moment.fn.day, moment.fn.months = moment.fn.month, 
    moment.fn.weeks = moment.fn.week, moment.fn.isoWeeks = moment.fn.isoWeek, moment.fn.toJSON = moment.fn.toISOString, 
    extend(moment.duration.fn = Duration.prototype, {
        _bubble: function() {
            var seconds, minutes, hours, years, milliseconds = this._milliseconds, days = this._days, months = this._months, data = this._data;
            data.milliseconds = milliseconds % 1e3, seconds = absRound(milliseconds / 1e3), 
            data.seconds = seconds % 60, minutes = absRound(seconds / 60), data.minutes = minutes % 60, 
            hours = absRound(minutes / 60), data.hours = hours % 24, days += absRound(hours / 24), 
            data.days = days % 30, months += absRound(days / 30), data.months = months % 12, 
            years = absRound(months / 12), data.years = years;
        },
        weeks: function() {
            return absRound(this.days() / 7);
        },
        valueOf: function() {
            return this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * toInt(this._months / 12);
        },
        humanize: function(withSuffix) {
            var difference = +this, output = relativeTime(difference, !withSuffix, this.lang());
            return withSuffix && (output = this.lang().pastFuture(difference, output)), this.lang().postformat(output);
        },
        add: function(input, val) {
            var dur = moment.duration(input, val);
            return this._milliseconds += dur._milliseconds, this._days += dur._days, this._months += dur._months, 
            this._bubble(), this;
        },
        subtract: function(input, val) {
            var dur = moment.duration(input, val);
            return this._milliseconds -= dur._milliseconds, this._days -= dur._days, this._months -= dur._months, 
            this._bubble(), this;
        },
        get: function(units) {
            return units = normalizeUnits(units), this[units.toLowerCase() + "s"]();
        },
        as: function(units) {
            return units = normalizeUnits(units), this["as" + units.charAt(0).toUpperCase() + units.slice(1) + "s"]();
        },
        lang: moment.fn.lang,
        toIsoString: function() {
            var years = Math.abs(this.years()), months = Math.abs(this.months()), days = Math.abs(this.days()), hours = Math.abs(this.hours()), minutes = Math.abs(this.minutes()), seconds = Math.abs(this.seconds() + this.milliseconds() / 1e3);
            return this.asSeconds() ? (this.asSeconds() < 0 ? "-" : "") + "P" + (years ? years + "Y" : "") + (months ? months + "M" : "") + (days ? days + "D" : "") + (hours || minutes || seconds ? "T" : "") + (hours ? hours + "H" : "") + (minutes ? minutes + "M" : "") + (seconds ? seconds + "S" : "") : "P0D";
        }
    });
    for (i in unitMillisecondFactors) unitMillisecondFactors.hasOwnProperty(i) && (makeDurationAsGetter(i, unitMillisecondFactors[i]), 
    makeDurationGetter(i.toLowerCase()));
    makeDurationAsGetter("Weeks", 6048e5), moment.duration.fn.asMonths = function() {
        return (+this - 31536e6 * this.years()) / 2592e6 + 12 * this.years();
    }, moment.lang("en", {
        ordinal: function(number) {
            var b = number % 10, output = 1 === toInt(number % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th";
            return number + output;
        }
    }), hasModule ? (module.exports = moment, makeGlobal(!0)) : "function" == typeof define && define.amd ? define("moment", function(require, exports, module) {
        return module.config && module.config() && module.config().noGlobal !== !0 && makeGlobal(module.config().noGlobal === undefined), 
        moment;
    }) : makeGlobal();
}.call(this), function() {
    "use strict";
    function angularMoment(angular, moment) {
        return angular.module("angularMoment", []).constant("angularMomentConfig", {
            preprocess: null,
            timezone: "",
            format: null
        }).constant("moment", moment).constant("amTimeAgoConfig", {
            withoutSuffix: !1,
            serverTime: null,
            titleFormat: null
        }).directive("amTimeAgo", [ "$window", "moment", "amMoment", "amTimeAgoConfig", "angularMomentConfig", function($window, moment, amMoment, amTimeAgoConfig, angularMomentConfig) {
            return function(scope, element, attr) {
                function getNow() {
                    var now;
                    if (amTimeAgoConfig.serverTime) {
                        var localNow = new Date().getTime(), nowMillis = localNow - localDate + amTimeAgoConfig.serverTime;
                        now = moment(nowMillis);
                    } else now = moment();
                    return now;
                }
                function cancelTimer() {
                    activeTimeout && ($window.clearTimeout(activeTimeout), activeTimeout = null);
                }
                function updateTime(momentInstance) {
                    if (element.text(momentInstance.from(getNow(), withoutSuffix)), titleFormat && !element.attr("title") && element.attr("title", momentInstance.local().format(titleFormat)), 
                    !isBindOnce) {
                        var howOld = Math.abs(getNow().diff(momentInstance, "minute")), secondsUntilUpdate = 3600;
                        howOld < 1 ? secondsUntilUpdate = 1 : howOld < 60 ? secondsUntilUpdate = 30 : howOld < 180 && (secondsUntilUpdate = 300), 
                        activeTimeout = $window.setTimeout(function() {
                            updateTime(momentInstance);
                        }, 1e3 * secondsUntilUpdate);
                    }
                }
                function updateDateTimeAttr(value) {
                    isTimeElement && element.attr("datetime", value);
                }
                function updateMoment() {
                    if (cancelTimer(), currentValue) {
                        var momentValue = amMoment.preprocessDate(currentValue, preprocess, currentFormat);
                        updateTime(momentValue), updateDateTimeAttr(momentValue.toISOString());
                    }
                }
                var currentValue, unwatchChanges, activeTimeout = null, currentFormat = angularMomentConfig.format, withoutSuffix = amTimeAgoConfig.withoutSuffix, titleFormat = amTimeAgoConfig.titleFormat, localDate = new Date().getTime(), preprocess = angularMomentConfig.preprocess, modelName = attr.amTimeAgo.replace(/^::/, ""), isBindOnce = 0 === attr.amTimeAgo.indexOf("::"), isTimeElement = "TIME" === element[0].nodeName.toUpperCase();
                unwatchChanges = scope.$watch(modelName, function(value) {
                    return "undefined" == typeof value || null === value || "" === value ? (cancelTimer(), 
                    void (currentValue && (element.text(""), updateDateTimeAttr(""), currentValue = null))) : (currentValue = value, 
                    updateMoment(), void (void 0 !== value && isBindOnce && unwatchChanges()));
                }), angular.isDefined(attr.amWithoutSuffix) && scope.$watch(attr.amWithoutSuffix, function(value) {
                    "boolean" == typeof value ? (withoutSuffix = value, updateMoment()) : withoutSuffix = amTimeAgoConfig.withoutSuffix;
                }), attr.$observe("amFormat", function(format) {
                    "undefined" != typeof format && (currentFormat = format, updateMoment());
                }), attr.$observe("amPreprocess", function(newValue) {
                    preprocess = newValue, updateMoment();
                }), scope.$on("$destroy", function() {
                    cancelTimer();
                }), scope.$on("amMoment:localeChanged", function() {
                    updateMoment();
                });
            };
        } ]).service("amMoment", [ "moment", "$rootScope", "$log", "angularMomentConfig", function(moment, $rootScope, $log, angularMomentConfig) {
            var that = this;
            this.preprocessors = {
                utc: moment.utc,
                unix: moment.unix
            }, this.changeLocale = function(locale) {
                var result = (moment.locale || moment.lang)(locale);
                return angular.isDefined(locale) && ($rootScope.$broadcast("amMoment:localeChanged"), 
                $rootScope.$broadcast("amMoment:languageChange")), result;
            }, this.changeLanguage = function(lang) {
                return $log.warn("angular-moment: Usage of amMoment.changeLanguage() is deprecated. Please use changeLocale()"), 
                that.changeLocale(lang);
            }, this.preprocessDate = function(value, preprocess, format) {
                return angular.isUndefined(preprocess) && (preprocess = angularMomentConfig.preprocess), 
                this.preprocessors[preprocess] ? this.preprocessors[preprocess](value, format) : (preprocess && $log.warn("angular-moment: Ignoring unsupported value for preprocess: " + preprocess), 
                !isNaN(parseFloat(value)) && isFinite(value) ? moment(parseInt(value, 10)) : moment(value, format));
            }, this.applyTimezone = function(aMoment) {
                var timezone = angularMomentConfig.timezone;
                return aMoment && timezone && (aMoment.tz ? aMoment = aMoment.tz(timezone) : $log.warn("angular-moment: timezone specified but moment.tz() is undefined. Did you forget to include moment-timezone.js?")), 
                aMoment;
            };
        } ]).filter("amCalendar", [ "moment", "amMoment", function(moment, amMoment) {
            return function(value, preprocess) {
                if ("undefined" == typeof value || null === value) return "";
                value = amMoment.preprocessDate(value, preprocess);
                var date = moment(value);
                return date.isValid() ? amMoment.applyTimezone(date).calendar() : "";
            };
        } ]).filter("amDateFormat", [ "moment", "amMoment", function(moment, amMoment) {
            return function(value, format, preprocess) {
                if ("undefined" == typeof value || null === value) return "";
                value = amMoment.preprocessDate(value, preprocess);
                var date = moment(value);
                return date.isValid() ? amMoment.applyTimezone(date).format(format) : "";
            };
        } ]).filter("amDurationFormat", [ "moment", function(moment) {
            return function(value, format, suffix) {
                return "undefined" == typeof value || null === value ? "" : moment.duration(value, format).humanize(suffix);
            };
        } ]).filter("amTimeAgo", [ "moment", "amMoment", function(moment, amMoment) {
            return function(value, preprocess, suffix) {
                if ("undefined" == typeof value || null === value) return "";
                value = amMoment.preprocessDate(value, preprocess);
                var date = moment(value);
                return date.isValid() ? amMoment.applyTimezone(date).fromNow(suffix) : "";
            };
        } ]);
    }
    "function" == typeof define && define.amd ? define("angular-moment", [ "angular", "moment" ], angularMoment) : "undefined" != typeof module && module && module.exports ? angularMoment(angular, require("moment")) : angularMoment(angular, window.moment);
}(), "undefined" != typeof module && "undefined" != typeof exports && module.exports === exports && (module.exports = "ui.router"), 
function(window, angular, undefined) {
    "use strict";
    function inherit(parent, extra) {
        return extend(new (extend(function() {}, {
            prototype: parent
        }))(), extra);
    }
    function merge(dst) {
        return forEach(arguments, function(obj) {
            obj !== dst && forEach(obj, function(value, key) {
                dst.hasOwnProperty(key) || (dst[key] = value);
            });
        }), dst;
    }
    function ancestors(first, second) {
        var path = [];
        for (var n in first.path) {
            if (first.path[n] !== second.path[n]) break;
            path.push(first.path[n]);
        }
        return path;
    }
    function objectKeys(object) {
        if (Object.keys) return Object.keys(object);
        var result = [];
        return angular.forEach(object, function(val, key) {
            result.push(key);
        }), result;
    }
    function indexOf(array, value) {
        if (Array.prototype.indexOf) return array.indexOf(value, Number(arguments[2]) || 0);
        var len = array.length >>> 0, from = Number(arguments[2]) || 0;
        for (from = from < 0 ? Math.ceil(from) : Math.floor(from), from < 0 && (from += len); from < len; from++) if (from in array && array[from] === value) return from;
        return -1;
    }
    function inheritParams(currentParams, newParams, $current, $to) {
        var parentParams, parents = ancestors($current, $to), inherited = {}, inheritList = [];
        for (var i in parents) if (parents[i].params && (parentParams = objectKeys(parents[i].params), 
        parentParams.length)) for (var j in parentParams) indexOf(inheritList, parentParams[j]) >= 0 || (inheritList.push(parentParams[j]), 
        inherited[parentParams[j]] = currentParams[parentParams[j]]);
        return extend({}, inherited, newParams);
    }
    function equalForKeys(a, b, keys) {
        if (!keys) {
            keys = [];
            for (var n in a) keys.push(n);
        }
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (a[k] != b[k]) return !1;
        }
        return !0;
    }
    function filterByKeys(keys, values) {
        var filtered = {};
        return forEach(keys, function(name) {
            filtered[name] = values[name];
        }), filtered;
    }
    function omit(obj) {
        var copy = {}, keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
        for (var key in obj) indexOf(keys, key) == -1 && (copy[key] = obj[key]);
        return copy;
    }
    function filter(collection, callback) {
        var array = isArray(collection), result = array ? [] : {};
        return forEach(collection, function(val, i) {
            callback(val, i) && (result[array ? result.length : i] = val);
        }), result;
    }
    function map(collection, callback) {
        var result = isArray(collection) ? [] : {};
        return forEach(collection, function(val, i) {
            result[i] = callback(val, i);
        }), result;
    }
    function $Resolve($q, $injector) {
        var VISIT_IN_PROGRESS = 1, VISIT_DONE = 2, NOTHING = {}, NO_DEPENDENCIES = [], NO_LOCALS = NOTHING, NO_PARENT = extend($q.when(NOTHING), {
            $$promises: NOTHING,
            $$values: NOTHING
        });
        this.study = function(invocables) {
            function visit(value, key) {
                if (visited[key] !== VISIT_DONE) {
                    if (cycle.push(key), visited[key] === VISIT_IN_PROGRESS) throw cycle.splice(0, indexOf(cycle, key)), 
                    new Error("Cyclic dependency: " + cycle.join(" -> "));
                    if (visited[key] = VISIT_IN_PROGRESS, isString(value)) plan.push(key, [ function() {
                        return $injector.get(value);
                    } ], NO_DEPENDENCIES); else {
                        var params = $injector.annotate(value);
                        forEach(params, function(param) {
                            param !== key && invocables.hasOwnProperty(param) && visit(invocables[param], param);
                        }), plan.push(key, value, params);
                    }
                    cycle.pop(), visited[key] = VISIT_DONE;
                }
            }
            function isResolve(value) {
                return isObject(value) && value.then && value.$$promises;
            }
            if (!isObject(invocables)) throw new Error("'invocables' must be an object");
            var invocableKeys = objectKeys(invocables || {}), plan = [], cycle = [], visited = {};
            return forEach(invocables, visit), invocables = cycle = visited = null, function(locals, parent, self) {
                function done() {
                    --wait || (merged || merge(values, parent.$$values), result.$$values = values, result.$$promises = result.$$promises || !0, 
                    delete result.$$inheritedValues, resolution.resolve(values));
                }
                function fail(reason) {
                    result.$$failure = reason, resolution.reject(reason);
                }
                function invoke(key, invocable, params) {
                    function onfailure(reason) {
                        invocation.reject(reason), fail(reason);
                    }
                    function proceed() {
                        if (!isDefined(result.$$failure)) try {
                            invocation.resolve($injector.invoke(invocable, self, values)), invocation.promise.then(function(result) {
                                values[key] = result, done();
                            }, onfailure);
                        } catch (e) {
                            onfailure(e);
                        }
                    }
                    var invocation = $q.defer(), waitParams = 0;
                    forEach(params, function(dep) {
                        promises.hasOwnProperty(dep) && !locals.hasOwnProperty(dep) && (waitParams++, promises[dep].then(function(result) {
                            values[dep] = result, --waitParams || proceed();
                        }, onfailure));
                    }), waitParams || proceed(), promises[key] = invocation.promise;
                }
                if (isResolve(locals) && self === undefined && (self = parent, parent = locals, 
                locals = null), locals) {
                    if (!isObject(locals)) throw new Error("'locals' must be an object");
                } else locals = NO_LOCALS;
                if (parent) {
                    if (!isResolve(parent)) throw new Error("'parent' must be a promise returned by $resolve.resolve()");
                } else parent = NO_PARENT;
                var resolution = $q.defer(), result = resolution.promise, promises = result.$$promises = {}, values = extend({}, locals), wait = 1 + plan.length / 3, merged = !1;
                if (isDefined(parent.$$failure)) return fail(parent.$$failure), result;
                parent.$$inheritedValues && merge(values, omit(parent.$$inheritedValues, invocableKeys)), 
                extend(promises, parent.$$promises), parent.$$values ? (merged = merge(values, omit(parent.$$values, invocableKeys)), 
                result.$$inheritedValues = omit(parent.$$values, invocableKeys), done()) : (parent.$$inheritedValues && (result.$$inheritedValues = omit(parent.$$inheritedValues, invocableKeys)), 
                parent.then(done, fail));
                for (var i = 0, ii = plan.length; i < ii; i += 3) locals.hasOwnProperty(plan[i]) ? done() : invoke(plan[i], plan[i + 1], plan[i + 2]);
                return result;
            };
        }, this.resolve = function(invocables, locals, parent, self) {
            return this.study(invocables)(locals, parent, self);
        };
    }
    function $TemplateFactory($http, $templateCache, $injector) {
        this.fromConfig = function(config, params, locals) {
            return isDefined(config.template) ? this.fromString(config.template, params) : isDefined(config.templateUrl) ? this.fromUrl(config.templateUrl, params) : isDefined(config.templateProvider) ? this.fromProvider(config.templateProvider, params, locals) : null;
        }, this.fromString = function(template, params) {
            return isFunction(template) ? template(params) : template;
        }, this.fromUrl = function(url, params) {
            return isFunction(url) && (url = url(params)), null == url ? null : $http.get(url, {
                cache: $templateCache,
                headers: {
                    Accept: "text/html"
                }
            }).then(function(response) {
                return response.data;
            });
        }, this.fromProvider = function(provider, params, locals) {
            return $injector.invoke(provider, null, locals || {
                params: params
            });
        };
    }
    function UrlMatcher(pattern, config, parentMatcher) {
        function addParameter(id, type, config, location) {
            if (paramNames.push(id), parentParams[id]) return parentParams[id];
            if (!/^\w+(-+\w+)*(?:\[\])?$/.test(id)) throw new Error("Invalid parameter name '" + id + "' in pattern '" + pattern + "'");
            if (params[id]) throw new Error("Duplicate parameter name '" + id + "' in pattern '" + pattern + "'");
            return params[id] = new $$UMFP.Param(id, type, config, location), params[id];
        }
        function quoteRegExp(string, pattern, squash) {
            var surroundPattern = [ "", "" ], result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
            if (!pattern) return result;
            switch (squash) {
              case !1:
                surroundPattern = [ "(", ")" ];
                break;

              case !0:
                surroundPattern = [ "?(", ")?" ];
                break;

              default:
                surroundPattern = [ "(" + squash + "|", ")?" ];
            }
            return result + surroundPattern[0] + pattern + surroundPattern[1];
        }
        function matchDetails(m, isSearch) {
            var id, regexp, segment, type, cfg;
            return id = m[2] || m[3], cfg = config.params[id], segment = pattern.substring(last, m.index), 
            regexp = isSearch ? m[4] : m[4] || ("*" == m[1] ? ".*" : null), type = $$UMFP.type(regexp || "string") || inherit($$UMFP.type("string"), {
                pattern: new RegExp(regexp)
            }), {
                id: id,
                regexp: regexp,
                segment: segment,
                type: type,
                cfg: cfg
            };
        }
        config = extend({
            params: {}
        }, isObject(config) ? config : {});
        var m, placeholder = /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g, searchPlaceholder = /([:]?)([\w\[\]-]+)|\{([\w\[\]-]+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g, compiled = "^", last = 0, segments = this.segments = [], parentParams = parentMatcher ? parentMatcher.params : {}, params = this.params = parentMatcher ? parentMatcher.params.$$new() : new $$UMFP.ParamSet(), paramNames = [];
        this.source = pattern;
        for (var p, param, segment; (m = placeholder.exec(pattern)) && (p = matchDetails(m, !1), 
        !(p.segment.indexOf("?") >= 0)); ) param = addParameter(p.id, p.type, p.cfg, "path"), 
        compiled += quoteRegExp(p.segment, param.type.pattern.source, param.squash), segments.push(p.segment), 
        last = placeholder.lastIndex;
        segment = pattern.substring(last);
        var i = segment.indexOf("?");
        if (i >= 0) {
            var search = this.sourceSearch = segment.substring(i);
            if (segment = segment.substring(0, i), this.sourcePath = pattern.substring(0, last + i), 
            search.length > 0) for (last = 0; m = searchPlaceholder.exec(search); ) p = matchDetails(m, !0), 
            param = addParameter(p.id, p.type, p.cfg, "search"), last = placeholder.lastIndex;
        } else this.sourcePath = pattern, this.sourceSearch = "";
        compiled += quoteRegExp(segment) + (config.strict === !1 ? "/?" : "") + "$", segments.push(segment), 
        this.regexp = new RegExp(compiled, config.caseInsensitive ? "i" : undefined), this.prefix = segments[0], 
        this.$$paramNames = paramNames;
    }
    function Type(config) {
        extend(this, config);
    }
    function $UrlMatcherFactory() {
        function valToString(val) {
            return null != val ? val.toString().replace(/\//g, "%2F") : val;
        }
        function valFromString(val) {
            return null != val ? val.toString().replace(/%2F/g, "/") : val;
        }
        function regexpMatches(val) {
            return this.pattern.test(val);
        }
        function getDefaultConfig() {
            return {
                strict: isStrictMode,
                caseInsensitive: isCaseInsensitive
            };
        }
        function isInjectable(value) {
            return isFunction(value) || isArray(value) && isFunction(value[value.length - 1]);
        }
        function flushTypeQueue() {
            for (;typeQueue.length; ) {
                var type = typeQueue.shift();
                if (type.pattern) throw new Error("You cannot override a type's .pattern at runtime.");
                angular.extend($types[type.name], injector.invoke(type.def));
            }
        }
        function ParamSet(params) {
            extend(this, params || {});
        }
        $$UMFP = this;
        var injector, isCaseInsensitive = !1, isStrictMode = !0, defaultSquashPolicy = !1, $types = {}, enqueue = !0, typeQueue = [], defaultTypes = {
            string: {
                encode: valToString,
                decode: valFromString,
                is: regexpMatches,
                pattern: /[^/]*/
            },
            int: {
                encode: valToString,
                decode: function(val) {
                    return parseInt(val, 10);
                },
                is: function(val) {
                    return isDefined(val) && this.decode(val.toString()) === val;
                },
                pattern: /\d+/
            },
            bool: {
                encode: function(val) {
                    return val ? 1 : 0;
                },
                decode: function(val) {
                    return 0 !== parseInt(val, 10);
                },
                is: function(val) {
                    return val === !0 || val === !1;
                },
                pattern: /0|1/
            },
            date: {
                encode: function(val) {
                    return this.is(val) ? [ val.getFullYear(), ("0" + (val.getMonth() + 1)).slice(-2), ("0" + val.getDate()).slice(-2) ].join("-") : undefined;
                },
                decode: function(val) {
                    if (this.is(val)) return val;
                    var match = this.capture.exec(val);
                    return match ? new Date(match[1], match[2] - 1, match[3]) : undefined;
                },
                is: function(val) {
                    return val instanceof Date && !isNaN(val.valueOf());
                },
                equals: function(a, b) {
                    return this.is(a) && this.is(b) && a.toISOString() === b.toISOString();
                },
                pattern: /[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])/,
                capture: /([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/
            },
            json: {
                encode: angular.toJson,
                decode: angular.fromJson,
                is: angular.isObject,
                equals: angular.equals,
                pattern: /[^/]*/
            },
            any: {
                encode: angular.identity,
                decode: angular.identity,
                is: angular.identity,
                equals: angular.equals,
                pattern: /.*/
            }
        };
        $UrlMatcherFactory.$$getDefaultValue = function(config) {
            if (!isInjectable(config.value)) return config.value;
            if (!injector) throw new Error("Injectable functions cannot be called at configuration time");
            return injector.invoke(config.value);
        }, this.caseInsensitive = function(value) {
            return isDefined(value) && (isCaseInsensitive = value), isCaseInsensitive;
        }, this.strictMode = function(value) {
            return isDefined(value) && (isStrictMode = value), isStrictMode;
        }, this.defaultSquashPolicy = function(value) {
            if (!isDefined(value)) return defaultSquashPolicy;
            if (value !== !0 && value !== !1 && !isString(value)) throw new Error("Invalid squash policy: " + value + ". Valid policies: false, true, arbitrary-string");
            return defaultSquashPolicy = value, value;
        }, this.compile = function(pattern, config) {
            return new UrlMatcher(pattern, extend(getDefaultConfig(), config));
        }, this.isMatcher = function(o) {
            if (!isObject(o)) return !1;
            var result = !0;
            return forEach(UrlMatcher.prototype, function(val, name) {
                isFunction(val) && (result = result && isDefined(o[name]) && isFunction(o[name]));
            }), result;
        }, this.type = function(name, definition, definitionFn) {
            if (!isDefined(definition)) return $types[name];
            if ($types.hasOwnProperty(name)) throw new Error("A type named '" + name + "' has already been defined.");
            return $types[name] = new Type(extend({
                name: name
            }, definition)), definitionFn && (typeQueue.push({
                name: name,
                def: definitionFn
            }), enqueue || flushTypeQueue()), this;
        }, forEach(defaultTypes, function(type, name) {
            $types[name] = new Type(extend({
                name: name
            }, type));
        }), $types = inherit($types, {}), this.$get = [ "$injector", function($injector) {
            return injector = $injector, enqueue = !1, flushTypeQueue(), forEach(defaultTypes, function(type, name) {
                $types[name] || ($types[name] = new Type(type));
            }), this;
        } ], this.Param = function(id, type, config, location) {
            function unwrapShorthand(config) {
                var keys = isObject(config) ? objectKeys(config) : [], isShorthand = indexOf(keys, "value") === -1 && indexOf(keys, "type") === -1 && indexOf(keys, "squash") === -1 && indexOf(keys, "array") === -1;
                return isShorthand && (config = {
                    value: config
                }), config.$$fn = isInjectable(config.value) ? config.value : function() {
                    return config.value;
                }, config;
            }
            function getType(config, urlType, location) {
                if (config.type && urlType) throw new Error("Param '" + id + "' has two type configurations.");
                return urlType ? urlType : config.type ? config.type instanceof Type ? config.type : new Type(config.type) : "config" === location ? $types.any : $types.string;
            }
            function getArrayMode() {
                var arrayDefaults = {
                    array: "search" === location && "auto"
                }, arrayParamNomenclature = id.match(/\[\]$/) ? {
                    array: !0
                } : {};
                return extend(arrayDefaults, arrayParamNomenclature, config).array;
            }
            function getSquashPolicy(config, isOptional) {
                var squash = config.squash;
                if (!isOptional || squash === !1) return !1;
                if (!isDefined(squash) || null == squash) return defaultSquashPolicy;
                if (squash === !0 || isString(squash)) return squash;
                throw new Error("Invalid squash policy: '" + squash + "'. Valid policies: false, true, or arbitrary string");
            }
            function getReplace(config, arrayMode, isOptional, squash) {
                var replace, configuredKeys, defaultPolicy = [ {
                    from: "",
                    to: isOptional || arrayMode ? undefined : ""
                }, {
                    from: null,
                    to: isOptional || arrayMode ? undefined : ""
                } ];
                return replace = isArray(config.replace) ? config.replace : [], isString(squash) && replace.push({
                    from: squash,
                    to: undefined
                }), configuredKeys = map(replace, function(item) {
                    return item.from;
                }), filter(defaultPolicy, function(item) {
                    return indexOf(configuredKeys, item.from) === -1;
                }).concat(replace);
            }
            function $$getDefaultValue() {
                if (!injector) throw new Error("Injectable functions cannot be called at configuration time");
                return injector.invoke(config.$$fn);
            }
            function $value(value) {
                function hasReplaceVal(val) {
                    return function(obj) {
                        return obj.from === val;
                    };
                }
                function $replace(value) {
                    var replacement = map(filter(self.replace, hasReplaceVal(value)), function(obj) {
                        return obj.to;
                    });
                    return replacement.length ? replacement[0] : value;
                }
                return value = $replace(value), isDefined(value) ? self.type.decode(value) : $$getDefaultValue();
            }
            function toString() {
                return "{Param:" + id + " " + type + " squash: '" + squash + "' optional: " + isOptional + "}";
            }
            var self = this;
            config = unwrapShorthand(config), type = getType(config, type, location);
            var arrayMode = getArrayMode();
            type = arrayMode ? type.$asArray(arrayMode, "search" === location) : type, "string" !== type.name || arrayMode || "path" !== location || config.value !== undefined || (config.value = "");
            var isOptional = config.value !== undefined, squash = getSquashPolicy(config, isOptional), replace = getReplace(config, arrayMode, isOptional, squash);
            extend(this, {
                id: id,
                type: type,
                location: location,
                array: arrayMode,
                squash: squash,
                replace: replace,
                isOptional: isOptional,
                value: $value,
                dynamic: undefined,
                config: config,
                toString: toString
            });
        }, ParamSet.prototype = {
            $$new: function() {
                return inherit(this, extend(new ParamSet(), {
                    $$parent: this
                }));
            },
            $$keys: function() {
                for (var keys = [], chain = [], parent = this, ignore = objectKeys(ParamSet.prototype); parent; ) chain.push(parent), 
                parent = parent.$$parent;
                return chain.reverse(), forEach(chain, function(paramset) {
                    forEach(objectKeys(paramset), function(key) {
                        indexOf(keys, key) === -1 && indexOf(ignore, key) === -1 && keys.push(key);
                    });
                }), keys;
            },
            $$values: function(paramValues) {
                var values = {}, self = this;
                return forEach(self.$$keys(), function(key) {
                    values[key] = self[key].value(paramValues && paramValues[key]);
                }), values;
            },
            $$equals: function(paramValues1, paramValues2) {
                var equal = !0, self = this;
                return forEach(self.$$keys(), function(key) {
                    var left = paramValues1 && paramValues1[key], right = paramValues2 && paramValues2[key];
                    self[key].type.equals(left, right) || (equal = !1);
                }), equal;
            },
            $$validates: function(paramValues) {
                var isOptional, val, param, result = !0, self = this;
                return forEach(this.$$keys(), function(key) {
                    param = self[key], val = paramValues[key], isOptional = !val && param.isOptional, 
                    result = result && (isOptional || !!param.type.is(val));
                }), result;
            },
            $$parent: undefined
        }, this.ParamSet = ParamSet;
    }
    function $UrlRouterProvider($locationProvider, $urlMatcherFactory) {
        function regExpPrefix(re) {
            var prefix = /^\^((?:\\[^a-zA-Z0-9]|[^\\\[\]\^$*+?.()|{}]+)*)/.exec(re.source);
            return null != prefix ? prefix[1].replace(/\\(.)/g, "$1") : "";
        }
        function interpolate(pattern, match) {
            return pattern.replace(/\$(\$|\d{1,2})/, function(m, what) {
                return match["$" === what ? 0 : Number(what)];
            });
        }
        function handleIfMatch($injector, handler, match) {
            if (!match) return !1;
            var result = $injector.invoke(handler, handler, {
                $match: match
            });
            return !isDefined(result) || result;
        }
        function $get($location, $rootScope, $injector, $browser) {
            function appendBasePath(url, isHtml5, absolute) {
                return "/" === baseHref ? url : isHtml5 ? baseHref.slice(0, -1) + url : absolute ? baseHref.slice(1) + url : url;
            }
            function update(evt) {
                function check(rule) {
                    var handled = rule($injector, $location);
                    return !!handled && (isString(handled) && $location.replace().url(handled), !0);
                }
                if (!evt || !evt.defaultPrevented) {
                    var ignoreUpdate = lastPushedUrl && $location.url() === lastPushedUrl;
                    if (lastPushedUrl = undefined, ignoreUpdate) return !0;
                    var i, n = rules.length;
                    for (i = 0; i < n; i++) if (check(rules[i])) return;
                    otherwise && check(otherwise);
                }
            }
            function listen() {
                return listener = listener || $rootScope.$on("$locationChangeSuccess", update);
            }
            var lastPushedUrl, baseHref = $browser.baseHref(), location = $location.url();
            return interceptDeferred || listen(), {
                sync: function() {
                    update();
                },
                listen: function() {
                    return listen();
                },
                update: function(read) {
                    return read ? void (location = $location.url()) : void ($location.url() !== location && ($location.url(location), 
                    $location.replace()));
                },
                push: function(urlMatcher, params, options) {
                    $location.url(urlMatcher.format(params || {})), lastPushedUrl = options && options.$$avoidResync ? $location.url() : undefined, 
                    options && options.replace && $location.replace();
                },
                href: function(urlMatcher, params, options) {
                    if (!urlMatcher.validates(params)) return null;
                    var isHtml5 = $locationProvider.html5Mode();
                    angular.isObject(isHtml5) && (isHtml5 = isHtml5.enabled);
                    var url = urlMatcher.format(params);
                    if (options = options || {}, isHtml5 || null === url || (url = "#" + $locationProvider.hashPrefix() + url), 
                    url = appendBasePath(url, isHtml5, options.absolute), !options.absolute || !url) return url;
                    var slash = !isHtml5 && url ? "/" : "", port = $location.port();
                    return port = 80 === port || 443 === port ? "" : ":" + port, [ $location.protocol(), "://", $location.host(), port, slash, url ].join("");
                }
            };
        }
        var listener, rules = [], otherwise = null, interceptDeferred = !1;
        this.rule = function(rule) {
            if (!isFunction(rule)) throw new Error("'rule' must be a function");
            return rules.push(rule), this;
        }, this.otherwise = function(rule) {
            if (isString(rule)) {
                var redirect = rule;
                rule = function() {
                    return redirect;
                };
            } else if (!isFunction(rule)) throw new Error("'rule' must be a function");
            return otherwise = rule, this;
        }, this.when = function(what, handler) {
            var redirect, handlerIsString = isString(handler);
            if (isString(what) && (what = $urlMatcherFactory.compile(what)), !handlerIsString && !isFunction(handler) && !isArray(handler)) throw new Error("invalid 'handler' in when()");
            var strategies = {
                matcher: function(what, handler) {
                    return handlerIsString && (redirect = $urlMatcherFactory.compile(handler), handler = [ "$match", function($match) {
                        return redirect.format($match);
                    } ]), extend(function($injector, $location) {
                        return handleIfMatch($injector, handler, what.exec($location.path(), $location.search()));
                    }, {
                        prefix: isString(what.prefix) ? what.prefix : ""
                    });
                },
                regex: function(what, handler) {
                    if (what.global || what.sticky) throw new Error("when() RegExp must not be global or sticky");
                    return handlerIsString && (redirect = handler, handler = [ "$match", function($match) {
                        return interpolate(redirect, $match);
                    } ]), extend(function($injector, $location) {
                        return handleIfMatch($injector, handler, what.exec($location.path()));
                    }, {
                        prefix: regExpPrefix(what)
                    });
                }
            }, check = {
                matcher: $urlMatcherFactory.isMatcher(what),
                regex: what instanceof RegExp
            };
            for (var n in check) if (check[n]) return this.rule(strategies[n](what, handler));
            throw new Error("invalid 'what' in when()");
        }, this.deferIntercept = function(defer) {
            defer === undefined && (defer = !0), interceptDeferred = defer;
        }, this.$get = $get, $get.$inject = [ "$location", "$rootScope", "$injector", "$browser" ];
    }
    function $StateProvider($urlRouterProvider, $urlMatcherFactory) {
        function isRelative(stateName) {
            return 0 === stateName.indexOf(".") || 0 === stateName.indexOf("^");
        }
        function findState(stateOrName, base) {
            if (!stateOrName) return undefined;
            var isStr = isString(stateOrName), name = isStr ? stateOrName : stateOrName.name, path = isRelative(name);
            if (path) {
                if (!base) throw new Error("No reference point given for path '" + name + "'");
                base = findState(base);
                for (var rel = name.split("."), i = 0, pathLength = rel.length, current = base; i < pathLength; i++) if ("" !== rel[i] || 0 !== i) {
                    if ("^" !== rel[i]) break;
                    if (!current.parent) throw new Error("Path '" + name + "' not valid for state '" + base.name + "'");
                    current = current.parent;
                } else current = base;
                rel = rel.slice(i).join("."), name = current.name + (current.name && rel ? "." : "") + rel;
            }
            var state = states[name];
            return !state || !isStr && (isStr || state !== stateOrName && state.self !== stateOrName) ? undefined : state;
        }
        function queueState(parentName, state) {
            queue[parentName] || (queue[parentName] = []), queue[parentName].push(state);
        }
        function flushQueuedChildren(parentName) {
            for (var queued = queue[parentName] || []; queued.length; ) registerState(queued.shift());
        }
        function registerState(state) {
            state = inherit(state, {
                self: state,
                resolve: state.resolve || {},
                toString: function() {
                    return this.name;
                }
            });
            var name = state.name;
            if (!isString(name) || name.indexOf("@") >= 0) throw new Error("State must have a valid name");
            if (states.hasOwnProperty(name)) throw new Error("State '" + name + "'' is already defined");
            var parentName = name.indexOf(".") !== -1 ? name.substring(0, name.lastIndexOf(".")) : isString(state.parent) ? state.parent : isObject(state.parent) && isString(state.parent.name) ? state.parent.name : "";
            if (parentName && !states[parentName]) return queueState(parentName, state.self);
            for (var key in stateBuilder) isFunction(stateBuilder[key]) && (state[key] = stateBuilder[key](state, stateBuilder.$delegates[key]));
            return states[name] = state, !state[abstractKey] && state.url && $urlRouterProvider.when(state.url, [ "$match", "$stateParams", function($match, $stateParams) {
                $state.$current.navigable == state && equalForKeys($match, $stateParams) || $state.transitionTo(state, $match, {
                    inherit: !0,
                    location: !1
                });
            } ]), flushQueuedChildren(name), state;
        }
        function isGlob(text) {
            return text.indexOf("*") > -1;
        }
        function doesStateMatchGlob(glob) {
            var globSegments = glob.split("."), segments = $state.$current.name.split(".");
            if ("**" === globSegments[0] && (segments = segments.slice(indexOf(segments, globSegments[1])), 
            segments.unshift("**")), "**" === globSegments[globSegments.length - 1] && (segments.splice(indexOf(segments, globSegments[globSegments.length - 2]) + 1, Number.MAX_VALUE), 
            segments.push("**")), globSegments.length != segments.length) return !1;
            for (var i = 0, l = globSegments.length; i < l; i++) "*" === globSegments[i] && (segments[i] = "*");
            return segments.join("") === globSegments.join("");
        }
        function decorator(name, func) {
            return isString(name) && !isDefined(func) ? stateBuilder[name] : isFunction(func) && isString(name) ? (stateBuilder[name] && !stateBuilder.$delegates[name] && (stateBuilder.$delegates[name] = stateBuilder[name]), 
            stateBuilder[name] = func, this) : this;
        }
        function state(name, definition) {
            return isObject(name) ? definition = name : definition.name = name, registerState(definition), 
            this;
        }
        function $get($rootScope, $q, $view, $injector, $resolve, $stateParams, $urlRouter, $location, $urlMatcherFactory) {
            function handleRedirect(redirect, state, params, options) {
                var evt = $rootScope.$broadcast("$stateNotFound", redirect, state, params);
                if (evt.defaultPrevented) return $urlRouter.update(), TransitionAborted;
                if (!evt.retry) return null;
                if (options.$retry) return $urlRouter.update(), TransitionFailed;
                var retryTransition = $state.transition = $q.when(evt.retry);
                return retryTransition.then(function() {
                    return retryTransition !== $state.transition ? TransitionSuperseded : (redirect.options.$retry = !0, 
                    $state.transitionTo(redirect.to, redirect.toParams, redirect.options));
                }, function() {
                    return TransitionAborted;
                }), $urlRouter.update(), retryTransition;
            }
            function resolveState(state, params, paramsAreFiltered, inherited, dst, options) {
                var $stateParams = paramsAreFiltered ? params : filterByKeys(state.params.$$keys(), params), locals = {
                    $stateParams: $stateParams
                };
                dst.resolve = $resolve.resolve(state.resolve, locals, dst.resolve, state);
                var promises = [ dst.resolve.then(function(globals) {
                    dst.globals = globals;
                }) ];
                return inherited && promises.push(inherited), forEach(state.views, function(view, name) {
                    var injectables = view.resolve && view.resolve !== state.resolve ? view.resolve : {};
                    injectables.$template = [ function() {
                        return $view.load(name, {
                            view: view,
                            locals: locals,
                            params: $stateParams,
                            notify: options.notify
                        }) || "";
                    } ], promises.push($resolve.resolve(injectables, locals, dst.resolve, state).then(function(result) {
                        if (isFunction(view.controllerProvider) || isArray(view.controllerProvider)) {
                            var injectLocals = angular.extend({}, injectables, locals);
                            result.$$controller = $injector.invoke(view.controllerProvider, null, injectLocals);
                        } else result.$$controller = view.controller;
                        result.$$state = state, result.$$controllerAs = view.controllerAs, dst[name] = result;
                    }));
                }), $q.all(promises).then(function(values) {
                    return dst;
                });
            }
            var TransitionSuperseded = $q.reject(new Error("transition superseded")), TransitionPrevented = $q.reject(new Error("transition prevented")), TransitionAborted = $q.reject(new Error("transition aborted")), TransitionFailed = $q.reject(new Error("transition failed"));
            return root.locals = {
                resolve: null,
                globals: {
                    $stateParams: {}
                }
            }, $state = {
                params: {},
                current: root.self,
                $current: root,
                transition: null
            }, $state.reload = function() {
                return $state.transitionTo($state.current, $stateParams, {
                    reload: !0,
                    inherit: !1,
                    notify: !0
                });
            }, $state.go = function(to, params, options) {
                return $state.transitionTo(to, params, extend({
                    inherit: !0,
                    relative: $state.$current
                }, options));
            }, $state.transitionTo = function(to, toParams, options) {
                toParams = toParams || {}, options = extend({
                    location: !0,
                    inherit: !1,
                    relative: null,
                    notify: !0,
                    reload: !1,
                    $retry: !1
                }, options || {});
                var evt, from = $state.$current, fromParams = $state.params, fromPath = from.path, toState = findState(to, options.relative);
                if (!isDefined(toState)) {
                    var redirect = {
                        to: to,
                        toParams: toParams,
                        options: options
                    }, redirectResult = handleRedirect(redirect, from.self, fromParams, options);
                    if (redirectResult) return redirectResult;
                    if (to = redirect.to, toParams = redirect.toParams, options = redirect.options, 
                    toState = findState(to, options.relative), !isDefined(toState)) {
                        if (!options.relative) throw new Error("No such state '" + to + "'");
                        throw new Error("Could not resolve '" + to + "' from state '" + options.relative + "'");
                    }
                }
                if (toState[abstractKey]) throw new Error("Cannot transition to abstract state '" + to + "'");
                if (options.inherit && (toParams = inheritParams($stateParams, toParams || {}, $state.$current, toState)), 
                !toState.params.$$validates(toParams)) return TransitionFailed;
                toParams = toState.params.$$values(toParams), to = toState;
                var toPath = to.path, keep = 0, state = toPath[keep], locals = root.locals, toLocals = [];
                if (!options.reload) for (;state && state === fromPath[keep] && state.ownParams.$$equals(toParams, fromParams); ) locals = toLocals[keep] = state.locals, 
                keep++, state = toPath[keep];
                if (shouldTriggerReload(to, from, locals, options)) return to.self.reloadOnSearch !== !1 && $urlRouter.update(), 
                $state.transition = null, $q.when($state.current);
                if (toParams = filterByKeys(to.params.$$keys(), toParams || {}), options.notify && $rootScope.$broadcast("$stateChangeStart", to.self, toParams, from.self, fromParams).defaultPrevented) return $urlRouter.update(), 
                TransitionPrevented;
                for (var resolved = $q.when(locals), l = keep; l < toPath.length; l++, state = toPath[l]) locals = toLocals[l] = inherit(locals), 
                resolved = resolveState(state, toParams, state === to, resolved, locals, options);
                var transition = $state.transition = resolved.then(function() {
                    var l, entering, exiting;
                    if ($state.transition !== transition) return TransitionSuperseded;
                    for (l = fromPath.length - 1; l >= keep; l--) exiting = fromPath[l], exiting.self.onExit && $injector.invoke(exiting.self.onExit, exiting.self, exiting.locals.globals), 
                    exiting.locals = null;
                    for (l = keep; l < toPath.length; l++) entering = toPath[l], entering.locals = toLocals[l], 
                    entering.self.onEnter && $injector.invoke(entering.self.onEnter, entering.self, entering.locals.globals);
                    return $state.transition !== transition ? TransitionSuperseded : ($state.$current = to, 
                    $state.current = to.self, $state.params = toParams, copy($state.params, $stateParams), 
                    $state.transition = null, options.location && to.navigable && $urlRouter.push(to.navigable.url, to.navigable.locals.globals.$stateParams, {
                        $$avoidResync: !0,
                        replace: "replace" === options.location
                    }), options.notify && $rootScope.$broadcast("$stateChangeSuccess", to.self, toParams, from.self, fromParams), 
                    $urlRouter.update(!0), $state.current);
                }, function(error) {
                    return $state.transition !== transition ? TransitionSuperseded : ($state.transition = null, 
                    evt = $rootScope.$broadcast("$stateChangeError", to.self, toParams, from.self, fromParams, error), 
                    evt.defaultPrevented || $urlRouter.update(), $q.reject(error));
                });
                return transition;
            }, $state.is = function(stateOrName, params, options) {
                options = extend({
                    relative: $state.$current
                }, options || {});
                var state = findState(stateOrName, options.relative);
                return isDefined(state) ? $state.$current === state && (!params || equalForKeys(state.params.$$values(params), $stateParams)) : undefined;
            }, $state.includes = function(stateOrName, params, options) {
                if (options = extend({
                    relative: $state.$current
                }, options || {}), isString(stateOrName) && isGlob(stateOrName)) {
                    if (!doesStateMatchGlob(stateOrName)) return !1;
                    stateOrName = $state.$current.name;
                }
                var state = findState(stateOrName, options.relative);
                return isDefined(state) ? !!isDefined($state.$current.includes[state.name]) && (!params || equalForKeys(state.params.$$values(params), $stateParams, objectKeys(params))) : undefined;
            }, $state.href = function(stateOrName, params, options) {
                options = extend({
                    lossy: !0,
                    inherit: !0,
                    absolute: !1,
                    relative: $state.$current
                }, options || {});
                var state = findState(stateOrName, options.relative);
                if (!isDefined(state)) return null;
                options.inherit && (params = inheritParams($stateParams, params || {}, $state.$current, state));
                var nav = state && options.lossy ? state.navigable : state;
                return nav && nav.url !== undefined && null !== nav.url ? $urlRouter.href(nav.url, filterByKeys(state.params.$$keys(), params || {}), {
                    absolute: options.absolute
                }) : null;
            }, $state.get = function(stateOrName, context) {
                if (0 === arguments.length) return map(objectKeys(states), function(name) {
                    return states[name].self;
                });
                var state = findState(stateOrName, context || $state.$current);
                return state && state.self ? state.self : null;
            }, $state;
        }
        function shouldTriggerReload(to, from, locals, options) {
            if (to === from && (locals === from.locals && !options.reload || to.self.reloadOnSearch === !1)) return !0;
        }
        var root, $state, states = {}, queue = {}, abstractKey = "abstract", stateBuilder = {
            parent: function(state) {
                if (isDefined(state.parent) && state.parent) return findState(state.parent);
                var compositeName = /^(.+)\.[^.]+$/.exec(state.name);
                return compositeName ? findState(compositeName[1]) : root;
            },
            data: function(state) {
                return state.parent && state.parent.data && (state.data = state.self.data = extend({}, state.parent.data, state.data)), 
                state.data;
            },
            url: function(state) {
                var url = state.url, config = {
                    params: state.params || {}
                };
                if (isString(url)) return "^" == url.charAt(0) ? $urlMatcherFactory.compile(url.substring(1), config) : (state.parent.navigable || root).url.concat(url, config);
                if (!url || $urlMatcherFactory.isMatcher(url)) return url;
                throw new Error("Invalid url '" + url + "' in state '" + state + "'");
            },
            navigable: function(state) {
                return state.url ? state : state.parent ? state.parent.navigable : null;
            },
            ownParams: function(state) {
                var params = state.url && state.url.params || new $$UMFP.ParamSet();
                return forEach(state.params || {}, function(config, id) {
                    params[id] || (params[id] = new $$UMFP.Param(id, null, config, "config"));
                }), params;
            },
            params: function(state) {
                return state.parent && state.parent.params ? extend(state.parent.params.$$new(), state.ownParams) : new $$UMFP.ParamSet();
            },
            views: function(state) {
                var views = {};
                return forEach(isDefined(state.views) ? state.views : {
                    "": state
                }, function(view, name) {
                    name.indexOf("@") < 0 && (name += "@" + state.parent.name), views[name] = view;
                }), views;
            },
            path: function(state) {
                return state.parent ? state.parent.path.concat(state) : [];
            },
            includes: function(state) {
                var includes = state.parent ? extend({}, state.parent.includes) : {};
                return includes[state.name] = !0, includes;
            },
            $delegates: {}
        };
        root = registerState({
            name: "",
            url: "^",
            views: null,
            abstract: !0
        }), root.navigable = null, this.decorator = decorator, this.state = state, this.$get = $get, 
        $get.$inject = [ "$rootScope", "$q", "$view", "$injector", "$resolve", "$stateParams", "$urlRouter", "$location", "$urlMatcherFactory" ];
    }
    function $ViewProvider() {
        function $get($rootScope, $templateFactory) {
            return {
                load: function(name, options) {
                    var result, defaults = {
                        template: null,
                        controller: null,
                        view: null,
                        locals: null,
                        notify: !0,
                        async: !0,
                        params: {}
                    };
                    return options = extend(defaults, options), options.view && (result = $templateFactory.fromConfig(options.view, options.params, options.locals)), 
                    result && options.notify && $rootScope.$broadcast("$viewContentLoading", options), 
                    result;
                }
            };
        }
        this.$get = $get, $get.$inject = [ "$rootScope", "$templateFactory" ];
    }
    function $ViewScrollProvider() {
        var useAnchorScroll = !1;
        this.useAnchorScroll = function() {
            useAnchorScroll = !0;
        }, this.$get = [ "$anchorScroll", "$timeout", function($anchorScroll, $timeout) {
            return useAnchorScroll ? $anchorScroll : function($element) {
                $timeout(function() {
                    $element[0].scrollIntoView();
                }, 0, !1);
            };
        } ];
    }
    function $ViewDirective($state, $injector, $uiViewScroll, $interpolate) {
        function getService() {
            return $injector.has ? function(service) {
                return $injector.has(service) ? $injector.get(service) : null;
            } : function(service) {
                try {
                    return $injector.get(service);
                } catch (e) {
                    return null;
                }
            };
        }
        function getRenderer(attrs, scope) {
            var statics = function() {
                return {
                    enter: function(element, target, cb) {
                        target.after(element), cb();
                    },
                    leave: function(element, cb) {
                        element.remove(), cb();
                    }
                };
            };
            if ($animate) return {
                enter: function(element, target, cb) {
                    var promise = $animate.enter(element, null, target, cb);
                    promise && promise.then && promise.then(cb);
                },
                leave: function(element, cb) {
                    var promise = $animate.leave(element, cb);
                    promise && promise.then && promise.then(cb);
                }
            };
            if ($animator) {
                var animate = $animator && $animator(scope, attrs);
                return {
                    enter: function(element, target, cb) {
                        animate.enter(element, null, target), cb();
                    },
                    leave: function(element, cb) {
                        animate.leave(element), cb();
                    }
                };
            }
            return statics();
        }
        var service = getService(), $animator = service("$animator"), $animate = service("$animate"), directive = {
            restrict: "ECA",
            terminal: !0,
            priority: 400,
            transclude: "element",
            compile: function(tElement, tAttrs, $transclude) {
                return function(scope, $element, attrs) {
                    function cleanupLastView() {
                        previousEl && (previousEl.remove(), previousEl = null), currentScope && (currentScope.$destroy(), 
                        currentScope = null), currentEl && (renderer.leave(currentEl, function() {
                            previousEl = null;
                        }), previousEl = currentEl, currentEl = null);
                    }
                    function updateView(firstTime) {
                        var newScope, name = getUiViewName(scope, attrs, $element, $interpolate), previousLocals = name && $state.$current && $state.$current.locals[name];
                        if (firstTime || previousLocals !== latestLocals) {
                            newScope = scope.$new(), latestLocals = $state.$current.locals[name];
                            var clone = $transclude(newScope, function(clone) {
                                renderer.enter(clone, $element, function() {
                                    currentScope && currentScope.$emit("$viewContentAnimationEnded"), (angular.isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) && $uiViewScroll(clone);
                                }), cleanupLastView();
                            });
                            currentEl = clone, currentScope = newScope, currentScope.$emit("$viewContentLoaded"), 
                            currentScope.$eval(onloadExp);
                        }
                    }
                    var previousEl, currentEl, currentScope, latestLocals, onloadExp = attrs.onload || "", autoScrollExp = attrs.autoscroll, renderer = getRenderer(attrs, scope);
                    scope.$on("$stateChangeSuccess", function() {
                        updateView(!1);
                    }), scope.$on("$viewContentLoading", function() {
                        updateView(!1);
                    }), updateView(!0);
                };
            }
        };
        return directive;
    }
    function $ViewDirectiveFill($compile, $controller, $state, $interpolate) {
        return {
            restrict: "ECA",
            priority: -400,
            compile: function(tElement) {
                var initial = tElement.html();
                return function(scope, $element, attrs) {
                    var current = $state.$current, name = getUiViewName(scope, attrs, $element, $interpolate), locals = current && current.locals[name];
                    if (locals) {
                        $element.data("$uiView", {
                            name: name,
                            state: locals.$$state
                        }), $element.html(locals.$template ? locals.$template : initial);
                        var link = $compile($element.contents());
                        if (locals.$$controller) {
                            locals.$scope = scope;
                            var controller = $controller(locals.$$controller, locals);
                            locals.$$controllerAs && (scope[locals.$$controllerAs] = controller), $element.data("$ngControllerController", controller), 
                            $element.children().data("$ngControllerController", controller);
                        }
                        link(scope);
                    }
                };
            }
        };
    }
    function getUiViewName(scope, attrs, element, $interpolate) {
        var name = $interpolate(attrs.uiView || attrs.name || "")(scope), inherited = element.inheritedData("$uiView");
        return name.indexOf("@") >= 0 ? name : name + "@" + (inherited ? inherited.state.name : "");
    }
    function parseStateRef(ref, current) {
        var parsed, preparsed = ref.match(/^\s*({[^}]*})\s*$/);
        if (preparsed && (ref = current + "(" + preparsed[1] + ")"), parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/), 
        !parsed || 4 !== parsed.length) throw new Error("Invalid state ref '" + ref + "'");
        return {
            state: parsed[1],
            paramExpr: parsed[3] || null
        };
    }
    function stateContext(el) {
        var stateData = el.parent().inheritedData("$uiView");
        if (stateData && stateData.state && stateData.state.name) return stateData.state;
    }
    function $StateRefDirective($state, $timeout) {
        var allowedOptions = [ "location", "inherit", "reload" ];
        return {
            restrict: "A",
            require: [ "?^uiSrefActive", "?^uiSrefActiveEq" ],
            link: function(scope, element, attrs, uiSrefActive) {
                var ref = parseStateRef(attrs.uiSref, $state.current.name), params = null, base = stateContext(element) || $state.$current, newHref = null, isAnchor = "A" === element.prop("tagName"), isForm = "FORM" === element[0].nodeName, attr = isForm ? "action" : "href", nav = !0, options = {
                    relative: base,
                    inherit: !0
                }, optionsOverride = scope.$eval(attrs.uiSrefOpts) || {};
                angular.forEach(allowedOptions, function(option) {
                    option in optionsOverride && (options[option] = optionsOverride[option]);
                });
                var update = function(newVal) {
                    if (newVal && (params = angular.copy(newVal)), nav) {
                        newHref = $state.href(ref.state, params, options);
                        var activeDirective = uiSrefActive[1] || uiSrefActive[0];
                        return activeDirective && activeDirective.$$setStateInfo(ref.state, params), null === newHref ? (nav = !1, 
                        !1) : void attrs.$set(attr, newHref);
                    }
                };
                ref.paramExpr && (scope.$watch(ref.paramExpr, function(newVal, oldVal) {
                    newVal !== params && update(newVal);
                }, !0), params = angular.copy(scope.$eval(ref.paramExpr))), update(), isForm || element.bind("click", function(e) {
                    var button = e.which || e.button;
                    if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || element.attr("target"))) {
                        var transition = $timeout(function() {
                            $state.go(ref.state, params, options);
                        });
                        e.preventDefault();
                        var ignorePreventDefaultCount = isAnchor && !newHref ? 1 : 0;
                        e.preventDefault = function() {
                            ignorePreventDefaultCount-- <= 0 && $timeout.cancel(transition);
                        };
                    }
                });
            }
        };
    }
    function $StateRefActiveDirective($state, $stateParams, $interpolate) {
        return {
            restrict: "A",
            controller: [ "$scope", "$element", "$attrs", function($scope, $element, $attrs) {
                function update() {
                    isMatch() ? $element.addClass(activeClass) : $element.removeClass(activeClass);
                }
                function isMatch() {
                    return "undefined" != typeof $attrs.uiSrefActiveEq ? state && $state.is(state.name, params) : state && $state.includes(state.name, params);
                }
                var state, params, activeClass;
                activeClass = $interpolate($attrs.uiSrefActiveEq || $attrs.uiSrefActive || "", !1)($scope), 
                this.$$setStateInfo = function(newState, newParams) {
                    state = $state.get(newState, stateContext($element)), params = newParams, update();
                }, $scope.$on("$stateChangeSuccess", update);
            } ]
        };
    }
    function $IsStateFilter($state) {
        var isFilter = function(state) {
            return $state.is(state);
        };
        return isFilter.$stateful = !0, isFilter;
    }
    function $IncludedByStateFilter($state) {
        var includesFilter = function(state) {
            return $state.includes(state);
        };
        return includesFilter.$stateful = !0, includesFilter;
    }
    var isDefined = angular.isDefined, isFunction = angular.isFunction, isString = angular.isString, isObject = angular.isObject, isArray = angular.isArray, forEach = angular.forEach, extend = angular.extend, copy = angular.copy;
    angular.module("ui.router.util", [ "ng" ]), angular.module("ui.router.router", [ "ui.router.util" ]), 
    angular.module("ui.router.state", [ "ui.router.router", "ui.router.util" ]), angular.module("ui.router", [ "ui.router.state" ]), 
    angular.module("ui.router.compat", [ "ui.router" ]), $Resolve.$inject = [ "$q", "$injector" ], 
    angular.module("ui.router.util").service("$resolve", $Resolve), $TemplateFactory.$inject = [ "$http", "$templateCache", "$injector" ], 
    angular.module("ui.router.util").service("$templateFactory", $TemplateFactory);
    var $$UMFP;
    UrlMatcher.prototype.concat = function(pattern, config) {
        var defaultConfig = {
            caseInsensitive: $$UMFP.caseInsensitive(),
            strict: $$UMFP.strictMode(),
            squash: $$UMFP.defaultSquashPolicy()
        };
        return new UrlMatcher(this.sourcePath + pattern + this.sourceSearch, extend(defaultConfig, config), this);
    }, UrlMatcher.prototype.toString = function() {
        return this.source;
    }, UrlMatcher.prototype.exec = function(path, searchParams) {
        function decodePathArray(string) {
            function reverseString(str) {
                return str.split("").reverse().join("");
            }
            function unquoteDashes(str) {
                return str.replace(/\\-/, "-");
            }
            var split = reverseString(string).split(/-(?!\\)/), allReversed = map(split, reverseString);
            return map(allReversed, unquoteDashes).reverse();
        }
        var m = this.regexp.exec(path);
        if (!m) return null;
        searchParams = searchParams || {};
        var i, j, paramName, paramNames = this.parameters(), nTotal = paramNames.length, nPath = this.segments.length - 1, values = {};
        if (nPath !== m.length - 1) throw new Error("Unbalanced capture group in route '" + this.source + "'");
        for (i = 0; i < nPath; i++) {
            paramName = paramNames[i];
            var param = this.params[paramName], paramVal = m[i + 1];
            for (j = 0; j < param.replace; j++) param.replace[j].from === paramVal && (paramVal = param.replace[j].to);
            paramVal && param.array === !0 && (paramVal = decodePathArray(paramVal)), values[paramName] = param.value(paramVal);
        }
        for (;i < nTotal; i++) paramName = paramNames[i], values[paramName] = this.params[paramName].value(searchParams[paramName]);
        return values;
    }, UrlMatcher.prototype.parameters = function(param) {
        return isDefined(param) ? this.params[param] || null : this.$$paramNames;
    }, UrlMatcher.prototype.validates = function(params) {
        return this.params.$$validates(params);
    }, UrlMatcher.prototype.format = function(values) {
        function encodeDashes(str) {
            return encodeURIComponent(str).replace(/-/g, function(c) {
                return "%5C%" + c.charCodeAt(0).toString(16).toUpperCase();
            });
        }
        values = values || {};
        var segments = this.segments, params = this.parameters(), paramset = this.params;
        if (!this.validates(values)) return null;
        var i, search = !1, nPath = segments.length - 1, nTotal = params.length, result = segments[0];
        for (i = 0; i < nTotal; i++) {
            var isPathParam = i < nPath, name = params[i], param = paramset[name], value = param.value(values[name]), isDefaultValue = param.isOptional && param.type.equals(param.value(), value), squash = !!isDefaultValue && param.squash, encoded = param.type.encode(value);
            if (isPathParam) {
                var nextSegment = segments[i + 1];
                if (squash === !1) null != encoded && (result += isArray(encoded) ? map(encoded, encodeDashes).join("-") : encodeURIComponent(encoded)), 
                result += nextSegment; else if (squash === !0) {
                    var capture = result.match(/\/$/) ? /\/?(.*)/ : /(.*)/;
                    result += nextSegment.match(capture)[1];
                } else isString(squash) && (result += squash + nextSegment);
            } else {
                if (null == encoded || isDefaultValue && squash !== !1) continue;
                isArray(encoded) || (encoded = [ encoded ]), encoded = map(encoded, encodeURIComponent).join("&" + name + "="), 
                result += (search ? "&" : "?") + (name + "=" + encoded), search = !0;
            }
        }
        return result;
    }, Type.prototype.is = function(val, key) {
        return !0;
    }, Type.prototype.encode = function(val, key) {
        return val;
    }, Type.prototype.decode = function(val, key) {
        return val;
    }, Type.prototype.equals = function(a, b) {
        return a == b;
    }, Type.prototype.$subPattern = function() {
        var sub = this.pattern.toString();
        return sub.substr(1, sub.length - 2);
    }, Type.prototype.pattern = /.*/, Type.prototype.toString = function() {
        return "{Type:" + this.name + "}";
    }, Type.prototype.$asArray = function(mode, isSearch) {
        function ArrayType(type, mode) {
            function bindTo(type, callbackName) {
                return function() {
                    return type[callbackName].apply(type, arguments);
                };
            }
            function arrayWrap(val) {
                return isArray(val) ? val : isDefined(val) ? [ val ] : [];
            }
            function arrayUnwrap(val) {
                switch (val.length) {
                  case 0:
                    return undefined;

                  case 1:
                    return "auto" === mode ? val[0] : val;

                  default:
                    return val;
                }
            }
            function falsey(val) {
                return !val;
            }
            function arrayHandler(callback, allTruthyMode) {
                return function(val) {
                    val = arrayWrap(val);
                    var result = map(val, callback);
                    return allTruthyMode === !0 ? 0 === filter(result, falsey).length : arrayUnwrap(result);
                };
            }
            function arrayEqualsHandler(callback) {
                return function(val1, val2) {
                    var left = arrayWrap(val1), right = arrayWrap(val2);
                    if (left.length !== right.length) return !1;
                    for (var i = 0; i < left.length; i++) if (!callback(left[i], right[i])) return !1;
                    return !0;
                };
            }
            this.encode = arrayHandler(bindTo(type, "encode")), this.decode = arrayHandler(bindTo(type, "decode")), 
            this.is = arrayHandler(bindTo(type, "is"), !0), this.equals = arrayEqualsHandler(bindTo(type, "equals")), 
            this.pattern = type.pattern, this.$arrayMode = mode;
        }
        if (!mode) return this;
        if ("auto" === mode && !isSearch) throw new Error("'auto' array mode is for query parameters only");
        return new ArrayType(this, mode);
    }, angular.module("ui.router.util").provider("$urlMatcherFactory", $UrlMatcherFactory), 
    angular.module("ui.router.util").run([ "$urlMatcherFactory", function($urlMatcherFactory) {} ]), 
    $UrlRouterProvider.$inject = [ "$locationProvider", "$urlMatcherFactoryProvider" ], 
    angular.module("ui.router.router").provider("$urlRouter", $UrlRouterProvider), $StateProvider.$inject = [ "$urlRouterProvider", "$urlMatcherFactoryProvider" ], 
    angular.module("ui.router.state").value("$stateParams", {}).provider("$state", $StateProvider), 
    $ViewProvider.$inject = [], angular.module("ui.router.state").provider("$view", $ViewProvider), 
    angular.module("ui.router.state").provider("$uiViewScroll", $ViewScrollProvider), 
    $ViewDirective.$inject = [ "$state", "$injector", "$uiViewScroll", "$interpolate" ], 
    $ViewDirectiveFill.$inject = [ "$compile", "$controller", "$state", "$interpolate" ], 
    angular.module("ui.router.state").directive("uiView", $ViewDirective), angular.module("ui.router.state").directive("uiView", $ViewDirectiveFill), 
    $StateRefDirective.$inject = [ "$state", "$timeout" ], $StateRefActiveDirective.$inject = [ "$state", "$stateParams", "$interpolate" ], 
    angular.module("ui.router.state").directive("uiSref", $StateRefDirective).directive("uiSrefActive", $StateRefActiveDirective).directive("uiSrefActiveEq", $StateRefActiveDirective), 
    $IsStateFilter.$inject = [ "$state" ], $IncludedByStateFilter.$inject = [ "$state" ], 
    angular.module("ui.router.state").filter("isState", $IsStateFilter).filter("includedByState", $IncludedByStateFilter);
}(window, window.angular), function(window, angular, undefined) {
    "use strict";
    angular.module("ngAnimate", [ "ng" ]).directive("ngAnimateChildren", function() {
        var NG_ANIMATE_CHILDREN = "$$ngAnimateChildren";
        return function(scope, element, attrs) {
            var val = attrs.ngAnimateChildren;
            angular.isString(val) && 0 === val.length ? element.data(NG_ANIMATE_CHILDREN, !0) : scope.$watch(val, function(value) {
                element.data(NG_ANIMATE_CHILDREN, !!value);
            });
        };
    }).factory("$$animateReflow", [ "$$rAF", "$document", function($$rAF, $document) {
        var bod = $document[0].body;
        return function(fn) {
            return $$rAF(function() {
                fn(bod.offsetWidth);
            });
        };
    } ]).config([ "$provide", "$animateProvider", function($provide, $animateProvider) {
        function extractElementNode(element) {
            for (var i = 0; i < element.length; i++) {
                var elm = element[i];
                if (elm.nodeType == ELEMENT_NODE) return elm;
            }
        }
        function prepareElement(element) {
            return element && angular.element(element);
        }
        function stripCommentsFromElement(element) {
            return angular.element(extractElementNode(element));
        }
        function isMatchingElement(elm1, elm2) {
            return extractElementNode(elm1) == extractElementNode(elm2);
        }
        var noop = angular.noop, forEach = angular.forEach, selectors = $animateProvider.$$selectors, ELEMENT_NODE = 1, NG_ANIMATE_STATE = "$$ngAnimateState", NG_ANIMATE_CHILDREN = "$$ngAnimateChildren", NG_ANIMATE_CLASS_NAME = "ng-animate", rootAnimateState = {
            running: !0
        };
        $provide.decorator("$animate", [ "$delegate", "$injector", "$sniffer", "$rootElement", "$$asyncCallback", "$rootScope", "$document", function($delegate, $injector, $sniffer, $rootElement, $$asyncCallback, $rootScope, $document) {
            function blockElementAnimations(element) {
                var data = element.data(NG_ANIMATE_STATE) || {};
                data.running = !0, element.data(NG_ANIMATE_STATE, data);
            }
            function lookup(name) {
                if (name) {
                    var matches = [], flagMap = {}, classes = name.substr(1).split(".");
                    ($sniffer.transitions || $sniffer.animations) && matches.push($injector.get(selectors[""]));
                    for (var i = 0; i < classes.length; i++) {
                        var klass = classes[i], selectorFactoryName = selectors[klass];
                        selectorFactoryName && !flagMap[klass] && (matches.push($injector.get(selectorFactoryName)), 
                        flagMap[klass] = !0);
                    }
                    return matches;
                }
            }
            function animationRunner(element, animationEvent, className) {
                function registerAnimation(animationFactory, event) {
                    var afterFn = animationFactory[event], beforeFn = animationFactory["before" + event.charAt(0).toUpperCase() + event.substr(1)];
                    if (afterFn || beforeFn) return "leave" == event && (beforeFn = afterFn, afterFn = null), 
                    after.push({
                        event: event,
                        fn: afterFn
                    }), before.push({
                        event: event,
                        fn: beforeFn
                    }), !0;
                }
                function run(fns, cancellations, allCompleteFn) {
                    function afterAnimationComplete(index) {
                        if (cancellations) {
                            if ((cancellations[index] || noop)(), ++count < animations.length) return;
                            cancellations = null;
                        }
                        allCompleteFn();
                    }
                    var animations = [];
                    forEach(fns, function(animation) {
                        animation.fn && animations.push(animation);
                    });
                    var count = 0;
                    forEach(animations, function(animation, index) {
                        var progress = function() {
                            afterAnimationComplete(index);
                        };
                        switch (animation.event) {
                          case "setClass":
                            cancellations.push(animation.fn(element, classNameAdd, classNameRemove, progress));
                            break;

                          case "addClass":
                            cancellations.push(animation.fn(element, classNameAdd || className, progress));
                            break;

                          case "removeClass":
                            cancellations.push(animation.fn(element, classNameRemove || className, progress));
                            break;

                          default:
                            cancellations.push(animation.fn(element, progress));
                        }
                    }), cancellations && 0 === cancellations.length && allCompleteFn();
                }
                var node = element[0];
                if (node) {
                    var classNameAdd, classNameRemove, isSetClassOperation = "setClass" == animationEvent, isClassBased = isSetClassOperation || "addClass" == animationEvent || "removeClass" == animationEvent;
                    angular.isArray(className) && (classNameAdd = className[0], classNameRemove = className[1], 
                    className = classNameAdd + " " + classNameRemove);
                    var currentClassName = element.attr("class"), classes = currentClassName + " " + className;
                    if (isAnimatableClassName(classes)) {
                        var beforeComplete = noop, beforeCancel = [], before = [], afterComplete = noop, afterCancel = [], after = [], animationLookup = (" " + classes).replace(/\s+/g, ".");
                        return forEach(lookup(animationLookup), function(animationFactory) {
                            var created = registerAnimation(animationFactory, animationEvent);
                            !created && isSetClassOperation && (registerAnimation(animationFactory, "addClass"), 
                            registerAnimation(animationFactory, "removeClass"));
                        }), {
                            node: node,
                            event: animationEvent,
                            className: className,
                            isClassBased: isClassBased,
                            isSetClassOperation: isSetClassOperation,
                            before: function(allCompleteFn) {
                                beforeComplete = allCompleteFn, run(before, beforeCancel, function() {
                                    beforeComplete = noop, allCompleteFn();
                                });
                            },
                            after: function(allCompleteFn) {
                                afterComplete = allCompleteFn, run(after, afterCancel, function() {
                                    afterComplete = noop, allCompleteFn();
                                });
                            },
                            cancel: function() {
                                beforeCancel && (forEach(beforeCancel, function(cancelFn) {
                                    (cancelFn || noop)(!0);
                                }), beforeComplete(!0)), afterCancel && (forEach(afterCancel, function(cancelFn) {
                                    (cancelFn || noop)(!0);
                                }), afterComplete(!0));
                            }
                        };
                    }
                }
            }
            function performAnimation(animationEvent, className, element, parentElement, afterElement, domOperation, doneCallback) {
                function fireDOMCallback(animationPhase) {
                    var eventName = "$animate:" + animationPhase;
                    elementEvents && elementEvents[eventName] && elementEvents[eventName].length > 0 && $$asyncCallback(function() {
                        element.triggerHandler(eventName, {
                            event: animationEvent,
                            className: className
                        });
                    });
                }
                function fireBeforeCallbackAsync() {
                    fireDOMCallback("before");
                }
                function fireAfterCallbackAsync() {
                    fireDOMCallback("after");
                }
                function fireDoneCallbackAsync() {
                    fireDOMCallback("close"), doneCallback && $$asyncCallback(function() {
                        doneCallback();
                    });
                }
                function fireDOMOperation() {
                    fireDOMOperation.hasBeenRun || (fireDOMOperation.hasBeenRun = !0, domOperation());
                }
                function closeAnimation() {
                    if (!closeAnimation.hasBeenRun) {
                        closeAnimation.hasBeenRun = !0;
                        var data = element.data(NG_ANIMATE_STATE);
                        data && (runner && runner.isClassBased ? cleanup(element, className) : ($$asyncCallback(function() {
                            var data = element.data(NG_ANIMATE_STATE) || {};
                            localAnimationCount == data.index && cleanup(element, className, animationEvent);
                        }), element.data(NG_ANIMATE_STATE, data))), fireDoneCallbackAsync();
                    }
                }
                var runner = animationRunner(element, animationEvent, className);
                if (!runner) return fireDOMOperation(), fireBeforeCallbackAsync(), fireAfterCallbackAsync(), 
                void closeAnimation();
                className = runner.className;
                var elementEvents = angular.element._data(runner.node);
                elementEvents = elementEvents && elementEvents.events, parentElement || (parentElement = afterElement ? afterElement.parent() : element.parent());
                var skipAnimations, ngAnimateState = element.data(NG_ANIMATE_STATE) || {}, runningAnimations = ngAnimateState.active || {}, totalActiveAnimations = ngAnimateState.totalActive || 0, lastAnimation = ngAnimateState.last;
                if (runner.isClassBased && (skipAnimations = ngAnimateState.running || ngAnimateState.disabled || lastAnimation && !lastAnimation.isClassBased), 
                skipAnimations || animationsDisabled(element, parentElement)) return fireDOMOperation(), 
                fireBeforeCallbackAsync(), fireAfterCallbackAsync(), void closeAnimation();
                var skipAnimation = !1;
                if (totalActiveAnimations > 0) {
                    var animationsToCancel = [];
                    if (runner.isClassBased) {
                        if ("setClass" == lastAnimation.event) animationsToCancel.push(lastAnimation), cleanup(element, className); else if (runningAnimations[className]) {
                            var current = runningAnimations[className];
                            current.event == animationEvent ? skipAnimation = !0 : (animationsToCancel.push(current), 
                            cleanup(element, className));
                        }
                    } else if ("leave" == animationEvent && runningAnimations["ng-leave"]) skipAnimation = !0; else {
                        for (var klass in runningAnimations) animationsToCancel.push(runningAnimations[klass]), 
                        cleanup(element, klass);
                        runningAnimations = {}, totalActiveAnimations = 0;
                    }
                    animationsToCancel.length > 0 && forEach(animationsToCancel, function(operation) {
                        operation.cancel();
                    });
                }
                if (!runner.isClassBased || runner.isSetClassOperation || skipAnimation || (skipAnimation = "addClass" == animationEvent == element.hasClass(className)), 
                skipAnimation) return fireDOMOperation(), fireBeforeCallbackAsync(), fireAfterCallbackAsync(), 
                void fireDoneCallbackAsync();
                "leave" == animationEvent && element.one("$destroy", function(e) {
                    var element = angular.element(this), state = element.data(NG_ANIMATE_STATE);
                    if (state) {
                        var activeLeaveAnimation = state.active["ng-leave"];
                        activeLeaveAnimation && (activeLeaveAnimation.cancel(), cleanup(element, "ng-leave"));
                    }
                }), element.addClass(NG_ANIMATE_CLASS_NAME);
                var localAnimationCount = globalAnimationCounter++;
                totalActiveAnimations++, runningAnimations[className] = runner, element.data(NG_ANIMATE_STATE, {
                    last: runner,
                    active: runningAnimations,
                    index: localAnimationCount,
                    totalActive: totalActiveAnimations
                }), fireBeforeCallbackAsync(), runner.before(function(cancelled) {
                    var data = element.data(NG_ANIMATE_STATE);
                    cancelled = cancelled || !data || !data.active[className] || runner.isClassBased && data.active[className].event != animationEvent, 
                    fireDOMOperation(), cancelled === !0 ? closeAnimation() : (fireAfterCallbackAsync(), 
                    runner.after(closeAnimation));
                });
            }
            function cancelChildAnimations(element) {
                var node = extractElementNode(element);
                if (node) {
                    var nodes = angular.isFunction(node.getElementsByClassName) ? node.getElementsByClassName(NG_ANIMATE_CLASS_NAME) : node.querySelectorAll("." + NG_ANIMATE_CLASS_NAME);
                    forEach(nodes, function(element) {
                        element = angular.element(element);
                        var data = element.data(NG_ANIMATE_STATE);
                        data && data.active && forEach(data.active, function(runner) {
                            runner.cancel();
                        });
                    });
                }
            }
            function cleanup(element, className) {
                if (isMatchingElement(element, $rootElement)) rootAnimateState.disabled || (rootAnimateState.running = !1, 
                rootAnimateState.structural = !1); else if (className) {
                    var data = element.data(NG_ANIMATE_STATE) || {}, removeAnimations = className === !0;
                    !removeAnimations && data.active && data.active[className] && (data.totalActive--, 
                    delete data.active[className]), !removeAnimations && data.totalActive || (element.removeClass(NG_ANIMATE_CLASS_NAME), 
                    element.removeData(NG_ANIMATE_STATE));
                }
            }
            function animationsDisabled(element, parentElement) {
                if (rootAnimateState.disabled) return !0;
                if (isMatchingElement(element, $rootElement)) return rootAnimateState.running;
                var allowChildAnimations, parentRunningAnimation, hasParent;
                do {
                    if (0 === parentElement.length) break;
                    var isRoot = isMatchingElement(parentElement, $rootElement), state = isRoot ? rootAnimateState : parentElement.data(NG_ANIMATE_STATE) || {};
                    if (state.disabled) return !0;
                    if (isRoot && (hasParent = !0), allowChildAnimations !== !1) {
                        var animateChildrenFlag = parentElement.data(NG_ANIMATE_CHILDREN);
                        angular.isDefined(animateChildrenFlag) && (allowChildAnimations = animateChildrenFlag);
                    }
                    parentRunningAnimation = parentRunningAnimation || state.running || state.last && !state.last.isClassBased;
                } while (parentElement = parentElement.parent());
                return !hasParent || !allowChildAnimations && parentRunningAnimation;
            }
            var globalAnimationCounter = 0;
            $rootElement.data(NG_ANIMATE_STATE, rootAnimateState), $rootScope.$$postDigest(function() {
                $rootScope.$$postDigest(function() {
                    rootAnimateState.running = !1;
                });
            });
            var classNameFilter = $animateProvider.classNameFilter(), isAnimatableClassName = classNameFilter ? function(className) {
                return classNameFilter.test(className);
            } : function() {
                return !0;
            };
            return {
                enter: function(element, parentElement, afterElement, doneCallback) {
                    element = angular.element(element), parentElement = prepareElement(parentElement), 
                    afterElement = prepareElement(afterElement), blockElementAnimations(element), $delegate.enter(element, parentElement, afterElement), 
                    $rootScope.$$postDigest(function() {
                        element = stripCommentsFromElement(element), performAnimation("enter", "ng-enter", element, parentElement, afterElement, noop, doneCallback);
                    });
                },
                leave: function(element, doneCallback) {
                    element = angular.element(element), cancelChildAnimations(element), blockElementAnimations(element), 
                    $rootScope.$$postDigest(function() {
                        performAnimation("leave", "ng-leave", stripCommentsFromElement(element), null, null, function() {
                            $delegate.leave(element);
                        }, doneCallback);
                    });
                },
                move: function(element, parentElement, afterElement, doneCallback) {
                    element = angular.element(element), parentElement = prepareElement(parentElement), 
                    afterElement = prepareElement(afterElement), cancelChildAnimations(element), blockElementAnimations(element), 
                    $delegate.move(element, parentElement, afterElement), $rootScope.$$postDigest(function() {
                        element = stripCommentsFromElement(element), performAnimation("move", "ng-move", element, parentElement, afterElement, noop, doneCallback);
                    });
                },
                addClass: function(element, className, doneCallback) {
                    element = angular.element(element), element = stripCommentsFromElement(element), 
                    performAnimation("addClass", className, element, null, null, function() {
                        $delegate.addClass(element, className);
                    }, doneCallback);
                },
                removeClass: function(element, className, doneCallback) {
                    element = angular.element(element), element = stripCommentsFromElement(element), 
                    performAnimation("removeClass", className, element, null, null, function() {
                        $delegate.removeClass(element, className);
                    }, doneCallback);
                },
                setClass: function(element, add, remove, doneCallback) {
                    element = angular.element(element), element = stripCommentsFromElement(element), 
                    performAnimation("setClass", [ add, remove ], element, null, null, function() {
                        $delegate.setClass(element, add, remove);
                    }, doneCallback);
                },
                enabled: function(value, element) {
                    switch (arguments.length) {
                      case 2:
                        if (value) cleanup(element); else {
                            var data = element.data(NG_ANIMATE_STATE) || {};
                            data.disabled = !0, element.data(NG_ANIMATE_STATE, data);
                        }
                        break;

                      case 1:
                        rootAnimateState.disabled = !value;
                        break;

                      default:
                        value = !rootAnimateState.disabled;
                    }
                    return !!value;
                }
            };
        } ]), $animateProvider.register("", [ "$window", "$sniffer", "$timeout", "$$animateReflow", function($window, $sniffer, $timeout, $$animateReflow) {
            function clearCacheAfterReflow() {
                cancelAnimationReflow || (cancelAnimationReflow = $$animateReflow(function() {
                    animationReflowQueue = [], cancelAnimationReflow = null, lookupCache = {};
                }));
            }
            function afterReflow(element, callback) {
                cancelAnimationReflow && cancelAnimationReflow(), animationReflowQueue.push(callback), 
                cancelAnimationReflow = $$animateReflow(function() {
                    forEach(animationReflowQueue, function(fn) {
                        fn();
                    }), animationReflowQueue = [], cancelAnimationReflow = null, lookupCache = {};
                });
            }
            function animationCloseHandler(element, totalTime) {
                var node = extractElementNode(element);
                element = angular.element(node), animationElementQueue.push(element);
                var futureTimestamp = Date.now() + totalTime;
                futureTimestamp <= closingTimestamp || ($timeout.cancel(closingTimer), closingTimestamp = futureTimestamp, 
                closingTimer = $timeout(function() {
                    closeAllAnimations(animationElementQueue), animationElementQueue = [];
                }, totalTime, !1));
            }
            function closeAllAnimations(elements) {
                forEach(elements, function(element) {
                    var elementData = element.data(NG_ANIMATE_CSS_DATA_KEY);
                    elementData && (elementData.closeAnimationFn || noop)();
                });
            }
            function getElementAnimationDetails(element, cacheKey) {
                var data = cacheKey ? lookupCache[cacheKey] : null;
                if (!data) {
                    var transitionDelayStyle, animationDelayStyle, transitionDurationStyle, transitionPropertyStyle, transitionDuration = 0, transitionDelay = 0, animationDuration = 0, animationDelay = 0;
                    forEach(element, function(element) {
                        if (element.nodeType == ELEMENT_NODE) {
                            var elementStyles = $window.getComputedStyle(element) || {};
                            transitionDurationStyle = elementStyles[TRANSITION_PROP + DURATION_KEY], transitionDuration = Math.max(parseMaxTime(transitionDurationStyle), transitionDuration), 
                            transitionPropertyStyle = elementStyles[TRANSITION_PROP + PROPERTY_KEY], transitionDelayStyle = elementStyles[TRANSITION_PROP + DELAY_KEY], 
                            transitionDelay = Math.max(parseMaxTime(transitionDelayStyle), transitionDelay), 
                            animationDelayStyle = elementStyles[ANIMATION_PROP + DELAY_KEY], animationDelay = Math.max(parseMaxTime(animationDelayStyle), animationDelay);
                            var aDuration = parseMaxTime(elementStyles[ANIMATION_PROP + DURATION_KEY]);
                            aDuration > 0 && (aDuration *= parseInt(elementStyles[ANIMATION_PROP + ANIMATION_ITERATION_COUNT_KEY], 10) || 1), 
                            animationDuration = Math.max(aDuration, animationDuration);
                        }
                    }), data = {
                        total: 0,
                        transitionPropertyStyle: transitionPropertyStyle,
                        transitionDurationStyle: transitionDurationStyle,
                        transitionDelayStyle: transitionDelayStyle,
                        transitionDelay: transitionDelay,
                        transitionDuration: transitionDuration,
                        animationDelayStyle: animationDelayStyle,
                        animationDelay: animationDelay,
                        animationDuration: animationDuration
                    }, cacheKey && (lookupCache[cacheKey] = data);
                }
                return data;
            }
            function parseMaxTime(str) {
                var maxValue = 0, values = angular.isString(str) ? str.split(/\s*,\s*/) : [];
                return forEach(values, function(value) {
                    maxValue = Math.max(parseFloat(value) || 0, maxValue);
                }), maxValue;
            }
            function getCacheKey(element) {
                var parentElement = element.parent(), parentID = parentElement.data(NG_ANIMATE_PARENT_KEY);
                return parentID || (parentElement.data(NG_ANIMATE_PARENT_KEY, ++parentCounter), 
                parentID = parentCounter), parentID + "-" + extractElementNode(element).getAttribute("class");
            }
            function animateSetup(animationEvent, element, className, calculationDecorator) {
                var cacheKey = getCacheKey(element), eventCacheKey = cacheKey + " " + className, itemIndex = lookupCache[eventCacheKey] ? ++lookupCache[eventCacheKey].total : 0, stagger = {};
                if (itemIndex > 0) {
                    var staggerClassName = className + "-stagger", staggerCacheKey = cacheKey + " " + staggerClassName, applyClasses = !lookupCache[staggerCacheKey];
                    applyClasses && element.addClass(staggerClassName), stagger = getElementAnimationDetails(element, staggerCacheKey), 
                    applyClasses && element.removeClass(staggerClassName);
                }
                calculationDecorator = calculationDecorator || function(fn) {
                    return fn();
                }, element.addClass(className);
                var formerData = element.data(NG_ANIMATE_CSS_DATA_KEY) || {}, timings = calculationDecorator(function() {
                    return getElementAnimationDetails(element, eventCacheKey);
                }), transitionDuration = timings.transitionDuration, animationDuration = timings.animationDuration;
                if (0 === transitionDuration && 0 === animationDuration) return element.removeClass(className), 
                !1;
                element.data(NG_ANIMATE_CSS_DATA_KEY, {
                    running: formerData.running || 0,
                    itemIndex: itemIndex,
                    stagger: stagger,
                    timings: timings,
                    closeAnimationFn: noop
                });
                var isCurrentlyAnimating = formerData.running > 0 || "setClass" == animationEvent;
                return transitionDuration > 0 && blockTransitions(element, className, isCurrentlyAnimating), 
                animationDuration > 0 && stagger.animationDelay > 0 && 0 === stagger.animationDuration && blockKeyframeAnimations(element), 
                !0;
            }
            function isStructuralAnimation(className) {
                return "ng-enter" == className || "ng-move" == className || "ng-leave" == className;
            }
            function blockTransitions(element, className, isAnimating) {
                isStructuralAnimation(className) || !isAnimating ? extractElementNode(element).style[TRANSITION_PROP + PROPERTY_KEY] = "none" : element.addClass(NG_ANIMATE_BLOCK_CLASS_NAME);
            }
            function blockKeyframeAnimations(element) {
                extractElementNode(element).style[ANIMATION_PROP] = "none 0s";
            }
            function unblockTransitions(element, className) {
                var prop = TRANSITION_PROP + PROPERTY_KEY, node = extractElementNode(element);
                node.style[prop] && node.style[prop].length > 0 && (node.style[prop] = ""), element.removeClass(NG_ANIMATE_BLOCK_CLASS_NAME);
            }
            function unblockKeyframeAnimations(element) {
                var prop = ANIMATION_PROP, node = extractElementNode(element);
                node.style[prop] && node.style[prop].length > 0 && (node.style[prop] = "");
            }
            function animateRun(animationEvent, element, className, activeAnimationComplete) {
                function onEnd(cancelled) {
                    element.off(css3AnimationEvents, onAnimationProgress), element.removeClass(activeClassName), 
                    animateClose(element, className);
                    var node = extractElementNode(element);
                    for (var i in appliedStyles) node.style.removeProperty(appliedStyles[i]);
                }
                function onAnimationProgress(event) {
                    event.stopPropagation();
                    var ev = event.originalEvent || event, timeStamp = ev.$manualTimeStamp || Date.now(), elapsedTime = parseFloat(ev.elapsedTime.toFixed(ELAPSED_TIME_MAX_DECIMAL_PLACES));
                    Math.max(timeStamp - startTime, 0) >= maxDelayTime && elapsedTime >= maxDuration && activeAnimationComplete();
                }
                var node = extractElementNode(element), elementData = element.data(NG_ANIMATE_CSS_DATA_KEY);
                if (node.getAttribute("class").indexOf(className) == -1 || !elementData) return void activeAnimationComplete();
                var activeClassName = "";
                forEach(className.split(" "), function(klass, i) {
                    activeClassName += (i > 0 ? " " : "") + klass + "-active";
                });
                var stagger = elementData.stagger, timings = elementData.timings, itemIndex = elementData.itemIndex, maxDuration = Math.max(timings.transitionDuration, timings.animationDuration), maxDelay = Math.max(timings.transitionDelay, timings.animationDelay), maxDelayTime = maxDelay * ONE_SECOND, startTime = Date.now(), css3AnimationEvents = ANIMATIONEND_EVENT + " " + TRANSITIONEND_EVENT, style = "", appliedStyles = [];
                if (timings.transitionDuration > 0) {
                    var propertyStyle = timings.transitionPropertyStyle;
                    propertyStyle.indexOf("all") == -1 && (style += CSS_PREFIX + "transition-property: " + propertyStyle + ";", 
                    style += CSS_PREFIX + "transition-duration: " + timings.transitionDurationStyle + ";", 
                    appliedStyles.push(CSS_PREFIX + "transition-property"), appliedStyles.push(CSS_PREFIX + "transition-duration"));
                }
                if (itemIndex > 0) {
                    if (stagger.transitionDelay > 0 && 0 === stagger.transitionDuration) {
                        var delayStyle = timings.transitionDelayStyle;
                        style += CSS_PREFIX + "transition-delay: " + prepareStaggerDelay(delayStyle, stagger.transitionDelay, itemIndex) + "; ", 
                        appliedStyles.push(CSS_PREFIX + "transition-delay");
                    }
                    stagger.animationDelay > 0 && 0 === stagger.animationDuration && (style += CSS_PREFIX + "animation-delay: " + prepareStaggerDelay(timings.animationDelayStyle, stagger.animationDelay, itemIndex) + "; ", 
                    appliedStyles.push(CSS_PREFIX + "animation-delay"));
                }
                if (appliedStyles.length > 0) {
                    var oldStyle = node.getAttribute("style") || "";
                    node.setAttribute("style", oldStyle + "; " + style);
                }
                element.on(css3AnimationEvents, onAnimationProgress), element.addClass(activeClassName), 
                elementData.closeAnimationFn = function() {
                    onEnd(), activeAnimationComplete();
                };
                var staggerTime = itemIndex * (Math.max(stagger.animationDelay, stagger.transitionDelay) || 0), animationTime = (maxDelay + maxDuration) * CLOSING_TIME_BUFFER, totalTime = (staggerTime + animationTime) * ONE_SECOND;
                return elementData.running++, animationCloseHandler(element, totalTime), onEnd;
            }
            function prepareStaggerDelay(delayStyle, staggerDelay, index) {
                var style = "";
                return forEach(delayStyle.split(","), function(val, i) {
                    style += (i > 0 ? "," : "") + (index * staggerDelay + parseInt(val, 10)) + "s";
                }), style;
            }
            function animateBefore(animationEvent, element, className, calculationDecorator) {
                if (animateSetup(animationEvent, element, className, calculationDecorator)) return function(cancelled) {
                    cancelled && animateClose(element, className);
                };
            }
            function animateAfter(animationEvent, element, className, afterAnimationComplete) {
                return element.data(NG_ANIMATE_CSS_DATA_KEY) ? animateRun(animationEvent, element, className, afterAnimationComplete) : (animateClose(element, className), 
                void afterAnimationComplete());
            }
            function animate(animationEvent, element, className, animationComplete) {
                var preReflowCancellation = animateBefore(animationEvent, element, className);
                if (!preReflowCancellation) return clearCacheAfterReflow(), void animationComplete();
                var cancel = preReflowCancellation;
                return afterReflow(element, function() {
                    unblockTransitions(element, className), unblockKeyframeAnimations(element), cancel = animateAfter(animationEvent, element, className, animationComplete);
                }), function(cancelled) {
                    (cancel || noop)(cancelled);
                };
            }
            function animateClose(element, className) {
                element.removeClass(className);
                var data = element.data(NG_ANIMATE_CSS_DATA_KEY);
                data && (data.running && data.running--, data.running && 0 !== data.running || element.removeData(NG_ANIMATE_CSS_DATA_KEY));
            }
            function suffixClasses(classes, suffix) {
                var className = "";
                return classes = angular.isArray(classes) ? classes : classes.split(/\s+/), forEach(classes, function(klass, i) {
                    klass && klass.length > 0 && (className += (i > 0 ? " " : "") + klass + suffix);
                }), className;
            }
            var TRANSITION_PROP, TRANSITIONEND_EVENT, ANIMATION_PROP, ANIMATIONEND_EVENT, CSS_PREFIX = "";
            window.ontransitionend === undefined && window.onwebkittransitionend !== undefined ? (CSS_PREFIX = "-webkit-", 
            TRANSITION_PROP = "WebkitTransition", TRANSITIONEND_EVENT = "webkitTransitionEnd transitionend") : (TRANSITION_PROP = "transition", 
            TRANSITIONEND_EVENT = "transitionend"), window.onanimationend === undefined && window.onwebkitanimationend !== undefined ? (CSS_PREFIX = "-webkit-", 
            ANIMATION_PROP = "WebkitAnimation", ANIMATIONEND_EVENT = "webkitAnimationEnd animationend") : (ANIMATION_PROP = "animation", 
            ANIMATIONEND_EVENT = "animationend");
            var cancelAnimationReflow, DURATION_KEY = "Duration", PROPERTY_KEY = "Property", DELAY_KEY = "Delay", ANIMATION_ITERATION_COUNT_KEY = "IterationCount", NG_ANIMATE_PARENT_KEY = "$$ngAnimateKey", NG_ANIMATE_CSS_DATA_KEY = "$$ngAnimateCSS3Data", NG_ANIMATE_BLOCK_CLASS_NAME = "ng-animate-block-transitions", ELAPSED_TIME_MAX_DECIMAL_PLACES = 3, CLOSING_TIME_BUFFER = 1.5, ONE_SECOND = 1e3, lookupCache = {}, parentCounter = 0, animationReflowQueue = [], closingTimer = null, closingTimestamp = 0, animationElementQueue = [];
            return {
                enter: function(element, animationCompleted) {
                    return animate("enter", element, "ng-enter", animationCompleted);
                },
                leave: function(element, animationCompleted) {
                    return animate("leave", element, "ng-leave", animationCompleted);
                },
                move: function(element, animationCompleted) {
                    return animate("move", element, "ng-move", animationCompleted);
                },
                beforeSetClass: function(element, add, remove, animationCompleted) {
                    var className = suffixClasses(remove, "-remove") + " " + suffixClasses(add, "-add"), cancellationMethod = animateBefore("setClass", element, className, function(fn) {
                        var klass = element.attr("class");
                        element.removeClass(remove), element.addClass(add);
                        var timings = fn();
                        return element.attr("class", klass), timings;
                    });
                    return cancellationMethod ? (afterReflow(element, function() {
                        unblockTransitions(element, className), unblockKeyframeAnimations(element), animationCompleted();
                    }), cancellationMethod) : (clearCacheAfterReflow(), void animationCompleted());
                },
                beforeAddClass: function(element, className, animationCompleted) {
                    var cancellationMethod = animateBefore("addClass", element, suffixClasses(className, "-add"), function(fn) {
                        element.addClass(className);
                        var timings = fn();
                        return element.removeClass(className), timings;
                    });
                    return cancellationMethod ? (afterReflow(element, function() {
                        unblockTransitions(element, className), unblockKeyframeAnimations(element), animationCompleted();
                    }), cancellationMethod) : (clearCacheAfterReflow(), void animationCompleted());
                },
                setClass: function(element, add, remove, animationCompleted) {
                    remove = suffixClasses(remove, "-remove"), add = suffixClasses(add, "-add");
                    var className = remove + " " + add;
                    return animateAfter("setClass", element, className, animationCompleted);
                },
                addClass: function(element, className, animationCompleted) {
                    return animateAfter("addClass", element, suffixClasses(className, "-add"), animationCompleted);
                },
                beforeRemoveClass: function(element, className, animationCompleted) {
                    var cancellationMethod = animateBefore("removeClass", element, suffixClasses(className, "-remove"), function(fn) {
                        var klass = element.attr("class");
                        element.removeClass(className);
                        var timings = fn();
                        return element.attr("class", klass), timings;
                    });
                    return cancellationMethod ? (afterReflow(element, function() {
                        unblockTransitions(element, className), unblockKeyframeAnimations(element), animationCompleted();
                    }), cancellationMethod) : void animationCompleted();
                },
                removeClass: function(element, className, animationCompleted) {
                    return animateAfter("removeClass", element, suffixClasses(className, "-remove"), animationCompleted);
                }
            };
        } ]);
    } ]);
}(window, window.angular), function(window, angular, undefined) {
    "use strict";
    function isValidDottedPath(path) {
        return null != path && "" !== path && "hasOwnProperty" !== path && MEMBER_NAME_REGEX.test("." + path);
    }
    function lookupDottedPath(obj, path) {
        if (!isValidDottedPath(path)) throw $resourceMinErr("badmember", 'Dotted member path "@{0}" is invalid.', path);
        for (var keys = path.split("."), i = 0, ii = keys.length; i < ii && obj !== undefined; i++) {
            var key = keys[i];
            obj = null !== obj ? obj[key] : undefined;
        }
        return obj;
    }
    function shallowClearAndCopy(src, dst) {
        dst = dst || {}, angular.forEach(dst, function(value, key) {
            delete dst[key];
        });
        for (var key in src) !src.hasOwnProperty(key) || "$" === key.charAt(0) && "$" === key.charAt(1) || (dst[key] = src[key]);
        return dst;
    }
    var $resourceMinErr = angular.$$minErr("$resource"), MEMBER_NAME_REGEX = /^(\.[a-zA-Z_$][0-9a-zA-Z_$]*)+$/;
    angular.module("ngResource", [ "ng" ]).factory("$resource", [ "$http", "$q", function($http, $q) {
        function encodeUriSegment(val) {
            return encodeUriQuery(val, !0).replace(/%26/gi, "&").replace(/%3D/gi, "=").replace(/%2B/gi, "+");
        }
        function encodeUriQuery(val, pctEncodeSpaces) {
            return encodeURIComponent(val).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, pctEncodeSpaces ? "%20" : "+");
        }
        function Route(template, defaults) {
            this.template = template, this.defaults = defaults || {}, this.urlParams = {};
        }
        function resourceFactory(url, paramDefaults, actions) {
            function extractParams(data, actionParams) {
                var ids = {};
                return actionParams = extend({}, paramDefaults, actionParams), forEach(actionParams, function(value, key) {
                    isFunction(value) && (value = value()), ids[key] = value && value.charAt && "@" == value.charAt(0) ? lookupDottedPath(data, value.substr(1)) : value;
                }), ids;
            }
            function defaultResponseInterceptor(response) {
                return response.resource;
            }
            function Resource(value) {
                shallowClearAndCopy(value || {}, this);
            }
            var route = new Route(url);
            return actions = extend({}, DEFAULT_ACTIONS, actions), forEach(actions, function(action, name) {
                var hasBody = /^(POST|PUT|PATCH)$/i.test(action.method);
                Resource[name] = function(a1, a2, a3, a4) {
                    var data, success, error, params = {};
                    switch (arguments.length) {
                      case 4:
                        error = a4, success = a3;

                      case 3:
                      case 2:
                        if (!isFunction(a2)) {
                            params = a1, data = a2, success = a3;
                            break;
                        }
                        if (isFunction(a1)) {
                            success = a1, error = a2;
                            break;
                        }
                        success = a2, error = a3;

                      case 1:
                        isFunction(a1) ? success = a1 : hasBody ? data = a1 : params = a1;
                        break;

                      case 0:
                        break;

                      default:
                        throw $resourceMinErr("badargs", "Expected up to 4 arguments [params, data, success, error], got {0} arguments", arguments.length);
                    }
                    var isInstanceCall = this instanceof Resource, value = isInstanceCall ? data : action.isArray ? [] : new Resource(data), httpConfig = {}, responseInterceptor = action.interceptor && action.interceptor.response || defaultResponseInterceptor, responseErrorInterceptor = action.interceptor && action.interceptor.responseError || undefined;
                    forEach(action, function(value, key) {
                        "params" != key && "isArray" != key && "interceptor" != key && (httpConfig[key] = copy(value));
                    }), hasBody && (httpConfig.data = data), route.setUrlParams(httpConfig, extend({}, extractParams(data, action.params || {}), params), action.url);
                    var promise = $http(httpConfig).then(function(response) {
                        var data = response.data, promise = value.$promise;
                        if (data) {
                            if (angular.isArray(data) !== !!action.isArray) throw $resourceMinErr("badcfg", "Error in resource configuration. Expected response to contain an {0} but got an {1}", action.isArray ? "array" : "object", angular.isArray(data) ? "array" : "object");
                            action.isArray ? (value.length = 0, forEach(data, function(item) {
                                "object" == typeof item ? value.push(new Resource(item)) : value.push(item);
                            })) : (shallowClearAndCopy(data, value), value.$promise = promise);
                        }
                        return value.$resolved = !0, response.resource = value, response;
                    }, function(response) {
                        return value.$resolved = !0, (error || noop)(response), $q.reject(response);
                    });
                    return promise = promise.then(function(response) {
                        var value = responseInterceptor(response);
                        return (success || noop)(value, response.headers), value;
                    }, responseErrorInterceptor), isInstanceCall ? promise : (value.$promise = promise, 
                    value.$resolved = !1, value);
                }, Resource.prototype["$" + name] = function(params, success, error) {
                    isFunction(params) && (error = success, success = params, params = {});
                    var result = Resource[name].call(this, params, this, success, error);
                    return result.$promise || result;
                };
            }), Resource.bind = function(additionalParamDefaults) {
                return resourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
            }, Resource;
        }
        var DEFAULT_ACTIONS = {
            get: {
                method: "GET"
            },
            save: {
                method: "POST"
            },
            query: {
                method: "GET",
                isArray: !0
            },
            remove: {
                method: "DELETE"
            },
            delete: {
                method: "DELETE"
            }
        }, noop = angular.noop, forEach = angular.forEach, extend = angular.extend, copy = angular.copy, isFunction = angular.isFunction;
        return Route.prototype = {
            setUrlParams: function(config, params, actionUrl) {
                var val, encodedVal, self = this, url = actionUrl || self.template, urlParams = self.urlParams = {};
                forEach(url.split(/\W/), function(param) {
                    if ("hasOwnProperty" === param) throw $resourceMinErr("badname", "hasOwnProperty is not a valid parameter name.");
                    !new RegExp("^\\d+$").test(param) && param && new RegExp("(^|[^\\\\]):" + param + "(\\W|$)").test(url) && (urlParams[param] = !0);
                }), url = url.replace(/\\:/g, ":"), params = params || {}, forEach(self.urlParams, function(_, urlParam) {
                    val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam], 
                    angular.isDefined(val) && null !== val ? (encodedVal = encodeUriSegment(val), url = url.replace(new RegExp(":" + urlParam + "(\\W|$)", "g"), function(match, p1) {
                        return encodedVal + p1;
                    })) : url = url.replace(new RegExp("(/?):" + urlParam + "(\\W|$)", "g"), function(match, leadingSlashes, tail) {
                        return "/" == tail.charAt(0) ? tail : leadingSlashes + tail;
                    });
                }), url = url.replace(/\/+$/, "") || "/", url = url.replace(/\/\.(?=\w+($|\?))/, "."), 
                config.url = url.replace(/\/\\\./, "/."), forEach(params, function(value, key) {
                    self.urlParams[key] || (config.params = config.params || {}, config.params[key] = value);
                });
            }
        }, resourceFactory;
    } ]);
}(window, window.angular), angular.module("ui.bootstrap", [ "ui.bootstrap.tpls", "ui.bootstrap.transition", "ui.bootstrap.collapse", "ui.bootstrap.accordion", "ui.bootstrap.alert", "ui.bootstrap.bindHtml", "ui.bootstrap.buttons", "ui.bootstrap.carousel", "ui.bootstrap.position", "ui.bootstrap.datepicker", "ui.bootstrap.dropdownToggle", "ui.bootstrap.modal", "ui.bootstrap.pagination", "ui.bootstrap.tooltip", "ui.bootstrap.popover", "ui.bootstrap.progressbar", "ui.bootstrap.rating", "ui.bootstrap.tabs", "ui.bootstrap.timepicker", "ui.bootstrap.typeahead" ]), 
angular.module("ui.bootstrap.tpls", [ "template/accordion/accordion-group.html", "template/accordion/accordion.html", "template/alert/alert.html", "template/carousel/carousel.html", "template/carousel/slide.html", "template/datepicker/datepicker.html", "template/datepicker/popup.html", "template/modal/backdrop.html", "template/modal/window.html", "template/pagination/pager.html", "template/pagination/pagination.html", "template/tooltip/tooltip-html-unsafe-popup.html", "template/tooltip/tooltip-popup.html", "template/popover/popover.html", "template/progressbar/bar.html", "template/progressbar/progress.html", "template/progressbar/progressbar.html", "template/rating/rating.html", "template/tabs/tab.html", "template/tabs/tabset.html", "template/timepicker/timepicker.html", "template/typeahead/typeahead-match.html", "template/typeahead/typeahead-popup.html" ]), 
angular.module("ui.bootstrap.transition", []).factory("$transition", [ "$q", "$timeout", "$rootScope", function($q, $timeout, $rootScope) {
    function findEndEventName(endEventNames) {
        for (var name in endEventNames) if (void 0 !== transElement.style[name]) return endEventNames[name];
    }
    var $transition = function(element, trigger, options) {
        options = options || {};
        var deferred = $q.defer(), endEventName = $transition[options.animation ? "animationEndEventName" : "transitionEndEventName"], transitionEndHandler = function(event) {
            $rootScope.$apply(function() {
                element.unbind(endEventName, transitionEndHandler), deferred.resolve(element);
            });
        };
        return endEventName && element.bind(endEventName, transitionEndHandler), $timeout(function() {
            angular.isString(trigger) ? element.addClass(trigger) : angular.isFunction(trigger) ? trigger(element) : angular.isObject(trigger) && element.css(trigger), 
            endEventName || deferred.resolve(element);
        }), deferred.promise.cancel = function() {
            endEventName && element.unbind(endEventName, transitionEndHandler), deferred.reject("Transition cancelled");
        }, deferred.promise;
    }, transElement = document.createElement("trans"), transitionEndEventNames = {
        WebkitTransition: "webkitTransitionEnd",
        MozTransition: "transitionend",
        OTransition: "oTransitionEnd",
        transition: "transitionend"
    }, animationEndEventNames = {
        WebkitTransition: "webkitAnimationEnd",
        MozTransition: "animationend",
        OTransition: "oAnimationEnd",
        transition: "animationend"
    };
    return $transition.transitionEndEventName = findEndEventName(transitionEndEventNames), 
    $transition.animationEndEventName = findEndEventName(animationEndEventNames), $transition;
} ]), angular.module("ui.bootstrap.collapse", [ "ui.bootstrap.transition" ]).directive("collapse", [ "$transition", function($transition, $timeout) {
    return {
        link: function(scope, element, attrs) {
            function doTransition(change) {
                function newTransitionDone() {
                    currentTransition === newTransition && (currentTransition = void 0);
                }
                var newTransition = $transition(element, change);
                return currentTransition && currentTransition.cancel(), currentTransition = newTransition, 
                newTransition.then(newTransitionDone, newTransitionDone), newTransition;
            }
            function expand() {
                initialAnimSkip ? (initialAnimSkip = !1, expandDone()) : (element.removeClass("collapse").addClass("collapsing"), 
                doTransition({
                    height: element[0].scrollHeight + "px"
                }).then(expandDone));
            }
            function expandDone() {
                element.removeClass("collapsing"), element.addClass("collapse in"), element.css({
                    height: "auto"
                });
            }
            function collapse() {
                if (initialAnimSkip) initialAnimSkip = !1, collapseDone(), element.css({
                    height: 0
                }); else {
                    element.css({
                        height: element[0].scrollHeight + "px"
                    });
                    element[0].offsetWidth;
                    element.removeClass("collapse in").addClass("collapsing"), doTransition({
                        height: 0
                    }).then(collapseDone);
                }
            }
            function collapseDone() {
                element.removeClass("collapsing"), element.addClass("collapse");
            }
            var currentTransition, initialAnimSkip = !0;
            scope.$watch(attrs.collapse, function(shouldCollapse) {
                shouldCollapse ? collapse() : expand();
            });
        }
    };
} ]), angular.module("ui.bootstrap.accordion", [ "ui.bootstrap.collapse" ]).constant("accordionConfig", {
    closeOthers: !0
}).controller("AccordionController", [ "$scope", "$attrs", "accordionConfig", function($scope, $attrs, accordionConfig) {
    this.groups = [], this.closeOthers = function(openGroup) {
        var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
        closeOthers && angular.forEach(this.groups, function(group) {
            group !== openGroup && (group.isOpen = !1);
        });
    }, this.addGroup = function(groupScope) {
        var that = this;
        this.groups.push(groupScope), groupScope.$on("$destroy", function(event) {
            that.removeGroup(groupScope);
        });
    }, this.removeGroup = function(group) {
        var index = this.groups.indexOf(group);
        index !== -1 && this.groups.splice(this.groups.indexOf(group), 1);
    };
} ]).directive("accordion", function() {
    return {
        restrict: "EA",
        controller: "AccordionController",
        transclude: !0,
        replace: !1,
        templateUrl: "template/accordion/accordion.html"
    };
}).directive("accordionGroup", [ "$parse", function($parse) {
    return {
        require: "^accordion",
        restrict: "EA",
        transclude: !0,
        replace: !0,
        templateUrl: "template/accordion/accordion-group.html",
        scope: {
            heading: "@"
        },
        controller: function() {
            this.setHeading = function(element) {
                this.heading = element;
            };
        },
        link: function(scope, element, attrs, accordionCtrl) {
            var getIsOpen, setIsOpen;
            accordionCtrl.addGroup(scope), scope.isOpen = !1, attrs.isOpen && (getIsOpen = $parse(attrs.isOpen), 
            setIsOpen = getIsOpen.assign, scope.$parent.$watch(getIsOpen, function(value) {
                scope.isOpen = !!value;
            })), scope.$watch("isOpen", function(value) {
                value && accordionCtrl.closeOthers(scope), setIsOpen && setIsOpen(scope.$parent, value);
            });
        }
    };
} ]).directive("accordionHeading", function() {
    return {
        restrict: "EA",
        transclude: !0,
        template: "",
        replace: !0,
        require: "^accordionGroup",
        compile: function(element, attr, transclude) {
            return function(scope, element, attr, accordionGroupCtrl) {
                accordionGroupCtrl.setHeading(transclude(scope, function() {}));
            };
        }
    };
}).directive("accordionTransclude", function() {
    return {
        require: "^accordionGroup",
        link: function(scope, element, attr, controller) {
            scope.$watch(function() {
                return controller[attr.accordionTransclude];
            }, function(heading) {
                heading && (element.html(""), element.append(heading));
            });
        }
    };
}), angular.module("ui.bootstrap.alert", []).controller("AlertController", [ "$scope", "$attrs", function($scope, $attrs) {
    $scope.closeable = "close" in $attrs;
} ]).directive("alert", function() {
    return {
        restrict: "EA",
        controller: "AlertController",
        templateUrl: "template/alert/alert.html",
        transclude: !0,
        replace: !0,
        scope: {
            type: "=",
            close: "&"
        }
    };
}), angular.module("ui.bootstrap.bindHtml", []).directive("bindHtmlUnsafe", function() {
    return function(scope, element, attr) {
        element.addClass("ng-binding").data("$binding", attr.bindHtmlUnsafe), scope.$watch(attr.bindHtmlUnsafe, function(value) {
            element.html(value || "");
        });
    };
}), angular.module("ui.bootstrap.buttons", []).constant("buttonConfig", {
    activeClass: "active",
    toggleEvent: "click"
}).controller("ButtonsController", [ "buttonConfig", function(buttonConfig) {
    this.activeClass = buttonConfig.activeClass || "active", this.toggleEvent = buttonConfig.toggleEvent || "click";
} ]).directive("btnRadio", function() {
    return {
        require: [ "btnRadio", "ngModel" ],
        controller: "ButtonsController",
        link: function(scope, element, attrs, ctrls) {
            var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];
            ngModelCtrl.$render = function() {
                element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)));
            }, element.bind(buttonsCtrl.toggleEvent, function() {
                element.hasClass(buttonsCtrl.activeClass) || scope.$apply(function() {
                    ngModelCtrl.$setViewValue(scope.$eval(attrs.btnRadio)), ngModelCtrl.$render();
                });
            });
        }
    };
}).directive("btnCheckbox", function() {
    return {
        require: [ "btnCheckbox", "ngModel" ],
        controller: "ButtonsController",
        link: function(scope, element, attrs, ctrls) {
            function getTrueValue() {
                return getCheckboxValue(attrs.btnCheckboxTrue, !0);
            }
            function getFalseValue() {
                return getCheckboxValue(attrs.btnCheckboxFalse, !1);
            }
            function getCheckboxValue(attributeValue, defaultValue) {
                var val = scope.$eval(attributeValue);
                return angular.isDefined(val) ? val : defaultValue;
            }
            var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];
            ngModelCtrl.$render = function() {
                element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
            }, element.bind(buttonsCtrl.toggleEvent, function() {
                scope.$apply(function() {
                    ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue()), 
                    ngModelCtrl.$render();
                });
            });
        }
    };
}), angular.module("ui.bootstrap.carousel", [ "ui.bootstrap.transition" ]).controller("CarouselController", [ "$scope", "$timeout", "$transition", "$q", function($scope, $timeout, $transition, $q) {
    function restartTimer() {
        resetTimer();
        var interval = +$scope.interval;
        !isNaN(interval) && interval >= 0 && (currentTimeout = $timeout(timerFn, interval));
    }
    function resetTimer() {
        currentTimeout && ($timeout.cancel(currentTimeout), currentTimeout = null);
    }
    function timerFn() {
        isPlaying ? ($scope.next(), restartTimer()) : $scope.pause();
    }
    var currentTimeout, isPlaying, self = this, slides = self.slides = [], currentIndex = -1;
    self.currentSlide = null;
    var destroyed = !1;
    self.select = function(nextSlide, direction) {
        function goNext() {
            if (!destroyed) {
                if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
                    nextSlide.$element.addClass(direction);
                    nextSlide.$element[0].offsetWidth;
                    angular.forEach(slides, function(slide) {
                        angular.extend(slide, {
                            direction: "",
                            entering: !1,
                            leaving: !1,
                            active: !1
                        });
                    }), angular.extend(nextSlide, {
                        direction: direction,
                        active: !0,
                        entering: !0
                    }), angular.extend(self.currentSlide || {}, {
                        direction: direction,
                        leaving: !0
                    }), $scope.$currentTransition = $transition(nextSlide.$element, {}), function(next, current) {
                        $scope.$currentTransition.then(function() {
                            transitionDone(next, current);
                        }, function() {
                            transitionDone(next, current);
                        });
                    }(nextSlide, self.currentSlide);
                } else transitionDone(nextSlide, self.currentSlide);
                self.currentSlide = nextSlide, currentIndex = nextIndex, restartTimer();
            }
        }
        function transitionDone(next, current) {
            angular.extend(next, {
                direction: "",
                active: !0,
                leaving: !1,
                entering: !1
            }), angular.extend(current || {}, {
                direction: "",
                active: !1,
                leaving: !1,
                entering: !1
            }), $scope.$currentTransition = null;
        }
        var nextIndex = slides.indexOf(nextSlide);
        void 0 === direction && (direction = nextIndex > currentIndex ? "next" : "prev"), 
        nextSlide && nextSlide !== self.currentSlide && ($scope.$currentTransition ? ($scope.$currentTransition.cancel(), 
        $timeout(goNext)) : goNext());
    }, $scope.$on("$destroy", function() {
        destroyed = !0;
    }), self.indexOfSlide = function(slide) {
        return slides.indexOf(slide);
    }, $scope.next = function() {
        var newIndex = (currentIndex + 1) % slides.length;
        if (!$scope.$currentTransition) return self.select(slides[newIndex], "next");
    }, $scope.prev = function() {
        var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;
        if (!$scope.$currentTransition) return self.select(slides[newIndex], "prev");
    }, $scope.select = function(slide) {
        self.select(slide);
    }, $scope.isActive = function(slide) {
        return self.currentSlide === slide;
    }, $scope.slides = function() {
        return slides;
    }, $scope.$watch("interval", restartTimer), $scope.$on("$destroy", resetTimer), 
    $scope.play = function() {
        isPlaying || (isPlaying = !0, restartTimer());
    }, $scope.pause = function() {
        $scope.noPause || (isPlaying = !1, resetTimer());
    }, self.addSlide = function(slide, element) {
        slide.$element = element, slides.push(slide), 1 === slides.length || slide.active ? (self.select(slides[slides.length - 1]), 
        1 == slides.length && $scope.play()) : slide.active = !1;
    }, self.removeSlide = function(slide) {
        var index = slides.indexOf(slide);
        slides.splice(index, 1), slides.length > 0 && slide.active ? index >= slides.length ? self.select(slides[index - 1]) : self.select(slides[index]) : currentIndex > index && currentIndex--;
    };
} ]).directive("carousel", [ function() {
    return {
        restrict: "EA",
        transclude: !0,
        replace: !0,
        controller: "CarouselController",
        require: "carousel",
        templateUrl: "template/carousel/carousel.html",
        scope: {
            interval: "=",
            noTransition: "=",
            noPause: "="
        }
    };
} ]).directive("slide", [ "$parse", function($parse) {
    return {
        require: "^carousel",
        restrict: "EA",
        transclude: !0,
        replace: !0,
        templateUrl: "template/carousel/slide.html",
        scope: {},
        link: function(scope, element, attrs, carouselCtrl) {
            if (attrs.active) {
                var getActive = $parse(attrs.active), setActive = getActive.assign, lastValue = scope.active = getActive(scope.$parent);
                scope.$watch(function() {
                    var parentActive = getActive(scope.$parent);
                    return parentActive !== scope.active && (parentActive !== lastValue ? lastValue = scope.active = parentActive : setActive(scope.$parent, parentActive = lastValue = scope.active)), 
                    parentActive;
                });
            }
            carouselCtrl.addSlide(scope, element), scope.$on("$destroy", function() {
                carouselCtrl.removeSlide(scope);
            }), scope.$watch("active", function(active) {
                active && carouselCtrl.select(scope);
            });
        }
    };
} ]), angular.module("ui.bootstrap.position", []).factory("$position", [ "$document", "$window", function($document, $window) {
    function getStyle(el, cssprop) {
        return el.currentStyle ? el.currentStyle[cssprop] : $window.getComputedStyle ? $window.getComputedStyle(el)[cssprop] : el.style[cssprop];
    }
    function isStaticPositioned(element) {
        return "static" === (getStyle(element, "position") || "static");
    }
    var parentOffsetEl = function(element) {
        for (var docDomEl = $document[0], offsetParent = element.offsetParent || docDomEl; offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent); ) offsetParent = offsetParent.offsetParent;
        return offsetParent || docDomEl;
    };
    return {
        position: function(element) {
            var elBCR = this.offset(element), offsetParentBCR = {
                top: 0,
                left: 0
            }, offsetParentEl = parentOffsetEl(element[0]);
            offsetParentEl != $document[0] && (offsetParentBCR = this.offset(angular.element(offsetParentEl)), 
            offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop, offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft);
            var boundingClientRect = element[0].getBoundingClientRect();
            return {
                width: boundingClientRect.width || element.prop("offsetWidth"),
                height: boundingClientRect.height || element.prop("offsetHeight"),
                top: elBCR.top - offsetParentBCR.top,
                left: elBCR.left - offsetParentBCR.left
            };
        },
        offset: function(element) {
            var boundingClientRect = element[0].getBoundingClientRect();
            return {
                width: boundingClientRect.width || element.prop("offsetWidth"),
                height: boundingClientRect.height || element.prop("offsetHeight"),
                top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
                left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft)
            };
        }
    };
} ]), angular.module("ui.bootstrap.datepicker", [ "ui.bootstrap.position" ]).constant("datepickerConfig", {
    dayFormat: "dd",
    monthFormat: "MMMM",
    yearFormat: "yyyy",
    dayHeaderFormat: "EEE",
    dayTitleFormat: "MMMM yyyy",
    monthTitleFormat: "yyyy",
    showWeeks: !0,
    startingDay: 0,
    yearRange: 20,
    minDate: null,
    maxDate: null
}).controller("DatepickerController", [ "$scope", "$attrs", "dateFilter", "datepickerConfig", function($scope, $attrs, dateFilter, dtConfig) {
    function getValue(value, defaultValue) {
        return angular.isDefined(value) ? $scope.$parent.$eval(value) : defaultValue;
    }
    function getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }
    function getDates(startDate, n) {
        for (var dates = new Array(n), current = startDate, i = 0; i < n; ) dates[i++] = new Date(current), 
        current.setDate(current.getDate() + 1);
        return dates;
    }
    function makeDate(date, format, isSelected, isSecondary) {
        return {
            date: date,
            label: dateFilter(date, format),
            selected: !!isSelected,
            secondary: !!isSecondary
        };
    }
    var format = {
        day: getValue($attrs.dayFormat, dtConfig.dayFormat),
        month: getValue($attrs.monthFormat, dtConfig.monthFormat),
        year: getValue($attrs.yearFormat, dtConfig.yearFormat),
        dayHeader: getValue($attrs.dayHeaderFormat, dtConfig.dayHeaderFormat),
        dayTitle: getValue($attrs.dayTitleFormat, dtConfig.dayTitleFormat),
        monthTitle: getValue($attrs.monthTitleFormat, dtConfig.monthTitleFormat)
    }, startingDay = getValue($attrs.startingDay, dtConfig.startingDay), yearRange = getValue($attrs.yearRange, dtConfig.yearRange);
    this.minDate = dtConfig.minDate ? new Date(dtConfig.minDate) : null, this.maxDate = dtConfig.maxDate ? new Date(dtConfig.maxDate) : null, 
    this.modes = [ {
        name: "day",
        getVisibleDates: function(date, selected) {
            var year = date.getFullYear(), month = date.getMonth(), firstDayOfMonth = new Date(year, month, 1), difference = startingDay - firstDayOfMonth.getDay(), numDisplayedFromPreviousMonth = difference > 0 ? 7 - difference : -difference, firstDate = new Date(firstDayOfMonth), numDates = 0;
            numDisplayedFromPreviousMonth > 0 && (firstDate.setDate(-numDisplayedFromPreviousMonth + 1), 
            numDates += numDisplayedFromPreviousMonth), numDates += getDaysInMonth(year, month + 1), 
            numDates += (7 - numDates % 7) % 7;
            for (var days = getDates(firstDate, numDates), labels = new Array(7), i = 0; i < numDates; i++) {
                var dt = new Date(days[i]);
                days[i] = makeDate(dt, format.day, selected && selected.getDate() === dt.getDate() && selected.getMonth() === dt.getMonth() && selected.getFullYear() === dt.getFullYear(), dt.getMonth() !== month);
            }
            for (var j = 0; j < 7; j++) labels[j] = dateFilter(days[j].date, format.dayHeader);
            return {
                objects: days,
                title: dateFilter(date, format.dayTitle),
                labels: labels
            };
        },
        compare: function(date1, date2) {
            return new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
        },
        split: 7,
        step: {
            months: 1
        }
    }, {
        name: "month",
        getVisibleDates: function(date, selected) {
            for (var months = new Array(12), year = date.getFullYear(), i = 0; i < 12; i++) {
                var dt = new Date(year, i, 1);
                months[i] = makeDate(dt, format.month, selected && selected.getMonth() === i && selected.getFullYear() === year);
            }
            return {
                objects: months,
                title: dateFilter(date, format.monthTitle)
            };
        },
        compare: function(date1, date2) {
            return new Date(date1.getFullYear(), date1.getMonth()) - new Date(date2.getFullYear(), date2.getMonth());
        },
        split: 3,
        step: {
            years: 1
        }
    }, {
        name: "year",
        getVisibleDates: function(date, selected) {
            for (var years = new Array(yearRange), year = date.getFullYear(), startYear = parseInt((year - 1) / yearRange, 10) * yearRange + 1, i = 0; i < yearRange; i++) {
                var dt = new Date(startYear + i, 0, 1);
                years[i] = makeDate(dt, format.year, selected && selected.getFullYear() === dt.getFullYear());
            }
            return {
                objects: years,
                title: [ years[0].label, years[yearRange - 1].label ].join(" - ")
            };
        },
        compare: function(date1, date2) {
            return date1.getFullYear() - date2.getFullYear();
        },
        split: 5,
        step: {
            years: yearRange
        }
    } ], this.isDisabled = function(date, mode) {
        var currentMode = this.modes[mode || 0];
        return this.minDate && currentMode.compare(date, this.minDate) < 0 || this.maxDate && currentMode.compare(date, this.maxDate) > 0 || $scope.dateDisabled && $scope.dateDisabled({
            date: date,
            mode: currentMode.name
        });
    };
} ]).directive("datepicker", [ "dateFilter", "$parse", "datepickerConfig", "$log", function(dateFilter, $parse, datepickerConfig, $log) {
    return {
        restrict: "EA",
        replace: !0,
        templateUrl: "template/datepicker/datepicker.html",
        scope: {
            dateDisabled: "&"
        },
        require: [ "datepicker", "?^ngModel" ],
        controller: "DatepickerController",
        link: function(scope, element, attrs, ctrls) {
            function updateShowWeekNumbers() {
                scope.showWeekNumbers = 0 === mode && showWeeks;
            }
            function split(arr, size) {
                for (var arrays = []; arr.length > 0; ) arrays.push(arr.splice(0, size));
                return arrays;
            }
            function refill(updateSelected) {
                var date = null, valid = !0;
                ngModel.$modelValue && (date = new Date(ngModel.$modelValue), isNaN(date) ? (valid = !1, 
                $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.')) : updateSelected && (selected = date)), 
                ngModel.$setValidity("date", valid);
                var currentMode = datepickerCtrl.modes[mode], data = currentMode.getVisibleDates(selected, date);
                angular.forEach(data.objects, function(obj) {
                    obj.disabled = datepickerCtrl.isDisabled(obj.date, mode);
                }), ngModel.$setValidity("date-disabled", !date || !datepickerCtrl.isDisabled(date)), 
                scope.rows = split(data.objects, currentMode.split), scope.labels = data.labels || [], 
                scope.title = data.title;
            }
            function setMode(value) {
                mode = value, updateShowWeekNumbers(), refill();
            }
            function getISO8601WeekNumber(date) {
                var checkDate = new Date(date);
                checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
                var time = checkDate.getTime();
                return checkDate.setMonth(0), checkDate.setDate(1), Math.floor(Math.round((time - checkDate) / 864e5) / 7) + 1;
            }
            var datepickerCtrl = ctrls[0], ngModel = ctrls[1];
            if (ngModel) {
                var mode = 0, selected = new Date(), showWeeks = datepickerConfig.showWeeks;
                attrs.showWeeks ? scope.$parent.$watch($parse(attrs.showWeeks), function(value) {
                    showWeeks = !!value, updateShowWeekNumbers();
                }) : updateShowWeekNumbers(), attrs.min && scope.$parent.$watch($parse(attrs.min), function(value) {
                    datepickerCtrl.minDate = value ? new Date(value) : null, refill();
                }), attrs.max && scope.$parent.$watch($parse(attrs.max), function(value) {
                    datepickerCtrl.maxDate = value ? new Date(value) : null, refill();
                }), ngModel.$render = function() {
                    refill(!0);
                }, scope.select = function(date) {
                    if (0 === mode) {
                        var dt = ngModel.$modelValue ? new Date(ngModel.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
                        dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate()), ngModel.$setViewValue(dt), 
                        refill(!0);
                    } else selected = date, setMode(mode - 1);
                }, scope.move = function(direction) {
                    var step = datepickerCtrl.modes[mode].step;
                    selected.setMonth(selected.getMonth() + direction * (step.months || 0)), selected.setFullYear(selected.getFullYear() + direction * (step.years || 0)), 
                    refill();
                }, scope.toggleMode = function() {
                    setMode((mode + 1) % datepickerCtrl.modes.length);
                }, scope.getWeekNumber = function(row) {
                    return 0 === mode && scope.showWeekNumbers && 7 === row.length ? getISO8601WeekNumber(row[0].date) : null;
                };
            }
        }
    };
} ]).constant("datepickerPopupConfig", {
    dateFormat: "yyyy-MM-dd",
    currentText: "Today",
    toggleWeeksText: "Weeks",
    clearText: "Clear",
    closeText: "Done",
    closeOnDateSelection: !0,
    appendToBody: !1,
    showButtonBar: !0
}).directive("datepickerPopup", [ "$compile", "$parse", "$document", "$position", "dateFilter", "datepickerPopupConfig", "datepickerConfig", function($compile, $parse, $document, $position, dateFilter, datepickerPopupConfig, datepickerConfig) {
    return {
        restrict: "EA",
        require: "ngModel",
        link: function(originalScope, element, attrs, ngModel) {
            function setOpen(value) {
                setIsOpen ? setIsOpen(originalScope, !!value) : scope.isOpen = !!value;
            }
            function parseDate(viewValue) {
                if (viewValue) {
                    if (angular.isDate(viewValue)) return ngModel.$setValidity("date", !0), viewValue;
                    if (angular.isString(viewValue)) {
                        var date = new Date(viewValue);
                        return isNaN(date) ? void ngModel.$setValidity("date", !1) : (ngModel.$setValidity("date", !0), 
                        date);
                    }
                    return void ngModel.$setValidity("date", !1);
                }
                return ngModel.$setValidity("date", !0), null;
            }
            function addWatchableAttribute(attribute, scopeProperty, datepickerAttribute) {
                attribute && (originalScope.$watch($parse(attribute), function(value) {
                    scope[scopeProperty] = value;
                }), datepickerEl.attr(datepickerAttribute || scopeProperty, scopeProperty));
            }
            function updatePosition() {
                scope.position = appendToBody ? $position.offset(element) : $position.position(element), 
                scope.position.top = scope.position.top + element.prop("offsetHeight");
            }
            var dateFormat, scope = originalScope.$new(), closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? originalScope.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection, appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? originalScope.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;
            attrs.$observe("datepickerPopup", function(value) {
                dateFormat = value || datepickerPopupConfig.dateFormat, ngModel.$render();
            }), scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? originalScope.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar, 
            originalScope.$on("$destroy", function() {
                $popup.remove(), scope.$destroy();
            }), attrs.$observe("currentText", function(text) {
                scope.currentText = angular.isDefined(text) ? text : datepickerPopupConfig.currentText;
            }), attrs.$observe("toggleWeeksText", function(text) {
                scope.toggleWeeksText = angular.isDefined(text) ? text : datepickerPopupConfig.toggleWeeksText;
            }), attrs.$observe("clearText", function(text) {
                scope.clearText = angular.isDefined(text) ? text : datepickerPopupConfig.clearText;
            }), attrs.$observe("closeText", function(text) {
                scope.closeText = angular.isDefined(text) ? text : datepickerPopupConfig.closeText;
            });
            var getIsOpen, setIsOpen;
            attrs.isOpen && (getIsOpen = $parse(attrs.isOpen), setIsOpen = getIsOpen.assign, 
            originalScope.$watch(getIsOpen, function(value) {
                scope.isOpen = !!value;
            })), scope.isOpen = !!getIsOpen && getIsOpen(originalScope);
            var documentClickBind = function(event) {
                scope.isOpen && event.target !== element[0] && scope.$apply(function() {
                    setOpen(!1);
                });
            }, elementFocusBind = function() {
                scope.$apply(function() {
                    setOpen(!0);
                });
            }, popupEl = angular.element("<div datepicker-popup-wrap><div datepicker></div></div>");
            popupEl.attr({
                "ng-model": "date",
                "ng-change": "dateSelection()"
            });
            var datepickerEl = angular.element(popupEl.children()[0]), datepickerOptions = {};
            attrs.datepickerOptions && (datepickerOptions = originalScope.$eval(attrs.datepickerOptions), 
            datepickerEl.attr(angular.extend({}, datepickerOptions))), ngModel.$parsers.unshift(parseDate), 
            scope.dateSelection = function(dt) {
                angular.isDefined(dt) && (scope.date = dt), ngModel.$setViewValue(scope.date), ngModel.$render(), 
                closeOnDateSelection && setOpen(!1);
            }, element.bind("input change keyup", function() {
                scope.$apply(function() {
                    scope.date = ngModel.$modelValue;
                });
            }), ngModel.$render = function() {
                var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, dateFormat) : "";
                element.val(date), scope.date = ngModel.$modelValue;
            }, addWatchableAttribute(attrs.min, "min"), addWatchableAttribute(attrs.max, "max"), 
            attrs.showWeeks ? addWatchableAttribute(attrs.showWeeks, "showWeeks", "show-weeks") : (scope.showWeeks = "show-weeks" in datepickerOptions ? datepickerOptions["show-weeks"] : datepickerConfig.showWeeks, 
            datepickerEl.attr("show-weeks", "showWeeks")), attrs.dateDisabled && datepickerEl.attr("date-disabled", attrs.dateDisabled);
            var documentBindingInitialized = !1, elementFocusInitialized = !1;
            scope.$watch("isOpen", function(value) {
                value ? (updatePosition(), $document.bind("click", documentClickBind), elementFocusInitialized && element.unbind("focus", elementFocusBind), 
                element[0].focus(), documentBindingInitialized = !0) : (documentBindingInitialized && $document.unbind("click", documentClickBind), 
                element.bind("focus", elementFocusBind), elementFocusInitialized = !0), setIsOpen && setIsOpen(originalScope, value);
            }), scope.today = function() {
                scope.dateSelection(new Date());
            }, scope.clear = function() {
                scope.dateSelection(null);
            };
            var $popup = $compile(popupEl)(scope);
            appendToBody ? $document.find("body").append($popup) : element.after($popup);
        }
    };
} ]).directive("datepickerPopupWrap", function() {
    return {
        restrict: "EA",
        replace: !0,
        transclude: !0,
        templateUrl: "template/datepicker/popup.html",
        link: function(scope, element, attrs) {
            element.bind("click", function(event) {
                event.preventDefault(), event.stopPropagation();
            });
        }
    };
}), angular.module("ui.bootstrap.dropdownToggle", []).directive("dropdownToggle", [ "$document", "$location", function($document, $location) {
    var openElement = null, closeMenu = angular.noop;
    return {
        restrict: "CA",
        link: function(scope, element, attrs) {
            scope.$watch("$location.path", function() {
                closeMenu();
            }), element.parent().bind("click", function() {
                closeMenu();
            }), element.bind("click", function(event) {
                var elementWasOpen = element === openElement;
                event.preventDefault(), event.stopPropagation(), openElement && closeMenu(), elementWasOpen || element.hasClass("disabled") || element.prop("disabled") || (element.parent().addClass("open"), 
                openElement = element, closeMenu = function(event) {
                    event && (event.preventDefault(), event.stopPropagation()), $document.unbind("click", closeMenu), 
                    element.parent().removeClass("open"), closeMenu = angular.noop, openElement = null;
                }, $document.bind("click", closeMenu));
            });
        }
    };
} ]), angular.module("ui.bootstrap.modal", [ "ui.bootstrap.transition" ]).factory("$$stackedMap", function() {
    return {
        createNew: function() {
            var stack = [];
            return {
                add: function(key, value) {
                    stack.push({
                        key: key,
                        value: value
                    });
                },
                get: function(key) {
                    for (var i = 0; i < stack.length; i++) if (key == stack[i].key) return stack[i];
                },
                keys: function() {
                    for (var keys = [], i = 0; i < stack.length; i++) keys.push(stack[i].key);
                    return keys;
                },
                top: function() {
                    return stack[stack.length - 1];
                },
                remove: function(key) {
                    for (var idx = -1, i = 0; i < stack.length; i++) if (key == stack[i].key) {
                        idx = i;
                        break;
                    }
                    return stack.splice(idx, 1)[0];
                },
                removeTop: function() {
                    return stack.splice(stack.length - 1, 1)[0];
                },
                length: function() {
                    return stack.length;
                }
            };
        }
    };
}).directive("modalBackdrop", [ "$timeout", function($timeout) {
    return {
        restrict: "EA",
        replace: !0,
        templateUrl: "template/modal/backdrop.html",
        link: function(scope) {
            scope.animate = !1, $timeout(function() {
                scope.animate = !0;
            });
        }
    };
} ]).directive("modalWindow", [ "$modalStack", "$timeout", function($modalStack, $timeout) {
    return {
        restrict: "EA",
        scope: {
            index: "@",
            animate: "="
        },
        replace: !0,
        transclude: !0,
        templateUrl: "template/modal/window.html",
        link: function(scope, element, attrs) {
            scope.windowClass = attrs.windowClass || "", $timeout(function() {
                scope.animate = !0, element[0].focus();
            }), scope.close = function(evt) {
                var modal = $modalStack.getTop();
                modal && modal.value.backdrop && "static" != modal.value.backdrop && evt.target === evt.currentTarget && (evt.preventDefault(), 
                evt.stopPropagation(), $modalStack.dismiss(modal.key, "backdrop click"));
            };
        }
    };
} ]).factory("$modalStack", [ "$transition", "$timeout", "$document", "$compile", "$rootScope", "$$stackedMap", function($transition, $timeout, $document, $compile, $rootScope, $$stackedMap) {
    function backdropIndex() {
        for (var topBackdropIndex = -1, opened = openedWindows.keys(), i = 0; i < opened.length; i++) openedWindows.get(opened[i]).value.backdrop && (topBackdropIndex = i);
        return topBackdropIndex;
    }
    function removeModalWindow(modalInstance) {
        var body = $document.find("body").eq(0), modalWindow = openedWindows.get(modalInstance).value;
        openedWindows.remove(modalInstance), removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, checkRemoveBackdrop), 
        body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
    }
    function checkRemoveBackdrop() {
        if (backdropDomEl && backdropIndex() == -1) {
            var backdropScopeRef = backdropScope;
            removeAfterAnimate(backdropDomEl, backdropScope, 150, function() {
                backdropScopeRef.$destroy(), backdropScopeRef = null;
            }), backdropDomEl = void 0, backdropScope = void 0;
        }
    }
    function removeAfterAnimate(domEl, scope, emulateTime, done) {
        function afterAnimating() {
            afterAnimating.done || (afterAnimating.done = !0, domEl.remove(), done && done());
        }
        scope.animate = !1;
        var transitionEndEventName = $transition.transitionEndEventName;
        if (transitionEndEventName) {
            var timeout = $timeout(afterAnimating, emulateTime);
            domEl.bind(transitionEndEventName, function() {
                $timeout.cancel(timeout), afterAnimating(), scope.$apply();
            });
        } else $timeout(afterAnimating, 0);
    }
    var backdropDomEl, backdropScope, OPENED_MODAL_CLASS = "modal-open", openedWindows = $$stackedMap.createNew(), $modalStack = {};
    return $rootScope.$watch(backdropIndex, function(newBackdropIndex) {
        backdropScope && (backdropScope.index = newBackdropIndex);
    }), $document.bind("keydown", function(evt) {
        var modal;
        27 === evt.which && (modal = openedWindows.top(), modal && modal.value.keyboard && $rootScope.$apply(function() {
            $modalStack.dismiss(modal.key);
        }));
    }), $modalStack.open = function(modalInstance, modal) {
        openedWindows.add(modalInstance, {
            deferred: modal.deferred,
            modalScope: modal.scope,
            backdrop: modal.backdrop,
            keyboard: modal.keyboard
        });
        var body = $document.find("body").eq(0), currBackdropIndex = backdropIndex();
        currBackdropIndex >= 0 && !backdropDomEl && (backdropScope = $rootScope.$new(!0), 
        backdropScope.index = currBackdropIndex, backdropDomEl = $compile("<div modal-backdrop></div>")(backdropScope), 
        body.append(backdropDomEl));
        var angularDomEl = angular.element("<div modal-window></div>");
        angularDomEl.attr("window-class", modal.windowClass), angularDomEl.attr("index", openedWindows.length() - 1), 
        angularDomEl.attr("animate", "animate"), angularDomEl.html(modal.content);
        var modalDomEl = $compile(angularDomEl)(modal.scope);
        openedWindows.top().value.modalDomEl = modalDomEl, body.append(modalDomEl), body.addClass(OPENED_MODAL_CLASS);
    }, $modalStack.close = function(modalInstance, result) {
        var modalWindow = openedWindows.get(modalInstance).value;
        modalWindow && (modalWindow.deferred.resolve(result), removeModalWindow(modalInstance));
    }, $modalStack.dismiss = function(modalInstance, reason) {
        var modalWindow = openedWindows.get(modalInstance).value;
        modalWindow && (modalWindow.deferred.reject(reason), removeModalWindow(modalInstance));
    }, $modalStack.dismissAll = function(reason) {
        for (var topModal = this.getTop(); topModal; ) this.dismiss(topModal.key, reason), 
        topModal = this.getTop();
    }, $modalStack.getTop = function() {
        return openedWindows.top();
    }, $modalStack;
} ]).provider("$modal", function() {
    var $modalProvider = {
        options: {
            backdrop: !0,
            keyboard: !0
        },
        $get: [ "$injector", "$rootScope", "$q", "$http", "$templateCache", "$controller", "$modalStack", function($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {
            function getTemplatePromise(options) {
                return options.template ? $q.when(options.template) : $http.get(options.templateUrl, {
                    cache: $templateCache
                }).then(function(result) {
                    return result.data;
                });
            }
            function getResolvePromises(resolves) {
                var promisesArr = [];
                return angular.forEach(resolves, function(value, key) {
                    (angular.isFunction(value) || angular.isArray(value)) && promisesArr.push($q.when($injector.invoke(value)));
                }), promisesArr;
            }
            var $modal = {};
            return $modal.open = function(modalOptions) {
                var modalResultDeferred = $q.defer(), modalOpenedDeferred = $q.defer(), modalInstance = {
                    result: modalResultDeferred.promise,
                    opened: modalOpenedDeferred.promise,
                    close: function(result) {
                        $modalStack.close(modalInstance, result);
                    },
                    dismiss: function(reason) {
                        $modalStack.dismiss(modalInstance, reason);
                    }
                };
                if (modalOptions = angular.extend({}, $modalProvider.options, modalOptions), modalOptions.resolve = modalOptions.resolve || {}, 
                !modalOptions.template && !modalOptions.templateUrl) throw new Error("One of template or templateUrl options is required.");
                var templateAndResolvePromise = $q.all([ getTemplatePromise(modalOptions) ].concat(getResolvePromises(modalOptions.resolve)));
                return templateAndResolvePromise.then(function(tplAndVars) {
                    var modalScope = (modalOptions.scope || $rootScope).$new();
                    modalScope.$close = modalInstance.close, modalScope.$dismiss = modalInstance.dismiss;
                    var ctrlInstance, ctrlLocals = {}, resolveIter = 1;
                    modalOptions.controller && (ctrlLocals.$scope = modalScope, ctrlLocals.$modalInstance = modalInstance, 
                    angular.forEach(modalOptions.resolve, function(value, key) {
                        ctrlLocals[key] = tplAndVars[resolveIter++];
                    }), ctrlInstance = $controller(modalOptions.controller, ctrlLocals)), $modalStack.open(modalInstance, {
                        scope: modalScope,
                        deferred: modalResultDeferred,
                        content: tplAndVars[0],
                        backdrop: modalOptions.backdrop,
                        keyboard: modalOptions.keyboard,
                        windowClass: modalOptions.windowClass
                    });
                }, function(reason) {
                    modalResultDeferred.reject(reason);
                }), templateAndResolvePromise.then(function() {
                    modalOpenedDeferred.resolve(!0);
                }, function() {
                    modalOpenedDeferred.reject(!1);
                }), modalInstance;
            }, $modal;
        } ]
    };
    return $modalProvider;
}), angular.module("ui.bootstrap.pagination", []).controller("PaginationController", [ "$scope", "$attrs", "$parse", "$interpolate", function($scope, $attrs, $parse, $interpolate) {
    var self = this, setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : angular.noop;
    this.init = function(defaultItemsPerPage) {
        $attrs.itemsPerPage ? $scope.$parent.$watch($parse($attrs.itemsPerPage), function(value) {
            self.itemsPerPage = parseInt(value, 10), $scope.totalPages = self.calculateTotalPages();
        }) : this.itemsPerPage = defaultItemsPerPage;
    }, this.noPrevious = function() {
        return 1 === this.page;
    }, this.noNext = function() {
        return this.page === $scope.totalPages;
    }, this.isActive = function(page) {
        return this.page === page;
    }, this.calculateTotalPages = function() {
        var totalPages = this.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / this.itemsPerPage);
        return Math.max(totalPages || 0, 1);
    }, this.getAttributeValue = function(attribute, defaultValue, interpolate) {
        return angular.isDefined(attribute) ? interpolate ? $interpolate(attribute)($scope.$parent) : $scope.$parent.$eval(attribute) : defaultValue;
    }, this.render = function() {
        this.page = parseInt($scope.page, 10) || 1, this.page > 0 && this.page <= $scope.totalPages && ($scope.pages = this.getPages(this.page, $scope.totalPages));
    }, $scope.selectPage = function(page) {
        !self.isActive(page) && page > 0 && page <= $scope.totalPages && ($scope.page = page, 
        $scope.onSelectPage({
            page: page
        }));
    }, $scope.$watch("page", function() {
        self.render();
    }), $scope.$watch("totalItems", function() {
        $scope.totalPages = self.calculateTotalPages();
    }), $scope.$watch("totalPages", function(value) {
        setNumPages($scope.$parent, value), self.page > value ? $scope.selectPage(value) : self.render();
    });
} ]).constant("paginationConfig", {
    itemsPerPage: 10,
    boundaryLinks: !1,
    directionLinks: !0,
    firstText: "First",
    previousText: "Previous",
    nextText: "Next",
    lastText: "Last",
    rotate: !0
}).directive("pagination", [ "$parse", "paginationConfig", function($parse, config) {
    return {
        restrict: "EA",
        scope: {
            page: "=",
            totalItems: "=",
            onSelectPage: " &"
        },
        controller: "PaginationController",
        templateUrl: "template/pagination/pagination.html",
        replace: !0,
        link: function(scope, element, attrs, paginationCtrl) {
            function makePage(number, text, isActive, isDisabled) {
                return {
                    number: number,
                    text: text,
                    active: isActive,
                    disabled: isDisabled
                };
            }
            var maxSize, boundaryLinks = paginationCtrl.getAttributeValue(attrs.boundaryLinks, config.boundaryLinks), directionLinks = paginationCtrl.getAttributeValue(attrs.directionLinks, config.directionLinks), firstText = paginationCtrl.getAttributeValue(attrs.firstText, config.firstText, !0), previousText = paginationCtrl.getAttributeValue(attrs.previousText, config.previousText, !0), nextText = paginationCtrl.getAttributeValue(attrs.nextText, config.nextText, !0), lastText = paginationCtrl.getAttributeValue(attrs.lastText, config.lastText, !0), rotate = paginationCtrl.getAttributeValue(attrs.rotate, config.rotate);
            paginationCtrl.init(config.itemsPerPage), attrs.maxSize && scope.$parent.$watch($parse(attrs.maxSize), function(value) {
                maxSize = parseInt(value, 10), paginationCtrl.render();
            }), paginationCtrl.getPages = function(currentPage, totalPages) {
                var pages = [], startPage = 1, endPage = totalPages, isMaxSized = angular.isDefined(maxSize) && maxSize < totalPages;
                isMaxSized && (rotate ? (startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1), 
                endPage = startPage + maxSize - 1, endPage > totalPages && (endPage = totalPages, 
                startPage = endPage - maxSize + 1)) : (startPage = (Math.ceil(currentPage / maxSize) - 1) * maxSize + 1, 
                endPage = Math.min(startPage + maxSize - 1, totalPages)));
                for (var number = startPage; number <= endPage; number++) {
                    var page = makePage(number, number, paginationCtrl.isActive(number), !1);
                    pages.push(page);
                }
                if (isMaxSized && !rotate) {
                    if (startPage > 1) {
                        var previousPageSet = makePage(startPage - 1, "...", !1, !1);
                        pages.unshift(previousPageSet);
                    }
                    if (endPage < totalPages) {
                        var nextPageSet = makePage(endPage + 1, "...", !1, !1);
                        pages.push(nextPageSet);
                    }
                }
                if (directionLinks) {
                    var previousPage = makePage(currentPage - 1, previousText, !1, paginationCtrl.noPrevious());
                    pages.unshift(previousPage);
                    var nextPage = makePage(currentPage + 1, nextText, !1, paginationCtrl.noNext());
                    pages.push(nextPage);
                }
                if (boundaryLinks) {
                    var firstPage = makePage(1, firstText, !1, paginationCtrl.noPrevious());
                    pages.unshift(firstPage);
                    var lastPage = makePage(totalPages, lastText, !1, paginationCtrl.noNext());
                    pages.push(lastPage);
                }
                return pages;
            };
        }
    };
} ]).constant("pagerConfig", {
    itemsPerPage: 10,
    previousText: "« Previous",
    nextText: "Next »",
    align: !0
}).directive("pager", [ "pagerConfig", function(config) {
    return {
        restrict: "EA",
        scope: {
            page: "=",
            totalItems: "=",
            onSelectPage: " &"
        },
        controller: "PaginationController",
        templateUrl: "template/pagination/pager.html",
        replace: !0,
        link: function(scope, element, attrs, paginationCtrl) {
            function makePage(number, text, isDisabled, isPrevious, isNext) {
                return {
                    number: number,
                    text: text,
                    disabled: isDisabled,
                    previous: align && isPrevious,
                    next: align && isNext
                };
            }
            var previousText = paginationCtrl.getAttributeValue(attrs.previousText, config.previousText, !0), nextText = paginationCtrl.getAttributeValue(attrs.nextText, config.nextText, !0), align = paginationCtrl.getAttributeValue(attrs.align, config.align);
            paginationCtrl.init(config.itemsPerPage), paginationCtrl.getPages = function(currentPage) {
                return [ makePage(currentPage - 1, previousText, paginationCtrl.noPrevious(), !0, !1), makePage(currentPage + 1, nextText, paginationCtrl.noNext(), !1, !0) ];
            };
        }
    };
} ]), angular.module("ui.bootstrap.tooltip", [ "ui.bootstrap.position", "ui.bootstrap.bindHtml" ]).provider("$tooltip", function() {
    function snake_case(name) {
        var regexp = /[A-Z]/g, separator = "-";
        return name.replace(regexp, function(letter, pos) {
            return (pos ? separator : "") + letter.toLowerCase();
        });
    }
    var defaultOptions = {
        placement: "top",
        animation: !0,
        popupDelay: 0
    }, triggerMap = {
        mouseenter: "mouseleave",
        click: "click",
        focus: "blur"
    }, globalOptions = {};
    this.options = function(value) {
        angular.extend(globalOptions, value);
    }, this.setTriggers = function(triggers) {
        angular.extend(triggerMap, triggers);
    }, this.$get = [ "$window", "$compile", "$timeout", "$parse", "$document", "$position", "$interpolate", function($window, $compile, $timeout, $parse, $document, $position, $interpolate) {
        return function(type, prefix, defaultTriggerShow) {
            function getTriggers(trigger) {
                var show = trigger || options.trigger || defaultTriggerShow, hide = triggerMap[show] || show;
                return {
                    show: show,
                    hide: hide
                };
            }
            var options = angular.extend({}, defaultOptions, globalOptions), directiveName = snake_case(type), startSym = $interpolate.startSymbol(), endSym = $interpolate.endSymbol(), template = "<div " + directiveName + '-popup title="' + startSym + "tt_title" + endSym + '" content="' + startSym + "tt_content" + endSym + '" placement="' + startSym + "tt_placement" + endSym + '" animation="tt_animation" is-open="tt_isOpen"></div>';
            return {
                restrict: "EA",
                scope: !0,
                compile: function(tElem, tAttrs) {
                    var tooltipLinker = $compile(template);
                    return function(scope, element, attrs) {
                        function toggleTooltipBind() {
                            scope.tt_isOpen ? hideTooltipBind() : showTooltipBind();
                        }
                        function showTooltipBind() {
                            hasEnableExp && !scope.$eval(attrs[prefix + "Enable"]) || (scope.tt_popupDelay ? (popupTimeout = $timeout(show, scope.tt_popupDelay, !1), 
                            popupTimeout.then(function(reposition) {
                                reposition();
                            })) : show()());
                        }
                        function hideTooltipBind() {
                            scope.$apply(function() {
                                hide();
                            });
                        }
                        function show() {
                            return scope.tt_content ? (createTooltip(), transitionTimeout && $timeout.cancel(transitionTimeout), 
                            tooltip.css({
                                top: 0,
                                left: 0,
                                display: "block"
                            }), appendToBody ? $document.find("body").append(tooltip) : element.after(tooltip), 
                            positionTooltip(), scope.tt_isOpen = !0, scope.$digest(), positionTooltip) : angular.noop;
                        }
                        function hide() {
                            scope.tt_isOpen = !1, $timeout.cancel(popupTimeout), scope.tt_animation ? transitionTimeout = $timeout(removeTooltip, 500) : removeTooltip();
                        }
                        function createTooltip() {
                            tooltip && removeTooltip(), tooltip = tooltipLinker(scope, function() {}), scope.$digest();
                        }
                        function removeTooltip() {
                            tooltip && (tooltip.remove(), tooltip = null);
                        }
                        var tooltip, transitionTimeout, popupTimeout, appendToBody = !!angular.isDefined(options.appendToBody) && options.appendToBody, triggers = getTriggers(void 0), hasRegisteredTriggers = !1, hasEnableExp = angular.isDefined(attrs[prefix + "Enable"]), positionTooltip = function() {
                            var position, ttWidth, ttHeight, ttPosition;
                            switch (position = appendToBody ? $position.offset(element) : $position.position(element), 
                            ttWidth = tooltip.prop("offsetWidth"), ttHeight = tooltip.prop("offsetHeight"), 
                            scope.tt_placement) {
                              case "right":
                                ttPosition = {
                                    top: position.top + position.height / 2 - ttHeight / 2,
                                    left: position.left + position.width
                                };
                                break;

                              case "bottom":
                                ttPosition = {
                                    top: position.top + position.height,
                                    left: position.left + position.width / 2 - ttWidth / 2
                                };
                                break;

                              case "left":
                                ttPosition = {
                                    top: position.top + position.height / 2 - ttHeight / 2,
                                    left: position.left - ttWidth
                                };
                                break;

                              default:
                                ttPosition = {
                                    top: position.top - ttHeight,
                                    left: position.left + position.width / 2 - ttWidth / 2
                                };
                            }
                            ttPosition.top += "px", ttPosition.left += "px", tooltip.css(ttPosition);
                        };
                        scope.tt_isOpen = !1, attrs.$observe(type, function(val) {
                            scope.tt_content = val, !val && scope.tt_isOpen && hide();
                        }), attrs.$observe(prefix + "Title", function(val) {
                            scope.tt_title = val;
                        }), attrs.$observe(prefix + "Placement", function(val) {
                            scope.tt_placement = angular.isDefined(val) ? val : options.placement;
                        }), attrs.$observe(prefix + "PopupDelay", function(val) {
                            var delay = parseInt(val, 10);
                            scope.tt_popupDelay = isNaN(delay) ? options.popupDelay : delay;
                        });
                        var unregisterTriggers = function() {
                            hasRegisteredTriggers && (element.unbind(triggers.show, showTooltipBind), element.unbind(triggers.hide, hideTooltipBind));
                        };
                        attrs.$observe(prefix + "Trigger", function(val) {
                            unregisterTriggers(), triggers = getTriggers(val), triggers.show === triggers.hide ? element.bind(triggers.show, toggleTooltipBind) : (element.bind(triggers.show, showTooltipBind), 
                            element.bind(triggers.hide, hideTooltipBind)), hasRegisteredTriggers = !0;
                        });
                        var animation = scope.$eval(attrs[prefix + "Animation"]);
                        scope.tt_animation = angular.isDefined(animation) ? !!animation : options.animation, 
                        attrs.$observe(prefix + "AppendToBody", function(val) {
                            appendToBody = angular.isDefined(val) ? $parse(val)(scope) : appendToBody;
                        }), appendToBody && scope.$on("$locationChangeSuccess", function() {
                            scope.tt_isOpen && hide();
                        }), scope.$on("$destroy", function() {
                            $timeout.cancel(transitionTimeout), $timeout.cancel(popupTimeout), unregisterTriggers(), 
                            removeTooltip();
                        });
                    };
                }
            };
        };
    } ];
}).directive("tooltipPopup", function() {
    return {
        restrict: "EA",
        replace: !0,
        scope: {
            content: "@",
            placement: "@",
            animation: "&",
            isOpen: "&"
        },
        templateUrl: "template/tooltip/tooltip-popup.html"
    };
}).directive("tooltip", [ "$tooltip", function($tooltip) {
    return $tooltip("tooltip", "tooltip", "mouseenter");
} ]).directive("tooltipHtmlUnsafePopup", function() {
    return {
        restrict: "EA",
        replace: !0,
        scope: {
            content: "@",
            placement: "@",
            animation: "&",
            isOpen: "&"
        },
        templateUrl: "template/tooltip/tooltip-html-unsafe-popup.html"
    };
}).directive("tooltipHtmlUnsafe", [ "$tooltip", function($tooltip) {
    return $tooltip("tooltipHtmlUnsafe", "tooltip", "mouseenter");
} ]), angular.module("ui.bootstrap.popover", [ "ui.bootstrap.tooltip" ]).directive("popoverPopup", function() {
    return {
        restrict: "EA",
        replace: !0,
        scope: {
            title: "@",
            content: "@",
            placement: "@",
            animation: "&",
            isOpen: "&"
        },
        templateUrl: "template/popover/popover.html"
    };
}).directive("popover", [ "$tooltip", function($tooltip) {
    return $tooltip("popover", "popover", "click");
} ]), angular.module("ui.bootstrap.progressbar", [ "ui.bootstrap.transition" ]).constant("progressConfig", {
    animate: !0,
    max: 100
}).controller("ProgressController", [ "$scope", "$attrs", "progressConfig", "$transition", function($scope, $attrs, progressConfig, $transition) {
    var self = this, bars = [], max = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : progressConfig.max, animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;
    this.addBar = function(bar, element) {
        var oldValue = 0, index = bar.$parent.$index;
        angular.isDefined(index) && bars[index] && (oldValue = bars[index].value), bars.push(bar), 
        this.update(element, bar.value, oldValue), bar.$watch("value", function(value, oldValue) {
            value !== oldValue && self.update(element, value, oldValue);
        }), bar.$on("$destroy", function() {
            self.removeBar(bar);
        });
    }, this.update = function(element, newValue, oldValue) {
        var percent = this.getPercentage(newValue);
        animate ? (element.css("width", this.getPercentage(oldValue) + "%"), $transition(element, {
            width: percent + "%"
        })) : element.css({
            transition: "none",
            width: percent + "%"
        });
    }, this.removeBar = function(bar) {
        bars.splice(bars.indexOf(bar), 1);
    }, this.getPercentage = function(value) {
        return Math.round(100 * value / max);
    };
} ]).directive("progress", function() {
    return {
        restrict: "EA",
        replace: !0,
        transclude: !0,
        controller: "ProgressController",
        require: "progress",
        scope: {},
        template: '<div class="progress" ng-transclude></div>'
    };
}).directive("bar", function() {
    return {
        restrict: "EA",
        replace: !0,
        transclude: !0,
        require: "^progress",
        scope: {
            value: "=",
            type: "@"
        },
        templateUrl: "template/progressbar/bar.html",
        link: function(scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, element);
        }
    };
}).directive("progressbar", function() {
    return {
        restrict: "EA",
        replace: !0,
        transclude: !0,
        controller: "ProgressController",
        scope: {
            value: "=",
            type: "@"
        },
        templateUrl: "template/progressbar/progressbar.html",
        link: function(scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, angular.element(element.children()[0]));
        }
    };
}), angular.module("ui.bootstrap.rating", []).constant("ratingConfig", {
    max: 5,
    stateOn: null,
    stateOff: null
}).controller("RatingController", [ "$scope", "$attrs", "$parse", "ratingConfig", function($scope, $attrs, $parse, ratingConfig) {
    this.maxRange = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max, 
    this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn, 
    this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff, 
    this.createRateObjects = function(states) {
        for (var defaultOptions = {
            stateOn: this.stateOn,
            stateOff: this.stateOff
        }, i = 0, n = states.length; i < n; i++) states[i] = angular.extend({
            index: i
        }, defaultOptions, states[i]);
        return states;
    }, $scope.range = angular.isDefined($attrs.ratingStates) ? this.createRateObjects(angular.copy($scope.$parent.$eval($attrs.ratingStates))) : this.createRateObjects(new Array(this.maxRange)), 
    $scope.rate = function(value) {
        $scope.value === value || $scope.readonly || ($scope.value = value);
    }, $scope.enter = function(value) {
        $scope.readonly || ($scope.val = value), $scope.onHover({
            value: value
        });
    }, $scope.reset = function() {
        $scope.val = angular.copy($scope.value), $scope.onLeave();
    }, $scope.$watch("value", function(value) {
        $scope.val = value;
    }), $scope.readonly = !1, $attrs.readonly && $scope.$parent.$watch($parse($attrs.readonly), function(value) {
        $scope.readonly = !!value;
    });
} ]).directive("rating", function() {
    return {
        restrict: "EA",
        scope: {
            value: "=",
            onHover: "&",
            onLeave: "&"
        },
        controller: "RatingController",
        templateUrl: "template/rating/rating.html",
        replace: !0
    };
}), angular.module("ui.bootstrap.tabs", []).controller("TabsetController", [ "$scope", function($scope) {
    var ctrl = this, tabs = ctrl.tabs = $scope.tabs = [];
    ctrl.select = function(tab) {
        angular.forEach(tabs, function(tab) {
            tab.active = !1;
        }), tab.active = !0;
    }, ctrl.addTab = function(tab) {
        tabs.push(tab), (1 === tabs.length || tab.active) && ctrl.select(tab);
    }, ctrl.removeTab = function(tab) {
        var index = tabs.indexOf(tab);
        if (tab.active && tabs.length > 1) {
            var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
            ctrl.select(tabs[newActiveIndex]);
        }
        tabs.splice(index, 1);
    };
} ]).directive("tabset", function() {
    return {
        restrict: "EA",
        transclude: !0,
        replace: !0,
        scope: {},
        controller: "TabsetController",
        templateUrl: "template/tabs/tabset.html",
        link: function(scope, element, attrs) {
            scope.vertical = !!angular.isDefined(attrs.vertical) && scope.$parent.$eval(attrs.vertical), 
            scope.justified = !!angular.isDefined(attrs.justified) && scope.$parent.$eval(attrs.justified), 
            scope.type = angular.isDefined(attrs.type) ? scope.$parent.$eval(attrs.type) : "tabs";
        }
    };
}).directive("tab", [ "$parse", function($parse) {
    return {
        require: "^tabset",
        restrict: "EA",
        replace: !0,
        templateUrl: "template/tabs/tab.html",
        transclude: !0,
        scope: {
            heading: "@",
            onSelect: "&select",
            onDeselect: "&deselect"
        },
        controller: function() {},
        compile: function(elm, attrs, transclude) {
            return function(scope, elm, attrs, tabsetCtrl) {
                var getActive, setActive;
                attrs.active ? (getActive = $parse(attrs.active), setActive = getActive.assign, 
                scope.$parent.$watch(getActive, function(value, oldVal) {
                    value !== oldVal && (scope.active = !!value);
                }), scope.active = getActive(scope.$parent)) : setActive = getActive = angular.noop, 
                scope.$watch("active", function(active) {
                    setActive(scope.$parent, active), active ? (tabsetCtrl.select(scope), scope.onSelect()) : scope.onDeselect();
                }), scope.disabled = !1, attrs.disabled && scope.$parent.$watch($parse(attrs.disabled), function(value) {
                    scope.disabled = !!value;
                }), scope.select = function() {
                    scope.disabled || (scope.active = !0);
                }, tabsetCtrl.addTab(scope), scope.$on("$destroy", function() {
                    tabsetCtrl.removeTab(scope);
                }), scope.$transcludeFn = transclude;
            };
        }
    };
} ]).directive("tabHeadingTransclude", [ function() {
    return {
        restrict: "A",
        require: "^tab",
        link: function(scope, elm, attrs, tabCtrl) {
            scope.$watch("headingElement", function(heading) {
                heading && (elm.html(""), elm.append(heading));
            });
        }
    };
} ]).directive("tabContentTransclude", function() {
    function isTabHeading(node) {
        return node.tagName && (node.hasAttribute("tab-heading") || node.hasAttribute("data-tab-heading") || "tab-heading" === node.tagName.toLowerCase() || "data-tab-heading" === node.tagName.toLowerCase());
    }
    return {
        restrict: "A",
        require: "^tabset",
        link: function(scope, elm, attrs) {
            var tab = scope.$eval(attrs.tabContentTransclude);
            tab.$transcludeFn(tab.$parent, function(contents) {
                angular.forEach(contents, function(node) {
                    isTabHeading(node) ? tab.headingElement = node : elm.append(node);
                });
            });
        }
    };
}), angular.module("ui.bootstrap.timepicker", []).constant("timepickerConfig", {
    hourStep: 1,
    minuteStep: 1,
    showMeridian: !0,
    meridians: null,
    readonlyInput: !1,
    mousewheel: !0
}).directive("timepicker", [ "$parse", "$log", "timepickerConfig", "$locale", function($parse, $log, timepickerConfig, $locale) {
    return {
        restrict: "EA",
        require: "?^ngModel",
        replace: !0,
        scope: {},
        templateUrl: "template/timepicker/timepicker.html",
        link: function(scope, element, attrs, ngModel) {
            function getHoursFromTemplate() {
                var hours = parseInt(scope.hours, 10), valid = scope.showMeridian ? hours > 0 && hours < 13 : hours >= 0 && hours < 24;
                if (valid) return scope.showMeridian && (12 === hours && (hours = 0), scope.meridian === meridians[1] && (hours += 12)), 
                hours;
            }
            function getMinutesFromTemplate() {
                var minutes = parseInt(scope.minutes, 10);
                return minutes >= 0 && minutes < 60 ? minutes : void 0;
            }
            function pad(value) {
                return angular.isDefined(value) && value.toString().length < 2 ? "0" + value : value;
            }
            function refresh(keyboardChange) {
                makeValid(), ngModel.$setViewValue(new Date(selected)), updateTemplate(keyboardChange);
            }
            function makeValid() {
                ngModel.$setValidity("time", !0), scope.invalidHours = !1, scope.invalidMinutes = !1;
            }
            function updateTemplate(keyboardChange) {
                var hours = selected.getHours(), minutes = selected.getMinutes();
                scope.showMeridian && (hours = 0 === hours || 12 === hours ? 12 : hours % 12), scope.hours = "h" === keyboardChange ? hours : pad(hours), 
                scope.minutes = "m" === keyboardChange ? minutes : pad(minutes), scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
            }
            function addMinutes(minutes) {
                var dt = new Date(selected.getTime() + 6e4 * minutes);
                selected.setHours(dt.getHours(), dt.getMinutes()), refresh();
            }
            if (ngModel) {
                var selected = new Date(), meridians = angular.isDefined(attrs.meridians) ? scope.$parent.$eval(attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS, hourStep = timepickerConfig.hourStep;
                attrs.hourStep && scope.$parent.$watch($parse(attrs.hourStep), function(value) {
                    hourStep = parseInt(value, 10);
                });
                var minuteStep = timepickerConfig.minuteStep;
                attrs.minuteStep && scope.$parent.$watch($parse(attrs.minuteStep), function(value) {
                    minuteStep = parseInt(value, 10);
                }), scope.showMeridian = timepickerConfig.showMeridian, attrs.showMeridian && scope.$parent.$watch($parse(attrs.showMeridian), function(value) {
                    if (scope.showMeridian = !!value, ngModel.$error.time) {
                        var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
                        angular.isDefined(hours) && angular.isDefined(minutes) && (selected.setHours(hours), 
                        refresh());
                    } else updateTemplate();
                });
                var inputs = element.find("input"), hoursInputEl = inputs.eq(0), minutesInputEl = inputs.eq(1), mousewheel = angular.isDefined(attrs.mousewheel) ? scope.$eval(attrs.mousewheel) : timepickerConfig.mousewheel;
                if (mousewheel) {
                    var isScrollingUp = function(e) {
                        e.originalEvent && (e = e.originalEvent);
                        var delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
                        return e.detail || delta > 0;
                    };
                    hoursInputEl.bind("mousewheel wheel", function(e) {
                        scope.$apply(isScrollingUp(e) ? scope.incrementHours() : scope.decrementHours()), 
                        e.preventDefault();
                    }), minutesInputEl.bind("mousewheel wheel", function(e) {
                        scope.$apply(isScrollingUp(e) ? scope.incrementMinutes() : scope.decrementMinutes()), 
                        e.preventDefault();
                    });
                }
                if (scope.readonlyInput = angular.isDefined(attrs.readonlyInput) ? scope.$eval(attrs.readonlyInput) : timepickerConfig.readonlyInput, 
                scope.readonlyInput) scope.updateHours = angular.noop, scope.updateMinutes = angular.noop; else {
                    var invalidate = function(invalidHours, invalidMinutes) {
                        ngModel.$setViewValue(null), ngModel.$setValidity("time", !1), angular.isDefined(invalidHours) && (scope.invalidHours = invalidHours), 
                        angular.isDefined(invalidMinutes) && (scope.invalidMinutes = invalidMinutes);
                    };
                    scope.updateHours = function() {
                        var hours = getHoursFromTemplate();
                        angular.isDefined(hours) ? (selected.setHours(hours), refresh("h")) : invalidate(!0);
                    }, hoursInputEl.bind("blur", function(e) {
                        !scope.validHours && scope.hours < 10 && scope.$apply(function() {
                            scope.hours = pad(scope.hours);
                        });
                    }), scope.updateMinutes = function() {
                        var minutes = getMinutesFromTemplate();
                        angular.isDefined(minutes) ? (selected.setMinutes(minutes), refresh("m")) : invalidate(void 0, !0);
                    }, minutesInputEl.bind("blur", function(e) {
                        !scope.invalidMinutes && scope.minutes < 10 && scope.$apply(function() {
                            scope.minutes = pad(scope.minutes);
                        });
                    });
                }
                ngModel.$render = function() {
                    var date = ngModel.$modelValue ? new Date(ngModel.$modelValue) : null;
                    isNaN(date) ? (ngModel.$setValidity("time", !1), $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.')) : (date && (selected = date), 
                    makeValid(), updateTemplate());
                }, scope.incrementHours = function() {
                    addMinutes(60 * hourStep);
                }, scope.decrementHours = function() {
                    addMinutes(60 * -hourStep);
                }, scope.incrementMinutes = function() {
                    addMinutes(minuteStep);
                }, scope.decrementMinutes = function() {
                    addMinutes(-minuteStep);
                }, scope.toggleMeridian = function() {
                    addMinutes(720 * (selected.getHours() < 12 ? 1 : -1));
                };
            }
        }
    };
} ]), angular.module("ui.bootstrap.typeahead", [ "ui.bootstrap.position", "ui.bootstrap.bindHtml" ]).factory("typeaheadParser", [ "$parse", function($parse) {
    var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;
    return {
        parse: function(input) {
            var match = input.match(TYPEAHEAD_REGEXP);
            if (!match) throw new Error("Expected typeahead specification in form of '_modelValue_ (as _label_)? for _item_ in _collection_' but got '" + input + "'.");
            return {
                itemName: match[3],
                source: $parse(match[4]),
                viewMapper: $parse(match[2] || match[1]),
                modelMapper: $parse(match[1])
            };
        }
    };
} ]).directive("typeahead", [ "$compile", "$parse", "$q", "$timeout", "$document", "$position", "typeaheadParser", function($compile, $parse, $q, $timeout, $document, $position, typeaheadParser) {
    var HOT_KEYS = [ 9, 13, 27, 38, 40 ];
    return {
        require: "ngModel",
        link: function(originalScope, element, attrs, modelCtrl) {
            var hasFocus, minSearch = originalScope.$eval(attrs.typeaheadMinLength) || 1, waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0, isEditable = originalScope.$eval(attrs.typeaheadEditable) !== !1, isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop, onSelectCallback = $parse(attrs.typeaheadOnSelect), inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : void 0, appendToBody = !!attrs.typeaheadAppendToBody && $parse(attrs.typeaheadAppendToBody), $setModelValue = $parse(attrs.ngModel).assign, parserResult = typeaheadParser.parse(attrs.typeahead), popUpEl = angular.element("<div typeahead-popup></div>");
            popUpEl.attr({
                matches: "matches",
                active: "activeIdx",
                select: "select(activeIdx)",
                query: "query",
                position: "position"
            }), angular.isDefined(attrs.typeaheadTemplateUrl) && popUpEl.attr("template-url", attrs.typeaheadTemplateUrl);
            var scope = originalScope.$new();
            originalScope.$on("$destroy", function() {
                scope.$destroy();
            });
            var resetMatches = function() {
                scope.matches = [], scope.activeIdx = -1;
            }, getMatchesAsync = function(inputValue) {
                var locals = {
                    $viewValue: inputValue
                };
                isLoadingSetter(originalScope, !0), $q.when(parserResult.source(originalScope, locals)).then(function(matches) {
                    if (inputValue === modelCtrl.$viewValue && hasFocus) {
                        if (matches.length > 0) {
                            scope.activeIdx = 0, scope.matches.length = 0;
                            for (var i = 0; i < matches.length; i++) locals[parserResult.itemName] = matches[i], 
                            scope.matches.push({
                                label: parserResult.viewMapper(scope, locals),
                                model: matches[i]
                            });
                            scope.query = inputValue, scope.position = appendToBody ? $position.offset(element) : $position.position(element), 
                            scope.position.top = scope.position.top + element.prop("offsetHeight");
                        } else resetMatches();
                        isLoadingSetter(originalScope, !1);
                    }
                }, function() {
                    resetMatches(), isLoadingSetter(originalScope, !1);
                });
            };
            resetMatches(), scope.query = void 0;
            var timeoutPromise;
            modelCtrl.$parsers.unshift(function(inputValue) {
                return hasFocus = !0, inputValue && inputValue.length >= minSearch ? waitTime > 0 ? (timeoutPromise && $timeout.cancel(timeoutPromise), 
                timeoutPromise = $timeout(function() {
                    getMatchesAsync(inputValue);
                }, waitTime)) : getMatchesAsync(inputValue) : (isLoadingSetter(originalScope, !1), 
                resetMatches()), isEditable ? inputValue : inputValue ? void modelCtrl.$setValidity("editable", !1) : (modelCtrl.$setValidity("editable", !0), 
                inputValue);
            }), modelCtrl.$formatters.push(function(modelValue) {
                var candidateViewValue, emptyViewValue, locals = {};
                return inputFormatter ? (locals.$model = modelValue, inputFormatter(originalScope, locals)) : (locals[parserResult.itemName] = modelValue, 
                candidateViewValue = parserResult.viewMapper(originalScope, locals), locals[parserResult.itemName] = void 0, 
                emptyViewValue = parserResult.viewMapper(originalScope, locals), candidateViewValue !== emptyViewValue ? candidateViewValue : modelValue);
            }), scope.select = function(activeIdx) {
                var model, item, locals = {};
                locals[parserResult.itemName] = item = scope.matches[activeIdx].model, model = parserResult.modelMapper(originalScope, locals), 
                $setModelValue(originalScope, model), modelCtrl.$setValidity("editable", !0), onSelectCallback(originalScope, {
                    $item: item,
                    $model: model,
                    $label: parserResult.viewMapper(originalScope, locals)
                }), resetMatches(), element[0].focus();
            }, element.bind("keydown", function(evt) {
                0 !== scope.matches.length && HOT_KEYS.indexOf(evt.which) !== -1 && (evt.preventDefault(), 
                40 === evt.which ? (scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length, 
                scope.$digest()) : 38 === evt.which ? (scope.activeIdx = (scope.activeIdx ? scope.activeIdx : scope.matches.length) - 1, 
                scope.$digest()) : 13 === evt.which || 9 === evt.which ? scope.$apply(function() {
                    scope.select(scope.activeIdx);
                }) : 27 === evt.which && (evt.stopPropagation(), resetMatches(), scope.$digest()));
            }), element.bind("blur", function(evt) {
                hasFocus = !1;
            });
            var dismissClickHandler = function(evt) {
                element[0] !== evt.target && (resetMatches(), scope.$digest());
            };
            $document.bind("click", dismissClickHandler), originalScope.$on("$destroy", function() {
                $document.unbind("click", dismissClickHandler);
            });
            var $popup = $compile(popUpEl)(scope);
            appendToBody ? $document.find("body").append($popup) : element.after($popup);
        }
    };
} ]).directive("typeaheadPopup", function() {
    return {
        restrict: "EA",
        scope: {
            matches: "=",
            query: "=",
            active: "=",
            position: "=",
            select: "&"
        },
        replace: !0,
        templateUrl: "template/typeahead/typeahead-popup.html",
        link: function(scope, element, attrs) {
            scope.templateUrl = attrs.templateUrl, scope.isOpen = function() {
                return scope.matches.length > 0;
            }, scope.isActive = function(matchIdx) {
                return scope.active == matchIdx;
            }, scope.selectActive = function(matchIdx) {
                scope.active = matchIdx;
            }, scope.selectMatch = function(activeIdx) {
                scope.select({
                    activeIdx: activeIdx
                });
            };
        }
    };
}).directive("typeaheadMatch", [ "$http", "$templateCache", "$compile", "$parse", function($http, $templateCache, $compile, $parse) {
    return {
        restrict: "EA",
        scope: {
            index: "=",
            match: "=",
            query: "="
        },
        link: function(scope, element, attrs) {
            var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || "template/typeahead/typeahead-match.html";
            $http.get(tplUrl, {
                cache: $templateCache
            }).success(function(tplContent) {
                element.replaceWith($compile(tplContent.trim())(scope));
            });
        }
    };
} ]).filter("typeaheadHighlight", function() {
    function escapeRegexp(queryToEscape) {
        return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    }
    return function(matchItem, query) {
        return query ? matchItem.replace(new RegExp(escapeRegexp(query), "gi"), "<strong>$&</strong>") : matchItem;
    };
}), angular.module("template/accordion/accordion-group.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/accordion/accordion-group.html", '<div class="panel panel-default">\n  <div class="panel-heading">\n    <h4 class="panel-title">\n      <a class="accordion-toggle" ng-click="isOpen = !isOpen" accordion-transclude="heading">{{heading}}</a>\n    </h4>\n  </div>\n  <div class="panel-collapse" collapse="!isOpen">\n\t  <div class="panel-body" ng-transclude></div>\n  </div>\n</div>');
} ]), angular.module("template/accordion/accordion.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/accordion/accordion.html", '<div class="panel-group" ng-transclude></div>');
} ]), angular.module("template/alert/alert.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/alert/alert.html", "<div class='alert' ng-class='\"alert-\" + (type || \"warning\")'>\n    <button ng-show='closeable' type='button' class='close' ng-click='close()'>&times;</button>\n    <div ng-transclude></div>\n</div>\n");
} ]), angular.module("template/carousel/carousel.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/carousel/carousel.html", '<div ng-mouseenter="pause()" ng-mouseleave="play()" class="carousel">\n    <ol class="carousel-indicators" ng-show="slides().length > 1">\n        <li ng-repeat="slide in slides()" ng-class="{active: isActive(slide)}" ng-click="select(slide)"></li>\n    </ol>\n    <div class="carousel-inner" ng-transclude></div>\n    <a class="left carousel-control" ng-click="prev()" ng-show="slides().length > 1"><span class="icon-prev"></span></a>\n    <a class="right carousel-control" ng-click="next()" ng-show="slides().length > 1"><span class="icon-next"></span></a>\n</div>\n');
} ]), angular.module("template/carousel/slide.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/carousel/slide.html", "<div ng-class=\"{\n    'active': leaving || (active && !entering),\n    'prev': (next || active) && direction=='prev',\n    'next': (next || active) && direction=='next',\n    'right': direction=='prev',\n    'left': direction=='next'\n  }\" class=\"item text-center\" ng-transclude></div>\n");
} ]), angular.module("template/datepicker/datepicker.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/datepicker/datepicker.html", '<table>\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n      <th colspan="{{rows[0].length - 2 + showWeekNumbers}}"><button type="button" class="btn btn-default btn-sm btn-block" ng-click="toggleMode()"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n    </tr>\n    <tr ng-show="labels.length > 0" class="h6">\n      <th ng-show="showWeekNumbers" class="text-center">#</th>\n      <th ng-repeat="label in labels" class="text-center">{{label}}</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr ng-repeat="row in rows">\n      <td ng-show="showWeekNumbers" class="text-center"><em>{{ getWeekNumber(row) }}</em></td>\n      <td ng-repeat="dt in row" class="text-center">\n        <button type="button" style="width:100%;" class="btn btn-default btn-sm" ng-class="{\'btn-info\': dt.selected}" ng-click="select(dt.date)" ng-disabled="dt.disabled"><span ng-class="{\'text-muted\': dt.secondary}">{{dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n');
} ]), angular.module("template/datepicker/popup.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/datepicker/popup.html", "<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\">\n\t<li ng-transclude></li>\n" + '\t<li ng-show="showButtonBar" style="padding:10px 9px 2px">\n\t\t<span class="btn-group">\n\t\t\t<button type="button" class="btn btn-sm btn-info" ng-click="today()">{{currentText}}</button>\n\t\t\t<button type="button" class="btn btn-sm btn-default" ng-click="showWeeks = ! showWeeks" ng-class="{active: showWeeks}">{{toggleWeeksText}}</button>\n\t\t\t<button type="button" class="btn btn-sm btn-danger" ng-click="clear()">{{clearText}}</button>\n\t\t</span>\n\t\t<button type="button" class="btn btn-sm btn-success pull-right" ng-click="isOpen = false">{{closeText}}</button>\n\t</li>\n</ul>\n');
} ]), angular.module("template/modal/backdrop.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/modal/backdrop.html", '<div class="modal-backdrop fade" ng-class="{in: animate}" ng-style="{\'z-index\': 1040 + index*10}"></div>');
} ]), angular.module("template/modal/window.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/modal/window.html", '<div tabindex="-1" class="modal fade {{ windowClass }}" ng-class="{in: animate}" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)">\n    <div class="modal-dialog"><div class="modal-content" ng-transclude></div></div>\n</div>');
} ]), angular.module("template/pagination/pager.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/pagination/pager.html", '<ul class="pager">\n  <li ng-repeat="page in pages" ng-class="{disabled: page.disabled, previous: page.previous, next: page.next}"><a ng-click="selectPage(page.number)">{{page.text}}</a></li>\n</ul>');
} ]), angular.module("template/pagination/pagination.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/pagination/pagination.html", '<ul class="pagination">\n  <li ng-repeat="page in pages" ng-class="{active: page.active, disabled: page.disabled}"><a ng-click="selectPage(page.number)">{{page.text}}</a></li>\n</ul>');
} ]), angular.module("template/tooltip/tooltip-html-unsafe-popup.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/tooltip/tooltip-html-unsafe-popup.html", '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" bind-html-unsafe="content"></div>\n</div>\n');
} ]), angular.module("template/tooltip/tooltip-popup.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/tooltip/tooltip-popup.html", '<div class="tooltip {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="tooltip-arrow"></div>\n  <div class="tooltip-inner" ng-bind="content"></div>\n</div>\n');
} ]), angular.module("template/popover/popover.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/popover/popover.html", '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }">\n  <div class="arrow"></div>\n\n  <div class="popover-inner">\n      <h3 class="popover-title" ng-bind="title" ng-show="title"></h3>\n      <div class="popover-content" ng-bind="content"></div>\n  </div>\n</div>\n');
} ]), angular.module("template/progressbar/bar.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/progressbar/bar.html", '<div class="progress-bar" ng-class="type && \'progress-bar-\' + type" ng-transclude></div>');
} ]), angular.module("template/progressbar/progress.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/progressbar/progress.html", '<div class="progress" ng-transclude></div>');
} ]), angular.module("template/progressbar/progressbar.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/progressbar/progressbar.html", '<div class="progress"><div class="progress-bar" ng-class="type && \'progress-bar-\' + type" ng-transclude></div></div>');
} ]), angular.module("template/rating/rating.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/rating/rating.html", '<span ng-mouseleave="reset()">\n    <i ng-repeat="r in range" ng-mouseenter="enter($index + 1)" ng-click="rate($index + 1)" class="glyphicon" ng-class="$index < val && (r.stateOn || \'glyphicon-star\') || (r.stateOff || \'glyphicon-star-empty\')"></i>\n</span>');
} ]), angular.module("template/tabs/tab.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/tabs/tab.html", '<li ng-class="{active: active, disabled: disabled}">\n  <a ng-click="select()" tab-heading-transclude>{{heading}}</a>\n</li>\n');
} ]), angular.module("template/tabs/tabset-titles.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/tabs/tabset-titles.html", "<ul class=\"nav {{type && 'nav-' + type}}\" ng-class=\"{'nav-stacked': vertical}\">\n</ul>\n");
} ]), angular.module("template/tabs/tabset.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/tabs/tabset.html", '\n<div class="tabbable">\n  <ul class="nav {{type && \'nav-\' + type}}" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}" ng-transclude></ul>\n  <div class="tab-content">\n    <div class="tab-pane" \n         ng-repeat="tab in tabs" \n         ng-class="{active: tab.active}"\n         tab-content-transclude="tab">\n    </div>\n  </div>\n</div>\n');
} ]), angular.module("template/timepicker/timepicker.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/timepicker/timepicker.html", '<table>\n\t<tbody>\n\t\t<tr class="text-center">\n\t\t\t<td><a ng-click="incrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n\t\t\t<td>&nbsp;</td>\n\t\t\t<td><a ng-click="incrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n\t\t\t<td ng-show="showMeridian"></td>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidHours}">\n\t\t\t\t<input type="text" ng-model="hours" ng-change="updateHours()" class="form-control text-center" ng-mousewheel="incrementHours()" ng-readonly="readonlyInput" maxlength="2">\n\t\t\t</td>\n\t\t\t<td>:</td>\n\t\t\t<td style="width:50px;" class="form-group" ng-class="{\'has-error\': invalidMinutes}">\n\t\t\t\t<input type="text" ng-model="minutes" ng-change="updateMinutes()" class="form-control text-center" ng-readonly="readonlyInput" maxlength="2">\n\t\t\t</td>\n\t\t\t<td ng-show="showMeridian"><button type="button" class="btn btn-default text-center" ng-click="toggleMeridian()">{{meridian}}</button></td>\n\t\t</tr>\n\t\t<tr class="text-center">\n\t\t\t<td><a ng-click="decrementHours()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n\t\t\t<td>&nbsp;</td>\n\t\t\t<td><a ng-click="decrementMinutes()" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n\t\t\t<td ng-show="showMeridian"></td>\n\t\t</tr>\n\t</tbody>\n</table>\n');
} ]), angular.module("template/typeahead/typeahead-match.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/typeahead/typeahead-match.html", '<a tabindex="-1" bind-html-unsafe="match.label | typeaheadHighlight:query"></a>');
} ]), angular.module("template/typeahead/typeahead-popup.html", []).run([ "$templateCache", function($templateCache) {
    $templateCache.put("template/typeahead/typeahead-popup.html", "<ul class=\"dropdown-menu\" ng-style=\"{display: isOpen()&&'block' || 'none', top: position.top+'px', left: position.left+'px'}\">\n" + '    <li ng-repeat="match in matches" ng-class="{active: isActive($index) }" ng-mouseenter="selectActive($index)" ng-click="selectMatch($index)">\n        <div typeahead-match index="$index" match="match" query="query" template-url="templateUrl"></div>\n    </li>\n</ul>');
} ]), angular.module("ui.alias", []).config([ "$compileProvider", "uiAliasConfig", function($compileProvider, uiAliasConfig) {
    "use strict";
    uiAliasConfig = uiAliasConfig || {}, angular.forEach(uiAliasConfig, function(config, alias) {
        angular.isString(config) && (config = {
            replace: !0,
            template: config
        }), $compileProvider.directive(alias, function() {
            return config;
        });
    });
} ]), angular.module("ui.event", []).directive("uiEvent", [ "$parse", function($parse) {
    "use strict";
    return function($scope, elm, attrs) {
        var events = $scope.$eval(attrs.uiEvent);
        angular.forEach(events, function(uiEvent, eventName) {
            var fn = $parse(uiEvent);
            elm.bind(eventName, function(evt) {
                var params = Array.prototype.slice.call(arguments);
                params = params.splice(1), fn($scope, {
                    $event: evt,
                    $params: params
                }), $scope.$$phase || $scope.$apply();
            });
        });
    };
} ]), angular.module("ui.format", []).filter("format", function() {
    "use strict";
    return function(value, replace) {
        var target = value;
        if (angular.isString(target) && void 0 !== replace) if (angular.isArray(replace) || angular.isObject(replace) || (replace = [ replace ]), 
        angular.isArray(replace)) {
            var rlen = replace.length, rfx = function(str, i) {
                return i = parseInt(i, 10), i >= 0 && i < rlen ? replace[i] : str;
            };
            target = target.replace(/\$([0-9]+)/g, rfx);
        } else angular.forEach(replace, function(value, key) {
            target = target.split(":" + key).join(value);
        });
        return target;
    };
}), angular.module("ui.highlight", []).filter("highlight", function() {
    "use strict";
    return function(text, search, caseSensitive) {
        return text && (search || angular.isNumber(search)) ? (text = text.toString(), search = search.toString(), 
        caseSensitive ? text.split(search).join('<span class="ui-match">' + search + "</span>") : text.replace(new RegExp(search, "gi"), '<span class="ui-match">$&</span>')) : text;
    };
}), angular.module("ui.include", []).directive("uiInclude", [ "$http", "$templateCache", "$anchorScroll", "$compile", function($http, $templateCache, $anchorScroll, $compile) {
    "use strict";
    return {
        restrict: "ECA",
        terminal: !0,
        compile: function(element, attr) {
            var srcExp = attr.uiInclude || attr.src, fragExp = attr.fragment || "", onloadExp = attr.onload || "", autoScrollExp = attr.autoscroll;
            return function(scope, element) {
                function ngIncludeWatchAction() {
                    var thisChangeId = ++changeCounter, src = scope.$eval(srcExp), fragment = scope.$eval(fragExp);
                    src ? $http.get(src, {
                        cache: $templateCache
                    }).success(function(response) {
                        if (thisChangeId === changeCounter) {
                            childScope && childScope.$destroy(), childScope = scope.$new();
                            var contents;
                            contents = fragment ? angular.element("<div/>").html(response).find(fragment) : angular.element("<div/>").html(response).contents(), 
                            element.html(contents), $compile(contents)(childScope), !angular.isDefined(autoScrollExp) || autoScrollExp && !scope.$eval(autoScrollExp) || $anchorScroll(), 
                            childScope.$emit("$includeContentLoaded"), scope.$eval(onloadExp);
                        }
                    }).error(function() {
                        thisChangeId === changeCounter && clearContent();
                    }) : clearContent();
                }
                var childScope, changeCounter = 0, clearContent = function() {
                    childScope && (childScope.$destroy(), childScope = null), element.html("");
                };
                scope.$watch(fragExp, ngIncludeWatchAction), scope.$watch(srcExp, ngIncludeWatchAction);
            };
        }
    };
} ]), angular.module("ui.indeterminate", []).directive("uiIndeterminate", [ function() {
    "use strict";
    return {
        compile: function(tElm, tAttrs) {
            return tAttrs.type && "checkbox" === tAttrs.type.toLowerCase() ? function($scope, elm, attrs) {
                $scope.$watch(attrs.uiIndeterminate, function(newVal) {
                    elm[0].indeterminate = !!newVal;
                });
            } : angular.noop;
        }
    };
} ]), angular.module("ui.inflector", []).filter("inflector", function() {
    "use strict";
    function tokenize(text) {
        return text = text.replace(/([A-Z])|([\-|\_])/g, function(_, $1) {
            return " " + ($1 || "");
        }), text.replace(/\s\s+/g, " ").trim().toLowerCase().split(" ");
    }
    function capitalizeTokens(tokens) {
        var result = [];
        return angular.forEach(tokens, function(token) {
            result.push(token.charAt(0).toUpperCase() + token.substr(1));
        }), result;
    }
    var inflectors = {
        humanize: function(value) {
            return capitalizeTokens(tokenize(value)).join(" ");
        },
        underscore: function(value) {
            return tokenize(value).join("_");
        },
        variable: function(value) {
            return value = tokenize(value), value = value[0] + capitalizeTokens(value.slice(1)).join("");
        }
    };
    return function(text, inflector) {
        return inflector !== !1 && angular.isString(text) ? (inflector = inflector || "humanize", 
        inflectors[inflector](text)) : text;
    };
}), angular.module("ui.jq", []).value("uiJqConfig", {}).directive("uiJq", [ "uiJqConfig", "$timeout", function(uiJqConfig, $timeout) {
    "use strict";
    return {
        restrict: "A",
        compile: function(tElm, tAttrs) {
            if (!angular.isFunction(tElm[tAttrs.uiJq])) throw new Error('ui-jq: The "' + tAttrs.uiJq + '" function does not exist');
            var options = uiJqConfig && uiJqConfig[tAttrs.uiJq];
            return function(scope, elm, attrs) {
                function createLinkOptions() {
                    var linkOptions = [];
                    return attrs.uiOptions ? (linkOptions = scope.$eval("[" + attrs.uiOptions + "]"), 
                    angular.isObject(options) && angular.isObject(linkOptions[0]) && (linkOptions[0] = angular.extend({}, options, linkOptions[0]))) : options && (linkOptions = [ options ]), 
                    linkOptions;
                }
                function callPlugin() {
                    $timeout(function() {
                        elm[attrs.uiJq].apply(elm, createLinkOptions());
                    }, 0, !1);
                }
                attrs.ngModel && elm.is("select,input,textarea") && elm.bind("change", function() {
                    elm.trigger("input");
                }), attrs.uiRefresh && scope.$watch(attrs.uiRefresh, function() {
                    callPlugin();
                }), callPlugin();
            };
        }
    };
} ]), angular.module("ui.keypress", []).factory("keypressHelper", [ "$parse", function($parse) {
    "use strict";
    var keysByCode = {
        8: "backspace",
        9: "tab",
        13: "enter",
        27: "esc",
        32: "space",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        45: "insert",
        46: "delete"
    }, capitaliseFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    return function(mode, scope, elm, attrs) {
        var params, combinations = [];
        params = scope.$eval(attrs["ui" + capitaliseFirstLetter(mode)]), angular.forEach(params, function(v, k) {
            var combination, expression;
            expression = $parse(v), angular.forEach(k.split(" "), function(variation) {
                combination = {
                    expression: expression,
                    keys: {}
                }, angular.forEach(variation.split("-"), function(value) {
                    combination.keys[value] = !0;
                }), combinations.push(combination);
            });
        }), elm.bind(mode, function(event) {
            var metaPressed = !(!event.metaKey || event.ctrlKey), altPressed = !!event.altKey, ctrlPressed = !!event.ctrlKey, shiftPressed = !!event.shiftKey, keyCode = event.keyCode;
            "keypress" === mode && !shiftPressed && keyCode >= 97 && keyCode <= 122 && (keyCode -= 32), 
            angular.forEach(combinations, function(combination) {
                var mainKeyPressed = combination.keys[keysByCode[keyCode]] || combination.keys[keyCode.toString()], metaRequired = !!combination.keys.meta, altRequired = !!combination.keys.alt, ctrlRequired = !!combination.keys.ctrl, shiftRequired = !!combination.keys.shift;
                mainKeyPressed && metaRequired === metaPressed && altRequired === altPressed && ctrlRequired === ctrlPressed && shiftRequired === shiftPressed && scope.$apply(function() {
                    combination.expression(scope, {
                        $event: event
                    });
                });
            });
        });
    };
} ]), angular.module("ui.keypress").directive("uiKeydown", [ "keypressHelper", function(keypressHelper) {
    "use strict";
    return {
        link: function(scope, elm, attrs) {
            keypressHelper("keydown", scope, elm, attrs);
        }
    };
} ]), angular.module("ui.keypress").directive("uiKeypress", [ "keypressHelper", function(keypressHelper) {
    "use strict";
    return {
        link: function(scope, elm, attrs) {
            keypressHelper("keypress", scope, elm, attrs);
        }
    };
} ]), angular.module("ui.keypress").directive("uiKeyup", [ "keypressHelper", function(keypressHelper) {
    "use strict";
    return {
        link: function(scope, elm, attrs) {
            keypressHelper("keyup", scope, elm, attrs);
        }
    };
} ]), angular.module("ui.mask", []).value("uiMaskConfig", {
    maskDefinitions: {
        "9": /\d/,
        A: /[a-zA-Z]/,
        "*": /[a-zA-Z0-9]/
    },
    clearOnBlur: !0
}).directive("uiMask", [ "uiMaskConfig", "$parse", function(maskConfig, $parse) {
    "use strict";
    return {
        priority: 100,
        require: "ngModel",
        restrict: "A",
        compile: function() {
            var options = maskConfig;
            return function(scope, iElement, iAttrs, controller) {
                function initialize(maskAttr) {
                    return angular.isDefined(maskAttr) ? (processRawMask(maskAttr), maskProcessed ? (initializeElement(), 
                    bindEventListeners(), !0) : uninitialize()) : uninitialize();
                }
                function initPlaceholder(placeholderAttr) {
                    angular.isDefined(placeholderAttr) && (maskPlaceholder = placeholderAttr, maskProcessed && eventHandler());
                }
                function formatter(fromModelValue) {
                    return maskProcessed ? (value = unmaskValue(fromModelValue || ""), isValid = validateValue(value), 
                    controller.$setValidity("mask", isValid), isValid && value.length ? maskValue(value) : void 0) : fromModelValue;
                }
                function parser(fromViewValue) {
                    return maskProcessed ? (value = unmaskValue(fromViewValue || ""), isValid = validateValue(value), 
                    controller.$viewValue = value.length ? maskValue(value) : "", controller.$setValidity("mask", isValid), 
                    "" === value && iAttrs.required && controller.$setValidity("required", !controller.$error.required), 
                    isValid ? value : void 0) : fromViewValue;
                }
                function uninitialize() {
                    return maskProcessed = !1, unbindEventListeners(), angular.isDefined(originalPlaceholder) ? iElement.attr("placeholder", originalPlaceholder) : iElement.removeAttr("placeholder"), 
                    angular.isDefined(originalMaxlength) ? iElement.attr("maxlength", originalMaxlength) : iElement.removeAttr("maxlength"), 
                    iElement.val(controller.$modelValue), controller.$viewValue = controller.$modelValue, 
                    !1;
                }
                function initializeElement() {
                    value = oldValueUnmasked = unmaskValue(controller.$viewValue || ""), valueMasked = oldValue = maskValue(value), 
                    isValid = validateValue(value);
                    var viewValue = isValid && value.length ? valueMasked : "";
                    iAttrs.maxlength && iElement.attr("maxlength", 2 * maskCaretMap[maskCaretMap.length - 1]), 
                    iElement.attr("placeholder", maskPlaceholder), iElement.val(viewValue), controller.$viewValue = viewValue;
                }
                function bindEventListeners() {
                    eventsBound || (iElement.bind("blur", blurHandler), iElement.bind("mousedown mouseup", mouseDownUpHandler), 
                    iElement.bind("input keyup click focus", eventHandler), eventsBound = !0);
                }
                function unbindEventListeners() {
                    eventsBound && (iElement.unbind("blur", blurHandler), iElement.unbind("mousedown", mouseDownUpHandler), 
                    iElement.unbind("mouseup", mouseDownUpHandler), iElement.unbind("input", eventHandler), 
                    iElement.unbind("keyup", eventHandler), iElement.unbind("click", eventHandler), 
                    iElement.unbind("focus", eventHandler), eventsBound = !1);
                }
                function validateValue(value) {
                    return !value.length || value.length >= minRequiredLength;
                }
                function unmaskValue(value) {
                    var valueUnmasked = "", maskPatternsCopy = maskPatterns.slice();
                    return value = value.toString(), angular.forEach(maskComponents, function(component) {
                        value = value.replace(component, "");
                    }), angular.forEach(value.split(""), function(chr) {
                        maskPatternsCopy.length && maskPatternsCopy[0].test(chr) && (valueUnmasked += chr, 
                        maskPatternsCopy.shift());
                    }), valueUnmasked;
                }
                function maskValue(unmaskedValue) {
                    var valueMasked = "", maskCaretMapCopy = maskCaretMap.slice();
                    return angular.forEach(maskPlaceholder.split(""), function(chr, i) {
                        unmaskedValue.length && i === maskCaretMapCopy[0] ? (valueMasked += unmaskedValue.charAt(0) || "_", 
                        unmaskedValue = unmaskedValue.substr(1), maskCaretMapCopy.shift()) : valueMasked += chr;
                    }), valueMasked;
                }
                function getPlaceholderChar(i) {
                    var placeholder = iAttrs.placeholder;
                    return "undefined" != typeof placeholder && placeholder[i] ? placeholder[i] : "_";
                }
                function getMaskComponents() {
                    return maskPlaceholder.replace(/[_]+/g, "_").replace(/([^_]+)([a-zA-Z0-9])([^_])/g, "$1$2_$3").split("_");
                }
                function processRawMask(mask) {
                    var characterCount = 0;
                    if (maskCaretMap = [], maskPatterns = [], maskPlaceholder = "", "string" == typeof mask) {
                        minRequiredLength = 0;
                        var isOptional = !1, splitMask = mask.split("");
                        angular.forEach(splitMask, function(chr, i) {
                            linkOptions.maskDefinitions[chr] ? (maskCaretMap.push(characterCount), maskPlaceholder += getPlaceholderChar(i), 
                            maskPatterns.push(linkOptions.maskDefinitions[chr]), characterCount++, isOptional || minRequiredLength++) : "?" === chr ? isOptional = !0 : (maskPlaceholder += chr, 
                            characterCount++);
                        });
                    }
                    maskCaretMap.push(maskCaretMap.slice().pop() + 1), maskComponents = getMaskComponents(), 
                    maskProcessed = maskCaretMap.length > 1;
                }
                function blurHandler() {
                    linkOptions.clearOnBlur && (oldCaretPosition = 0, oldSelectionLength = 0, isValid && 0 !== value.length || (valueMasked = "", 
                    iElement.val(""), scope.$apply(function() {
                        controller.$setViewValue("");
                    })));
                }
                function mouseDownUpHandler(e) {
                    "mousedown" === e.type ? iElement.bind("mouseout", mouseoutHandler) : iElement.unbind("mouseout", mouseoutHandler);
                }
                function mouseoutHandler() {
                    oldSelectionLength = getSelectionLength(this), iElement.unbind("mouseout", mouseoutHandler);
                }
                function eventHandler(e) {
                    e = e || {};
                    var eventWhich = e.which, eventType = e.type;
                    if (16 !== eventWhich && 91 !== eventWhich) {
                        var valMasked, val = iElement.val(), valOld = oldValue, valUnmasked = unmaskValue(val), valUnmaskedOld = oldValueUnmasked, valAltered = !1, caretPos = getCaretPosition(this) || 0, caretPosOld = oldCaretPosition || 0, caretPosDelta = caretPos - caretPosOld, caretPosMin = maskCaretMap[0], caretPosMax = maskCaretMap[valUnmasked.length] || maskCaretMap.slice().shift(), selectionLenOld = oldSelectionLength || 0, isSelected = getSelectionLength(this) > 0, wasSelected = selectionLenOld > 0, isAddition = val.length > valOld.length || selectionLenOld && val.length > valOld.length - selectionLenOld, isDeletion = val.length < valOld.length || selectionLenOld && val.length === valOld.length - selectionLenOld, isSelection = eventWhich >= 37 && eventWhich <= 40 && e.shiftKey, isKeyLeftArrow = 37 === eventWhich, isKeyBackspace = 8 === eventWhich || "keyup" !== eventType && isDeletion && caretPosDelta === -1, isKeyDelete = 46 === eventWhich || "keyup" !== eventType && isDeletion && 0 === caretPosDelta && !wasSelected, caretBumpBack = (isKeyLeftArrow || isKeyBackspace || "click" === eventType) && caretPos > caretPosMin;
                        if (oldSelectionLength = getSelectionLength(this), !isSelection && (!isSelected || "click" !== eventType && "keyup" !== eventType)) {
                            if ("input" === eventType && isDeletion && !wasSelected && valUnmasked === valUnmaskedOld) {
                                for (;isKeyBackspace && caretPos > caretPosMin && !isValidCaretPosition(caretPos); ) caretPos--;
                                for (;isKeyDelete && caretPos < caretPosMax && maskCaretMap.indexOf(caretPos) === -1; ) caretPos++;
                                var charIndex = maskCaretMap.indexOf(caretPos);
                                valUnmasked = valUnmasked.substring(0, charIndex) + valUnmasked.substring(charIndex + 1), 
                                valAltered = !0;
                            }
                            for (valMasked = maskValue(valUnmasked), oldValue = valMasked, oldValueUnmasked = valUnmasked, 
                            iElement.val(valMasked), valAltered && scope.$apply(function() {
                                controller.$setViewValue(valUnmasked);
                            }), isAddition && caretPos <= caretPosMin && (caretPos = caretPosMin + 1), caretBumpBack && caretPos--, 
                            caretPos = caretPos > caretPosMax ? caretPosMax : caretPos < caretPosMin ? caretPosMin : caretPos; !isValidCaretPosition(caretPos) && caretPos > caretPosMin && caretPos < caretPosMax; ) caretPos += caretBumpBack ? -1 : 1;
                            (caretBumpBack && caretPos < caretPosMax || isAddition && !isValidCaretPosition(caretPosOld)) && caretPos++, 
                            oldCaretPosition = caretPos, setCaretPosition(this, caretPos);
                        }
                    }
                }
                function isValidCaretPosition(pos) {
                    return maskCaretMap.indexOf(pos) > -1;
                }
                function getCaretPosition(input) {
                    if (!input) return 0;
                    if (void 0 !== input.selectionStart) return input.selectionStart;
                    if (document.selection) {
                        input.focus();
                        var selection = document.selection.createRange();
                        return selection.moveStart("character", input.value ? -input.value.length : 0), 
                        selection.text.length;
                    }
                    return 0;
                }
                function setCaretPosition(input, pos) {
                    if (!input) return 0;
                    if (0 !== input.offsetWidth && 0 !== input.offsetHeight) if (input.setSelectionRange) input.focus(), 
                    input.setSelectionRange(pos, pos); else if (input.createTextRange) {
                        var range = input.createTextRange();
                        range.collapse(!0), range.moveEnd("character", pos), range.moveStart("character", pos), 
                        range.select();
                    }
                }
                function getSelectionLength(input) {
                    return input ? void 0 !== input.selectionStart ? input.selectionEnd - input.selectionStart : document.selection ? document.selection.createRange().text.length : 0 : 0;
                }
                var maskCaretMap, maskPatterns, maskPlaceholder, maskComponents, minRequiredLength, value, valueMasked, isValid, oldValue, oldValueUnmasked, oldCaretPosition, oldSelectionLength, maskProcessed = !1, eventsBound = !1, originalPlaceholder = iAttrs.placeholder, originalMaxlength = iAttrs.maxlength, linkOptions = {};
                iAttrs.uiOptions ? (linkOptions = scope.$eval("[" + iAttrs.uiOptions + "]"), angular.isObject(linkOptions[0]) && (linkOptions = function(original, current) {
                    for (var i in original) Object.prototype.hasOwnProperty.call(original, i) && (void 0 === current[i] ? current[i] = angular.copy(original[i]) : angular.extend(current[i], original[i]));
                    return current;
                }(options, linkOptions[0]))) : linkOptions = options, iAttrs.$observe("uiMask", initialize), 
                iAttrs.$observe("placeholder", initPlaceholder);
                var modelViewValue = !1;
                iAttrs.$observe("modelViewValue", function(val) {
                    "true" === val && (modelViewValue = !0);
                }), scope.$watch(iAttrs.ngModel, function(val) {
                    if (modelViewValue && val) {
                        var model = $parse(iAttrs.ngModel);
                        model.assign(scope, controller.$viewValue);
                    }
                }), controller.$formatters.push(formatter), controller.$parsers.push(parser), iElement.bind("mousedown mouseup", mouseDownUpHandler), 
                Array.prototype.indexOf || (Array.prototype.indexOf = function(searchElement) {
                    if (null === this) throw new TypeError();
                    var t = Object(this), len = t.length >>> 0;
                    if (0 === len) return -1;
                    var n = 0;
                    if (arguments.length > 1 && (n = Number(arguments[1]), n !== n ? n = 0 : 0 !== n && n !== 1 / 0 && n !== -(1 / 0) && (n = (n > 0 || -1) * Math.floor(Math.abs(n)))), 
                    n >= len) return -1;
                    for (var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) if (k in t && t[k] === searchElement) return k;
                    return -1;
                });
            };
        }
    };
} ]), angular.module("ui.reset", []).value("uiResetConfig", null).directive("uiReset", [ "uiResetConfig", function(uiResetConfig) {
    "use strict";
    var resetValue = null;
    return void 0 !== uiResetConfig && (resetValue = uiResetConfig), {
        require: "ngModel",
        link: function(scope, elm, attrs, ctrl) {
            var aElement;
            aElement = angular.element('<a class="ui-reset" />'), elm.wrap('<span class="ui-resetwrap" />').after(aElement), 
            aElement.bind("click", function(e) {
                e.preventDefault(), scope.$apply(function() {
                    attrs.uiReset ? ctrl.$setViewValue(scope.$eval(attrs.uiReset)) : ctrl.$setViewValue(resetValue), 
                    ctrl.$render();
                });
            });
        }
    };
} ]), angular.module("ui.route", []).directive("uiRoute", [ "$location", "$parse", function($location, $parse) {
    "use strict";
    return {
        restrict: "AC",
        scope: !0,
        compile: function(tElement, tAttrs) {
            var useProperty;
            if (tAttrs.uiRoute) useProperty = "uiRoute"; else if (tAttrs.ngHref) useProperty = "ngHref"; else {
                if (!tAttrs.href) throw new Error("uiRoute missing a route or href property on " + tElement[0]);
                useProperty = "href";
            }
            return function($scope, elm, attrs) {
                function staticWatcher(newVal) {
                    var hash = newVal.indexOf("#");
                    hash > -1 && (newVal = newVal.substr(hash + 1)), (watcher = function() {
                        modelSetter($scope, $location.path().indexOf(newVal) > -1);
                    })();
                }
                function regexWatcher(newVal) {
                    var hash = newVal.indexOf("#");
                    hash > -1 && (newVal = newVal.substr(hash + 1)), (watcher = function() {
                        var regexp = new RegExp("^" + newVal + "$", [ "i" ]);
                        modelSetter($scope, regexp.test($location.path()));
                    })();
                }
                var modelSetter = $parse(attrs.ngModel || attrs.routeModel || "$uiRoute").assign, watcher = angular.noop;
                switch (useProperty) {
                  case "uiRoute":
                    attrs.uiRoute ? regexWatcher(attrs.uiRoute) : attrs.$observe("uiRoute", regexWatcher);
                    break;

                  case "ngHref":
                    attrs.ngHref ? staticWatcher(attrs.ngHref) : attrs.$observe("ngHref", staticWatcher);
                    break;

                  case "href":
                    staticWatcher(attrs.href);
                }
                $scope.$on("$routeChangeSuccess", function() {
                    watcher();
                }), $scope.$on("$stateChangeSuccess", function() {
                    watcher();
                });
            };
        }
    };
} ]), angular.module("ui.scroll.jqlite", [ "ui.scroll" ]).service("jqLiteExtras", [ "$log", "$window", function(console, window) {
    "use strict";
    return {
        registerFor: function(element) {
            var convertToPx, css, getMeasurements, getStyle, getWidthHeight, isWindow, scrollTo;
            return css = angular.element.prototype.css, element.prototype.css = function(name, value) {
                var elem, self;
                if (self = this, elem = self[0], elem && 3 !== elem.nodeType && 8 !== elem.nodeType && elem.style) return css.call(self, name, value);
            }, isWindow = function(obj) {
                return obj && obj.document && obj.location && obj.alert && obj.setInterval;
            }, scrollTo = function(self, direction, value) {
                var elem, method, preserve, prop, _ref;
                return elem = self[0], _ref = {
                    top: [ "scrollTop", "pageYOffset", "scrollLeft" ],
                    left: [ "scrollLeft", "pageXOffset", "scrollTop" ]
                }[direction], method = _ref[0], prop = _ref[1], preserve = _ref[2], isWindow(elem) ? angular.isDefined(value) ? elem.scrollTo(self[preserve].call(self), value) : prop in elem ? elem[prop] : elem.document.documentElement[method] : angular.isDefined(value) ? elem[method] = value : elem[method];
            }, window.getComputedStyle ? (getStyle = function(elem) {
                return window.getComputedStyle(elem, null);
            }, convertToPx = function(elem, value) {
                return parseFloat(value);
            }) : (getStyle = function(elem) {
                return elem.currentStyle;
            }, convertToPx = function(elem, value) {
                var core_pnum, left, result, rnumnonpx, rs, rsLeft, style;
                return core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, rnumnonpx = new RegExp("^(" + core_pnum + ")(?!px)[a-z%]+$", "i"), 
                rnumnonpx.test(value) ? (style = elem.style, left = style.left, rs = elem.runtimeStyle, 
                rsLeft = rs && rs.left, rs && (rs.left = style.left), style.left = value, result = style.pixelLeft, 
                style.left = left, rsLeft && (rs.left = rsLeft), result) : parseFloat(value);
            }), getMeasurements = function(elem, measure) {
                var base, borderA, borderB, computedMarginA, computedMarginB, computedStyle, dirA, dirB, marginA, marginB, paddingA, paddingB, _ref;
                return isWindow(elem) ? (base = document.documentElement[{
                    height: "clientHeight",
                    width: "clientWidth"
                }[measure]], {
                    base: base,
                    padding: 0,
                    border: 0,
                    margin: 0
                }) : (_ref = {
                    width: [ elem.offsetWidth, "Left", "Right" ],
                    height: [ elem.offsetHeight, "Top", "Bottom" ]
                }[measure], base = _ref[0], dirA = _ref[1], dirB = _ref[2], computedStyle = getStyle(elem), 
                paddingA = convertToPx(elem, computedStyle["padding" + dirA]) || 0, paddingB = convertToPx(elem, computedStyle["padding" + dirB]) || 0, 
                borderA = convertToPx(elem, computedStyle["border" + dirA + "Width"]) || 0, borderB = convertToPx(elem, computedStyle["border" + dirB + "Width"]) || 0, 
                computedMarginA = computedStyle["margin" + dirA], computedMarginB = computedStyle["margin" + dirB], 
                marginA = convertToPx(elem, computedMarginA) || 0, marginB = convertToPx(elem, computedMarginB) || 0, 
                {
                    base: base,
                    padding: paddingA + paddingB,
                    border: borderA + borderB,
                    margin: marginA + marginB
                });
            }, getWidthHeight = function(elem, direction, measure) {
                var computedStyle, measurements, result;
                return measurements = getMeasurements(elem, direction), measurements.base > 0 ? {
                    base: measurements.base - measurements.padding - measurements.border,
                    outer: measurements.base,
                    outerfull: measurements.base + measurements.margin
                }[measure] : (computedStyle = getStyle(elem), result = computedStyle[direction], 
                (result < 0 || null === result) && (result = elem.style[direction] || 0), result = parseFloat(result) || 0, 
                {
                    base: result - measurements.padding - measurements.border,
                    outer: result,
                    outerfull: result + measurements.padding + measurements.border + measurements.margin
                }[measure]);
            }, angular.forEach({
                before: function(newElem) {
                    var children, elem, i, parent, self, _i, _ref;
                    if (self = this, elem = self[0], parent = self.parent(), children = parent.contents(), 
                    children[0] === elem) return parent.prepend(newElem);
                    for (i = _i = 1, _ref = children.length - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) if (children[i] === elem) return void angular.element(children[i - 1]).after(newElem);
                    throw new Error("invalid DOM structure " + elem.outerHTML);
                },
                height: function(value) {
                    var self;
                    return self = this, angular.isDefined(value) ? (angular.isNumber(value) && (value += "px"), 
                    css.call(self, "height", value)) : getWidthHeight(this[0], "height", "base");
                },
                outerHeight: function(option) {
                    return getWidthHeight(this[0], "height", option ? "outerfull" : "outer");
                },
                offset: function(value) {
                    var box, doc, docElem, elem, self, win;
                    if (self = this, arguments.length) {
                        if (void 0 === value) return self;
                        throw new Error("offset setter method is not implemented");
                    }
                    if (box = {
                        top: 0,
                        left: 0
                    }, elem = self[0], doc = elem && elem.ownerDocument) return docElem = doc.documentElement, 
                    null != elem.getBoundingClientRect && (box = elem.getBoundingClientRect()), win = doc.defaultView || doc.parentWindow, 
                    {
                        top: box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
                        left: box.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
                    };
                },
                scrollTop: function(value) {
                    return scrollTo(this, "top", value);
                },
                scrollLeft: function(value) {
                    return scrollTo(this, "left", value);
                }
            }, function(value, key) {
                if (!element.prototype[key]) return element.prototype[key] = value;
            });
        }
    };
} ]).run([ "$log", "$window", "jqLiteExtras", function(console, window, jqLiteExtras) {
    "use strict";
    if (!window.jQuery) return jqLiteExtras.registerFor(angular.element);
} ]), angular.module("ui.scroll", []).directive("uiScrollViewport", [ "$log", function() {
    "use strict";
    return {
        controller: [ "$scope", "$element", function(scope, element) {
            return this.viewport = element, this;
        } ]
    };
} ]).directive("uiScroll", [ "$log", "$injector", "$rootScope", "$timeout", function(console, $injector, $rootScope, $timeout) {
    "use strict";
    return {
        require: [ "?^uiScrollViewport" ],
        transclude: "element",
        priority: 1e3,
        terminal: !0,
        compile: function(elementTemplate, attr, linker) {
            return function($scope, element, $attr, controllers) {
                var adapter, adjustBuffer, adjustRowHeight, bof, bottomVisiblePos, buffer, bufferPadding, bufferSize, clipBottom, clipTop, datasource, datasourceName, doAdjustment, enqueueFetch, eof, eventListener, fetch, finalize, first, getValueChain, hideElementBeforeAppend, insert, isDatasource, isLoading, itemName, loading, log, match, next, pending, reload, removeFromBuffer, resizeHandler, ridActual, scrollHandler, scrollHeight, shouldLoadBottom, shouldLoadTop, showElementAfterRender, tempScope, topVisible, topVisibleElement, topVisibleItem, topVisiblePos, topVisibleScope, viewport, viewportScope, wheelHandler;
                if (log = console.debug || console.log, match = $attr.uiScroll.match(/^\s*(\w+)\s+in\s+([\w\.]+)\s*$/), 
                !match) throw new Error("Expected uiScroll in form of '_item_ in _datasource_' but got '" + $attr.uiScroll + "'");
                if (itemName = match[1], datasourceName = match[2], isDatasource = function(datasource) {
                    return angular.isObject(datasource) && datasource.get && angular.isFunction(datasource.get);
                }, getValueChain = function(targetScope, target) {
                    var chain;
                    return targetScope ? (chain = target.match(/^([\w]+)\.(.+)$/), chain && 3 === chain.length ? getValueChain(targetScope[chain[1]], chain[2]) : targetScope[target]) : null;
                }, datasource = getValueChain($scope, datasourceName), !isDatasource(datasource) && (datasource = $injector.get(datasourceName), 
                !isDatasource(datasource))) throw new Error("" + datasourceName + " is not a valid datasource");
                return bufferSize = Math.max(3, +$attr.bufferSize || 10), bufferPadding = function() {
                    return viewport.outerHeight() * Math.max(.1, +$attr.padding || .1);
                }, scrollHeight = function(elem) {
                    var _ref;
                    return null != (_ref = elem[0].scrollHeight) ? _ref : elem[0].document.documentElement.scrollHeight;
                }, adapter = null, linker(tempScope = $scope.$new(), function(template) {
                    var bottomPadding, createPadding, padding, repeaterType, topPadding, viewport;
                    if (repeaterType = template[0].localName, "dl" === repeaterType) throw new Error("ui-scroll directive does not support <" + template[0].localName + "> as a repeating tag: " + template[0].outerHTML);
                    return "li" !== repeaterType && "tr" !== repeaterType && (repeaterType = "div"), 
                    viewport = controllers[0] && controllers[0].viewport ? controllers[0].viewport : angular.element(window), 
                    viewport.css({
                        "overflow-y": "auto",
                        display: "block"
                    }), padding = function(repeaterType) {
                        var div, result, table;
                        switch (repeaterType) {
                          case "tr":
                            return table = angular.element("<table><tr><td><div></div></td></tr></table>"), 
                            div = table.find("div"), result = table.find("tr"), result.paddingHeight = function() {
                                return div.height.apply(div, arguments);
                            }, result;

                          default:
                            return result = angular.element("<" + repeaterType + "></" + repeaterType + ">"), 
                            result.paddingHeight = result.height, result;
                        }
                    }, createPadding = function(padding, element, direction) {
                        return element[{
                            top: "before",
                            bottom: "after"
                        }[direction]](padding), {
                            paddingHeight: function() {
                                return padding.paddingHeight.apply(padding, arguments);
                            },
                            insert: function(element) {
                                return padding[{
                                    top: "after",
                                    bottom: "before"
                                }[direction]](element);
                            }
                        };
                    }, topPadding = createPadding(padding(repeaterType), element, "top"), bottomPadding = createPadding(padding(repeaterType), element, "bottom"), 
                    tempScope.$destroy(), adapter = {
                        viewport: viewport,
                        topPadding: topPadding.paddingHeight,
                        bottomPadding: bottomPadding.paddingHeight,
                        append: bottomPadding.insert,
                        prepend: topPadding.insert,
                        bottomDataPos: function() {
                            return scrollHeight(viewport) - bottomPadding.paddingHeight();
                        },
                        topDataPos: function() {
                            return topPadding.paddingHeight();
                        }
                    };
                }), viewport = adapter.viewport, viewportScope = viewport.scope() || $rootScope, 
                angular.isDefined($attr.topVisible) && (topVisibleItem = function(item) {
                    return viewportScope[$attr.topVisible] = item;
                }), angular.isDefined($attr.topVisibleElement) && (topVisibleElement = function(element) {
                    return viewportScope[$attr.topVisibleElement] = element;
                }), angular.isDefined($attr.topVisibleScope) && (topVisibleScope = function(scope) {
                    return viewportScope[$attr.topVisibleScope] = scope;
                }), topVisible = function(item) {
                    if (topVisibleItem && topVisibleItem(item.scope[itemName]), topVisibleElement && topVisibleElement(item.element), 
                    topVisibleScope && topVisibleScope(item.scope), datasource.topVisible) return datasource.topVisible(item);
                }, loading = angular.isDefined($attr.isLoading) ? function(value) {
                    if (viewportScope[$attr.isLoading] = value, datasource.loading) return datasource.loading(value);
                } : function(value) {
                    if (datasource.loading) return datasource.loading(value);
                }, ridActual = 0, first = 1, next = 1, buffer = [], pending = [], eof = !1, bof = !1, 
                isLoading = !1, removeFromBuffer = function(start, stop) {
                    var i, _i;
                    for (i = _i = start; start <= stop ? _i < stop : _i > stop; i = start <= stop ? ++_i : --_i) buffer[i].scope.$destroy(), 
                    buffer[i].element.remove();
                    return buffer.splice(start, stop - start);
                }, reload = function() {
                    return ridActual++, first = 1, next = 1, removeFromBuffer(0, buffer.length), adapter.topPadding(0), 
                    adapter.bottomPadding(0), pending = [], eof = !1, bof = !1, adjustBuffer(ridActual, !1);
                }, bottomVisiblePos = function() {
                    return viewport.scrollTop() + viewport.outerHeight();
                }, topVisiblePos = function() {
                    return viewport.scrollTop();
                }, shouldLoadBottom = function() {
                    return !eof && adapter.bottomDataPos() < bottomVisiblePos() + bufferPadding();
                }, clipBottom = function() {
                    var bottomHeight, i, item, itemHeight, itemTop, newRow, overage, rowTop, _i, _ref;
                    for (bottomHeight = 0, overage = 0, i = _i = _ref = buffer.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) if (item = buffer[i], 
                    itemTop = item.element.offset().top, newRow = rowTop !== itemTop, rowTop = itemTop, 
                    newRow && (itemHeight = item.element.outerHeight(!0)), adapter.bottomDataPos() - bottomHeight - itemHeight > bottomVisiblePos() + bufferPadding()) newRow && (bottomHeight += itemHeight), 
                    overage++, eof = !1; else {
                        if (newRow) break;
                        overage++;
                    }
                    if (overage > 0) return adapter.bottomPadding(adapter.bottomPadding() + bottomHeight), 
                    removeFromBuffer(buffer.length - overage, buffer.length), next -= overage, log("clipped off bottom " + overage + " bottom padding " + adapter.bottomPadding());
                }, shouldLoadTop = function() {
                    return !bof && adapter.topDataPos() > topVisiblePos() - bufferPadding();
                }, clipTop = function() {
                    var item, itemHeight, itemTop, newRow, overage, rowTop, topHeight, _i, _len;
                    for (topHeight = 0, overage = 0, _i = 0, _len = buffer.length; _i < _len; _i++) if (item = buffer[_i], 
                    itemTop = item.element.offset().top, newRow = rowTop !== itemTop, rowTop = itemTop, 
                    newRow && (itemHeight = item.element.outerHeight(!0)), adapter.topDataPos() + topHeight + itemHeight < topVisiblePos() - bufferPadding()) newRow && (topHeight += itemHeight), 
                    overage++, bof = !1; else {
                        if (newRow) break;
                        overage++;
                    }
                    if (overage > 0) return adapter.topPadding(adapter.topPadding() + topHeight), removeFromBuffer(0, overage), 
                    first += overage, log("clipped off top " + overage + " top padding " + adapter.topPadding());
                }, enqueueFetch = function(rid, direction, scrolling) {
                    if (isLoading || (isLoading = !0, loading(!0)), 1 === pending.push(direction)) return fetch(rid, scrolling);
                }, hideElementBeforeAppend = function(element) {
                    return element.displayTemp = element.css("display"), element.css("display", "none");
                }, showElementAfterRender = function(element) {
                    if (element.hasOwnProperty("displayTemp")) return element.css("display", element.displayTemp);
                }, insert = function(index, item) {
                    var itemScope, toBeAppended, wrapper;
                    return itemScope = $scope.$new(), itemScope[itemName] = item, toBeAppended = index > first, 
                    itemScope.$index = index, toBeAppended && itemScope.$index--, wrapper = {
                        scope: itemScope
                    }, linker(itemScope, function(clone) {
                        return wrapper.element = clone, toBeAppended ? index === next ? (hideElementBeforeAppend(clone), 
                        adapter.append(clone), buffer.push(wrapper)) : (buffer[index - first].element.after(clone), 
                        buffer.splice(index - first + 1, 0, wrapper)) : (hideElementBeforeAppend(clone), 
                        adapter.prepend(clone), buffer.unshift(wrapper));
                    }), {
                        appended: toBeAppended,
                        wrapper: wrapper
                    };
                }, adjustRowHeight = function(appended, wrapper) {
                    var newHeight;
                    return appended ? adapter.bottomPadding(Math.max(0, adapter.bottomPadding() - wrapper.element.outerHeight(!0))) : (newHeight = adapter.topPadding() - wrapper.element.outerHeight(!0), 
                    newHeight >= 0 ? adapter.topPadding(newHeight) : viewport.scrollTop(viewport.scrollTop() + wrapper.element.outerHeight(!0)));
                }, doAdjustment = function(rid, scrolling, finalize) {
                    var item, itemHeight, itemTop, newRow, rowTop, topHeight, _i, _len, _results;
                    if (log("top {actual=" + adapter.topDataPos() + " visible from=" + topVisiblePos() + " bottom {visible through=" + bottomVisiblePos() + " actual=" + adapter.bottomDataPos() + "}"), 
                    shouldLoadBottom() ? enqueueFetch(rid, !0, scrolling) : shouldLoadTop() && enqueueFetch(rid, !1, scrolling), 
                    finalize && finalize(rid), 0 === pending.length) {
                        for (topHeight = 0, _results = [], _i = 0, _len = buffer.length; _i < _len; _i++) {
                            if (item = buffer[_i], itemTop = item.element.offset().top, newRow = rowTop !== itemTop, 
                            rowTop = itemTop, newRow && (itemHeight = item.element.outerHeight(!0)), !(newRow && adapter.topDataPos() + topHeight + itemHeight < topVisiblePos())) {
                                newRow && topVisible(item);
                                break;
                            }
                            _results.push(topHeight += itemHeight);
                        }
                        return _results;
                    }
                }, adjustBuffer = function(rid, scrolling, newItems, finalize) {
                    return newItems && newItems.length ? $timeout(function() {
                        var itemTop, row, rowTop, rows, _i, _j, _len, _len1;
                        for (rows = [], _i = 0, _len = newItems.length; _i < _len; _i++) row = newItems[_i], 
                        element = row.wrapper.element, showElementAfterRender(element), itemTop = element.offset().top, 
                        rowTop !== itemTop && (rows.push(row), rowTop = itemTop);
                        for (_j = 0, _len1 = rows.length; _j < _len1; _j++) row = rows[_j], adjustRowHeight(row.appended, row.wrapper);
                        return doAdjustment(rid, scrolling, finalize);
                    }) : doAdjustment(rid, scrolling, finalize);
                }, finalize = function(rid, scrolling, newItems) {
                    return adjustBuffer(rid, scrolling, newItems, function() {
                        return pending.shift(), 0 === pending.length ? (isLoading = !1, loading(!1)) : fetch(rid, scrolling);
                    });
                }, fetch = function(rid, scrolling) {
                    var direction;
                    return direction = pending[0], direction ? buffer.length && !shouldLoadBottom() ? finalize(rid, scrolling) : datasource.get(next, bufferSize, function(result) {
                        var item, newItems, _i, _len;
                        if (!rid || rid === ridActual) {
                            if (newItems = [], result.length < bufferSize && (eof = !0, adapter.bottomPadding(0)), 
                            result.length > 0) for (clipTop(), _i = 0, _len = result.length; _i < _len; _i++) item = result[_i], 
                            newItems.push(insert(++next, item));
                            return finalize(rid, scrolling, newItems);
                        }
                    }) : buffer.length && !shouldLoadTop() ? finalize(rid, scrolling) : datasource.get(first - bufferSize, bufferSize, function(result) {
                        var i, newItems, _i, _ref;
                        if (!rid || rid === ridActual) {
                            if (newItems = [], result.length < bufferSize && (bof = !0, adapter.topPadding(0)), 
                            result.length > 0) for (buffer.length && clipBottom(), i = _i = _ref = result.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) newItems.unshift(insert(--first, result[i]));
                            return finalize(rid, scrolling, newItems);
                        }
                    });
                }, resizeHandler = function() {
                    if (!$rootScope.$$phase && !isLoading) return adjustBuffer(null, !1), $scope.$apply();
                }, viewport.bind("resize", resizeHandler), scrollHandler = function() {
                    if (!$rootScope.$$phase && !isLoading) return adjustBuffer(null, !0), $scope.$apply();
                }, viewport.bind("scroll", scrollHandler), wheelHandler = function(event) {
                    var scrollTop, yMax;
                    if (scrollTop = viewport[0].scrollTop, yMax = viewport[0].scrollHeight - viewport[0].clientHeight, 
                    0 === scrollTop && !bof || scrollTop === yMax && !eof) return event.preventDefault();
                }, viewport.bind("mousewheel", wheelHandler), $scope.$watch(datasource.revision, function() {
                    return reload();
                }), eventListener = datasource.scope ? datasource.scope.$new() : $scope.$new(), 
                $scope.$on("$destroy", function() {
                    return eventListener.$destroy(), viewport.unbind("resize", resizeHandler), viewport.unbind("scroll", scrollHandler), 
                    viewport.unbind("mousewheel", wheelHandler);
                }), eventListener.$on("update.items", function(event, locator, newItem) {
                    var wrapper, _fn, _i, _len, _ref;
                    if (angular.isFunction(locator)) for (_fn = function(wrapper) {
                        return locator(wrapper.scope);
                    }, _i = 0, _len = buffer.length; _i < _len; _i++) wrapper = buffer[_i], _fn(wrapper); else 0 <= (_ref = locator - first - 1) && _ref < buffer.length && (buffer[locator - first - 1].scope[itemName] = newItem);
                    return null;
                }), eventListener.$on("delete.items", function(event, locator) {
                    var i, item, temp, wrapper, _fn, _i, _j, _k, _len, _len1, _len2, _ref;
                    if (angular.isFunction(locator)) {
                        for (temp = [], _i = 0, _len = buffer.length; _i < _len; _i++) item = buffer[_i], 
                        temp.unshift(item);
                        for (_fn = function(wrapper) {
                            if (locator(wrapper.scope)) return removeFromBuffer(temp.length - 1 - i, temp.length - i), 
                            next--;
                        }, i = _j = 0, _len1 = temp.length; _j < _len1; i = ++_j) wrapper = temp[i], _fn(wrapper);
                    } else 0 <= (_ref = locator - first - 1) && _ref < buffer.length && (removeFromBuffer(locator - first - 1, locator - first), 
                    next--);
                    for (i = _k = 0, _len2 = buffer.length; _k < _len2; i = ++_k) item = buffer[i], 
                    item.scope.$index = first + i;
                    return adjustBuffer(null, !1);
                }), eventListener.$on("insert.item", function(event, locator, item) {
                    var i, inserted, _i, _len, _ref;
                    if (inserted = [], angular.isFunction(locator)) throw new Error("not implemented - Insert with locator function");
                    for (0 <= (_ref = locator - first - 1) && _ref < buffer.length && (inserted.push(insert(locator, item)), 
                    next++), i = _i = 0, _len = buffer.length; _i < _len; i = ++_i) item = buffer[i], 
                    item.scope.$index = first + i;
                    return adjustBuffer(null, !1, inserted);
                });
            };
        }
    };
} ]), angular.module("ui.scrollfix", []).directive("uiScrollfix", [ "$window", function($window) {
    "use strict";
    function getWindowScrollTop() {
        if (angular.isDefined($window.pageYOffset)) return $window.pageYOffset;
        var iebody = document.compatMode && "BackCompat" !== document.compatMode ? document.documentElement : document.body;
        return iebody.scrollTop;
    }
    return {
        require: "^?uiScrollfixTarget",
        link: function(scope, elm, attrs, uiScrollfixTarget) {
            function onScroll() {
                var limit = absolute ? attrs.uiScrollfix : elm[0].offsetTop + shift, offset = uiScrollfixTarget ? $target[0].scrollTop : getWindowScrollTop();
                !elm.hasClass("ui-scrollfix") && offset > limit ? (elm.addClass("ui-scrollfix"), 
                fixLimit = limit) : elm.hasClass("ui-scrollfix") && offset < fixLimit && elm.removeClass("ui-scrollfix");
            }
            var fixLimit, absolute = !0, shift = 0, $target = uiScrollfixTarget && uiScrollfixTarget.$element || angular.element($window);
            attrs.uiScrollfix ? "string" == typeof attrs.uiScrollfix && ("-" === attrs.uiScrollfix.charAt(0) ? (absolute = !1, 
            shift = -parseFloat(attrs.uiScrollfix.substr(1))) : "+" === attrs.uiScrollfix.charAt(0) && (absolute = !1, 
            shift = parseFloat(attrs.uiScrollfix.substr(1)))) : absolute = !1, fixLimit = absolute ? attrs.uiScrollfix : elm[0].offsetTop + shift, 
            $target.on("scroll", onScroll), scope.$on("$destroy", function() {
                $target.off("scroll", onScroll);
            });
        }
    };
} ]).directive("uiScrollfixTarget", [ function() {
    "use strict";
    return {
        controller: [ "$element", function($element) {
            this.$element = $element;
        } ]
    };
} ]), angular.module("ui.showhide", []).directive("uiShow", [ function() {
    "use strict";
    return function(scope, elm, attrs) {
        scope.$watch(attrs.uiShow, function(newVal) {
            newVal ? elm.addClass("ui-show") : elm.removeClass("ui-show");
        });
    };
} ]).directive("uiHide", [ function() {
    "use strict";
    return function(scope, elm, attrs) {
        scope.$watch(attrs.uiHide, function(newVal) {
            newVal ? elm.addClass("ui-hide") : elm.removeClass("ui-hide");
        });
    };
} ]).directive("uiToggle", [ function() {
    "use strict";
    return function(scope, elm, attrs) {
        scope.$watch(attrs.uiToggle, function(newVal) {
            newVal ? elm.removeClass("ui-hide").addClass("ui-show") : elm.removeClass("ui-show").addClass("ui-hide");
        });
    };
} ]), angular.module("ui.unique", []).filter("unique", [ "$parse", function($parse) {
    "use strict";
    return function(items, filterOn) {
        if (filterOn === !1) return items;
        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var newItems = [], get = angular.isString(filterOn) ? $parse(filterOn) : function(item) {
                return item;
            }, extractValueToCompare = function(item) {
                return angular.isObject(item) ? get(item) : item;
            };
            angular.forEach(items, function(item) {
                for (var isDuplicate = !1, i = 0; i < newItems.length; i++) if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                    isDuplicate = !0;
                    break;
                }
                isDuplicate || newItems.push(item);
            }), items = newItems;
        }
        return items;
    };
} ]), angular.module("ui.uploader", []).service("uiUploader", uiUploader), uiUploader.$inject = [ "$log" ], 
angular.module("ui.validate", []).directive("uiValidate", function() {
    "use strict";
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, elm, attrs, ctrl) {
            function apply_watch(watch) {
                return angular.isString(watch) ? void scope.$watch(watch, function() {
                    angular.forEach(validators, function(validatorFn) {
                        validatorFn(ctrl.$modelValue);
                    });
                }) : angular.isArray(watch) ? void angular.forEach(watch, function(expression) {
                    scope.$watch(expression, function() {
                        angular.forEach(validators, function(validatorFn) {
                            validatorFn(ctrl.$modelValue);
                        });
                    });
                }) : void (angular.isObject(watch) && angular.forEach(watch, function(expression, validatorKey) {
                    angular.isString(expression) && scope.$watch(expression, function() {
                        validators[validatorKey](ctrl.$modelValue);
                    }), angular.isArray(expression) && angular.forEach(expression, function(intExpression) {
                        scope.$watch(intExpression, function() {
                            validators[validatorKey](ctrl.$modelValue);
                        });
                    });
                }));
            }
            var validateFn, validators = {}, validateExpr = scope.$eval(attrs.uiValidate);
            validateExpr && (angular.isString(validateExpr) && (validateExpr = {
                validator: validateExpr
            }), angular.forEach(validateExpr, function(exprssn, key) {
                validateFn = function(valueToValidate) {
                    var expression = scope.$eval(exprssn, {
                        $value: valueToValidate
                    });
                    return angular.isObject(expression) && angular.isFunction(expression.then) ? (expression.then(function() {
                        ctrl.$setValidity(key, !0);
                    }, function() {
                        ctrl.$setValidity(key, !1);
                    }), valueToValidate) : expression ? (ctrl.$setValidity(key, !0), valueToValidate) : (ctrl.$setValidity(key, !1), 
                    valueToValidate);
                }, validators[key] = validateFn, ctrl.$formatters.push(validateFn), ctrl.$parsers.push(validateFn);
            }), attrs.uiValidateWatch && apply_watch(scope.$eval(attrs.uiValidateWatch)));
        }
    };
}), angular.module("ui.utils", [ "ui.event", "ui.format", "ui.highlight", "ui.include", "ui.indeterminate", "ui.inflector", "ui.jq", "ui.keypress", "ui.mask", "ui.reset", "ui.route", "ui.scrollfix", "ui.scroll", "ui.scroll.jqlite", "ui.showhide", "ui.unique", "ui.validate" ]), 
function(window, angular, undefined) {
    "use strict";
    angular.module("ngCookies", [ "ng" ]).factory("$cookies", [ "$rootScope", "$browser", function($rootScope, $browser) {
        function push() {
            var name, value, browserCookies, updated;
            for (name in lastCookies) isUndefined(cookies[name]) && $browser.cookies(name, undefined);
            for (name in cookies) value = cookies[name], angular.isString(value) || (value = "" + value, 
            cookies[name] = value), value !== lastCookies[name] && ($browser.cookies(name, value), 
            updated = !0);
            if (updated) {
                updated = !1, browserCookies = $browser.cookies();
                for (name in cookies) cookies[name] !== browserCookies[name] && (isUndefined(browserCookies[name]) ? delete cookies[name] : cookies[name] = browserCookies[name], 
                updated = !0);
            }
        }
        var lastBrowserCookies, cookies = {}, lastCookies = {}, runEval = !1, copy = angular.copy, isUndefined = angular.isUndefined;
        return $browser.addPollFn(function() {
            var currentCookies = $browser.cookies();
            lastBrowserCookies != currentCookies && (lastBrowserCookies = currentCookies, copy(currentCookies, lastCookies), 
            copy(currentCookies, cookies), runEval && $rootScope.$apply());
        })(), runEval = !0, $rootScope.$watch(push), cookies;
    } ]).factory("$cookieStore", [ "$cookies", function($cookies) {
        return {
            get: function(key) {
                var value = $cookies[key];
                return value ? angular.fromJson(value) : value;
            },
            put: function(key, value) {
                $cookies[key] = angular.toJson(value);
            },
            remove: function(key) {
                delete $cookies[key];
            }
        };
    } ]);
}(window, window.angular), angular.module("ivpusic.cookie", [ "ipCookie" ]), angular.module("ipCookie", [ "ng" ]).factory("ipCookie", [ "$document", function($document) {
    "use strict";
    function tryDecodeURIComponent(value) {
        try {
            return decodeURIComponent(value);
        } catch (e) {}
    }
    return function() {
        function cookieFun(key, value, options) {
            var cookies, list, i, cookie, pos, name, hasCookies, all, expiresFor;
            options = options || {};
            var dec = options.decode || tryDecodeURIComponent, enc = options.encode || encodeURIComponent;
            if (void 0 !== value) return value = "object" == typeof value ? JSON.stringify(value) : String(value), 
            "number" == typeof options.expires && (expiresFor = options.expires, options.expires = new Date(), 
            expiresFor === -1 ? options.expires = new Date("Thu, 01 Jan 1970 00:00:00 GMT") : void 0 !== options.expirationUnit ? "hours" === options.expirationUnit ? options.expires.setHours(options.expires.getHours() + expiresFor) : "minutes" === options.expirationUnit ? options.expires.setMinutes(options.expires.getMinutes() + expiresFor) : "seconds" === options.expirationUnit ? options.expires.setSeconds(options.expires.getSeconds() + expiresFor) : "milliseconds" === options.expirationUnit ? options.expires.setMilliseconds(options.expires.getMilliseconds() + expiresFor) : options.expires.setDate(options.expires.getDate() + expiresFor) : options.expires.setDate(options.expires.getDate() + expiresFor)), 
            $document[0].cookie = [ enc(key), "=", enc(value), options.expires ? "; expires=" + options.expires.toUTCString() : "", options.path ? "; path=" + options.path : "", options.domain ? "; domain=" + options.domain : "", options.secure ? "; secure" : "" ].join("");
            for (list = [], all = $document[0].cookie, all && (list = all.split("; ")), cookies = {}, 
            hasCookies = !1, i = 0; i < list.length; ++i) if (list[i]) {
                if (cookie = list[i], pos = cookie.indexOf("="), name = cookie.substring(0, pos), 
                value = dec(cookie.substring(pos + 1)), angular.isUndefined(value)) continue;
                if (void 0 === key || key === name) {
                    try {
                        cookies[name] = JSON.parse(value);
                    } catch (e) {
                        cookies[name] = value;
                    }
                    if (key === name) return cookies[name];
                    hasCookies = !0;
                }
            }
            return hasCookies && void 0 === key ? cookies : void 0;
        }
        return cookieFun.remove = function(key, options) {
            var hasCookie = void 0 !== cookieFun(key);
            return hasCookie && (options || (options = {}), options.expires = -1, cookieFun(key, "", options)), 
            hasCookie;
        }, cookieFun;
    }();
} ]), function() {
    "use strict";
    angular.module("angularLoad", []).service("angularLoad", [ "$document", "$q", "$timeout", function($document, $q, $timeout) {
        this.loadScript = function(src) {
            var deferred = $q.defer(), script = $document[0].createElement("script");
            return script.onload = script.onreadystatechange = function(e) {
                $timeout(function() {
                    deferred.resolve(e);
                });
            }, script.onerror = function(e) {
                $timeout(function() {
                    deferred.reject(e);
                });
            }, script.src = src, $document[0].body.appendChild(script), deferred.promise;
        }, this.loadCSS = function(href) {
            var deferred = $q.defer(), style = $document[0].createElement("link");
            return style.rel = "stylesheet", style.type = "text/css", style.href = href, style.onload = style.onreadystatechange = function(e) {
                $timeout(function() {
                    deferred.resolve(e);
                });
            }, style.onerror = function(e) {
                $timeout(function() {
                    deferred.reject(e);
                });
            }, $document[0].head.appendChild(style), deferred.promise;
        };
    } ]);
}(), function(root) {
    function _extend(target, source) {
        if (!source || "function" == typeof source) return target;
        for (var attr in source) target[attr] = source[attr];
        return target;
    }
    function _deepExtend(target, source) {
        for (var prop in source) prop in target ? _deepExtend(target[prop], source[prop]) : target[prop] = source[prop];
        return target;
    }
    function _each(object, callback, args) {
        var name, i = 0, length = object.length, isObj = void 0 === length || "[object Array]" !== Object.prototype.toString.apply(object) || "function" == typeof object;
        if (args) if (isObj) {
            for (name in object) if (callback.apply(object[name], args) === !1) break;
        } else for (;i < length && callback.apply(object[i++], args) !== !1; ) ; else if (isObj) {
            for (name in object) if (callback.call(object[name], name, object[name]) === !1) break;
        } else for (;i < length && callback.call(object[i], i, object[i++]) !== !1; ) ;
        return object;
    }
    function _escape(data) {
        return "string" == typeof data ? data.replace(/[&<>"'\/]/g, function(s) {
            return _entityMap[s];
        }) : data;
    }
    function _ajax(options) {
        var getXhr = function(callback) {
            if (window.XMLHttpRequest) return callback(null, new XMLHttpRequest());
            if (window.ActiveXObject) try {
                return callback(null, new ActiveXObject("Msxml2.XMLHTTP"));
            } catch (e) {
                return callback(null, new ActiveXObject("Microsoft.XMLHTTP"));
            }
            return callback(new Error());
        }, encodeUsingUrlEncoding = function(data) {
            if ("string" == typeof data) return data;
            var result = [];
            for (var dataItem in data) data.hasOwnProperty(dataItem) && result.push(encodeURIComponent(dataItem) + "=" + encodeURIComponent(data[dataItem]));
            return result.join("&");
        }, utf8 = function(text) {
            text = text.replace(/\r\n/g, "\n");
            for (var result = "", i = 0; i < text.length; i++) {
                var c = text.charCodeAt(i);
                c < 128 ? result += String.fromCharCode(c) : c > 127 && c < 2048 ? (result += String.fromCharCode(c >> 6 | 192), 
                result += String.fromCharCode(63 & c | 128)) : (result += String.fromCharCode(c >> 12 | 224), 
                result += String.fromCharCode(c >> 6 & 63 | 128), result += String.fromCharCode(63 & c | 128));
            }
            return result;
        }, base64 = function(text) {
            var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            text = utf8(text);
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4, result = "", i = 0;
            do chr1 = text.charCodeAt(i++), chr2 = text.charCodeAt(i++), chr3 = text.charCodeAt(i++), 
            enc1 = chr1 >> 2, enc2 = (3 & chr1) << 4 | chr2 >> 4, enc3 = (15 & chr2) << 2 | chr3 >> 6, 
            enc4 = 63 & chr3, isNaN(chr2) ? enc3 = enc4 = 64 : isNaN(chr3) && (enc4 = 64), result += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4), 
            chr1 = chr2 = chr3 = "", enc1 = enc2 = enc3 = enc4 = ""; while (i < text.length);
            return result;
        }, mergeHeaders = function() {
            for (var result = arguments[0], i = 1; i < arguments.length; i++) {
                var currentHeaders = arguments[i];
                for (var header in currentHeaders) currentHeaders.hasOwnProperty(header) && (result[header] = currentHeaders[header]);
            }
            return result;
        }, ajax = function(method, url, options, callback) {
            "function" == typeof options && (callback = options, options = {}), options.cache = options.cache || !1, 
            options.data = options.data || {}, options.headers = options.headers || {}, options.jsonp = options.jsonp || !1, 
            options.async = void 0 === options.async || options.async;
            var payload, headers = mergeHeaders({
                accept: "*/*",
                "content-type": "application/x-www-form-urlencoded;charset=UTF-8"
            }, ajax.headers, options.headers);
            if (payload = "application/json" === headers["content-type"] ? JSON.stringify(options.data) : encodeUsingUrlEncoding(options.data), 
            "GET" === method) {
                var queryString = [];
                if (payload && (queryString.push(payload), payload = null), options.cache || queryString.push("_=" + new Date().getTime()), 
                options.jsonp && (queryString.push("callback=" + options.jsonp), queryString.push("jsonp=" + options.jsonp)), 
                queryString = queryString.join("&"), queryString.length > 1 && (url += url.indexOf("?") > -1 ? "&" + queryString : "?" + queryString), 
                options.jsonp) {
                    var head = document.getElementsByTagName("head")[0], script = document.createElement("script");
                    return script.type = "text/javascript", script.src = url, void head.appendChild(script);
                }
            }
            getXhr(function(err, xhr) {
                if (err) return callback(err);
                xhr.open(method, url, options.async);
                for (var header in headers) headers.hasOwnProperty(header) && xhr.setRequestHeader(header, headers[header]);
                xhr.onreadystatechange = function() {
                    if (4 === xhr.readyState) {
                        var data = xhr.responseText || "";
                        if (!callback) return;
                        callback(xhr.status, {
                            text: function() {
                                return data;
                            },
                            json: function() {
                                try {
                                    return JSON.parse(data);
                                } catch (e) {
                                    return f.error("Can not parse JSON. URL: " + url), {};
                                }
                            }
                        });
                    }
                }, xhr.send(payload);
            });
        }, http = {
            authBasic: function(username, password) {
                ajax.headers.Authorization = "Basic " + base64(username + ":" + password);
            },
            connect: function(url, options, callback) {
                return ajax("CONNECT", url, options, callback);
            },
            del: function(url, options, callback) {
                return ajax("DELETE", url, options, callback);
            },
            get: function(url, options, callback) {
                return ajax("GET", url, options, callback);
            },
            head: function(url, options, callback) {
                return ajax("HEAD", url, options, callback);
            },
            headers: function(headers) {
                ajax.headers = headers || {};
            },
            isAllowed: function(url, verb, callback) {
                this.options(url, function(status, data) {
                    callback(data.text().indexOf(verb) !== -1);
                });
            },
            options: function(url, options, callback) {
                return ajax("OPTIONS", url, options, callback);
            },
            patch: function(url, options, callback) {
                return ajax("PATCH", url, options, callback);
            },
            post: function(url, options, callback) {
                return ajax("POST", url, options, callback);
            },
            put: function(url, options, callback) {
                return ajax("PUT", url, options, callback);
            },
            trace: function(url, options, callback) {
                return ajax("TRACE", url, options, callback);
            }
        }, methode = options.type ? options.type.toLowerCase() : "get";
        http[methode](options.url, options, function(status, data) {
            200 === status || 0 === status && data.text() ? options.success(data.json(), status, null) : options.error(data.text(), status, null);
        });
    }
    function init(options, cb) {
        "function" == typeof options && (cb = options, options = {}), options = options || {}, 
        f.extend(o, options), delete o.fixLng, o.functions && (delete o.functions, f.extend(f, options.functions)), 
        "string" == typeof o.ns && (o.ns = {
            namespaces: [ o.ns ],
            defaultNs: o.ns
        }), "string" == typeof o.fallbackNS && (o.fallbackNS = [ o.fallbackNS ]), "string" != typeof o.fallbackLng && "boolean" != typeof o.fallbackLng || (o.fallbackLng = [ o.fallbackLng ]), 
        o.interpolationPrefixEscaped = f.regexEscape(o.interpolationPrefix), o.interpolationSuffixEscaped = f.regexEscape(o.interpolationSuffix), 
        o.lng || (o.lng = f.detectLanguage()), languages = f.toLanguages(o.lng), currentLng = languages[0], 
        f.log("currentLng set to: " + currentLng), o.useCookie && f.cookie.read(o.cookieName) !== currentLng && f.cookie.create(o.cookieName, currentLng, o.cookieExpirationTime, o.cookieDomain), 
        o.detectLngFromLocalStorage && "undefined" != typeof document && window.localStorage && f.localStorage.setItem("i18next_lng", currentLng);
        var lngTranslate = translate;
        options.fixLng && (lngTranslate = function(key, options) {
            return options = options || {}, options.lng = options.lng || lngTranslate.lng, translate(key, options);
        }, lngTranslate.lng = currentLng), pluralExtensions.setCurrentLng(currentLng), $ && o.setJqueryExt && addJqueryFunct();
        var deferred;
        if ($ && $.Deferred && (deferred = $.Deferred()), o.resStore) {
            if (resStore = o.resStore, initialized = !0, cb && cb(lngTranslate), deferred && deferred.resolve(lngTranslate), 
            deferred) return deferred.promise();
        } else {
            var lngsToLoad = f.toLanguages(o.lng);
            "string" == typeof o.preload && (o.preload = [ o.preload ]);
            for (var i = 0, l = o.preload.length; i < l; i++) for (var pres = f.toLanguages(o.preload[i]), y = 0, len = pres.length; y < len; y++) lngsToLoad.indexOf(pres[y]) < 0 && lngsToLoad.push(pres[y]);
            if (i18n.sync.load(lngsToLoad, o, function(err, store) {
                resStore = store, initialized = !0, cb && cb(lngTranslate), deferred && deferred.resolve(lngTranslate);
            }), deferred) return deferred.promise();
        }
    }
    function isInitialized() {
        return initialized;
    }
    function preload(lngs, cb) {
        "string" == typeof lngs && (lngs = [ lngs ]);
        for (var i = 0, l = lngs.length; i < l; i++) o.preload.indexOf(lngs[i]) < 0 && o.preload.push(lngs[i]);
        return init(cb);
    }
    function addResourceBundle(lng, ns, resources, deep) {
        "string" != typeof ns ? (resources = ns, ns = o.ns.defaultNs) : o.ns.namespaces.indexOf(ns) < 0 && o.ns.namespaces.push(ns), 
        resStore[lng] = resStore[lng] || {}, resStore[lng][ns] = resStore[lng][ns] || {}, 
        deep ? f.deepExtend(resStore[lng][ns], resources) : f.extend(resStore[lng][ns], resources), 
        o.useLocalStorage && sync._storeLocal(resStore);
    }
    function hasResourceBundle(lng, ns) {
        "string" != typeof ns && (ns = o.ns.defaultNs), resStore[lng] = resStore[lng] || {};
        var res = resStore[lng][ns] || {}, hasValues = !1;
        for (var prop in res) res.hasOwnProperty(prop) && (hasValues = !0);
        return hasValues;
    }
    function getResourceBundle(lng, ns) {
        return "string" != typeof ns && (ns = o.ns.defaultNs), resStore[lng] = resStore[lng] || {}, 
        f.extend({}, resStore[lng][ns]);
    }
    function removeResourceBundle(lng, ns) {
        "string" != typeof ns && (ns = o.ns.defaultNs), resStore[lng] = resStore[lng] || {}, 
        resStore[lng][ns] = {}, o.useLocalStorage && sync._storeLocal(resStore);
    }
    function addResource(lng, ns, key, value) {
        "string" != typeof ns ? (resource = ns, ns = o.ns.defaultNs) : o.ns.namespaces.indexOf(ns) < 0 && o.ns.namespaces.push(ns), 
        resStore[lng] = resStore[lng] || {}, resStore[lng][ns] = resStore[lng][ns] || {};
        for (var keys = key.split(o.keyseparator), x = 0, node = resStore[lng][ns]; keys[x]; ) x == keys.length - 1 ? node[keys[x]] = value : (null == node[keys[x]] && (node[keys[x]] = {}), 
        node = node[keys[x]]), x++;
        o.useLocalStorage && sync._storeLocal(resStore);
    }
    function addResources(lng, ns, resources) {
        "string" != typeof ns ? (resource = ns, ns = o.ns.defaultNs) : o.ns.namespaces.indexOf(ns) < 0 && o.ns.namespaces.push(ns);
        for (var m in resources) "string" == typeof resources[m] && addResource(lng, ns, m, resources[m]);
    }
    function setDefaultNamespace(ns) {
        o.ns.defaultNs = ns;
    }
    function loadNamespace(namespace, cb) {
        loadNamespaces([ namespace ], cb);
    }
    function loadNamespaces(namespaces, cb) {
        var opts = {
            dynamicLoad: o.dynamicLoad,
            resGetPath: o.resGetPath,
            getAsync: o.getAsync,
            customLoad: o.customLoad,
            ns: {
                namespaces: namespaces,
                defaultNs: ""
            }
        }, lngsToLoad = f.toLanguages(o.lng);
        "string" == typeof o.preload && (o.preload = [ o.preload ]);
        for (var i = 0, l = o.preload.length; i < l; i++) for (var pres = f.toLanguages(o.preload[i]), y = 0, len = pres.length; y < len; y++) lngsToLoad.indexOf(pres[y]) < 0 && lngsToLoad.push(pres[y]);
        for (var lngNeedLoad = [], a = 0, lenA = lngsToLoad.length; a < lenA; a++) {
            var needLoad = !1, resSet = resStore[lngsToLoad[a]];
            if (resSet) for (var b = 0, lenB = namespaces.length; b < lenB; b++) resSet[namespaces[b]] || (needLoad = !0); else needLoad = !0;
            needLoad && lngNeedLoad.push(lngsToLoad[a]);
        }
        lngNeedLoad.length ? i18n.sync._fetch(lngNeedLoad, opts, function(err, store) {
            var todo = namespaces.length * lngNeedLoad.length;
            f.each(namespaces, function(nsIndex, nsValue) {
                o.ns.namespaces.indexOf(nsValue) < 0 && o.ns.namespaces.push(nsValue), f.each(lngNeedLoad, function(lngIndex, lngValue) {
                    resStore[lngValue] = resStore[lngValue] || {}, resStore[lngValue][nsValue] = store[lngValue][nsValue], 
                    todo--, 0 === todo && cb && (o.useLocalStorage && i18n.sync._storeLocal(resStore), 
                    cb());
                });
            });
        }) : cb && cb();
    }
    function setLng(lng, options, cb) {
        return "function" == typeof options ? (cb = options, options = {}) : options || (options = {}), 
        options.lng = lng, init(options, cb);
    }
    function lng() {
        return currentLng;
    }
    function reload(cb) {
        resStore = {}, setLng(currentLng, cb);
    }
    function noConflict() {
        window.i18next = window.i18n, conflictReference ? window.i18n = conflictReference : delete window.i18n;
    }
    function addJqueryFunct() {
        function parse(ele, key, options) {
            if (0 !== key.length) {
                var attr = "text";
                if (0 === key.indexOf("[")) {
                    var parts = key.split("]");
                    key = parts[1], attr = parts[0].substr(1, parts[0].length - 1);
                }
                key.indexOf(";") === key.length - 1 && (key = key.substr(0, key.length - 2));
                var optionsToUse;
                if ("html" === attr) optionsToUse = o.defaultValueFromContent ? $.extend({
                    defaultValue: ele.html()
                }, options) : options, ele.html($.t(key, optionsToUse)); else if ("text" === attr) optionsToUse = o.defaultValueFromContent ? $.extend({
                    defaultValue: ele.text()
                }, options) : options, ele.text($.t(key, optionsToUse)); else if ("prepend" === attr) optionsToUse = o.defaultValueFromContent ? $.extend({
                    defaultValue: ele.html()
                }, options) : options, ele.prepend($.t(key, optionsToUse)); else if ("append" === attr) optionsToUse = o.defaultValueFromContent ? $.extend({
                    defaultValue: ele.html()
                }, options) : options, ele.append($.t(key, optionsToUse)); else if (0 === attr.indexOf("data-")) {
                    var dataAttr = attr.substr("data-".length);
                    optionsToUse = o.defaultValueFromContent ? $.extend({
                        defaultValue: ele.data(dataAttr)
                    }, options) : options;
                    var translated = $.t(key, optionsToUse);
                    ele.data(dataAttr, translated), ele.attr(attr, translated);
                } else optionsToUse = o.defaultValueFromContent ? $.extend({
                    defaultValue: ele.attr(attr)
                }, options) : options, ele.attr(attr, $.t(key, optionsToUse));
            }
        }
        function localize(ele, options) {
            var key = ele.attr(o.selectorAttr);
            if (key || "undefined" == typeof key || key === !1 || (key = ele.text() || ele.val()), 
            key) {
                var target = ele, targetSelector = ele.data("i18n-target");
                if (targetSelector && (target = ele.find(targetSelector) || ele), options || o.useDataAttrOptions !== !0 || (options = ele.data("i18n-options")), 
                options = options || {}, key.indexOf(";") >= 0) {
                    var keys = key.split(";");
                    $.each(keys, function(m, k) {
                        "" !== k && parse(target, k, options);
                    });
                } else parse(target, key, options);
                o.useDataAttrOptions === !0 && ele.data("i18n-options", options);
            }
        }
        $.t = $.t || translate, $.fn.i18n = function(options) {
            return this.each(function() {
                localize($(this), options);
                var elements = $(this).find("[" + o.selectorAttr + "]");
                elements.each(function() {
                    localize($(this), options);
                });
            });
        };
    }
    function applyReplacement(str, replacementHash, nestedKey, options) {
        if (!str) return str;
        if (options = options || replacementHash, str.indexOf(options.interpolationPrefix || o.interpolationPrefix) < 0) return str;
        var prefix = options.interpolationPrefix ? f.regexEscape(options.interpolationPrefix) : o.interpolationPrefixEscaped, suffix = options.interpolationSuffix ? f.regexEscape(options.interpolationSuffix) : o.interpolationSuffixEscaped, unEscapingSuffix = "HTML" + suffix, hash = replacementHash.replace && "object" == typeof replacementHash.replace ? replacementHash.replace : replacementHash;
        return f.each(hash, function(key, value) {
            var nextKey = nestedKey ? nestedKey + o.keyseparator + key : key;
            "object" == typeof value && null !== value ? str = applyReplacement(str, value, nextKey, options) : options.escapeInterpolation || o.escapeInterpolation ? (str = str.replace(new RegExp([ prefix, nextKey, unEscapingSuffix ].join(""), "g"), f.regexReplacementEscape(value)), 
            str = str.replace(new RegExp([ prefix, nextKey, suffix ].join(""), "g"), f.regexReplacementEscape(f.escape(value)))) : str = str.replace(new RegExp([ prefix, nextKey, suffix ].join(""), "g"), f.regexReplacementEscape(value));
        }), str;
    }
    function applyReuse(translated, options) {
        var comma = ",", options_open = "{", options_close = "}", opts = f.extend({}, options);
        for (delete opts.postProcess; translated.indexOf(o.reusePrefix) != -1 && (replacementCounter++, 
        !(replacementCounter > o.maxRecursion)); ) {
            var index_of_opening = translated.lastIndexOf(o.reusePrefix), index_of_end_of_closing = translated.indexOf(o.reuseSuffix, index_of_opening) + o.reuseSuffix.length, token = translated.substring(index_of_opening, index_of_end_of_closing), token_without_symbols = token.replace(o.reusePrefix, "").replace(o.reuseSuffix, "");
            if (index_of_end_of_closing <= index_of_opening) return f.error("there is an missing closing in following translation value", translated), 
            "";
            if (token_without_symbols.indexOf(comma) != -1) {
                var index_of_token_end_of_closing = token_without_symbols.indexOf(comma);
                if (token_without_symbols.indexOf(options_open, index_of_token_end_of_closing) != -1 && token_without_symbols.indexOf(options_close, index_of_token_end_of_closing) != -1) {
                    var index_of_opts_opening = token_without_symbols.indexOf(options_open, index_of_token_end_of_closing), index_of_opts_end_of_closing = token_without_symbols.indexOf(options_close, index_of_opts_opening) + options_close.length;
                    try {
                        opts = f.extend(opts, JSON.parse(token_without_symbols.substring(index_of_opts_opening, index_of_opts_end_of_closing))), 
                        token_without_symbols = token_without_symbols.substring(0, index_of_token_end_of_closing);
                    } catch (e) {}
                }
            }
            var translated_token = _translate(token_without_symbols, opts);
            translated = translated.replace(token, f.regexReplacementEscape(translated_token));
        }
        return translated;
    }
    function hasContext(options) {
        return options.context && ("string" == typeof options.context || "number" == typeof options.context);
    }
    function needsPlural(options, lng) {
        return void 0 !== options.count && "string" != typeof options.count;
    }
    function needsIndefiniteArticle(options) {
        return void 0 !== options.indefinite_article && "string" != typeof options.indefinite_article && options.indefinite_article;
    }
    function exists(key, options) {
        options = options || {};
        var notFound = _getDefaultValue(key, options), found = _find(key, options);
        return void 0 !== found || found === notFound;
    }
    function translate(key, options) {
        return options = options || {}, initialized ? (replacementCounter = 0, _translate.apply(null, arguments)) : (f.log("i18next not finished initialization. you might have called t function before loading resources finished."), 
        options.defaultValue || "");
    }
    function _getDefaultValue(key, options) {
        return void 0 !== options.defaultValue ? options.defaultValue : key;
    }
    function _injectSprintfProcessor() {
        for (var values = [], i = 1; i < arguments.length; i++) values.push(arguments[i]);
        return {
            postProcess: "sprintf",
            sprintf: values
        };
    }
    function _translate(potentialKeys, options) {
        if (options && "object" != typeof options ? "sprintf" === o.shortcutFunction ? options = _injectSprintfProcessor.apply(null, arguments) : "defaultValue" === o.shortcutFunction && (options = {
            defaultValue: options
        }) : options = options || {}, "object" == typeof o.defaultVariables && (options = f.extend({}, o.defaultVariables, options)), 
        void 0 === potentialKeys || null === potentialKeys || "" === potentialKeys) return "";
        "number" == typeof potentialKeys && (potentialKeys = String(potentialKeys)), "string" == typeof potentialKeys && (potentialKeys = [ potentialKeys ]);
        var key = potentialKeys[0];
        if (potentialKeys.length > 1) for (var i = 0; i < potentialKeys.length && (key = potentialKeys[i], 
        !exists(key, options)); i++) ;
        var parts, notFound = _getDefaultValue(key, options), found = _find(key, options), lngs = options.lng ? f.toLanguages(options.lng, options.fallbackLng) : languages, ns = options.ns || o.ns.defaultNs;
        key.indexOf(o.nsseparator) > -1 && (parts = key.split(o.nsseparator), ns = parts[0], 
        key = parts[1]), void 0 === found && o.sendMissing && "function" == typeof o.missingKeyHandler && (options.lng ? o.missingKeyHandler(lngs[0], ns, key, notFound, lngs) : o.missingKeyHandler(o.lng, ns, key, notFound, lngs));
        var postProcessorsToApply;
        postProcessorsToApply = "string" == typeof o.postProcess && "" !== o.postProcess ? [ o.postProcess ] : "array" == typeof o.postProcess || "object" == typeof o.postProcess ? o.postProcess : [], 
        "string" == typeof options.postProcess && "" !== options.postProcess ? postProcessorsToApply = postProcessorsToApply.concat([ options.postProcess ]) : "array" != typeof options.postProcess && "object" != typeof options.postProcess || (postProcessorsToApply = postProcessorsToApply.concat(options.postProcess)), 
        void 0 !== found && postProcessorsToApply.length && postProcessorsToApply.forEach(function(postProcessor) {
            postProcessors[postProcessor] && (found = postProcessors[postProcessor](found, key, options));
        });
        var splitNotFound = notFound;
        if (notFound.indexOf(o.nsseparator) > -1 && (parts = notFound.split(o.nsseparator), 
        splitNotFound = parts[1]), splitNotFound === key && o.parseMissingKey && (notFound = o.parseMissingKey(notFound)), 
        void 0 === found && (notFound = applyReplacement(notFound, options), notFound = applyReuse(notFound, options), 
        postProcessorsToApply.length)) {
            var val = _getDefaultValue(key, options);
            postProcessorsToApply.forEach(function(postProcessor) {
                postProcessors[postProcessor] && (found = postProcessors[postProcessor](val, key, options));
            });
        }
        return void 0 !== found ? found : notFound;
    }
    function _find(key, options) {
        options = options || {};
        var optionWithoutCount, translated, notFound = _getDefaultValue(key, options), lngs = languages;
        if (!resStore) return notFound;
        if ("cimode" === lngs[0].toLowerCase()) return notFound;
        if (options.lngs && (lngs = options.lngs), options.lng && (lngs = f.toLanguages(options.lng, options.fallbackLng), 
        !resStore[lngs[0]])) {
            var oldAsync = o.getAsync;
            o.getAsync = !1, i18n.sync.load(lngs, o, function(err, store) {
                f.extend(resStore, store), o.getAsync = oldAsync;
            });
        }
        var ns = options.ns || o.ns.defaultNs;
        if (key.indexOf(o.nsseparator) > -1) {
            var parts = key.split(o.nsseparator);
            ns = parts[0], key = parts[1];
        }
        if (hasContext(options)) {
            optionWithoutCount = f.extend({}, options), delete optionWithoutCount.context, optionWithoutCount.defaultValue = o.contextNotFound;
            var contextKey = ns + o.nsseparator + key + "_" + options.context;
            if (translated = translate(contextKey, optionWithoutCount), translated != o.contextNotFound) return applyReplacement(translated, {
                context: options.context
            });
        }
        if (needsPlural(options, lngs[0])) {
            optionWithoutCount = f.extend({
                lngs: [ lngs[0] ]
            }, options), delete optionWithoutCount.count, optionWithoutCount._origLng = optionWithoutCount._origLng || optionWithoutCount.lng || lngs[0], 
            delete optionWithoutCount.lng, optionWithoutCount.defaultValue = o.pluralNotFound;
            var pluralKey;
            if (pluralExtensions.needsPlural(lngs[0], options.count)) {
                pluralKey = ns + o.nsseparator + key + o.pluralSuffix;
                var pluralExtension = pluralExtensions.get(lngs[0], options.count);
                pluralExtension >= 0 ? pluralKey = pluralKey + "_" + pluralExtension : 1 === pluralExtension && (pluralKey = ns + o.nsseparator + key);
            } else pluralKey = ns + o.nsseparator + key;
            if (translated = translate(pluralKey, optionWithoutCount), translated != o.pluralNotFound) return applyReplacement(translated, {
                count: options.count,
                interpolationPrefix: options.interpolationPrefix,
                interpolationSuffix: options.interpolationSuffix
            });
            if (!(lngs.length > 1)) return optionWithoutCount.lng = optionWithoutCount._origLng, 
            delete optionWithoutCount._origLng, translated = translate(ns + o.nsseparator + key, optionWithoutCount), 
            applyReplacement(translated, {
                count: options.count,
                interpolationPrefix: options.interpolationPrefix,
                interpolationSuffix: options.interpolationSuffix
            });
            var clone = lngs.slice();
            if (clone.shift(), options = f.extend(options, {
                lngs: clone
            }), options._origLng = optionWithoutCount._origLng, delete options.lng, translated = translate(ns + o.nsseparator + key, options), 
            translated != o.pluralNotFound) return translated;
        }
        if (needsIndefiniteArticle(options)) {
            var optionsWithoutIndef = f.extend({}, options);
            delete optionsWithoutIndef.indefinite_article, optionsWithoutIndef.defaultValue = o.indefiniteNotFound;
            var indefiniteKey = ns + o.nsseparator + key + (options.count && !needsPlural(options, lngs[0]) || !options.count ? o.indefiniteSuffix : "");
            if (translated = translate(indefiniteKey, optionsWithoutIndef), translated != o.indefiniteNotFound) return translated;
        }
        for (var found, keys = key.split(o.keyseparator), i = 0, len = lngs.length; i < len && void 0 === found; i++) {
            for (var l = lngs[i], x = 0, value = resStore[l] && resStore[l][ns]; keys[x]; ) value = value && value[keys[x]], 
            x++;
            if (void 0 !== value && (!o.showKeyIfEmpty || "" !== value)) {
                var valueType = Object.prototype.toString.apply(value);
                if ("string" == typeof value) value = applyReplacement(value, options), value = applyReuse(value, options); else if ("[object Array]" !== valueType || o.returnObjectTrees || options.returnObjectTrees) {
                    if (null === value && o.fallbackOnNull === !0) value = void 0; else if (null !== value) if (o.returnObjectTrees || options.returnObjectTrees) {
                        if ("[object Number]" !== valueType && "[object Function]" !== valueType && "[object RegExp]" !== valueType) {
                            var copy = "[object Array]" === valueType ? [] : {};
                            f.each(value, function(m) {
                                copy[m] = _translate(ns + o.nsseparator + key + o.keyseparator + m, options);
                            }), value = copy;
                        }
                    } else o.objectTreeKeyHandler && "function" == typeof o.objectTreeKeyHandler ? value = o.objectTreeKeyHandler(key, value, l, ns, options) : (value = "key '" + ns + ":" + key + " (" + l + ")' returned an object instead of string.", 
                    f.log(value));
                } else value = value.join("\n"), value = applyReplacement(value, options), value = applyReuse(value, options);
                "string" == typeof value && "" === value.trim() && o.fallbackOnEmpty === !0 && (value = void 0), 
                found = value;
            }
        }
        if (void 0 === found && !options.isFallbackLookup && (o.fallbackToDefaultNS === !0 || o.fallbackNS && o.fallbackNS.length > 0)) {
            if (options.isFallbackLookup = !0, o.fallbackNS.length) {
                for (var y = 0, lenY = o.fallbackNS.length; y < lenY; y++) if (found = _find(o.fallbackNS[y] + o.nsseparator + key, options), 
                found || "" === found && o.fallbackOnEmpty === !1) {
                    var foundValue = found.indexOf(o.nsseparator) > -1 ? found.split(o.nsseparator)[1] : found, notFoundValue = notFound.indexOf(o.nsseparator) > -1 ? notFound.split(o.nsseparator)[1] : notFound;
                    if (foundValue !== notFoundValue) break;
                }
            } else options.ns = o.ns.defaultNs, found = _find(key, options);
            options.isFallbackLookup = !1;
        }
        return found;
    }
    function detectLanguage() {
        var detectedLng, whitelist = o.lngWhitelist || [], userLngChoices = [];
        if ("undefined" != typeof window && !function() {
            for (var query = window.location.search.substring(1), params = query.split("&"), i = 0; i < params.length; i++) {
                var pos = params[i].indexOf("=");
                if (pos > 0) {
                    var key = params[i].substring(0, pos);
                    key == o.detectLngQS && userLngChoices.push(params[i].substring(pos + 1));
                }
            }
        }(), o.useCookie && "undefined" != typeof document) {
            var c = f.cookie.read(o.cookieName);
            c && userLngChoices.push(c);
        }
        if (o.detectLngFromLocalStorage && "undefined" != typeof window && window.localStorage) {
            var lang = f.localStorage.getItem("i18next_lng");
            lang && userLngChoices.push(lang);
        }
        if ("undefined" != typeof navigator) {
            if (navigator.languages) for (var i = 0; i < navigator.languages.length; i++) userLngChoices.push(navigator.languages[i]);
            navigator.userLanguage && userLngChoices.push(navigator.userLanguage), navigator.language && userLngChoices.push(navigator.language);
        }
        return function() {
            for (var i = 0; i < userLngChoices.length; i++) {
                var lng = userLngChoices[i];
                if (lng.indexOf("-") > -1) {
                    var parts = lng.split("-");
                    lng = o.lowerCaseLng ? parts[0].toLowerCase() + "-" + parts[1].toLowerCase() : parts[0].toLowerCase() + "-" + parts[1].toUpperCase();
                }
                if (0 === whitelist.length || whitelist.indexOf(lng) > -1) {
                    detectedLng = lng;
                    break;
                }
            }
        }(), detectedLng || (detectedLng = o.fallbackLng[0]), detectedLng;
    }
    Array.prototype.indexOf || (Array.prototype.indexOf = function(searchElement) {
        "use strict";
        if (null == this) throw new TypeError();
        var t = Object(this), len = t.length >>> 0;
        if (0 === len) return -1;
        var n = 0;
        if (arguments.length > 0 && (n = Number(arguments[1]), n != n ? n = 0 : 0 != n && n != 1 / 0 && n != -(1 / 0) && (n = (n > 0 || -1) * Math.floor(Math.abs(n)))), 
        n >= len) return -1;
        for (var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) if (k in t && t[k] === searchElement) return k;
        return -1;
    }), Array.prototype.lastIndexOf || (Array.prototype.lastIndexOf = function(searchElement) {
        "use strict";
        if (null == this) throw new TypeError();
        var t = Object(this), len = t.length >>> 0;
        if (0 === len) return -1;
        var n = len;
        arguments.length > 1 && (n = Number(arguments[1]), n != n ? n = 0 : 0 != n && n != 1 / 0 && n != -(1 / 0) && (n = (n > 0 || -1) * Math.floor(Math.abs(n))));
        for (var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n); k >= 0; k--) if (k in t && t[k] === searchElement) return k;
        return -1;
    }), "function" != typeof String.prototype.trim && (String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, "");
    });
    var currentLng, $ = root.jQuery || root.Zepto, i18n = {}, resStore = {}, replacementCounter = 0, languages = [], initialized = !1, sync = {}, conflictReference = null;
    "undefined" != typeof module && module.exports ? module.exports = i18n : ($ && ($.i18n = $.i18n || i18n), 
    root.i18n && (conflictReference = root.i18n), root.i18n = i18n), sync = {
        load: function(lngs, options, cb) {
            options.useLocalStorage ? sync._loadLocal(lngs, options, function(err, store) {
                for (var missingLngs = [], i = 0, len = lngs.length; i < len; i++) store[lngs[i]] || missingLngs.push(lngs[i]);
                missingLngs.length > 0 ? sync._fetch(missingLngs, options, function(err, fetched) {
                    f.extend(store, fetched), sync._storeLocal(fetched), cb(null, store);
                }) : cb(null, store);
            }) : sync._fetch(lngs, options, function(err, store) {
                cb(null, store);
            });
        },
        _loadLocal: function(lngs, options, cb) {
            var store = {}, nowMS = new Date().getTime();
            if (window.localStorage) {
                var todo = lngs.length;
                f.each(lngs, function(key, lng) {
                    var local = f.localStorage.getItem("res_" + lng);
                    local && (local = JSON.parse(local), local.i18nStamp && local.i18nStamp + options.localStorageExpirationTime > nowMS && (store[lng] = local)), 
                    todo--, 0 === todo && cb(null, store);
                });
            }
        },
        _storeLocal: function(store) {
            if (window.localStorage) for (var m in store) store[m].i18nStamp = new Date().getTime(), 
            f.localStorage.setItem("res_" + m, JSON.stringify(store[m]));
        },
        _fetch: function(lngs, options, cb) {
            var ns = options.ns, store = {};
            if (options.dynamicLoad) {
                var loadComplete = function(err, data) {
                    cb(null, data);
                };
                if ("function" == typeof options.customLoad) options.customLoad(lngs, ns.namespaces, options, loadComplete); else {
                    var url = applyReplacement(options.resGetPath, {
                        lng: lngs.join("+"),
                        ns: ns.namespaces.join("+")
                    });
                    f.ajax({
                        url: url,
                        cache: options.cache,
                        success: function(data, status, xhr) {
                            f.log("loaded: " + url), loadComplete(null, data);
                        },
                        error: function(xhr, status, error) {
                            f.log("failed loading: " + url), loadComplete("failed loading resource.json error: " + error);
                        },
                        dataType: "json",
                        async: options.getAsync,
                        timeout: options.ajaxTimeout
                    });
                }
            } else {
                var errors, todo = ns.namespaces.length * lngs.length;
                f.each(ns.namespaces, function(nsIndex, nsValue) {
                    f.each(lngs, function(lngIndex, lngValue) {
                        var loadComplete = function(err, data) {
                            err && (errors = errors || [], errors.push(err)), store[lngValue] = store[lngValue] || {}, 
                            store[lngValue][nsValue] = data, todo--, 0 === todo && cb(errors, store);
                        };
                        "function" == typeof options.customLoad ? options.customLoad(lngValue, nsValue, options, loadComplete) : sync._fetchOne(lngValue, nsValue, options, loadComplete);
                    });
                });
            }
        },
        _fetchOne: function(lng, ns, options, done) {
            var url = applyReplacement(options.resGetPath, {
                lng: lng,
                ns: ns
            });
            f.ajax({
                url: url,
                cache: options.cache,
                success: function(data, status, xhr) {
                    f.log("loaded: " + url), done(null, data);
                },
                error: function(xhr, status, error) {
                    if (status && 200 == status || xhr && xhr.status && 200 == xhr.status) f.error("There is a typo in: " + url); else if (status && 404 == status || xhr && xhr.status && 404 == xhr.status) f.log("Does not exist: " + url); else {
                        var theStatus = status ? status : xhr && xhr.status ? xhr.status : null;
                        f.log(theStatus + " when loading " + url);
                    }
                    done(error, {});
                },
                dataType: "json",
                async: options.getAsync,
                timeout: options.ajaxTimeout
            });
        },
        postMissing: function(lng, ns, key, defaultValue, lngs) {
            var payload = {};
            payload[key] = defaultValue;
            var urls = [];
            if ("fallback" === o.sendMissingTo && o.fallbackLng[0] !== !1) for (var i = 0; i < o.fallbackLng.length; i++) urls.push({
                lng: o.fallbackLng[i],
                url: applyReplacement(o.resPostPath, {
                    lng: o.fallbackLng[i],
                    ns: ns
                })
            }); else if ("current" === o.sendMissingTo || "fallback" === o.sendMissingTo && o.fallbackLng[0] === !1) urls.push({
                lng: lng,
                url: applyReplacement(o.resPostPath, {
                    lng: lng,
                    ns: ns
                })
            }); else if ("all" === o.sendMissingTo) for (var i = 0, l = lngs.length; i < l; i++) urls.push({
                lng: lngs[i],
                url: applyReplacement(o.resPostPath, {
                    lng: lngs[i],
                    ns: ns
                })
            });
            for (var y = 0, len = urls.length; y < len; y++) {
                var item = urls[y];
                f.ajax({
                    url: item.url,
                    type: o.sendType,
                    data: payload,
                    success: function(data, status, xhr) {
                        f.log("posted missing key '" + key + "' to: " + item.url);
                        for (var keys = key.split("."), x = 0, value = resStore[item.lng][ns]; keys[x]; ) value = x === keys.length - 1 ? value[keys[x]] = defaultValue : value[keys[x]] = value[keys[x]] || {}, 
                        x++;
                    },
                    error: function(xhr, status, error) {
                        f.log("failed posting missing key '" + key + "' to: " + item.url);
                    },
                    dataType: "json",
                    async: o.postAsync,
                    timeout: o.ajaxTimeout
                });
            }
        },
        reload: reload
    };
    var o = {
        lng: void 0,
        load: "all",
        preload: [],
        lowerCaseLng: !1,
        returnObjectTrees: !1,
        fallbackLng: [ "dev" ],
        fallbackNS: [],
        detectLngQS: "setLng",
        detectLngFromLocalStorage: !1,
        ns: {
            namespaces: [ "translation" ],
            defaultNs: "translation"
        },
        fallbackOnNull: !0,
        fallbackOnEmpty: !1,
        fallbackToDefaultNS: !1,
        showKeyIfEmpty: !1,
        nsseparator: ":",
        keyseparator: ".",
        selectorAttr: "data-i18n",
        debug: !1,
        resGetPath: "locales/__lng__/__ns__.json",
        resPostPath: "locales/add/__lng__/__ns__",
        getAsync: !0,
        postAsync: !0,
        resStore: void 0,
        useLocalStorage: !1,
        localStorageExpirationTime: 6048e5,
        dynamicLoad: !1,
        sendMissing: !1,
        sendMissingTo: "fallback",
        sendType: "POST",
        interpolationPrefix: "__",
        interpolationSuffix: "__",
        defaultVariables: !1,
        reusePrefix: "$t(",
        reuseSuffix: ")",
        pluralSuffix: "_plural",
        pluralNotFound: [ "plural_not_found", Math.random() ].join(""),
        contextNotFound: [ "context_not_found", Math.random() ].join(""),
        escapeInterpolation: !1,
        indefiniteSuffix: "_indefinite",
        indefiniteNotFound: [ "indefinite_not_found", Math.random() ].join(""),
        setJqueryExt: !0,
        defaultValueFromContent: !0,
        useDataAttrOptions: !1,
        cookieExpirationTime: void 0,
        useCookie: !0,
        cookieName: "i18next",
        cookieDomain: void 0,
        objectTreeKeyHandler: void 0,
        postProcess: void 0,
        parseMissingKey: void 0,
        missingKeyHandler: sync.postMissing,
        ajaxTimeout: 0,
        shortcutFunction: "sprintf"
    }, _entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;"
    }, _cookie = {
        create: function(name, value, minutes, domain) {
            var expires;
            if (minutes) {
                var date = new Date();
                date.setTime(date.getTime() + 60 * minutes * 1e3), expires = "; expires=" + date.toGMTString();
            } else expires = "";
            domain = domain ? "domain=" + domain + ";" : "", document.cookie = name + "=" + value + expires + ";" + domain + "path=/";
        },
        read: function(name) {
            for (var nameEQ = name + "=", ca = document.cookie.split(";"), i = 0; i < ca.length; i++) {
                for (var c = ca[i]; " " == c.charAt(0); ) c = c.substring(1, c.length);
                if (0 === c.indexOf(nameEQ)) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },
        remove: function(name) {
            this.create(name, "", -1);
        }
    }, cookie_noop = {
        create: function(name, value, minutes, domain) {},
        read: function(name) {
            return null;
        },
        remove: function(name) {}
    }, f = {
        extend: $ ? $.extend : _extend,
        deepExtend: _deepExtend,
        each: $ ? $.each : _each,
        ajax: $ ? $.ajax : "undefined" != typeof document ? _ajax : function() {},
        cookie: "undefined" != typeof document ? _cookie : cookie_noop,
        detectLanguage: detectLanguage,
        escape: _escape,
        log: function(str) {
            o.debug && "undefined" != typeof console && console.log(str);
        },
        error: function(str) {
            "undefined" != typeof console && console.error(str);
        },
        getCountyIndexOfLng: function(lng) {
            var lng_index = 0;
            return "nb-NO" !== lng && "nn-NO" !== lng && "nb-no" !== lng && "nn-no" !== lng || (lng_index = 1), 
            lng_index;
        },
        toLanguages: function(lng) {
            function applyCase(l) {
                var ret = l;
                if ("string" == typeof l && l.indexOf("-") > -1) {
                    var parts = l.split("-");
                    ret = o.lowerCaseLng ? parts[0].toLowerCase() + "-" + parts[1].toLowerCase() : parts[0].toLowerCase() + "-" + parts[1].toUpperCase();
                } else ret = o.lowerCaseLng ? l.toLowerCase() : l;
                return ret;
            }
            var log = this.log, languages = [], whitelist = o.lngWhitelist || !1, addLanguage = function(language) {
                !whitelist || whitelist.indexOf(language) > -1 ? languages.push(language) : log("rejecting non-whitelisted language: " + language);
            };
            if ("string" == typeof lng && lng.indexOf("-") > -1) {
                var parts = lng.split("-");
                "unspecific" !== o.load && addLanguage(applyCase(lng)), "current" !== o.load && addLanguage(applyCase(parts[this.getCountyIndexOfLng(lng)]));
            } else addLanguage(applyCase(lng));
            for (var i = 0; i < o.fallbackLng.length; i++) languages.indexOf(o.fallbackLng[i]) === -1 && o.fallbackLng[i] && languages.push(applyCase(o.fallbackLng[i]));
            return languages;
        },
        regexEscape: function(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },
        regexReplacementEscape: function(strOrFn) {
            return "string" == typeof strOrFn ? strOrFn.replace(/\$/g, "$$$$") : strOrFn;
        },
        localStorage: {
            setItem: function(key, value) {
                if (window.localStorage) try {
                    window.localStorage.setItem(key, value);
                } catch (e) {
                    f.log('failed to set value for key "' + key + '" to localStorage.');
                }
            },
            getItem: function(key, value) {
                if (window.localStorage) try {
                    return window.localStorage.getItem(key, value);
                } catch (e) {
                    return void f.log('failed to get value for key "' + key + '" from localStorage.');
                }
            }
        }
    };
    f.applyReplacement = applyReplacement;
    var _rules = [ [ "ach", "Acholi", [ 1, 2 ], 1 ], [ "af", "Afrikaans", [ 1, 2 ], 2 ], [ "ak", "Akan", [ 1, 2 ], 1 ], [ "am", "Amharic", [ 1, 2 ], 1 ], [ "an", "Aragonese", [ 1, 2 ], 2 ], [ "ar", "Arabic", [ 0, 1, 2, 3, 11, 100 ], 5 ], [ "arn", "Mapudungun", [ 1, 2 ], 1 ], [ "ast", "Asturian", [ 1, 2 ], 2 ], [ "ay", "Aymará", [ 1 ], 3 ], [ "az", "Azerbaijani", [ 1, 2 ], 2 ], [ "be", "Belarusian", [ 1, 2, 5 ], 4 ], [ "bg", "Bulgarian", [ 1, 2 ], 2 ], [ "bn", "Bengali", [ 1, 2 ], 2 ], [ "bo", "Tibetan", [ 1 ], 3 ], [ "br", "Breton", [ 1, 2 ], 1 ], [ "bs", "Bosnian", [ 1, 2, 5 ], 4 ], [ "ca", "Catalan", [ 1, 2 ], 2 ], [ "cgg", "Chiga", [ 1 ], 3 ], [ "cs", "Czech", [ 1, 2, 5 ], 6 ], [ "csb", "Kashubian", [ 1, 2, 5 ], 7 ], [ "cy", "Welsh", [ 1, 2, 3, 8 ], 8 ], [ "da", "Danish", [ 1, 2 ], 2 ], [ "de", "German", [ 1, 2 ], 2 ], [ "dev", "Development Fallback", [ 1, 2 ], 2 ], [ "dz", "Dzongkha", [ 1 ], 3 ], [ "el", "Greek", [ 1, 2 ], 2 ], [ "en", "English", [ 1, 2 ], 2 ], [ "eo", "Esperanto", [ 1, 2 ], 2 ], [ "es", "Spanish", [ 1, 2 ], 2 ], [ "es_ar", "Argentinean Spanish", [ 1, 2 ], 2 ], [ "et", "Estonian", [ 1, 2 ], 2 ], [ "eu", "Basque", [ 1, 2 ], 2 ], [ "fa", "Persian", [ 1 ], 3 ], [ "fi", "Finnish", [ 1, 2 ], 2 ], [ "fil", "Filipino", [ 1, 2 ], 1 ], [ "fo", "Faroese", [ 1, 2 ], 2 ], [ "fr", "French", [ 1, 2 ], 9 ], [ "fur", "Friulian", [ 1, 2 ], 2 ], [ "fy", "Frisian", [ 1, 2 ], 2 ], [ "ga", "Irish", [ 1, 2, 3, 7, 11 ], 10 ], [ "gd", "Scottish Gaelic", [ 1, 2, 3, 20 ], 11 ], [ "gl", "Galician", [ 1, 2 ], 2 ], [ "gu", "Gujarati", [ 1, 2 ], 2 ], [ "gun", "Gun", [ 1, 2 ], 1 ], [ "ha", "Hausa", [ 1, 2 ], 2 ], [ "he", "Hebrew", [ 1, 2 ], 2 ], [ "hi", "Hindi", [ 1, 2 ], 2 ], [ "hr", "Croatian", [ 1, 2, 5 ], 4 ], [ "hu", "Hungarian", [ 1, 2 ], 2 ], [ "hy", "Armenian", [ 1, 2 ], 2 ], [ "ia", "Interlingua", [ 1, 2 ], 2 ], [ "id", "Indonesian", [ 1 ], 3 ], [ "is", "Icelandic", [ 1, 2 ], 12 ], [ "it", "Italian", [ 1, 2 ], 2 ], [ "ja", "Japanese", [ 1 ], 3 ], [ "jbo", "Lojban", [ 1 ], 3 ], [ "jv", "Javanese", [ 0, 1 ], 13 ], [ "ka", "Georgian", [ 1 ], 3 ], [ "kk", "Kazakh", [ 1 ], 3 ], [ "km", "Khmer", [ 1 ], 3 ], [ "kn", "Kannada", [ 1, 2 ], 2 ], [ "ko", "Korean", [ 1 ], 3 ], [ "ku", "Kurdish", [ 1, 2 ], 2 ], [ "kw", "Cornish", [ 1, 2, 3, 4 ], 14 ], [ "ky", "Kyrgyz", [ 1 ], 3 ], [ "lb", "Letzeburgesch", [ 1, 2 ], 2 ], [ "ln", "Lingala", [ 1, 2 ], 1 ], [ "lo", "Lao", [ 1 ], 3 ], [ "lt", "Lithuanian", [ 1, 2, 10 ], 15 ], [ "lv", "Latvian", [ 1, 2, 0 ], 16 ], [ "mai", "Maithili", [ 1, 2 ], 2 ], [ "mfe", "Mauritian Creole", [ 1, 2 ], 1 ], [ "mg", "Malagasy", [ 1, 2 ], 1 ], [ "mi", "Maori", [ 1, 2 ], 1 ], [ "mk", "Macedonian", [ 1, 2 ], 17 ], [ "ml", "Malayalam", [ 1, 2 ], 2 ], [ "mn", "Mongolian", [ 1, 2 ], 2 ], [ "mnk", "Mandinka", [ 0, 1, 2 ], 18 ], [ "mr", "Marathi", [ 1, 2 ], 2 ], [ "ms", "Malay", [ 1 ], 3 ], [ "mt", "Maltese", [ 1, 2, 11, 20 ], 19 ], [ "nah", "Nahuatl", [ 1, 2 ], 2 ], [ "nap", "Neapolitan", [ 1, 2 ], 2 ], [ "nb", "Norwegian Bokmal", [ 1, 2 ], 2 ], [ "ne", "Nepali", [ 1, 2 ], 2 ], [ "nl", "Dutch", [ 1, 2 ], 2 ], [ "nn", "Norwegian Nynorsk", [ 1, 2 ], 2 ], [ "no", "Norwegian", [ 1, 2 ], 2 ], [ "nso", "Northern Sotho", [ 1, 2 ], 2 ], [ "oc", "Occitan", [ 1, 2 ], 1 ], [ "or", "Oriya", [ 2, 1 ], 2 ], [ "pa", "Punjabi", [ 1, 2 ], 2 ], [ "pap", "Papiamento", [ 1, 2 ], 2 ], [ "pl", "Polish", [ 1, 2, 5 ], 7 ], [ "pms", "Piemontese", [ 1, 2 ], 2 ], [ "ps", "Pashto", [ 1, 2 ], 2 ], [ "pt", "Portuguese", [ 1, 2 ], 2 ], [ "pt_br", "Brazilian Portuguese", [ 1, 2 ], 2 ], [ "rm", "Romansh", [ 1, 2 ], 2 ], [ "ro", "Romanian", [ 1, 2, 20 ], 20 ], [ "ru", "Russian", [ 1, 2, 5 ], 4 ], [ "sah", "Yakut", [ 1 ], 3 ], [ "sco", "Scots", [ 1, 2 ], 2 ], [ "se", "Northern Sami", [ 1, 2 ], 2 ], [ "si", "Sinhala", [ 1, 2 ], 2 ], [ "sk", "Slovak", [ 1, 2, 5 ], 6 ], [ "sl", "Slovenian", [ 5, 1, 2, 3 ], 21 ], [ "so", "Somali", [ 1, 2 ], 2 ], [ "son", "Songhay", [ 1, 2 ], 2 ], [ "sq", "Albanian", [ 1, 2 ], 2 ], [ "sr", "Serbian", [ 1, 2, 5 ], 4 ], [ "su", "Sundanese", [ 1 ], 3 ], [ "sv", "Swedish", [ 1, 2 ], 2 ], [ "sw", "Swahili", [ 1, 2 ], 2 ], [ "ta", "Tamil", [ 1, 2 ], 2 ], [ "te", "Telugu", [ 1, 2 ], 2 ], [ "tg", "Tajik", [ 1, 2 ], 1 ], [ "th", "Thai", [ 1 ], 3 ], [ "ti", "Tigrinya", [ 1, 2 ], 1 ], [ "tk", "Turkmen", [ 1, 2 ], 2 ], [ "tr", "Turkish", [ 1, 2 ], 1 ], [ "tt", "Tatar", [ 1 ], 3 ], [ "ug", "Uyghur", [ 1 ], 3 ], [ "uk", "Ukrainian", [ 1, 2, 5 ], 4 ], [ "ur", "Urdu", [ 1, 2 ], 2 ], [ "uz", "Uzbek", [ 1, 2 ], 1 ], [ "vi", "Vietnamese", [ 1 ], 3 ], [ "wa", "Walloon", [ 1, 2 ], 1 ], [ "wo", "Wolof", [ 1 ], 3 ], [ "yo", "Yoruba", [ 1, 2 ], 2 ], [ "zh", "Chinese", [ 1 ], 3 ] ], _rulesPluralsTypes = {
        1: function(n) {
            return Number(n > 1);
        },
        2: function(n) {
            return Number(1 != n);
        },
        3: function(n) {
            return 0;
        },
        4: function(n) {
            return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
        },
        5: function(n) {
            return Number(0 === n ? 0 : 1 == n ? 1 : 2 == n ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5);
        },
        6: function(n) {
            return Number(1 == n ? 0 : n >= 2 && n <= 4 ? 1 : 2);
        },
        7: function(n) {
            return Number(1 == n ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
        },
        8: function(n) {
            return Number(1 == n ? 0 : 2 == n ? 1 : 8 != n && 11 != n ? 2 : 3);
        },
        9: function(n) {
            return Number(n >= 2);
        },
        10: function(n) {
            return Number(1 == n ? 0 : 2 == n ? 1 : n < 7 ? 2 : n < 11 ? 3 : 4);
        },
        11: function(n) {
            return Number(1 == n || 11 == n ? 0 : 2 == n || 12 == n ? 1 : n > 2 && n < 20 ? 2 : 3);
        },
        12: function(n) {
            return Number(n % 10 != 1 || n % 100 == 11);
        },
        13: function(n) {
            return Number(0 !== n);
        },
        14: function(n) {
            return Number(1 == n ? 0 : 2 == n ? 1 : 3 == n ? 2 : 3);
        },
        15: function(n) {
            return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
        },
        16: function(n) {
            return Number(n % 10 == 1 && n % 100 != 11 ? 0 : 0 !== n ? 1 : 2);
        },
        17: function(n) {
            return Number(1 == n || n % 10 == 1 ? 0 : 1);
        },
        18: function(n) {
            return Number(1 == n ? 1 : 2);
        },
        19: function(n) {
            return Number(1 == n ? 0 : 0 === n || n % 100 > 1 && n % 100 < 11 ? 1 : n % 100 > 10 && n % 100 < 20 ? 2 : 3);
        },
        20: function(n) {
            return Number(1 == n ? 0 : 0 === n || n % 100 > 0 && n % 100 < 20 ? 1 : 2);
        },
        21: function(n) {
            return Number(n % 100 == 1 ? 1 : n % 100 == 2 ? 2 : n % 100 == 3 || n % 100 == 4 ? 3 : 0);
        }
    }, pluralExtensions = {
        rules: function() {
            var l, rules = {};
            for (l = _rules.length; l--; ) rules[_rules[l][0]] = {
                name: _rules[l][1],
                numbers: _rules[l][2],
                plurals: _rulesPluralsTypes[_rules[l][3]]
            };
            return rules;
        }(),
        addRule: function(lng, obj) {
            pluralExtensions.rules[lng] = obj;
        },
        setCurrentLng: function(lng) {
            if (!pluralExtensions.currentRule || pluralExtensions.currentRule.lng !== lng) {
                var parts = lng.split("-");
                pluralExtensions.currentRule = {
                    lng: lng,
                    rule: pluralExtensions.rules[parts[0]]
                };
            }
        },
        needsPlural: function(lng, count) {
            var ext, parts = lng.split("-");
            return ext = pluralExtensions.currentRule && pluralExtensions.currentRule.lng === lng ? pluralExtensions.currentRule.rule : pluralExtensions.rules[parts[f.getCountyIndexOfLng(lng)]], 
            !(ext && ext.numbers.length <= 1) && 1 !== this.get(lng, count);
        },
        get: function(lng, count) {
            function getResult(l, c) {
                var ext;
                if (ext = pluralExtensions.currentRule && pluralExtensions.currentRule.lng === lng ? pluralExtensions.currentRule.rule : pluralExtensions.rules[l]) {
                    var i;
                    i = ext.noAbs ? ext.plurals(c) : ext.plurals(Math.abs(c));
                    var number = ext.numbers[i];
                    return 2 === ext.numbers.length && 1 === ext.numbers[0] && (2 === number ? number = -1 : 1 === number && (number = 1)), 
                    number;
                }
                return 1 === c ? "1" : "-1";
            }
            var parts = lng.split("-");
            return getResult(parts[f.getCountyIndexOfLng(lng)], count);
        }
    }, postProcessors = {}, addPostProcessor = function(name, fc) {
        postProcessors[name] = fc;
    }, sprintf = function() {
        function get_type(variable) {
            return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
        }
        function str_repeat(input, multiplier) {
            for (var output = []; multiplier > 0; output[--multiplier] = input) ;
            return output.join("");
        }
        var str_format = function() {
            return str_format.cache.hasOwnProperty(arguments[0]) || (str_format.cache[arguments[0]] = str_format.parse(arguments[0])), 
            str_format.format.call(null, str_format.cache[arguments[0]], arguments);
        };
        return str_format.format = function(parse_tree, argv) {
            var arg, i, k, match, pad, pad_character, pad_length, cursor = 1, tree_length = parse_tree.length, node_type = "", output = [];
            for (i = 0; i < tree_length; i++) if (node_type = get_type(parse_tree[i]), "string" === node_type) output.push(parse_tree[i]); else if ("array" === node_type) {
                if (match = parse_tree[i], match[2]) for (arg = argv[cursor], k = 0; k < match[2].length; k++) {
                    if (!arg.hasOwnProperty(match[2][k])) throw sprintf('[sprintf] property "%s" does not exist', match[2][k]);
                    arg = arg[match[2][k]];
                } else arg = match[1] ? argv[match[1]] : argv[cursor++];
                if (/[^s]/.test(match[8]) && "number" != get_type(arg)) throw sprintf("[sprintf] expecting number but found %s", get_type(arg));
                switch (match[8]) {
                  case "b":
                    arg = arg.toString(2);
                    break;

                  case "c":
                    arg = String.fromCharCode(arg);
                    break;

                  case "d":
                    arg = parseInt(arg, 10);
                    break;

                  case "e":
                    arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();
                    break;

                  case "f":
                    arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);
                    break;

                  case "o":
                    arg = arg.toString(8);
                    break;

                  case "s":
                    arg = (arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg;
                    break;

                  case "u":
                    arg = Math.abs(arg);
                    break;

                  case "x":
                    arg = arg.toString(16);
                    break;

                  case "X":
                    arg = arg.toString(16).toUpperCase();
                }
                arg = /[def]/.test(match[8]) && match[3] && arg >= 0 ? "+" + arg : arg, pad_character = match[4] ? "0" == match[4] ? "0" : match[4].charAt(1) : " ", 
                pad_length = match[6] - String(arg).length, pad = match[6] ? str_repeat(pad_character, pad_length) : "", 
                output.push(match[5] ? arg + pad : pad + arg);
            }
            return output.join("");
        }, str_format.cache = {}, str_format.parse = function(fmt) {
            for (var _fmt = fmt, match = [], parse_tree = [], arg_names = 0; _fmt; ) {
                if (null !== (match = /^[^\x25]+/.exec(_fmt))) parse_tree.push(match[0]); else if (null !== (match = /^\x25{2}/.exec(_fmt))) parse_tree.push("%"); else {
                    if (null === (match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt))) throw "[sprintf] huh?";
                    if (match[2]) {
                        arg_names |= 1;
                        var field_list = [], replacement_field = match[2], field_match = [];
                        if (null === (field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field))) throw "[sprintf] huh?";
                        for (field_list.push(field_match[1]); "" !== (replacement_field = replacement_field.substring(field_match[0].length)); ) if (null !== (field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field))) field_list.push(field_match[1]); else {
                            if (null === (field_match = /^\[(\d+)\]/.exec(replacement_field))) throw "[sprintf] huh?";
                            field_list.push(field_match[1]);
                        }
                        match[2] = field_list;
                    } else arg_names |= 2;
                    if (3 === arg_names) throw "[sprintf] mixing positional and named placeholders is not (yet) supported";
                    parse_tree.push(match);
                }
                _fmt = _fmt.substring(match[0].length);
            }
            return parse_tree;
        }, str_format;
    }(), vsprintf = function(fmt, argv) {
        return argv.unshift(fmt), sprintf.apply(null, argv);
    };
    addPostProcessor("sprintf", function(val, key, opts) {
        return opts.sprintf ? "[object Array]" === Object.prototype.toString.apply(opts.sprintf) ? vsprintf(val, opts.sprintf) : "object" == typeof opts.sprintf ? sprintf(val, opts.sprintf) : val : val;
    }), i18n.init = init, i18n.isInitialized = isInitialized, i18n.setLng = setLng, 
    i18n.preload = preload, i18n.addResourceBundle = addResourceBundle, i18n.hasResourceBundle = hasResourceBundle, 
    i18n.getResourceBundle = getResourceBundle, i18n.addResource = addResource, i18n.addResources = addResources, 
    i18n.removeResourceBundle = removeResourceBundle, i18n.loadNamespace = loadNamespace, 
    i18n.loadNamespaces = loadNamespaces, i18n.setDefaultNamespace = setDefaultNamespace, 
    i18n.t = translate, i18n.translate = translate, i18n.exists = exists, i18n.detectLanguage = f.detectLanguage, 
    i18n.pluralExtensions = pluralExtensions, i18n.sync = sync, i18n.functions = f, 
    i18n.lng = lng, i18n.addPostProcessor = addPostProcessor, i18n.applyReplacement = f.applyReplacement, 
    i18n.options = o, i18n.noConflict = noConflict;
}("undefined" == typeof exports ? window : exports), angular.module("jm.i18next", [ "ng", "ngSanitize" ]), 
angular.module("jm.i18next").provider("$i18next", function() {
    "use strict";
    var self = this, t = null, translations = {}, globalOptions = {}, triesToLoadI18next = 0;
    self.options = globalOptions, self.$get = [ "$rootScope", "$timeout", "$q", function($rootScope, $timeout, $q) {
        function init(options) {
            options.noConflict && window.i18n && window.i18n.noConflict();
            var i18n = window.i18next || window.i18n;
            if (i18n) return i18nDeferred = $q.defer(), i18n.init(options, function(localize) {
                translations = {}, t = localize, $rootScope.$$phase || $rootScope.$digest(), $rootScope.$broadcast("i18nextLanguageChange", i18n.lng()), 
                i18nDeferred.resolve();
            }), i18nDeferred.promise;
            if (triesToLoadI18next++, !(triesToLoadI18next < 5)) throw new Error("[ng-i18next] Can't find i18next!");
            $timeout(function() {
                return init(options);
            }, 400);
        }
        function optionsChange(newOptions, oldOptions) {
            return $i18nextTanslate.debugMsg.push([ "i18next options changed:", oldOptions, newOptions ]), 
            globalOptions = newOptions, init(globalOptions);
        }
        function translate(key, options, hasOwnOptions) {
            var lng = options.lng || "auto";
            translations[lng] || (translations[lng] = {}), t ? translations[lng][key] && !hasOwnOptions || (translations[lng][key] = t(key, options)) : translations[lng][key] = "defaultLoadingValue" in options ? options.defaultLoadingValue : "defaultValue" in options ? options.defaultValue : "defaultLoadingValue" in globalOptions ? globalOptions.defaultLoadingValue : key;
        }
        function $i18nextTanslate(key, options) {
            var mergedOptions, lng, hasOwnOptions = !!options, hasOwnNsOption = hasOwnOptions && options.ns, hasGlobalNsObj = globalOptions && globalOptions.ns, defaultOptions = globalOptions;
            return !hasOwnNsOption && hasGlobalNsObj && (defaultOptions = angular.copy(globalOptions), 
            defaultOptions.ns = defaultOptions.ns.defaultNs), mergedOptions = hasOwnOptions ? angular.extend({}, defaultOptions, options) : defaultOptions, 
            lng = mergedOptions.lng, translate(key, mergedOptions, hasOwnOptions), lng ? translations[lng][key] : translations.auto[key];
        }
        var i18nDeferred;
        return $i18nextTanslate.debugMsg = [], $i18nextTanslate.options = self.options, 
        self.options !== globalOptions && optionsChange(self.options, globalOptions), $i18nextTanslate.reInit = function() {
            return optionsChange(globalOptions, globalOptions);
        }, $rootScope.$watch(function() {
            return $i18nextTanslate.options;
        }, function(newOptions, oldOptions) {
            !newOptions || oldOptions === newOptions && globalOptions === newOptions || optionsChange(newOptions, oldOptions);
        }, !0), $i18nextTanslate;
    } ];
}), angular.module("jm.i18next").directive("ngI18next", [ "$i18next", "$compile", "$parse", "$interpolate", "$sanitize", function($i18next, $compile, $parse, $interpolate, $sanitize) {
    "use strict";
    function parseOptions(options) {
        var res = {
            attr: "text"
        };
        options = options.split(":");
        for (var i = 0; i < options.length; ++i) "i18next" === options[i] ? res[options[i]] = !0 : res.attr = options[i];
        return res;
    }
    function parseKey(key) {
        var tmp, options = {
            attr: "text"
        }, i18nOptions = "{}";
        return key = key.trim(), 0 === key.indexOf("[") && (tmp = key.split("]"), options = parseOptions(tmp.shift().substr(1).trim()), 
        key = tmp.join("]")), options.i18next && 0 === key.indexOf("(") && key.indexOf(")") >= 0 && (tmp = key.split(")"), 
        key = tmp.pop().trim(), i18nOptions = tmp.join(")").substr(1).trim()), {
            key: key,
            options: options,
            i18nOptions: $parse(i18nOptions)
        };
    }
    function I18nextCtrl($scope, $element) {
        function parse(key, noWatch) {
            function render(i18nOptions) {
                i18nOptions.sprintf && (i18nOptions.postProcess = "sprintf"), "html" === parsedKey.options.attr && angular.forEach(i18nOptions, function(value, key) {
                    i18nOptions[key] = $sanitize(value);
                });
                var string = $i18next(parsedKey.key, i18nOptions);
                if ("html" === parsedKey.options.attr) return $element.empty().append(string), void $compile($element.contents())($scope);
                stringUnregister && stringUnregister();
                var insertText = $element.text.bind($element);
                "text" !== parsedKey.options.attr && (insertText = $element.attr.bind($element, parsedKey.options.attr)), 
                string = $interpolate(string), noWatch || (stringUnregister = $scope.$watch(string, insertText)), 
                insertText(string($scope));
            }
            var parsedKey = parseKey(key);
            argsUnregister && argsUnregister(), stringUnregister && stringUnregister(), noWatch || (argsUnregister = $scope.$watch(parsedKey.i18nOptions, render, !0)), 
            render(parsedKey.i18nOptions($scope));
        }
        var argsUnregister, stringUnregister;
        this.localize = function(key, noWatch) {
            for (var keys = key.split(";"), i = 0; i < keys.length; ++i) key = keys[i].trim(), 
            "" !== key && parse(key, noWatch);
        };
    }
    return {
        restrict: "A",
        scope: !1,
        controller: [ "$scope", "$element", I18nextCtrl ],
        require: "ngI18next",
        link: function(scope, element, attrs, ctrl) {
            function observe(value) {
                return translationValue = value.replace(/^\s+|\s+$/g, ""), "" === translationValue ? setupWatcher() : void ctrl.localize(translationValue);
            }
            function setupWatcher() {
                if (!setupWatcher.done) {
                    var interpolation = $interpolate(element.html());
                    scope.$watch(interpolation, observe), setupWatcher.done = !0;
                }
            }
            var translationValue = "";
            translationValue = attrs.ngI18next.replace(/^\s+|\s+$/g, ""), translationValue.indexOf("__once__") < 0 ? attrs.$observe("ngI18next", observe) : (translationValue = translationValue.split("__once__").join(""), 
            ctrl.localize(translationValue, !0)), scope.$on("i18nextLanguageChange", function() {
                ctrl.localize(translationValue);
            });
        }
    };
} ]), angular.module("jm.i18next").directive("boI18next", [ "$i18next", "$compile", function($i18next, $compile) {
    "use strict";
    return {
        restrict: "A",
        scope: !1,
        link: function(scope, element, attrs) {
            var newElement = element.clone();
            newElement.attr("ng-i18next", "__once__" + attrs.boI18next), newElement.removeAttr("bo-i18next"), 
            element.replaceWith($compile(newElement)(scope));
        }
    };
} ]), angular.module("jm.i18next").filter("i18next", [ "$i18next", function($i18next) {
    "use strict";
    function i18nextFilter(string, options) {
        return $i18next(string, options);
    }
    return i18nextFilter.$stateful = !0, i18nextFilter;
} ]), angular.module("dndLists", []).directive("dndDraggable", [ "$parse", "$timeout", "dndDropEffectWorkaround", "dndDragTypeWorkaround", function($parse, $timeout, dndDropEffectWorkaround, dndDragTypeWorkaround) {
    return function(scope, element, attr) {
        element.attr("draggable", "true"), attr.dndDisableIf && scope.$watch(attr.dndDisableIf, function(disabled) {
            element.attr("draggable", !disabled);
        }), element.on("dragstart", function(event) {
            event = event.originalEvent || event, event.dataTransfer.setData("Text", angular.toJson(scope.$eval(attr.dndDraggable))), 
            event.dataTransfer.effectAllowed = attr.dndEffectAllowed || "move", element.addClass("dndDragging"), 
            $timeout(function() {
                element.addClass("dndDraggingSource");
            }, 0), dndDropEffectWorkaround.dropEffect = "none", dndDragTypeWorkaround.isDragging = !0, 
            dndDragTypeWorkaround.dragType = attr.dndType ? scope.$eval(attr.dndType) : void 0, 
            $parse(attr.dndDragstart)(scope, {
                event: event
            }), event.stopPropagation();
        }), element.on("dragend", function(event) {
            event = event.originalEvent || event;
            var dropEffect = dndDropEffectWorkaround.dropEffect;
            scope.$apply(function() {
                switch (dropEffect) {
                  case "move":
                    $parse(attr.dndMoved)(scope, {
                        event: event
                    });
                    break;

                  case "copy":
                    $parse(attr.dndCopied)(scope, {
                        event: event
                    });
                }
            }), element.removeClass("dndDragging"), element.removeClass("dndDraggingSource"), 
            dndDragTypeWorkaround.isDragging = !1, event.stopPropagation();
        }), element.on("click", function(event) {
            event = event.originalEvent || event, scope.$apply(function() {
                $parse(attr.dndSelected)(scope, {
                    event: event
                });
            }), event.stopPropagation();
        }), element.on("selectstart", function() {
            return this.dragDrop && this.dragDrop(), !1;
        });
    };
} ]).directive("dndList", [ "$parse", "$timeout", "dndDropEffectWorkaround", "dndDragTypeWorkaround", function($parse, $timeout, dndDropEffectWorkaround, dndDragTypeWorkaround) {
    return function(scope, element, attr) {
        function isMouseInFirstHalf(event, targetNode, relativeToParent) {
            var mousePointer = horizontal ? event.offsetX || event.layerX : event.offsetY || event.layerY, targetSize = horizontal ? targetNode.offsetWidth : targetNode.offsetHeight, targetPosition = horizontal ? targetNode.offsetLeft : targetNode.offsetTop;
            return targetPosition = relativeToParent ? targetPosition : 0, mousePointer < targetPosition + targetSize / 2;
        }
        function getPlaceholderIndex() {
            return Array.prototype.indexOf.call(listNode.children, placeholderNode);
        }
        function isDropAllowed(event) {
            if (!dndDragTypeWorkaround.isDragging && !externalSources) return !1;
            if (!hasTextMimetype(event.dataTransfer.types)) return !1;
            if (attr.dndAllowedTypes && dndDragTypeWorkaround.isDragging) {
                var allowed = scope.$eval(attr.dndAllowedTypes);
                if (angular.isArray(allowed) && allowed.indexOf(dndDragTypeWorkaround.dragType) === -1) return !1;
            }
            return !attr.dndDisableIf || !scope.$eval(attr.dndDisableIf);
        }
        function stopDragover() {
            return placeholder.remove(), element.removeClass("dndDragover"), !0;
        }
        function invokeCallback(expression, event, item) {
            return $parse(expression)(scope, {
                event: event,
                index: getPlaceholderIndex(),
                item: item || void 0,
                external: !dndDragTypeWorkaround.isDragging,
                type: dndDragTypeWorkaround.isDragging ? dndDragTypeWorkaround.dragType : void 0
            });
        }
        function hasTextMimetype(types) {
            if (!types) return !0;
            for (var i = 0; i < types.length; i++) if ("Text" === types[i] || "text/plain" === types[i]) return !0;
            return !1;
        }
        var placeholder = angular.element("<li class='dndPlaceholder'></li>"), placeholderNode = placeholder[0], listNode = element[0], horizontal = attr.dndHorizontalList && scope.$eval(attr.dndHorizontalList), externalSources = attr.dndExternalSources && scope.$eval(attr.dndExternalSources);
        element.on("dragover", function(event) {
            if (event = event.originalEvent || event, !isDropAllowed(event)) return !0;
            if (placeholderNode.parentNode != listNode && element.append(placeholder), event.target !== listNode) {
                for (var listItemNode = event.target; listItemNode.parentNode !== listNode && listItemNode.parentNode; ) listItemNode = listItemNode.parentNode;
                listItemNode.parentNode === listNode && listItemNode !== placeholderNode && (isMouseInFirstHalf(event, listItemNode) ? listNode.insertBefore(placeholderNode, listItemNode) : listNode.insertBefore(placeholderNode, listItemNode.nextSibling));
            } else if (isMouseInFirstHalf(event, placeholderNode, !0)) for (;placeholderNode.previousElementSibling && (isMouseInFirstHalf(event, placeholderNode.previousElementSibling, !0) || 0 === placeholderNode.previousElementSibling.offsetHeight); ) listNode.insertBefore(placeholderNode, placeholderNode.previousElementSibling); else for (;placeholderNode.nextElementSibling && !isMouseInFirstHalf(event, placeholderNode.nextElementSibling, !0); ) listNode.insertBefore(placeholderNode, placeholderNode.nextElementSibling.nextElementSibling);
            return attr.dndDragover && !invokeCallback(attr.dndDragover, event) ? stopDragover() : (element.addClass("dndDragover"), 
            event.preventDefault(), event.stopPropagation(), !1);
        }), element.on("drop", function(event) {
            if (event = event.originalEvent || event, !isDropAllowed(event)) return !0;
            event.preventDefault();
            var transferredObject, data = event.dataTransfer.getData("Text") || event.dataTransfer.getData("text/plain");
            try {
                transferredObject = JSON.parse(data);
            } catch (e) {
                return stopDragover();
            }
            if (attr.dndDrop && (transferredObject = invokeCallback(attr.dndDrop, event, transferredObject), 
            !transferredObject)) return stopDragover();
            var targetArray = scope.$eval(attr.dndList);
            return scope.$apply(function() {
                targetArray.splice(getPlaceholderIndex(), 0, transferredObject);
            }), "none" === event.dataTransfer.dropEffect ? "copy" === event.dataTransfer.effectAllowed || "move" === event.dataTransfer.effectAllowed ? dndDropEffectWorkaround.dropEffect = event.dataTransfer.effectAllowed : dndDropEffectWorkaround.dropEffect = event.ctrlKey ? "copy" : "move" : dndDropEffectWorkaround.dropEffect = event.dataTransfer.dropEffect, 
            stopDragover(), event.stopPropagation(), !1;
        }), element.on("dragleave", function(event) {
            event = event.originalEvent || event, element.removeClass("dndDragover"), $timeout(function() {
                element.hasClass("dndDragover") || placeholder.remove();
            }, 100);
        });
    };
} ]).factory("dndDragTypeWorkaround", function() {
    return {};
}).factory("dndDropEffectWorkaround", function() {
    return {};
});

var mod;

mod = angular.module("infinite-scroll", []), mod.value("THROTTLE_MILLISECONDS", null), 
mod.directive("infiniteScroll", [ "$rootScope", "$window", "$interval", "THROTTLE_MILLISECONDS", function(a, b, c, d) {
    return {
        scope: {
            infiniteScroll: "&",
            infiniteScrollContainer: "=",
            infiniteScrollDistance: "=",
            infiniteScrollDisabled: "=",
            infiniteScrollUseDocumentBottom: "="
        },
        link: function(e, f, g) {
            var h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x;
            return x = angular.element(b), t = null, u = null, i = null, j = null, q = !0, w = !1, 
            p = function(a) {
                return a = a[0] || a, isNaN(a.offsetHeight) ? a.document.documentElement.clientHeight : a.offsetHeight;
            }, r = function(a) {
                return a[0].getBoundingClientRect && !a.css("none") ? a[0].getBoundingClientRect().top + s(a) : void 0;
            }, s = function(a) {
                return a = a[0] || a, isNaN(window.pageYOffset) ? a.document.documentElement.scrollTop : a.ownerDocument.defaultView.pageYOffset;
            }, o = function() {
                var b, c, d, g, h;
                return j === x ? (b = p(j) + s(j[0].document.documentElement), d = r(f) + p(f)) : (b = p(j), 
                c = 0, void 0 !== r(j) && (c = r(j)), d = r(f) - c + p(f)), w && (d = p((f[0].ownerDocument || f[0].document).documentElement)), 
                g = d - b, h = g <= p(j) * t + 1, h ? (i = !0, u ? e.$$phase || a.$$phase ? e.infiniteScroll() : e.$apply(e.infiniteScroll) : void 0) : i = !1;
            }, v = function(a, b) {
                var d, e, f;
                return f = null, e = 0, d = function() {
                    var b;
                    return e = new Date().getTime(), c.cancel(f), f = null, a.call(), b = null;
                }, function() {
                    var g, h;
                    return g = new Date().getTime(), h = b - (g - e), 0 >= h ? (clearTimeout(f), c.cancel(f), 
                    f = null, e = g, a.call()) : f ? void 0 : f = c(d, h, 1);
                };
            }, null != d && (o = v(o, d)), e.$on("$destroy", function() {
                return j.unbind("scroll", o);
            }), m = function(a) {
                return t = parseFloat(a) || 0;
            }, e.$watch("infiniteScrollDistance", m), m(e.infiniteScrollDistance), l = function(a) {
                return u = !a, u && i ? (i = !1, o()) : void 0;
            }, e.$watch("infiniteScrollDisabled", l), l(e.infiniteScrollDisabled), n = function(a) {
                return w = a;
            }, e.$watch("infiniteScrollUseDocumentBottom", n), n(e.infiniteScrollUseDocumentBottom), 
            h = function(a) {
                return null != j && j.unbind("scroll", o), j = a, null != a ? j.bind("scroll", o) : void 0;
            }, h(x), k = function(a) {
                if (null != a && 0 !== a.length) {
                    if (a instanceof HTMLElement ? a = angular.element(a) : "function" == typeof a.append ? a = angular.element(a[a.length - 1]) : "string" == typeof a && (a = angular.element(document.querySelector(a))), 
                    null != a) return h(a);
                    throw new Exception("invalid infinite-scroll-container attribute.");
                }
            }, e.$watch("infiniteScrollContainer", k), k(e.infiniteScrollContainer || []), null != g.infiniteScrollParent && h(angular.element(f.parent())), 
            null != g.infiniteScrollImmediateCheck && (q = e.$eval(g.infiniteScrollImmediateCheck)), 
            c(function() {
                return q ? o() : void 0;
            }, 0, 1);
        }
    };
} ]), !function(e) {
    "use strict";
    function t(t, r) {
        if (r = r || {}, r.worker && S.WORKERS_SUPPORTED) {
            var n = f();
            return n.userStep = r.step, n.userChunk = r.chunk, n.userComplete = r.complete, 
            n.userError = r.error, r.step = m(r.step), r.chunk = m(r.chunk), r.complete = m(r.complete), 
            r.error = m(r.error), delete r.worker, void n.postMessage({
                input: t,
                config: r,
                workerId: n.id
            });
        }
        var o = null;
        return "string" == typeof t ? o = r.download ? new i(r) : new a(r) : (e.File && t instanceof File || t instanceof Object) && (o = new s(r)), 
        o.stream(t);
    }
    function r(e, t) {
        function r() {
            "object" == typeof t && ("string" == typeof t.delimiter && 1 == t.delimiter.length && -1 == S.BAD_DELIMITERS.indexOf(t.delimiter) && (u = t.delimiter), 
            ("boolean" == typeof t.quotes || t.quotes instanceof Array) && (o = t.quotes), "string" == typeof t.newline && (h = t.newline));
        }
        function n(e) {
            if ("object" != typeof e) return [];
            var t = [];
            for (var r in e) t.push(r);
            return t;
        }
        function i(e, t) {
            var r = "";
            "string" == typeof e && (e = JSON.parse(e)), "string" == typeof t && (t = JSON.parse(t));
            var n = e instanceof Array && e.length > 0, i = !(t[0] instanceof Array);
            if (n) {
                for (var a = 0; a < e.length; a++) a > 0 && (r += u), r += s(e[a], a);
                t.length > 0 && (r += h);
            }
            for (var o = 0; o < t.length; o++) {
                for (var f = n ? e.length : t[o].length, c = 0; f > c; c++) {
                    c > 0 && (r += u);
                    var d = n && i ? e[c] : c;
                    r += s(t[o][d], c);
                }
                o < t.length - 1 && (r += h);
            }
            return r;
        }
        function s(e, t) {
            if ("undefined" == typeof e || null === e) return "";
            e = e.toString().replace(/"/g, '""');
            var r = "boolean" == typeof o && o || o instanceof Array && o[t] || a(e, S.BAD_DELIMITERS) || e.indexOf(u) > -1 || " " == e.charAt(0) || " " == e.charAt(e.length - 1);
            return r ? '"' + e + '"' : e;
        }
        function a(e, t) {
            for (var r = 0; r < t.length; r++) if (e.indexOf(t[r]) > -1) return !0;
            return !1;
        }
        var o = !1, u = ",", h = "\r\n";
        if (r(), "string" == typeof e && (e = JSON.parse(e)), e instanceof Array) {
            if (!e.length || e[0] instanceof Array) return i(null, e);
            if ("object" == typeof e[0]) return i(n(e[0]), e);
        } else if ("object" == typeof e) return "string" == typeof e.data && (e.data = JSON.parse(e.data)), 
        e.data instanceof Array && (e.fields || (e.fields = e.data[0] instanceof Array ? e.fields : n(e.data[0])), 
        e.data[0] instanceof Array || "object" == typeof e.data[0] || (e.data = [ e.data ])), 
        i(e.fields || [], e.data || []);
        throw "exception: Unable to serialize unrecognized input";
    }
    function n(t) {
        function r(e) {
            var t = _(e);
            t.chunkSize = parseInt(t.chunkSize), e.step || e.chunk || (t.chunkSize = null), 
            this._handle = new o(t), this._handle.streamer = this, this._config = t;
        }
        this._handle = null, this._paused = !1, this._finished = !1, this._input = null, 
        this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, 
        this._nextChunk = null, this.isFirstChunk = !0, this._completeResults = {
            data: [],
            errors: [],
            meta: {}
        }, r.call(this, t), this.parseChunk = function(t) {
            if (this.isFirstChunk && m(this._config.beforeFirstChunk)) {
                var r = this._config.beforeFirstChunk(t);
                void 0 !== r && (t = r);
            }
            this.isFirstChunk = !1;
            var n = this._partialLine + t;
            this._partialLine = "";
            var i = this._handle.parse(n, this._baseIndex, !this._finished);
            if (!this._handle.paused() && !this._handle.aborted()) {
                var s = i.meta.cursor;
                this._finished || (this._partialLine = n.substring(s - this._baseIndex), this._baseIndex = s), 
                i && i.data && (this._rowCount += i.data.length);
                var a = this._finished || this._config.preview && this._rowCount >= this._config.preview;
                if (y) e.postMessage({
                    results: i,
                    workerId: S.WORKER_ID,
                    finished: a
                }); else if (m(this._config.chunk)) {
                    if (this._config.chunk(i, this._handle), this._paused) return;
                    i = void 0, this._completeResults = void 0;
                }
                return this._config.step || this._config.chunk || (this._completeResults.data = this._completeResults.data.concat(i.data), 
                this._completeResults.errors = this._completeResults.errors.concat(i.errors), this._completeResults.meta = i.meta), 
                !a || !m(this._config.complete) || i && i.meta.aborted || this._config.complete(this._completeResults), 
                a || i && i.meta.paused || this._nextChunk(), i;
            }
        }, this._sendError = function(t) {
            m(this._config.error) ? this._config.error(t) : y && this._config.error && e.postMessage({
                workerId: S.WORKER_ID,
                error: t,
                finished: !1
            });
        };
    }
    function i(e) {
        function t(e) {
            var t = e.getResponseHeader("Content-Range");
            return parseInt(t.substr(t.lastIndexOf("/") + 1));
        }
        e = e || {}, e.chunkSize || (e.chunkSize = S.RemoteChunkSize), n.call(this, e);
        var r;
        this._nextChunk = k ? function() {
            this._readChunk(), this._chunkLoaded();
        } : function() {
            this._readChunk();
        }, this.stream = function(e) {
            this._input = e, this._nextChunk();
        }, this._readChunk = function() {
            if (this._finished) return void this._chunkLoaded();
            if (r = new XMLHttpRequest(), k || (r.onload = g(this._chunkLoaded, this), r.onerror = g(this._chunkError, this)), 
            r.open("GET", this._input, !k), this._config.chunkSize) {
                var e = this._start + this._config.chunkSize - 1;
                r.setRequestHeader("Range", "bytes=" + this._start + "-" + e), r.setRequestHeader("If-None-Match", "webkit-no-cache");
            }
            try {
                r.send();
            } catch (t) {
                this._chunkError(t.message);
            }
            k && 0 == r.status ? this._chunkError() : this._start += this._config.chunkSize;
        }, this._chunkLoaded = function() {
            if (4 == r.readyState) {
                if (r.status < 200 || r.status >= 400) return void this._chunkError();
                this._finished = !this._config.chunkSize || this._start > t(r), this.parseChunk(r.responseText);
            }
        }, this._chunkError = function(e) {
            var t = r.statusText || e;
            this._sendError(t);
        };
    }
    function s(e) {
        e = e || {}, e.chunkSize || (e.chunkSize = S.LocalChunkSize), n.call(this, e);
        var t, r, i = "undefined" != typeof FileReader;
        this.stream = function(e) {
            this._input = e, r = e.slice || e.webkitSlice || e.mozSlice, i ? (t = new FileReader(), 
            t.onload = g(this._chunkLoaded, this), t.onerror = g(this._chunkError, this)) : t = new FileReaderSync(), 
            this._nextChunk();
        }, this._nextChunk = function() {
            this._finished || this._config.preview && !(this._rowCount < this._config.preview) || this._readChunk();
        }, this._readChunk = function() {
            var e = this._input;
            if (this._config.chunkSize) {
                var n = Math.min(this._start + this._config.chunkSize, this._input.size);
                e = r.call(e, this._start, n);
            }
            var s = t.readAsText(e, this._config.encoding);
            i || this._chunkLoaded({
                target: {
                    result: s
                }
            });
        }, this._chunkLoaded = function(e) {
            this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, 
            this.parseChunk(e.target.result);
        }, this._chunkError = function() {
            this._sendError(t.error);
        };
    }
    function a(e) {
        e = e || {}, n.call(this, e);
        var t, r;
        this.stream = function(e) {
            return t = e, r = e, this._nextChunk();
        }, this._nextChunk = function() {
            if (!this._finished) {
                var e = this._config.chunkSize, t = e ? r.substr(0, e) : r;
                return r = e ? r.substr(e) : "", this._finished = !r, this.parseChunk(t);
            }
        };
    }
    function o(e) {
        function t() {
            if (b && d && (h("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + S.DefaultDelimiter + "'"), 
            d = !1), e.skipEmptyLines) for (var t = 0; t < b.data.length; t++) 1 == b.data[t].length && "" == b.data[t][0] && b.data.splice(t--, 1);
            return r() && n(), i();
        }
        function r() {
            return e.header && 0 == y.length;
        }
        function n() {
            if (b) {
                for (var e = 0; r() && e < b.data.length; e++) for (var t = 0; t < b.data[e].length; t++) y.push(b.data[e][t]);
                b.data.splice(0, 1);
            }
        }
        function i() {
            if (!b || !e.header && !e.dynamicTyping) return b;
            for (var t = 0; t < b.data.length; t++) {
                for (var r = {}, n = 0; n < b.data[t].length; n++) {
                    if (e.dynamicTyping) {
                        var i = b.data[t][n];
                        b.data[t][n] = "true" == i || "TRUE" == i || "false" != i && "FALSE" != i && o(i);
                    }
                    e.header && (n >= y.length ? (r.__parsed_extra || (r.__parsed_extra = []), r.__parsed_extra.push(b.data[t][n])) : r[y[n]] = b.data[t][n]);
                }
                e.header && (b.data[t] = r, n > y.length ? h("FieldMismatch", "TooManyFields", "Too many fields: expected " + y.length + " fields but parsed " + n, t) : n < y.length && h("FieldMismatch", "TooFewFields", "Too few fields: expected " + y.length + " fields but parsed " + n, t));
            }
            return e.header && b.meta && (b.meta.fields = y), b;
        }
        function s(t) {
            for (var r, n, i, s = [ ",", "\t", "|", ";", S.RECORD_SEP, S.UNIT_SEP ], a = 0; a < s.length; a++) {
                var o = s[a], h = 0, f = 0;
                i = void 0;
                for (var c = new u({
                    delimiter: o,
                    preview: 10
                }).parse(t), d = 0; d < c.data.length; d++) {
                    var l = c.data[d].length;
                    f += l, "undefined" != typeof i ? l > 1 && (h += Math.abs(l - i), i = l) : i = l;
                }
                c.data.length > 0 && (f /= c.data.length), ("undefined" == typeof n || n > h) && f > 1.99 && (n = h, 
                r = o);
            }
            return e.delimiter = r, {
                successful: !!r,
                bestDelimiter: r
            };
        }
        function a(e) {
            e = e.substr(0, 1048576);
            var t = e.split("\r");
            if (1 == t.length) return "\n";
            for (var r = 0, n = 0; n < t.length; n++) "\n" == t[n][0] && r++;
            return r >= t.length / 2 ? "\r\n" : "\r";
        }
        function o(e) {
            var t = l.test(e);
            return t ? parseFloat(e) : e;
        }
        function h(e, t, r, n) {
            b.errors.push({
                type: e,
                code: t,
                message: r,
                row: n
            });
        }
        var f, c, d, l = /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i, p = this, g = 0, v = !1, k = !1, y = [], b = {
            data: [],
            errors: [],
            meta: {}
        };
        if (m(e.step)) {
            var R = e.step;
            e.step = function(n) {
                if (b = n, r()) t(); else {
                    if (t(), 0 == b.data.length) return;
                    g += n.data.length, e.preview && g > e.preview ? c.abort() : R(b, p);
                }
            };
        }
        this.parse = function(r, n, i) {
            if (e.newline || (e.newline = a(r)), d = !1, !e.delimiter) {
                var o = s(r);
                o.successful ? e.delimiter = o.bestDelimiter : (d = !0, e.delimiter = S.DefaultDelimiter), 
                b.meta.delimiter = e.delimiter;
            }
            var h = _(e);
            return e.preview && e.header && h.preview++, f = r, c = new u(h), b = c.parse(f, n, i), 
            t(), v ? {
                meta: {
                    paused: !0
                }
            } : b || {
                meta: {
                    paused: !1
                }
            };
        }, this.paused = function() {
            return v;
        }, this.pause = function() {
            v = !0, c.abort(), f = f.substr(c.getCharIndex());
        }, this.resume = function() {
            v = !1, p.streamer.parseChunk(f);
        }, this.aborted = function() {
            return k;
        }, this.abort = function() {
            k = !0, c.abort(), b.meta.aborted = !0, m(e.complete) && e.complete(b), f = "";
        };
    }
    function u(e) {
        e = e || {};
        var t = e.delimiter, r = e.newline, n = e.comments, i = e.step, s = e.preview, a = e.fastMode;
        if (("string" != typeof t || S.BAD_DELIMITERS.indexOf(t) > -1) && (t = ","), n === t) throw "Comment character same as delimiter";
        n === !0 ? n = "#" : ("string" != typeof n || S.BAD_DELIMITERS.indexOf(n) > -1) && (n = !1), 
        "\n" != r && "\r" != r && "\r\n" != r && (r = "\n");
        var o = 0, u = !1;
        this.parse = function(e, h, f) {
            function c(e) {
                b.push(e), S = o;
            }
            function d(t) {
                return f ? p() : ("undefined" == typeof t && (t = e.substr(o)), w.push(t), o = g, 
                c(w), y && _(), p());
            }
            function l(t) {
                o = t, c(w), w = [], O = e.indexOf(r, o);
            }
            function p(e) {
                return {
                    data: b,
                    errors: R,
                    meta: {
                        delimiter: t,
                        linebreak: r,
                        aborted: u,
                        truncated: !!e,
                        cursor: S + (h || 0)
                    }
                };
            }
            function _() {
                i(p()), b = [], R = [];
            }
            if ("string" != typeof e) throw "Input must be a string";
            var g = e.length, m = t.length, v = r.length, k = n.length, y = "function" == typeof i;
            o = 0;
            var b = [], R = [], w = [], S = 0;
            if (!e) return p();
            if (a || a !== !1 && -1 === e.indexOf('"')) {
                for (var C = e.split(r), E = 0; E < C.length; E++) {
                    var w = C[E];
                    if (o += w.length, E !== C.length - 1) o += r.length; else if (f) return p();
                    if (!n || w.substr(0, k) != n) {
                        if (y) {
                            if (b = [], c(w.split(t)), _(), u) return p();
                        } else c(w.split(t));
                        if (s && E >= s) return b = b.slice(0, s), p(!0);
                    }
                }
                return p();
            }
            for (var x = e.indexOf(t, o), O = e.indexOf(r, o); ;) if ('"' != e[o]) if (n && 0 === w.length && e.substr(o, k) === n) {
                if (-1 == O) return p();
                o = O + v, O = e.indexOf(r, o), x = e.indexOf(t, o);
            } else if (-1 !== x && (O > x || -1 === O)) w.push(e.substring(o, x)), o = x + m, 
            x = e.indexOf(t, o); else {
                if (-1 === O) break;
                if (w.push(e.substring(o, O)), l(O + v), y && (_(), u)) return p();
                if (s && b.length >= s) return p(!0);
            } else {
                var I = o;
                for (o++; ;) {
                    var I = e.indexOf('"', I + 1);
                    if (-1 === I) return f || R.push({
                        type: "Quotes",
                        code: "MissingQuotes",
                        message: "Quoted field unterminated",
                        row: b.length,
                        index: o
                    }), d();
                    if (I === g - 1) {
                        var D = e.substring(o, I).replace(/""/g, '"');
                        return d(D);
                    }
                    if ('"' != e[I + 1]) {
                        if (e[I + 1] == t) {
                            w.push(e.substring(o, I).replace(/""/g, '"')), o = I + 1 + m, x = e.indexOf(t, o), 
                            O = e.indexOf(r, o);
                            break;
                        }
                        if (e.substr(I + 1, v) === r) {
                            if (w.push(e.substring(o, I).replace(/""/g, '"')), l(I + 1 + v), x = e.indexOf(t, o), 
                            y && (_(), u)) return p();
                            if (s && b.length >= s) return p(!0);
                            break;
                        }
                    } else I++;
                }
            }
            return d();
        }, this.abort = function() {
            u = !0;
        }, this.getCharIndex = function() {
            return o;
        };
    }
    function h() {
        var e = document.getElementsByTagName("script");
        return e.length ? e[e.length - 1].src : "";
    }
    function f() {
        if (!S.WORKERS_SUPPORTED) return !1;
        if (!b && null === S.SCRIPT_PATH) throw new Error("Script path cannot be determined automatically when Papa Parse is loaded asynchronously. You need to set Papa.SCRIPT_PATH manually.");
        var t = S.SCRIPT_PATH || v;
        t += (-1 !== t.indexOf("?") ? "&" : "?") + "papaworker";
        var r = new e.Worker(t);
        return r.onmessage = c, r.id = w++, R[r.id] = r, r;
    }
    function c(e) {
        var t = e.data, r = R[t.workerId], n = !1;
        if (t.error) r.userError(t.error, t.file); else if (t.results && t.results.data) {
            var i = function() {
                n = !0, d(t.workerId, {
                    data: [],
                    errors: [],
                    meta: {
                        aborted: !0
                    }
                });
            }, s = {
                abort: i,
                pause: l,
                resume: l
            };
            if (m(r.userStep)) {
                for (var a = 0; a < t.results.data.length && (r.userStep({
                    data: [ t.results.data[a] ],
                    errors: t.results.errors,
                    meta: t.results.meta
                }, s), !n); a++) ;
                delete t.results;
            } else m(r.userChunk) && (r.userChunk(t.results, s, t.file), delete t.results);
        }
        t.finished && !n && d(t.workerId, t.results);
    }
    function d(e, t) {
        var r = R[e];
        m(r.userComplete) && r.userComplete(t), r.terminate(), delete R[e];
    }
    function l() {
        throw "Not implemented.";
    }
    function p(t) {
        var r = t.data;
        if ("undefined" == typeof S.WORKER_ID && r && (S.WORKER_ID = r.workerId), "string" == typeof r.input) e.postMessage({
            workerId: S.WORKER_ID,
            results: S.parse(r.input, r.config),
            finished: !0
        }); else if (e.File && r.input instanceof File || r.input instanceof Object) {
            var n = S.parse(r.input, r.config);
            n && e.postMessage({
                workerId: S.WORKER_ID,
                results: n,
                finished: !0
            });
        }
    }
    function _(e) {
        if ("object" != typeof e) return e;
        var t = e instanceof Array ? [] : {};
        for (var r in e) t[r] = _(e[r]);
        return t;
    }
    function g(e, t) {
        return function() {
            e.apply(t, arguments);
        };
    }
    function m(e) {
        return "function" == typeof e;
    }
    var v, k = !e.document && !!e.postMessage, y = k && /(\?|&)papaworker(=|&|$)/.test(e.location.search), b = !1, R = {}, w = 0, S = {};
    if (S.parse = t, S.unparse = r, S.RECORD_SEP = String.fromCharCode(30), S.UNIT_SEP = String.fromCharCode(31), 
    S.BYTE_ORDER_MARK = "\ufeff", S.BAD_DELIMITERS = [ "\r", "\n", '"', S.BYTE_ORDER_MARK ], 
    S.WORKERS_SUPPORTED = !k && !!e.Worker, S.SCRIPT_PATH = null, S.LocalChunkSize = 10485760, 
    S.RemoteChunkSize = 5242880, S.DefaultDelimiter = ",", S.Parser = u, S.ParserHandle = o, 
    S.NetworkStreamer = i, S.FileStreamer = s, S.StringStreamer = a, "undefined" != typeof module && module.exports ? module.exports = S : m(e.define) && e.define.amd ? define(function() {
        return S;
    }) : e.Papa = S, e.jQuery) {
        var C = e.jQuery;
        C.fn.parse = function(t) {
            function r() {
                if (0 == a.length) return void (m(t.complete) && t.complete());
                var e = a[0];
                if (m(t.before)) {
                    var r = t.before(e.file, e.inputElem);
                    if ("object" == typeof r) {
                        if ("abort" == r.action) return void n("AbortError", e.file, e.inputElem, r.reason);
                        if ("skip" == r.action) return void i();
                        "object" == typeof r.config && (e.instanceConfig = C.extend(e.instanceConfig, r.config));
                    } else if ("skip" == r) return void i();
                }
                var s = e.instanceConfig.complete;
                e.instanceConfig.complete = function(t) {
                    m(s) && s(t, e.file, e.inputElem), i();
                }, S.parse(e.file, e.instanceConfig);
            }
            function n(e, r, n, i) {
                m(t.error) && t.error({
                    name: e
                }, r, n, i);
            }
            function i() {
                a.splice(0, 1), r();
            }
            var s = t.config || {}, a = [];
            return this.each(function() {
                var t = "INPUT" == C(this).prop("tagName").toUpperCase() && "file" == C(this).attr("type").toLowerCase() && e.FileReader;
                if (!t || !this.files || 0 == this.files.length) return !0;
                for (var r = 0; r < this.files.length; r++) a.push({
                    file: this.files[r],
                    inputElem: this,
                    instanceConfig: C.extend({}, s)
                });
            }), r(), this;
        };
    }
    y ? e.onmessage = p : S.WORKERS_SUPPORTED && (v = h(), document.body ? document.addEventListener("DOMContentLoaded", function() {
        b = !0;
    }, !0) : b = !0), i.prototype = Object.create(n.prototype), i.prototype.constructor = i, 
    s.prototype = Object.create(n.prototype), s.prototype.constructor = s, a.prototype = Object.create(a.prototype), 
    a.prototype.constructor = a;
}("undefined" != typeof window ? window : this);

var saveAs = saveAs || function(e) {
    "use strict";
    if (!("undefined" == typeof e || "undefined" != typeof navigator && /MSIE [1-9]\./.test(navigator.userAgent))) {
        var t = e.document, n = function() {
            return e.URL || e.webkitURL || e;
        }, r = t.createElementNS("http://www.w3.org/1999/xhtml", "a"), o = "download" in r, i = function(e) {
            var t = new MouseEvent("click");
            e.dispatchEvent(t);
        }, a = /constructor/i.test(e.HTMLElement), f = /CriOS\/[\d]+/.test(navigator.userAgent), u = function(t) {
            (e.setImmediate || e.setTimeout)(function() {
                throw t;
            }, 0);
        }, d = "application/octet-stream", s = 4e4, c = function(e) {
            var t = function() {
                "string" == typeof e ? n().revokeObjectURL(e) : e.remove();
            };
            setTimeout(t, s);
        }, l = function(e, t, n) {
            t = [].concat(t);
            for (var r = t.length; r--; ) {
                var o = e["on" + t[r]];
                if ("function" == typeof o) try {
                    o.call(e, n || e);
                } catch (i) {
                    u(i);
                }
            }
        }, p = function(e) {
            return /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type) ? new Blob([ String.fromCharCode(65279), e ], {
                type: e.type
            }) : e;
        }, v = function(t, u, s) {
            s || (t = p(t));
            var y, v = this, w = t.type, m = w === d, h = function() {
                l(v, "writestart progress write writeend".split(" "));
            }, S = function() {
                if ((f || m && a) && e.FileReader) {
                    var r = new FileReader();
                    return r.onloadend = function() {
                        var t = f ? r.result : r.result.replace(/^data:[^;]*;/, "data:attachment/file;"), n = e.open(t, "_blank");
                        n || (e.location.href = t), t = void 0, v.readyState = v.DONE, h();
                    }, r.readAsDataURL(t), void (v.readyState = v.INIT);
                }
                if (y || (y = n().createObjectURL(t)), m) e.location.href = y; else {
                    var o = e.open(y, "_blank");
                    o || (e.location.href = y);
                }
                v.readyState = v.DONE, h(), c(y);
            };
            return v.readyState = v.INIT, o ? (y = n().createObjectURL(t), void setTimeout(function() {
                r.href = y, r.download = u, i(r), h(), c(y), v.readyState = v.DONE;
            })) : void S();
        }, w = v.prototype, m = function(e, t, n) {
            return new v(e, t || e.name || "download", n);
        };
        return "undefined" != typeof navigator && navigator.msSaveOrOpenBlob ? function(e, t, n) {
            return t = t || e.name || "download", n || (e = p(e)), navigator.msSaveOrOpenBlob(e, t);
        } : (w.abort = function() {}, w.readyState = w.INIT = 0, w.WRITING = 1, w.DONE = 2, 
        w.error = w.onwritestart = w.onprogress = w.onwrite = w.onabort = w.onerror = w.onwriteend = null, 
        m);
    }
}("undefined" != typeof self && self || "undefined" != typeof window && window || this.content);

"undefined" != typeof module && module.exports ? module.exports.saveAs = saveAs : "undefined" != typeof define && null !== define && null !== define.amd && define([], function() {
    return saveAs;
}), function() {
    function patchXHR(fnName, newFn) {
        window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
    }
    function handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile) {
        function isInputTypeFile() {
            return "input" === elem[0].tagName.toLowerCase() && elem.attr("type") && "file" === elem.attr("type").toLowerCase();
        }
        function watch(attrVal) {
            $timeout(function() {
                elem.parent().length && watchers.push(scope.$watch(attrVal, function(val, oldVal) {
                    val != oldVal && recompileElem();
                }));
            });
        }
        function recompileElem() {
            var clone = elem.clone();
            if (elem.attr("__afu_gen__") && angular.element(document.getElementById(elem.attr("id").substring(1))).remove(), 
            elem.parent().length) {
                for (var i = 0; i < watchers.length; i++) watchers[i]();
                elem.replaceWith(clone), $compile(clone)(scope);
            }
            return clone;
        }
        function bindAttr(bindAttr, attrName) {
            if (bindAttr) {
                watch(bindAttr);
                var val = $parse(bindAttr)(scope);
                val ? (elem.attr(attrName, val), attr[attrName] = val) : (elem.attr(attrName, null), 
                delete attr[attrName]);
            }
        }
        function onChangeFn(evt) {
            var fileList;
            fileList = evt.__files_ || evt.target && evt.target.files, updateModel(fileList, attr, ngModel, scope, evt);
        }
        function resetAndClick(evt) {
            if (null != fileElem[0].value && "" != fileElem[0].value && (fileElem[0].value = null, 
            navigator.userAgent.indexOf("Trident/7") === -1 && onChangeFn({
                target: {
                    files: []
                }
            })), elem.attr("__afu_clone__")) elem.attr("__afu_clone__", null); else if (navigator.appVersion.indexOf("MSIE 10") !== -1 || navigator.userAgent.indexOf("Trident/7") !== -1) {
                var clone = recompileElem();
                return clone.attr("__afu_clone__", !0), clone[0].click(), evt.preventDefault(), 
                evt.stopPropagation(), !0;
            }
        }
        function updateModel(fileList, attr, ngModel, scope, evt) {
            for (var files = [], rejFiles = [], regexp = attr.accept ? new RegExp(globStringToRegex(attr.accept), "gi") : null, i = 0; i < fileList.length; i++) {
                var file = fileList.item(i);
                !regexp || file.type.match(regexp) || null != file.name && file.name.match(regexp) ? files.push(file) : rejFiles.push(file);
            }
            $timeout(function() {
                ngModel && ($parse(attr.ngModel).assign(scope, files), ngModel && ngModel.$setViewValue(null != files && 0 == files.length ? "" : files), 
                attr.ngModelRejected && $parse(attr.ngModelRejected).assign(scope, rejFiles)), attr.ngFileChange && "" != attr.ngFileChange && $parse(attr.ngFileChange)(scope, {
                    $files: files,
                    $rejectedFiles: rejFiles,
                    $event: evt
                });
            });
        }
        var watchers = [];
        bindAttr(attr.ngMultiple, "multiple"), bindAttr(attr.ngAccept, "accept"), bindAttr(attr.ngCapture, "capture"), 
        "" != attr.ngFileSelect && (attr.ngFileChange = attr.ngFileSelect);
        var fileElem = elem;
        if (isInputTypeFile()) elem.bind("click", resetAndClick); else {
            fileElem = angular.element('<input type="file">'), attr.multiple && fileElem.attr("multiple", attr.multiple), 
            attr.accept && fileElem.attr("accept", attr.accept), attr.capture && fileElem.attr("capture", attr.capture);
            for (var key in attr) if (0 == key.indexOf("inputFile")) {
                var name = key.substring("inputFile".length);
                name = name[0].toLowerCase() + name.substring(1), fileElem.attr(name, attr[key]);
            }
            fileElem.css("width", "0px").css("height", "0px").css("position", "absolute").css("padding", 0).css("margin", 0).css("overflow", "hidden").attr("tabindex", "-1").css("opacity", 0).attr("__afu_gen__", !0), 
            elem.attr("__refElem__", !0), fileElem[0].__refElem__ = elem[0], elem.parent()[0].insertBefore(fileElem[0], elem[0]), 
            elem.css("overflow", "hidden"), elem.bind("click", function(e) {
                resetAndClick(e) || fileElem[0].click();
            });
        }
        fileElem.bind("change", onChangeFn), elem.on("$destroy", function() {
            for (var i = 0; i < watchers.length; i++) watchers[i]();
            elem[0] != fileElem[0] && fileElem.remove();
        }), watchers.push(scope.$watch(attr.ngModel, function(val, oldVal) {
            val == oldVal || null != val && val.length || (navigator.appVersion.indexOf("MSIE 10") !== -1 ? recompileElem() : fileElem[0].value = null);
        }));
    }
    function handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location) {
        function calculateDragOverClass(scope, attr, evt) {
            var valid = !0;
            if (regexp) {
                var items = evt.dataTransfer.items;
                if (null != items) for (var i = 0; i < items.length && valid; i++) valid = valid && ("file" == items[i].kind || "" == items[i].kind) && (null != items[i].type.match(regexp) || null != items[i].name && null != items[i].name.match(regexp));
            }
            var clazz = $parse(attr.dragOverClass)(scope, {
                $event: evt
            });
            return clazz && (clazz.delay && (dragOverDelay = clazz.delay), clazz.accept && (clazz = valid ? clazz.accept : clazz.reject)), 
            clazz || attr.dragOverClass || "dragover";
        }
        function extractFiles(evt, callback, allowDir, multiple) {
            function addFile(file) {
                !regexp || file.type.match(regexp) || null != file.name && file.name.match(regexp) ? files.push(file) : rejFiles.push(file);
            }
            function traverseFileTree(files, entry, path) {
                if (null != entry) if (entry.isDirectory) {
                    var filePath = (path || "") + entry.name;
                    addFile({
                        name: entry.name,
                        type: "directory",
                        path: filePath
                    });
                    var dirReader = entry.createReader(), entries = [];
                    processing++;
                    var readEntries = function() {
                        dirReader.readEntries(function(results) {
                            try {
                                if (results.length) entries = entries.concat(Array.prototype.slice.call(results || [], 0)), 
                                readEntries(); else {
                                    for (var i = 0; i < entries.length; i++) traverseFileTree(files, entries[i], (path ? path : "") + entry.name + "/");
                                    processing--;
                                }
                            } catch (e) {
                                processing--, console.error(e);
                            }
                        }, function() {
                            processing--;
                        });
                    };
                    readEntries();
                } else processing++, entry.file(function(file) {
                    try {
                        processing--, file.path = (path ? path : "") + file.name, addFile(file);
                    } catch (e) {
                        processing--, console.error(e);
                    }
                }, function(e) {
                    processing--;
                });
            }
            var files = [], rejFiles = [], items = evt.dataTransfer.items, processing = 0;
            if (items && items.length > 0 && "file" != $location.protocol()) for (var i = 0; i < items.length; i++) {
                if (items[i].webkitGetAsEntry && items[i].webkitGetAsEntry() && items[i].webkitGetAsEntry().isDirectory) {
                    var entry = items[i].webkitGetAsEntry();
                    if (entry.isDirectory && !allowDir) continue;
                    null != entry && traverseFileTree(files, entry);
                } else {
                    var f = items[i].getAsFile();
                    null != f && addFile(f);
                }
                if (!multiple && files.length > 0) break;
            } else {
                var fileList = evt.dataTransfer.files;
                if (null != fileList) for (var i = 0; i < fileList.length && (addFile(fileList.item(i)), 
                multiple || !(files.length > 0)); i++) ;
            }
            var delays = 0;
            !function waitForProcess(delay) {
                $timeout(function() {
                    if (processing) 10 * delays++ < 2e4 && waitForProcess(10); else {
                        if (!multiple && files.length > 1) {
                            for (var i = 0; "directory" == files[i].type; ) i++;
                            files = [ files[i] ];
                        }
                        callback(files, rejFiles);
                    }
                }, delay || 0);
            }();
        }
        var available = dropAvailable();
        if (attr.dropAvailable && $timeout(function() {
            scope.dropAvailable ? scope.dropAvailable.value = available : scope.dropAvailable = available;
        }), !available) return void (0 != $parse(attr.hideOnDropNotAvailable)(scope) && elem.css("display", "none"));
        var actualDragOverClass, leaveTimeout = null, stopPropagation = $parse(attr.stopPropagation)(scope), dragOverDelay = 1, accept = $parse(attr.ngAccept)(scope) || attr.accept, regexp = accept ? new RegExp(globStringToRegex(accept), "gi") : null;
        elem[0].addEventListener("dragover", function(evt) {
            if (evt.preventDefault(), stopPropagation && evt.stopPropagation(), navigator.userAgent.indexOf("Chrome") > -1) {
                var b = evt.dataTransfer.effectAllowed;
                evt.dataTransfer.dropEffect = "move" === b || "linkMove" === b ? "move" : "copy";
            }
            $timeout.cancel(leaveTimeout), scope.actualDragOverClass || (actualDragOverClass = calculateDragOverClass(scope, attr, evt)), 
            elem.addClass(actualDragOverClass);
        }, !1), elem[0].addEventListener("dragenter", function(evt) {
            evt.preventDefault(), stopPropagation && evt.stopPropagation();
        }, !1), elem[0].addEventListener("dragleave", function(evt) {
            leaveTimeout = $timeout(function() {
                elem.removeClass(actualDragOverClass), actualDragOverClass = null;
            }, dragOverDelay || 1);
        }, !1), "" != attr.ngFileDrop && (attr.ngFileChange = scope.ngFileDrop), elem[0].addEventListener("drop", function(evt) {
            evt.preventDefault(), stopPropagation && evt.stopPropagation(), elem.removeClass(actualDragOverClass), 
            actualDragOverClass = null, extractFiles(evt, function(files, rejFiles) {
                $timeout(function() {
                    ngModel && ($parse(attr.ngModel).assign(scope, files), ngModel && ngModel.$setViewValue(null != files && 0 == files.length ? "" : files)), 
                    attr.ngModelRejected && scope[attr.ngModelRejected] && $parse(attr.ngModelRejected).assign(scope, rejFiles);
                }), $timeout(function() {
                    $parse(attr.ngFileChange)(scope, {
                        $files: files,
                        $rejectedFiles: rejFiles,
                        $event: evt
                    });
                });
            }, 0 != $parse(attr.allowDir)(scope), attr.multiple || $parse(attr.ngMultiple)(scope));
        }, !1);
    }
    function dropAvailable() {
        var div = document.createElement("div");
        return "draggable" in div && "ondrop" in div;
    }
    function globStringToRegex(str) {
        if (str.length > 2 && "/" === str[0] && "/" === str[str.length - 1]) return str.substring(1, str.length - 1);
        var split = str.split(","), result = "";
        if (split.length > 1) for (var i = 0; i < split.length; i++) result += "(" + globStringToRegex(split[i]) + ")", 
        i < split.length - 1 && (result += "|"); else 0 == str.indexOf(".") && (str = "*" + str), 
        result = "^" + str.replace(new RegExp("[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]", "g"), "\\$&") + "$", 
        result = result.replace(/\\\*/g, ".*").replace(/\\\?/g, ".");
        return result;
    }
    window.XMLHttpRequest && !window.XMLHttpRequest.__isFileAPIShim && patchXHR("setRequestHeader", function(orig) {
        return function(header, value) {
            if ("__setXHR_" === header) {
                var val = value(this);
                val instanceof Function && val(this);
            } else orig.apply(this, arguments);
        };
    });
    var angularFileUpload = angular.module("angularFileUpload", []);
    angularFileUpload.version = "3.0.7", angularFileUpload.service("$upload", [ "$http", "$q", "$timeout", function($http, $q, $timeout) {
        function sendHttp(config) {
            config.method = config.method || "POST", config.headers = config.headers || {}, 
            config.transformRequest = config.transformRequest || function(data, headersGetter) {
                return window.ArrayBuffer && data instanceof window.ArrayBuffer ? data : $http.defaults.transformRequest[0](data, headersGetter);
            };
            var deferred = $q.defer(), promise = deferred.promise;
            return config.headers.__setXHR_ = function() {
                return function(xhr) {
                    xhr && (config.__XHR = xhr, config.xhrFn && config.xhrFn(xhr), xhr.upload.addEventListener("progress", function(e) {
                        e.config = config, deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function() {
                            promise.progress_fn(e);
                        });
                    }, !1), xhr.upload.addEventListener("load", function(e) {
                        e.lengthComputable && (e.config = config, deferred.notify ? deferred.notify(e) : promise.progress_fn && $timeout(function() {
                            promise.progress_fn(e);
                        }));
                    }, !1));
                };
            }, $http(config).then(function(r) {
                deferred.resolve(r);
            }, function(e) {
                deferred.reject(e);
            }, function(n) {
                deferred.notify(n);
            }), promise.success = function(fn) {
                return promise.then(function(response) {
                    fn(response.data, response.status, response.headers, config);
                }), promise;
            }, promise.error = function(fn) {
                return promise.then(null, function(response) {
                    fn(response.data, response.status, response.headers, config);
                }), promise;
            }, promise.progress = function(fn) {
                return promise.progress_fn = fn, promise.then(null, null, function(update) {
                    fn(update);
                }), promise;
            }, promise.abort = function() {
                return config.__XHR && $timeout(function() {
                    config.__XHR.abort();
                }), promise;
            }, promise.xhr = function(fn) {
                return config.xhrFn = function(origXhrFn) {
                    return function() {
                        origXhrFn && origXhrFn.apply(promise, arguments), fn.apply(promise, arguments);
                    };
                }(config.xhrFn), promise;
            }, promise;
        }
        this.upload = function(config) {
            config.headers = config.headers || {}, config.headers["Content-Type"] = void 0;
            config.transformRequest;
            return config.transformRequest = config.transformRequest ? "[object Array]" === Object.prototype.toString.call(config.transformRequest) ? config.transformRequest : [ config.transformRequest ] : [], 
            config.transformRequest.push(function(data, headerGetter) {
                var formData = new FormData(), allFields = {};
                for (var key in config.fields) allFields[key] = config.fields[key];
                if (data && (allFields.data = data), config.formDataAppender) for (var key in allFields) config.formDataAppender(formData, key, allFields[key]); else for (var key in allFields) {
                    var val = allFields[key];
                    void 0 !== val && ("[object String]" === Object.prototype.toString.call(val) ? formData.append(key, val) : config.sendObjectsAsJsonBlob && "object" == typeof val ? formData.append(key, new Blob([ val ], {
                        type: "application/json"
                    })) : formData.append(key, JSON.stringify(val)));
                }
                if (null != config.file) {
                    var fileFormName = config.fileFormDataName || "file";
                    if ("[object Array]" === Object.prototype.toString.call(config.file)) for (var isFileFormNameString = "[object String]" === Object.prototype.toString.call(fileFormName), i = 0; i < config.file.length; i++) formData.append(isFileFormNameString ? fileFormName : fileFormName[i], config.file[i], config.fileName && config.fileName[i] || config.file[i].name); else formData.append(fileFormName, config.file, config.fileName || config.file.name);
                }
                return formData;
            }), sendHttp(config);
        }, this.http = function(config) {
            return sendHttp(config);
        };
    } ]), angularFileUpload.directive("ngFileSelect", [ "$parse", "$timeout", "$compile", function($parse, $timeout, $compile) {
        return {
            restrict: "AEC",
            require: "?ngModel",
            link: function(scope, elem, attr, ngModel) {
                handleFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile);
            }
        };
    } ]), angularFileUpload.directive("ngFileDrop", [ "$parse", "$timeout", "$location", function($parse, $timeout, $location) {
        return {
            restrict: "AEC",
            require: "?ngModel",
            link: function(scope, elem, attr, ngModel) {
                handleDrop(scope, elem, attr, ngModel, $parse, $timeout, $location);
            }
        };
    } ]), angularFileUpload.directive("ngNoFileDrop", function() {
        return function(scope, elem, attr) {
            dropAvailable() && elem.css("display", "none");
        };
    }), angularFileUpload.directive("ngFileDropAvailable", [ "$parse", "$timeout", function($parse, $timeout) {
        return function(scope, elem, attr) {
            if (dropAvailable()) {
                var fn = $parse(attr.ngFileDropAvailable);
                $timeout(function() {
                    fn(scope);
                });
            }
        };
    } ]);
    var ngFileUpload = angular.module("ngFileUpload", []);
    for (var key in angularFileUpload) ngFileUpload[key] = angularFileUpload[key];
}(), function(angular) {
    "use strict";
    angular.module("ng-autofocus", []).directive("autofocus", [ "$timeout", function($timeout) {
        return {
            restrict: "A",
            link: function($scope, element) {
                $timeout(function() {
                    element[0].focus();
                });
            }
        };
    } ]);
}(angular), function() {
    this.ResizeSensor = function(element, callback) {
        function addResizeListener(element, callback) {
            window.OverflowEvent ? element.addEventListener("overflowchanged", function(e) {
                callback.call(this, e);
            }) : (element.addEventListener("overflow", function(e) {
                callback.call(this, e);
            }), element.addEventListener("underflow", function(e) {
                callback.call(this, e);
            }));
        }
        function EventQueue() {
            this.q = [], this.add = function(ev) {
                this.q.push(ev);
            };
            var i, j;
            this.call = function() {
                for (i = 0, j = this.q.length; i < j; i++) this.q[i].call();
            };
        }
        function getComputedStyle(element, prop) {
            return element.currentStyle ? element.currentStyle[prop] : window.getComputedStyle ? window.getComputedStyle(element, null).getPropertyValue(prop) : element.style[prop];
        }
        function attachResizeEvent(element, resized) {
            function setupSensor() {
                var change = !1, width = element.resizeSensor.offsetWidth, height = element.resizeSensor.offsetHeight;
                return x != width && (firstStyle.width = width - 1 + "px", lastStyle.width = width + 1 + "px", 
                change = !0, x = width), y != height && (firstStyle.height = height - 1 + "px", 
                lastStyle.height = height + 1 + "px", change = !0, y = height), change;
            }
            if (element.resizedAttached) {
                if (element.resizedAttached) return void element.resizedAttached.add(resized);
            } else element.resizedAttached = new EventQueue(), element.resizedAttached.add(resized);
            if ("onresize" in element && 11 > document.documentMode) element.attachEvent ? element.attachEvent("onresize", function() {
                element.resizedAttached.call();
            }) : element.addEventListener && element.addEventListener("resize", function() {
                element.resizedAttached.call();
            }); else {
                var myResized = function() {
                    setupSensor() && element.resizedAttached.call();
                };
                element.resizeSensor = document.createElement("div"), element.resizeSensor.className = "resize-sensor";
                var style = "position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1;";
                element.resizeSensor.style.cssText = style, element.resizeSensor.innerHTML = '<div class="resize-sensor-overflow" style="' + style + '"><div></div></div><div class="resize-sensor-underflow" style="' + style + '"><div></div></div>', 
                element.appendChild(element.resizeSensor), "absolute" !== getComputedStyle(element, "position") && (element.style.position = "relative");
                var x = -1, y = -1, firstStyle = element.resizeSensor.firstElementChild.firstChild.style, lastStyle = element.resizeSensor.lastElementChild.firstChild.style;
                setupSensor(), addResizeListener(element.resizeSensor, myResized), addResizeListener(element.resizeSensor.firstElementChild, myResized), 
                addResizeListener(element.resizeSensor.lastElementChild, myResized);
            }
        }
        if ("array" == typeof element || "undefined" != typeof jQuery && element instanceof jQuery || "undefined" != typeof Elements && element instanceof Elements) for (var i = 0, j = element.length; i < j; i++) attachResizeEvent(element[i], callback); else attachResizeEvent(element, callback);
    };
}(), RC4.getStringBytes = function(string) {
    for (var output = [], i = 0; i < string.length; i++) {
        var c = string.charCodeAt(i), bytes = [];
        do bytes.push(255 & c), c >>= 8; while (c > 0);
        output = output.concat(bytes.reverse());
    }
    return output;
}, RC4.prototype._swap = function(i, j) {
    var tmp = this.s[i];
    this.s[i] = this.s[j], this.s[j] = tmp;
}, RC4.prototype.mix = function(seed) {
    for (var input = RC4.getStringBytes(seed), j = 0, i = 0; i < this.s.length; i++) j += this.s[i] + input[i % input.length], 
    j %= 256, this._swap(i, j);
}, RC4.prototype.next = function() {
    return this.i = (this.i + 1) % 256, this.j = (this.j + this.s[this.i]) % 256, this._swap(this.i, this.j), 
    this.s[(this.s[this.i] + this.s[this.j]) % 256];
}, RNG.prototype.nextByte = function() {
    return this._state.next();
}, RNG.prototype.uniform = function() {
    for (var BYTES = 7, output = 0, i = 0; i < BYTES; i++) output *= 256, output += this.nextByte();
    return output / (Math.pow(2, 8 * BYTES) - 1);
}, RNG.prototype.random = function(n, m) {
    return null == n ? this.uniform() : (null == m && (m = n, n = 0), n + Math.floor(this.uniform() * (m - n)));
}, RNG.prototype.normal = function() {
    if (null !== this._normal) {
        var n = this._normal;
        return this._normal = null, n;
    }
    var x = this.uniform() || Math.pow(2, -53), y = this.uniform();
    return this._normal = Math.sqrt(-2 * Math.log(x)) * Math.sin(2 * Math.PI * y), Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y);
}, RNG.prototype.exponential = function() {
    return -Math.log(this.uniform() || Math.pow(2, -53));
}, RNG.prototype.poisson = function(mean) {
    var L = Math.exp(-(mean || 1)), k = 0, p = 1;
    do k++, p *= this.uniform(); while (p > L);
    return k - 1;
}, RNG.prototype.gamma = function(a) {
    var d = (a < 1 ? 1 + a : a) - 1 / 3, c = 1 / Math.sqrt(9 * d);
    do {
        do var x = this.normal(), v = Math.pow(c * x + 1, 3); while (v <= 0);
        var u = this.uniform(), x2 = Math.pow(x, 2);
    } while (u >= 1 - .0331 * x2 * x2 && Math.log(u) >= .5 * x2 + d * (1 - v + Math.log(v)));
    return a < 1 ? d * v * Math.exp(this.exponential() / -a) : d * v;
}, RNG.roller = function(expr, rng) {
    var parts = expr.split(/(\d+)?d(\d+)([+-]\d+)?/).slice(1), dice = parseFloat(parts[0]) || 1, sides = parseFloat(parts[1]), mod = parseFloat(parts[2]) || 0;
    return rng = rng || new RNG(), function() {
        for (var total = dice + mod, i = 0; i < dice; i++) total += rng.random(sides);
        return total;
    };
}, RNG.$ = new RNG(), function() {
    angular.module("angular-date-picker-polyfill", []);
}.call(this), function() {
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
                    return d = angular.isDate(ngModelCtrl.$viewValue) ? angular.copy(ngModelCtrl.$viewValue) : new Date(), 
                    d.setDate(1), scope.monthDate = d;
                }, refreshView = function() {
                    return scope.monthArray = aaMonthUtil.generateMonthArray(scope.monthDate.getFullYear(), scope.monthDate.getMonth(), ngModelCtrl.$viewValue);
                }, scope.setDate = function(d) {
                    var c;
                    return c = angular.isDate(ngModelCtrl.$viewValue) ? angular.copy(ngModelCtrl.$viewValue) : aaDateUtil.todayStart(), 
                    c.setYear(d.getFullYear()), c.setMonth(d.getMonth()), c.setDate(d.getDate()), ngModelCtrl.$setViewValue(c), 
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
                return d = new Date(), d.setHours(0), d.setMinutes(0), d.setSeconds(0), d.setMilliseconds(0), 
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
            var $popup, popupDiv, tmpl, useAmPm;
            return elem.wrap("<div class='aa-date-input'></div>"), tmpl = "<div class='aa-datepicker-popup' data-ng-show='isOpen'>\n  <div class='aa-datepicker-popup-close' data-ng-click='closePopup()'></div>\n  <div data-aa-calendar ng-model='ngModel'></div>", 
            includeTimepicker && (useAmPm = null == attrs.useAmPm || (attrs.useAmPm === !0 || "true" === attrs.useAmPm), 
            tmpl += "<div data-aa-timepicker use-am-pm='" + useAmPm + "' ng-model='ngModel'></div>"), 
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
            }), $wrapper = elem.parent(), $wrapper.on("mousedown", function(e) {
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
                return [ 31, year % 4 === 0 && year % 100 !== 0 || year % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ][month];
            },
            generateMonthArray: function(year, month, selected) {
                var arr, d, dayIndex, endDate, obj, offset, today, weekNum, _i;
                for (null == selected && (selected = null), d = new Date(year, month, 1), today = new Date(), 
                endDate = new Date(year, month, this.numberOfDaysInMonth(year, month)), offset = d.getDay(), 
                d.setDate(d.getDate() + offset * -1), arr = [], weekNum = 0; d <= endDate; ) {
                    for (arr.push([]), dayIndex = _i = 0; _i <= 6; dayIndex = ++_i) obj = {
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
                var amPm, h, m;
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
                return m = d.getMinutes(), [ h, m, amPm ];
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
                    return scope.useAmPm = null == attrs.useAmPm || (attrs.useAmPm === !0 || "true" === attrs.useAmPm), 
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
    var BROWSER_IS_IE7, BROWSER_SCROLLBAR_WIDTH, DOMSCROLL, DOWN, DRAG, ENTER, KEYDOWN, KEYUP, MOUSEDOWN, MOUSEENTER, MOUSEMOVE, MOUSEUP, MOUSEWHEEL, NanoScroll, PANEDOWN, RESIZE, SCROLL, SCROLLBAR, TOUCHMOVE, UP, WHEEL, cAF, defaults, getBrowserScrollbarWidth, hasTransform, isFFWithBuggyScrollbar, rAF, transform, _elementStyle, _prefixStyle, _vendor;
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
    }, SCROLLBAR = "scrollbar", SCROLL = "scroll", MOUSEDOWN = "mousedown", MOUSEENTER = "mouseenter", 
    MOUSEMOVE = "mousemove", MOUSEWHEEL = "mousewheel", MOUSEUP = "mouseup", RESIZE = "resize", 
    DRAG = "drag", ENTER = "enter", UP = "up", PANEDOWN = "panedown", DOMSCROLL = "DOMMouseScroll", 
    DOWN = "down", WHEEL = "wheel", KEYDOWN = "keydown", KEYUP = "keyup", TOUCHMOVE = "touchmove", 
    BROWSER_IS_IE7 = "Microsoft Internet Explorer" === window.navigator.appName && /msie 7./i.test(window.navigator.appVersion) && window.ActiveXObject, 
    BROWSER_SCROLLBAR_WIDTH = null, rAF = window.requestAnimationFrame, cAF = window.cancelAnimationFrame, 
    _elementStyle = document.createElement("div").style, _vendor = function() {
        var i, transform, vendor, vendors, _i, _len;
        for (vendors = [ "t", "webkitT", "MozT", "msT", "OT" ], i = _i = 0, _len = vendors.length; _i < _len; i = ++_i) if (vendor = vendors[i], 
        transform = vendors[i] + "ransform", transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
        return !1;
    }(), _prefixStyle = function(style) {
        return _vendor !== !1 && ("" === _vendor ? style : _vendor + style.charAt(0).toUpperCase() + style.substr(1));
    }, transform = _prefixStyle("transform"), hasTransform = transform !== !1, getBrowserScrollbarWidth = function() {
        var outer, outerStyle, scrollbarWidth;
        return outer = document.createElement("div"), outerStyle = outer.style, outerStyle.position = "absolute", 
        outerStyle.width = "100px", outerStyle.height = "100px", outerStyle.overflow = SCROLL, 
        outerStyle.top = "-9999px", document.body.appendChild(outer), scrollbarWidth = outer.offsetWidth - outer.clientWidth, 
        document.body.removeChild(outer), scrollbarWidth;
    }, isFFWithBuggyScrollbar = function() {
        var isOSXFF, ua, version;
        return ua = window.navigator.userAgent, !!(isOSXFF = /(?=.+Mac OS X)(?=.+Firefox)/.test(ua)) && (version = /Firefox\/\d{2}\./.exec(ua), 
        version && (version = version[0].replace(/\D+/g, "")), isOSXFF && +version > 23);
    }, NanoScroll = function() {
        function NanoScroll(el, options) {
            this.el = el, this.options = options, BROWSER_SCROLLBAR_WIDTH || (BROWSER_SCROLLBAR_WIDTH = getBrowserScrollbarWidth()), 
            this.$el = $(this.el), this.doc = $(this.options.documentContext || document), this.win = $(this.options.windowContext || window), 
            this.body = this.doc.find("body"), this.$content = this.$el.children("." + options.contentClass), 
            this.$content.attr("tabindex", this.options.tabIndex || 0), this.content = this.$content[0], 
            this.previousPosition = 0, this.options.iOSNativeScrolling && (null != this.el.style.WebkitOverflowScrolling || navigator.userAgent.match(/mobi.+Gecko/i)) ? this.nativeScrolling() : this.generate(), 
            this.createEvents(), this.addEvents(), this.reset();
        }
        return NanoScroll.prototype.preventScrolling = function(e, direction) {
            if (this.isActive) if (e.type === DOMSCROLL) (direction === DOWN && e.originalEvent.detail > 0 || direction === UP && e.originalEvent.detail < 0) && e.preventDefault(); else if (e.type === MOUSEWHEEL) {
                if (!e.originalEvent || !e.originalEvent.wheelDelta) return;
                (direction === DOWN && e.originalEvent.wheelDelta < 0 || direction === UP && e.originalEvent.wheelDelta > 0) && e.preventDefault();
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
            this.previousPosition = this.contentScrollTop, "same" !== direction && this.$el.trigger("update", {
                position: this.contentScrollTop,
                maximum: this.maxScrollTop,
                direction: direction
            }), this.iOSNativeScrolling || (this.maxSliderTop = this.paneHeight - this.sliderHeight, 
            this.sliderTop = 0 === this.maxScrollTop ? 0 : this.contentScrollTop * this.maxSliderTop / this.maxScrollTop);
        }, NanoScroll.prototype.setOnScrollStyles = function() {
            var cssValue;
            hasTransform ? (cssValue = {}, cssValue[transform] = "translate(0, " + this.sliderTop + "px)") : cssValue = {
                top: this.sliderTop
            }, rAF ? (cAF && this.scrollRAF && cAF(this.scrollRAF), this.scrollRAF = rAF(function(_this) {
                return function() {
                    return _this.scrollRAF = null, _this.slider.css(cssValue);
                };
            }(this))) : this.slider.css(cssValue);
        }, NanoScroll.prototype.createEvents = function() {
            this.events = {
                down: function(_this) {
                    return function(e) {
                        return _this.isBeingDragged = !0, _this.offsetY = e.pageY - _this.slider.offset().top, 
                        _this.slider.is(e.target) || (_this.offsetY = 0), _this.pane.addClass("active"), 
                        _this.doc.bind(MOUSEMOVE, _this.events[DRAG]).bind(MOUSEUP, _this.events[UP]), _this.body.bind(MOUSEENTER, _this.events[ENTER]), 
                        !1;
                    };
                }(this),
                drag: function(_this) {
                    return function(e) {
                        return _this.sliderY = e.pageY - _this.$el.offset().top - _this.paneTop - (_this.offsetY || .5 * _this.sliderHeight), 
                        _this.scroll(), _this.contentScrollTop >= _this.maxScrollTop && _this.prevScrollTop !== _this.maxScrollTop ? _this.$el.trigger("scrollend") : 0 === _this.contentScrollTop && 0 !== _this.prevScrollTop && _this.$el.trigger("scrolltop"), 
                        !1;
                    };
                }(this),
                up: function(_this) {
                    return function(e) {
                        return _this.isBeingDragged = !1, _this.pane.removeClass("active"), _this.doc.unbind(MOUSEMOVE, _this.events[DRAG]).unbind(MOUSEUP, _this.events[UP]), 
                        _this.body.unbind(MOUSEENTER, _this.events[ENTER]), !1;
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
                        _this.setOnScrollStyles()), null != e && (_this.contentScrollTop >= _this.maxScrollTop ? (_this.options.preventPageScrolling && _this.preventScrolling(e, DOWN), 
                        _this.prevScrollTop !== _this.maxScrollTop && _this.$el.trigger("scrollend")) : 0 === _this.contentScrollTop && (_this.options.preventPageScrolling && _this.preventScrolling(e, UP), 
                        0 !== _this.prevScrollTop && _this.$el.trigger("scrolltop"))));
                    };
                }(this),
                wheel: function(_this) {
                    return function(e) {
                        var delta;
                        if (null != e) return delta = e.delta || e.wheelDelta || e.originalEvent && e.originalEvent.wheelDelta || -e.detail || e.originalEvent && -e.originalEvent.detail, 
                        delta && (_this.sliderY += -delta / 3), _this.scroll(), !1;
                    };
                }(this),
                enter: function(_this) {
                    return function(e) {
                        var _ref;
                        if (_this.isBeingDragged) return 1 !== (e.buttons || e.which) ? (_ref = _this.events)[UP].apply(_ref, arguments) : void 0;
                    };
                }(this)
            };
        }, NanoScroll.prototype.addEvents = function() {
            var events;
            this.removeEvents(), events = this.events, this.options.disableResize || this.win.bind(RESIZE, events[RESIZE]), 
            this.iOSNativeScrolling || (this.slider.bind(MOUSEDOWN, events[DOWN]), this.pane.bind(MOUSEDOWN, events[PANEDOWN]).bind("" + MOUSEWHEEL + " " + DOMSCROLL, events[WHEEL])), 
            this.$content.bind("" + SCROLL + " " + MOUSEWHEEL + " " + DOMSCROLL + " " + TOUCHMOVE, events[SCROLL]);
        }, NanoScroll.prototype.removeEvents = function() {
            var events;
            events = this.events, this.win.unbind(RESIZE, events[RESIZE]), this.iOSNativeScrolling || (this.slider.unbind(), 
            this.pane.unbind()), this.$content.unbind("" + SCROLL + " " + MOUSEWHEEL + " " + DOMSCROLL + " " + TOUCHMOVE, events[SCROLL]);
        }, NanoScroll.prototype.generate = function() {
            var contentClass, cssRule, currentPadding, options, pane, paneClass, sliderClass;
            return options = this.options, paneClass = options.paneClass, sliderClass = options.sliderClass, 
            contentClass = options.contentClass, (pane = this.$el.children("." + paneClass)).length || pane.children("." + sliderClass).length || this.$el.append('<div class="' + paneClass + '"><div class="' + sliderClass + '" /></div>'), 
            this.pane = this.$el.children("." + paneClass), this.slider = this.pane.find("." + sliderClass), 
            0 === BROWSER_SCROLLBAR_WIDTH && isFFWithBuggyScrollbar() ? (currentPadding = window.getComputedStyle(this.content, null).getPropertyValue("padding-right").replace(/[^0-9.]+/g, ""), 
            cssRule = {
                right: -14,
                paddingRight: +currentPadding + 14
            }) : BROWSER_SCROLLBAR_WIDTH && (cssRule = {
                right: -BROWSER_SCROLLBAR_WIDTH
            }, this.$el.addClass("has-scrollbar")), null != cssRule && this.$content.css(cssRule), 
            this;
        }, NanoScroll.prototype.restore = function() {
            this.stopped = !1, this.iOSNativeScrolling || this.pane.show(), this.addEvents();
        }, NanoScroll.prototype.reset = function() {
            var content, contentHeight, contentPosition, contentStyle, contentStyleOverflowY, paneBottom, paneHeight, paneOuterHeight, paneTop, parentMaxHeight, right, sliderHeight;
            return this.iOSNativeScrolling ? void (this.contentHeight = this.content.scrollHeight) : (this.$el.find("." + this.options.paneClass).length || this.generate().stop(), 
            this.stopped && this.restore(), content = this.content, contentStyle = content.style, 
            contentStyleOverflowY = contentStyle.overflowY, BROWSER_IS_IE7 && this.$content.css({
                height: this.$content.height()
            }), contentHeight = content.scrollHeight + BROWSER_SCROLLBAR_WIDTH, parentMaxHeight = parseInt(this.$el.css("max-height"), 10), 
            parentMaxHeight > 0 && (this.$el.height(""), this.$el.height(content.scrollHeight > parentMaxHeight ? parentMaxHeight : content.scrollHeight)), 
            paneHeight = this.pane.outerHeight(!1), paneTop = parseInt(this.pane.css("top"), 10), 
            paneBottom = parseInt(this.pane.css("bottom"), 10), paneOuterHeight = paneHeight + paneTop + paneBottom, 
            sliderHeight = Math.round(paneOuterHeight / contentHeight * paneOuterHeight), sliderHeight < this.options.sliderMinHeight ? sliderHeight = this.options.sliderMinHeight : null != this.options.sliderMaxHeight && sliderHeight > this.options.sliderMaxHeight && (sliderHeight = this.options.sliderMaxHeight), 
            contentStyleOverflowY === SCROLL && contentStyle.overflowX !== SCROLL && (sliderHeight += BROWSER_SCROLLBAR_WIDTH), 
            this.maxSliderTop = paneOuterHeight - sliderHeight, this.contentHeight = contentHeight, 
            this.paneHeight = paneHeight, this.paneOuterHeight = paneOuterHeight, this.sliderHeight = sliderHeight, 
            this.paneTop = paneTop, this.slider.height(sliderHeight), this.events.scroll(), 
            this.pane.show(), this.isActive = !0, content.scrollHeight === content.clientHeight || this.pane.outerHeight(!0) >= content.scrollHeight && contentStyleOverflowY !== SCROLL ? (this.pane.hide(), 
            this.isActive = !1) : this.el.clientHeight === content.scrollHeight && contentStyleOverflowY === SCROLL ? this.slider.hide() : this.slider.show(), 
            this.pane.css({
                opacity: this.options.alwaysVisible ? 1 : "",
                visibility: this.options.alwaysVisible ? "visible" : ""
            }), contentPosition = this.$content.css("position"), "static" !== contentPosition && "relative" !== contentPosition || (right = parseInt(this.$content.css("right"), 10), 
            right && this.$content.css({
                right: "",
                marginRight: right
            })), this);
        }, NanoScroll.prototype.scroll = function() {
            if (this.isActive) return this.sliderY = Math.max(0, this.sliderY), this.sliderY = Math.min(this.maxSliderTop, this.sliderY), 
            this.$content.scrollTop(this.maxScrollTop * this.sliderY / this.maxSliderTop), this.iOSNativeScrolling || (this.updateScrollValues(), 
            this.setOnScrollStyles()), this;
        }, NanoScroll.prototype.scrollBottom = function(offsetY) {
            if (this.isActive) return this.$content.scrollTop(this.contentHeight - this.$content.height() - offsetY).trigger(MOUSEWHEEL), 
            this.stop().restore(), this;
        }, NanoScroll.prototype.scrollTop = function(offsetY) {
            if (this.isActive) return this.$content.scrollTop(+offsetY).trigger(MOUSEWHEEL), 
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
            if (!this.iOSNativeScrolling && this.isActive) return this.reset(), this.pane.addClass("flashed"), 
            setTimeout(function(_this) {
                return function() {
                    _this.pane.removeClass("flashed");
                };
            }(this), this.options.flashDelay), this;
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
            var fix, restore, defaults = {
                absolute: !1,
                clone: !1,
                includeMargin: !1
            }, configs = $.extend(defaults, options), $target = this.eq(0);
            if (configs.clone === !0) fix = function() {
                var style = "position: absolute !important; top: -1000 !important; ";
                $target = $target.clone().attr("style", style).appendTo("body");
            }, restore = function() {
                $target.remove();
            }; else {
                var $hidden, tmp = [], style = "";
                fix = function() {
                    $hidden = $target.parents().addBack().filter(":hidden"), style += "visibility: hidden !important; display: block !important; ", 
                    configs.absolute === !0 && (style += "position: absolute !important; "), $hidden.each(function() {
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
}(jQuery), !function() {
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
        c("Initialising iFrame"), f(), i(), h("background", L), h("padding", O), o(), m(), 
        j(), p(), n(), D("init", "Init message from host page");
    }
    function f() {
        function a(a) {
            return "true" === a;
        }
        var b = X.substr(_).split(":");
        ab = b[0], M = void 0 !== b[1] ? Number(b[1]) : M, P = void 0 !== b[2] ? a(b[2]) : P, 
        Z = void 0 !== b[3] ? a(b[3]) : Z, Y = void 0 !== b[4] ? Number(b[4]) : Y, bb = void 0 !== b[5] ? a(b[5]) : bb, 
        J = void 0 !== b[6] ? a(b[6]) : J, N = b[7], V = void 0 !== b[8] ? b[8] : V, L = b[9], 
        O = b[10], fb = void 0 !== b[11] ? Number(b[11]) : fb;
    }
    function g(a, b) {
        return -1 !== b.indexOf("-") && (d("Negative CSS value ignored for " + a), b = ""), 
        b;
    }
    function h(a, b) {
        void 0 !== b && "" !== b && "null" !== b && (document.body.style[a] = b, c("Body " + a + ' set to "' + b + '"'));
    }
    function i() {
        void 0 === N && (N = M + "px"), g("margin", N), h("margin", N);
    }
    function j() {
        document.documentElement.style.height = "", document.body.style.height = "", c('HTML & body height set to "auto"');
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
    function n() {
        !0 === J ? (k(), l(), s()) : c("Auto Resize disabled");
    }
    function o() {
        var a = document.createElement("div");
        a.style.clear = "both", a.style.display = "block", document.body.appendChild(a);
    }
    function p() {
        bb && (c("Enable public methods"), window.parentIFrame = {
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
                var c = "" + (a ? a : "") + (b ? "," + b : "");
                E(), D("size", "parentIFrame.size(" + c + ")", a, b);
            }
        });
    }
    function q() {
        0 !== Y && (c("setInterval: " + Y + "ms"), setInterval(function() {
            D("interval", "setInterval: " + Y);
        }, Math.abs(Y)));
    }
    function r(b) {
        function d(b) {
            (void 0 === b.height || void 0 === b.width || 0 === b.height || 0 === b.width) && (c("Attach listerner to " + b.src), 
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
    function s() {
        function a() {
            var a = document.querySelector("body"), d = {
                attributes: !0,
                attributeOldValue: !1,
                characterData: !0,
                characterDataOldValue: !1,
                childList: !0,
                subtree: !0
            }, e = new b(function(a) {
                D("mutationObserver", "mutationObserver: " + a[0].target + " " + a[0].type), r(a);
            });
            c("Enable MutationObserver"), e.observe(a, d);
        }
        var b = window.MutationObserver || window.WebKitMutationObserver;
        b ? 0 > Y ? q() : a() : (d("MutationObserver not supported in this browser!"), q());
    }
    function t() {
        function a(a) {
            function b(a) {
                var b = /^\d+(px)?$/i;
                if (b.test(a)) return parseInt(a, K);
                var d = c.style.left, e = c.runtimeStyle.left;
                return c.runtimeStyle.left = c.currentStyle.left, c.style.left = a || 0, a = c.style.pixelLeft, 
                c.style.left = d, c.runtimeStyle.left = e, a;
            }
            var c = document.body, d = 0;
            return "defaultView" in document && "getComputedStyle" in document.defaultView ? (d = document.defaultView.getComputedStyle(c, null), 
            d = null !== d ? d[a] : 0) : d = b(c.currentStyle[a]), parseInt(d, K);
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
    function x() {
        for (var a = document.querySelectorAll("body *"), b = a.length, d = 0, e = new Date().getTime(), f = 0; b > f; f++) a[f].getBoundingClientRect().bottom > d && (d = a[f].getBoundingClientRect().bottom);
        return e = new Date().getTime() - e, c("Parsed " + b + " HTML elements"), c("LowestElement bottom position calculated in " + e + "ms"), 
        d;
    }
    function y() {
        return [ t(), u(), v(), w() ];
    }
    function z() {
        return Math.max.apply(null, y());
    }
    function A() {
        return Math.min.apply(null, y());
    }
    function B() {
        return Math.max(t(), x());
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
        function g() {
            S = n, ib = o, H(S, ib, a);
        }
        function h() {
            return gb && a in Q;
        }
        function i() {
            function a(a, b) {
                var c = Math.abs(a - b) <= fb;
                return !c;
            }
            return n = void 0 !== d ? d : jb[V](), o = void 0 !== e ? e : C(), a(S, n) || P && a(ib, o);
        }
        function j() {
            return !(a in {
                init: 1,
                interval: 1,
                size: 1
            });
        }
        function k() {
            return V in cb;
        }
        function l() {
            c("No change in size detected");
        }
        function m() {
            j() && k() ? G(b) : a in {
                interval: 1
            } || (f(), l());
        }
        var n, o;
        h() ? c("Trigger event cancelled: " + a) : i() ? (f(), E(), g()) : m();
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
        function g() {
            void 0 === f ? f = db : c("Message targetOrigin: " + f);
        }
        function h() {
            var g = a + ":" + b, h = ab + ":" + g + ":" + d + (void 0 !== e ? ":" + e : "");
            c("Sending message to host page (" + h + ")"), eb.postMessage($ + h, f);
        }
        g(), h();
    }
    function I(a) {
        function b() {
            return $ === ("" + a.data).substr(0, _);
        }
        function f() {
            X = a.data, eb = a.source, e(), T = !1, setTimeout(function() {
                W = !1;
            }, R);
        }
        function g() {
            W ? c("Page reset ignored by init") : (c("Page size reset by host page"), F("resetPage"));
        }
        function h() {
            return a.data.split("]")[1];
        }
        function i() {
            return "iFrameResize" in window;
        }
        function j() {
            return a.data.split(":")[2] in {
                true: 1,
                false: 1
            };
        }
        b() && (T && j() ? f() : "reset" === h() ? g() : a.data === X || i() || d("Unexpected message (" + a.data + ")"));
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
        min: A,
        grow: z,
        lowestElement: B
    };
    a(window, "message", I);
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

"undefined" != typeof module && module.exports && (module.exports = sjcl), sjcl.cipher.aes = function(a) {
    this.j[0][0][0] || this.D();
    var b, c, d, e, f = this.j[0][4], g = this.j[1];
    b = a.length;
    var h = 1;
    for (4 !== b && 6 !== b && 8 !== b && q(new sjcl.exception.invalid("invalid aes key size")), 
    this.a = [ d = a.slice(0), e = [] ], a = b; a < 4 * b + 28; a++) c = d[a - 1], (0 === a % b || 8 === b && 4 === a % b) && (c = f[c >>> 24] << 24 ^ f[c >> 16 & 255] << 16 ^ f[c >> 8 & 255] << 8 ^ f[255 & c], 
    0 === a % b && (c = c << 8 ^ c >>> 24 ^ h << 24, h = h << 1 ^ 283 * (h >> 7))), 
    d[a] = d[a - b] ^ c;
    for (b = 0; a; b++, a--) c = d[3 & b ? a : a - 4], e[b] = 4 >= a || 4 > b ? c : g[0][f[c >>> 24]] ^ g[1][f[c >> 16 & 255]] ^ g[2][f[c >> 8 & 255]] ^ g[3][f[255 & c]];
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
        for (e = 0; 256 > e; e++) l[(h[e] = e << 1 ^ 283 * (e >> 7)) ^ e] = e;
        for (f = g = 0; !c[f]; f ^= k || 1, g = l[g] || 1) for (m = g ^ g << 1 ^ g << 2 ^ g << 3 ^ g << 4, 
        m = m >> 8 ^ 255 & m ^ 99, c[f] = m, d[m] = f, n = h[e = h[k = h[f]]], p = 16843009 * n ^ 65537 * e ^ 257 * k ^ 16843008 * f, 
        n = 257 * h[m] ^ 16843008 * m, e = 0; 4 > e; e++) a[e][f] = n = n << 24 ^ n >>> 8, 
        b[e][m] = p = p << 24 ^ p >>> 8;
        for (e = 0; 5 > e; e++) a[e] = a[e].slice(0), b[e] = b[e].slice(0);
    }
}, sjcl.bitArray = {
    bitSlice: function(a, b, c) {
        return a = sjcl.bitArray.P(a.slice(b / 32), 32 - (31 & b)).slice(1), c === t ? a : sjcl.bitArray.clamp(a, c - b);
    },
    extract: function(a, b, c) {
        var d = Math.floor(-b - c & 31);
        return ((b + c - 1 ^ b) & -32 ? a[b / 32 | 0] << 32 - d ^ a[b / 32 + 1 | 0] >>> d : a[b / 32 | 0] >>> d) & (1 << c) - 1;
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
        a = a.slice(0, Math.ceil(b / 32));
        var c = a.length;
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
        for (d = 0; d < c / 8; d++) 0 === (3 & d) && (e = a[d / 4]), b += String.fromCharCode(e >>> 24), 
        e <<= 8;
        return decodeURIComponent(escape(b));
    },
    toBits: function(a) {
        a = unescape(encodeURIComponent(a));
        var c, b = [], d = 0;
        for (c = 0; c < a.length; c++) d = d << 8 | a.charCodeAt(c), 3 === (3 & c) && (b.push(d), 
        d = 0);
        return 3 & c && b.push(sjcl.bitArray.partial(8 * (3 & c), d)), b;
    }
}, sjcl.codec.hex = {
    fromBits: function(a) {
        var c, b = "";
        for (c = 0; c < a.length; c++) b += ((0 | a[c]) + 0xf00000000000).toString(16).substr(4);
        return b.substr(0, sjcl.bitArray.bitLength(a) / 4);
    },
    toBits: function(a) {
        var b, d, c = [];
        for (a = a.replace(/\s|0x/g, ""), d = a.length, a += "00000000", b = 0; b < a.length; b += 8) c.push(0 ^ parseInt(a.substr(b, 8), 16));
        return sjcl.bitArray.clamp(c, 4 * d);
    }
}, sjcl.codec.base64 = {
    J: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    fromBits: function(a, b, c) {
        var d = "", e = 0, f = sjcl.codec.base64.J, g = 0, h = sjcl.bitArray.bitLength(a);
        for (c && (f = f.substr(0, 62) + "-_"), c = 0; 6 * d.length < h; ) d += f.charAt((g ^ a[c] >>> e) >>> 26), 
        6 > e ? (g = a[c] << 6 - e, e += 26, c++) : (g <<= 6, e -= 6);
        for (;3 & d.length && !b; ) d += "=";
        return d;
    },
    toBits: function(a, b) {
        a = a.replace(/\s|=/g, "");
        var d, h, c = [], e = 0, f = sjcl.codec.base64.J, g = 0;
        for (b && (f = f.substr(0, 62) + "-_"), d = 0; d < a.length; d++) h = f.indexOf(a.charAt(d)), 
        0 > h && q(new sjcl.exception.invalid("this isn't base64!")), 26 < e ? (e -= 26, 
        c.push(g ^ h >>> e), g = h << 32 - e) : (e += 6, g ^= h << 32 - e);
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
        var a, b = this.n, c = this.q, b = sjcl.bitArray.concat(b, [ sjcl.bitArray.partial(1, 1) ]);
        for (a = b.length + 2; 15 & a; a++) b.push(0);
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
        a: for (;64 > b; c++) {
            for (d = 2; d * d <= c; d++) if (0 === c % d) continue a;
            8 > b && (this.N[b] = a(Math.pow(c, .5))), this.a[b] = a(Math.pow(c, 1 / 3)), b++;
        }
    }
}, sjcl.mode.ccm = {
    name: "ccm",
    encrypt: function(a, b, c, d, e) {
        var f, g = b.slice(0), h = sjcl.bitArray, l = h.bitLength(c) / 8, k = h.bitLength(g) / 8;
        for (e = e || 64, d = d || [], 7 > l && q(new sjcl.exception.invalid("ccm: iv must be at least 7 bytes")), 
        f = 2; 4 > f && k >>> 8 * f; f++) ;
        return f < 15 - l && (f = 15 - l), c = h.clamp(c, 8 * (15 - f)), b = sjcl.mode.ccm.L(a, b, c, d, e, f), 
        g = sjcl.mode.ccm.o(a, g, c, b, e, f), h.concat(g.data, g.tag);
    },
    decrypt: function(a, b, c, d, e) {
        e = e || 64, d = d || [];
        var f = sjcl.bitArray, g = f.bitLength(c) / 8, h = f.bitLength(b), l = f.clamp(b, h - e), k = f.bitSlice(b, h - e), h = (h - e) / 8;
        for (7 > g && q(new sjcl.exception.invalid("ccm: iv must be at least 7 bytes")), 
        b = 2; 4 > b && h >>> 8 * b; b++) ;
        return b < 15 - g && (b = 15 - g), c = f.clamp(c, 8 * (15 - b)), l = sjcl.mode.ccm.o(a, l, c, k, e, b), 
        a = sjcl.mode.ccm.L(a, l.data, c, d, e, b), f.equal(l.tag, a) || q(new sjcl.exception.corrupt("ccm: tag doesn't match")), 
        l.data;
    },
    L: function(a, b, c, d, e, f) {
        var g = [], h = sjcl.bitArray, l = h.k;
        if (e /= 8, (e % 2 || 4 > e || 16 < e) && q(new sjcl.exception.invalid("ccm: invalid tag length")), 
        (4294967295 < d.length || 4294967295 < b.length) && q(new sjcl.exception.bug("ccm: can't deal with 4GiB or more data")), 
        f = [ h.partial(8, (d.length ? 64 : 0) | e - 2 << 2 | f - 1) ], f = h.concat(f, c), 
        f[3] |= h.bitLength(b) / 8, f = a.encrypt(f), d.length) for (c = h.bitLength(d) / 8, 
        65279 >= c ? g = [ h.partial(16, c) ] : 4294967295 >= c && (g = h.concat([ h.partial(16, 65534) ], [ c ])), 
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
        for (d = d || [], e = e || 64, g = 0; g + 4 < b.length; g += 4) m = b.slice(g, g + 4), 
        n = k(n, m), p = p.concat(k(c, a.encrypt(k(c, m)))), c = h(c);
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
        var c, d = sjcl.mode.ocb2.H, e = sjcl.bitArray, f = e.k, g = [ 0, 0, 0, 0 ], h = a.encrypt([ 0, 0, 0, 0 ]), h = f(h, d(d(h)));
        for (c = 0; c + 4 < b.length; c += 4) h = d(h), g = f(g, a.encrypt(f(h, b.slice(c, c + 4))));
        return c = b.slice(c), 128 > e.bitLength(c) && (h = f(h, d(h)), c = e.concat(c, [ -2147483648, 0, 0, 0 ])), 
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
        return e = e || 128, d = d || [], e <= h ? (b = g.bitSlice(f, h - e), f = g.bitSlice(f, 0, h - e)) : (b = f, 
        f = []), a = sjcl.mode.gcm.o(u, a, f, d, c, e), g.equal(a.tag, b) || q(new sjcl.exception.corrupt("gcm: tag doesn't match")), 
        a.data;
    },
    W: function(a, b) {
        var c, d, e, f, g, h = sjcl.bitArray.k;
        for (e = [ 0, 0, 0, 0 ], f = b.slice(0), c = 0; 128 > c; c++) {
            for ((d = 0 !== (a[Math.floor(c / 32)] & 1 << 31 - c % 32)) && (e = h(e, f)), g = 0 !== (1 & f[3]), 
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
        96 === h ? (e = e.slice(0), e = r.concat(e, [ 1 ])) : (e = sjcl.mode.gcm.f(g, [ 0, 0, 0, 0 ], e), 
        e = sjcl.mode.gcm.f(g, e, [ 0, 0, Math.floor(h / 4294967296), 4294967295 & h ])), 
        h = sjcl.mode.gcm.f(g, [ 0, 0, 0, 0 ], d), n = e.slice(0), d = h.slice(0), a || (d = sjcl.mode.gcm.f(g, h, c)), 
        k = 0; k < m; k += 4) n[3]++, l = b.encrypt(n), c[k] ^= l[0], c[k + 1] ^= l[1], 
        c[k + 2] ^= l[2], c[k + 3] ^= l[3];
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
    var a = this.G.finalize(), a = new this.M(this.m[1]).update(a).finalize();
    return this.reset(), a;
}, sjcl.misc.pbkdf2 = function(a, b, c, d, e) {
    c = c || 1e3, (0 > d || 0 > c) && q(sjcl.exception.invalid("invalid params to pbkdf2")), 
    "string" == typeof a && (a = sjcl.codec.utf8String.toBits(a)), "string" == typeof b && (b = sjcl.codec.utf8String.toBits(b)), 
    e = e || sjcl.misc.hmac, a = new e(a);
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
        var d, c = [];
        d = this.isReady(b);
        var e;
        if (d === this.l && q(new sjcl.exception.notReady("generator isn't seeded")), d & this.w) {
            d = !(d & this.u), e = [];
            var g, f = 0;
            for (this.O = e[0] = new Date().valueOf() + this.T, g = 0; 16 > g; g++) e.push(4294967296 * Math.random() | 0);
            for (g = 0; g < this.b.length && (e = e.concat(this.b[g].finalize()), f += this.h[g], 
            this.h[g] = 0, !(!d && this.F & 1 << g)); g++) ;
            for (this.F >= 1 << this.b.length && (this.b.push(new sjcl.hash.sha256()), this.h.push(0)), 
            this.c -= f, f > this.i && (this.i = f), this.F++, this.a = sjcl.hash.sha256.hash(this.a.concat(e)), 
            this.A = new sjcl.cipher.aes(this.a), d = 0; 4 > d && (this.e[d] = this.e[d] + 1 | 0, 
            !this.e[d]); d++) ;
        }
        for (d = 0; d < a; d += 4) 0 === (d + 1) % this.S && A(this), e = B(this), c.push(e[0], e[1], e[2], e[3]);
        return A(this), c.slice(0, a);
    },
    setDefaultParanoia: function(a) {
        this.B = a;
    },
    addEntropy: function(a, b, c) {
        c = c || "user";
        var d, e, f = new Date().valueOf(), g = this.t[c], h = this.isReady(), l = 0;
        switch (d = this.K[c], d === t && (d = this.K[c] = this.V++), g === t && (g = this.t[c] = 0), 
        this.t[c] = (this.t[c] + 1) % this.b.length, typeof a) {
          case "number":
            b === t && (b = 1), this.b[g].update([ d, this.C++, 1, b, f, 1, 0 | a ]);
            break;

          case "object":
            if (c = Object.prototype.toString.call(a), "[object Uint32Array]" === c) {
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
        return a = this.I[a ? a : this.B], this.i >= a ? 1 : this.c > a ? 1 : this.c / a;
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
        for (c = 0; c < f.length; c++) d = f[c], delete e[d];
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
        "string" == typeof f.iv && (f.iv = sjcl.codec.base64.toBits(f.iv)), (!sjcl.mode[f.mode] || !sjcl.cipher[f.cipher] || "string" == typeof a && 100 >= f.iter || 64 !== f.ts && 96 !== f.ts && 128 !== f.ts || 128 !== f.ks && 192 !== f.ks && 256 !== f.ks || 2 > f.iv.length || 4 < f.iv.length) && q(new sjcl.exception.invalid("json encrypt: invalid parameters")), 
        "string" == typeof a ? (g = sjcl.misc.cachedPbkdf2(a, f), a = g.key.slice(0, f.ks / 32), 
        f.salt = g.salt) : sjcl.ecc && a instanceof sjcl.ecc.elGamal.publicKey && (g = a.kem(), 
        f.kemtag = g.tag, a = g.key.slice(0, f.ks / 32)), "string" == typeof b && (b = sjcl.codec.utf8String.toBits(b)), 
        "string" == typeof c && (c = sjcl.codec.utf8String.toBits(c)), g = new sjcl.cipher[f.cipher](a), 
        e.d(d, f), d.key = a, f.ct = sjcl.mode[f.mode].encrypt(g, b, f.iv, c, f.ts), e.encode(f);
    },
    decrypt: function(a, b, c, d) {
        c = c || {}, d = d || {};
        var e = sjcl.json;
        b = e.d(e.d(e.d({}, e.defaults), e.decode(b)), c, !0);
        var f;
        return c = b.adata, "string" == typeof b.salt && (b.salt = sjcl.codec.base64.toBits(b.salt)), 
        "string" == typeof b.iv && (b.iv = sjcl.codec.base64.toBits(b.iv)), (!sjcl.mode[b.mode] || !sjcl.cipher[b.cipher] || "string" == typeof a && 100 >= b.iter || 64 !== b.ts && 96 !== b.ts && 128 !== b.ts || 128 !== b.ks && 192 !== b.ks && 256 !== b.ks || !b.iv || 2 > b.iv.length || 4 < b.iv.length) && q(new sjcl.exception.invalid("json decrypt: invalid parameters")), 
        "string" == typeof a ? (f = sjcl.misc.cachedPbkdf2(a, b), a = f.key.slice(0, b.ks / 32), 
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
        a = a.replace(/\s/g, ""), a.match(/^\{.*\}$/) || q(new sjcl.exception.invalid("json decode: this isn't json!")), 
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
    return b = b || {}, d = b.iter || 1e3, c = c[a] = c[a] || {}, d = c[d] = c[d] || {
        firstSalt: b.salt && b.salt.length ? b.salt.slice(0) : sjcl.random.randomWords(2, 0)
    }, c = b.salt === t ? d.firstSalt : b.salt, d[c] = d[c] || sjcl.misc.pbkdf2(a, c, b.iter), 
    {
        key: d[c].slice(0),
        salt: c.slice(0)
    };
}, Random = {}, Random.getRandomInteger = function(max) {
    var random, bit_length = max.bitLength();
    random = sjcl.random.randomWords(bit_length / 32, 0);
    var rand_bi = new BigInt(sjcl.codec.hex.fromBits(random), 16);
    return rand_bi.mod(max);
};