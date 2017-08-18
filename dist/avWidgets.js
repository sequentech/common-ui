!function() {
    function createElement(name, attrs) {
        var el = document.createElement(name);
        for (var key in attrs) el.setAttribute(key, attrs[key]);
        return el;
    }
    function processLinks(className, callback) {
        for (var links = document.getElementsByClassName(className), i = 0; i < links.length; i++) {
            var link = links[i], href = link.getAttribute("href");
            void 0 !== callback && callback(link, i, className);
            var iframe = createElement("iframe", {
                class: className + "-iframe",
                src: href,
                style: "border: 0; width: 100%; height: 100%",
                seamless: ""
            });
            link.parentNode.insertBefore(iframe, link), link.parentNode.removeChild(link);
        }
    }
    function requestAuthorization(e) {
        function callback(khmac) {
            e.source.postMessage("avPostAuthorization:" + khmac, "*");
        }
        var reqAuth = "avRequestAuthorization:";
        if (e.data.substr(0, reqAuth.length) === reqAuth) {
            var args = [ JSON.parse(e.data.substr(reqAuth.length, e.data.length)), callback ];
            window[window.avRequestAuthorizationFuncName].apply(window, args);
        }
    }
    window.addEventListener("message", requestAuthorization, !1), processLinks("agoravoting-voting-booth", function(link) {
        var funcName = link.getAttribute("data-authorization-funcname");
        window.avRequestAuthorizationFuncName = funcName;
    }), processLinks("agoravoting-ballot-locator"), processLinks("agoravoting-results");
}();