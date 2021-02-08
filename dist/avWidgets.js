!function() {
    function processLinks(className, callback) {
        for (var links = document.getElementsByClassName(className), i = 0; i < links.length; i++) {
            var link = links[i], iframe = link.getAttribute("href");
            void 0 !== callback && callback(link, i, className);
            iframe = function(name, attrs) {
                var key, el = document.createElement(name);
                for (key in attrs) el.setAttribute(key, attrs[key]);
                return el;
            }("iframe", {
                class: className + "-iframe",
                src: iframe,
                style: "border: 0; width: 100%; height: 100%",
                seamless: ""
            });
            link.parentNode.insertBefore(iframe, link), link.parentNode.removeChild(link);
        }
    }
    window.addEventListener("message", function(e) {
        var args = "avRequestAuthorization:";
        e && e.data && e.data.substr(0, args.length) === args && (args = [ JSON.parse(e.data.substr(args.length, e.data.length)), function(khmac) {
            e.source.postMessage("avPostAuthorization:" + khmac, "*");
        } ], window[window.avRequestAuthorizationFuncName].apply(window, args));
    }, !1), processLinks("agoravoting-voting-booth", function(funcName) {
        funcName = funcName.getAttribute("data-authorization-funcname");
        window.avRequestAuthorizationFuncName = funcName;
    }), processLinks("agoravoting-ballot-locator"), processLinks("agoravoting-results");
}();