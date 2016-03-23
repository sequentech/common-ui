/**
 * @description Service that manages the Plugins extension points.
 */
angular.module('avRegistration')
    .factory('Plugins', function() {
        var plugins = {};
        // TODO: What are plugins used for exactly? Please explain
        plugins.plugins = {list: []};

        // Signal storage
        plugins.signals = $.Callbacks("unique");

        /**
         * List of hooks handlers.
         *
         * A hook is a point of extension. Each time @a Plugins.hook()
         * is called, all the hooks are called with the arguments given and in
         * list order, so that they can process the hook.
         *
         * To insert/delete/list hook handlers, access directly to
         * @a Plugins.hooks.
         *
         * Each hook handler is a function that receives two arguments:
         * - hookname
         * - data
         *
         * A hook handler should return a value interpretable as a false
         * expression if it wants no other hook to process the call, or
         * anything else otherwise.
         *
         * Example hook handler:
         *
         * <code>
         *    var fooHookHandler = function(hookname, data) {
         *      if (hookname === "foo") {
         *         processFoo(data);
         *         return false;
         *      }
         *
         *      return true;
         *    };
         *
         *    // add the handler
         *    AdminPlugins.hooks.push(fooHookHandler);
         * </code>
         */
        plugins.hooks = [];

        /*
         * Adds a plugin.
         *
         * plugin format:
         * {
         *   name: 'test',
         *   directive: 'test', (optional, only if this link has a directive)
         *   head: true | false,
         *   link: ui-sref link,
         *   menu: html() | {icon: icon, text: text}
         * }
         */
        plugins.add = function(plugin) {
            plugins.plugins.list.push(plugin);
        };

        /*
         * Clears the plugins list.
         */
        plugins.clear = function() {
            plugins.plugins.list = [];
        };

        /**
         * Remove a plugin from the list.
         */
        plugins.remove = function(plugin) {
            // Implemented by creating a new list without the plugin of that
            // name
            var pluginList = plugins.plugins.list;
            plugins.plugins.list = [];
            pluginList.forEach(function(pluginFromList) {
                if (plugin.name !== pluginFromList.name) {
                    plugins.plugins.list.push(pluginFromList);
                }
            });
        };

        /**
         * Emits a signal by name.
         *
         * @data can be any object or even null.
         */
        plugins.emit = function(signalName, data) {
            plugins.signals.fire(signalName, data);
        };

        /**
         * Calls to a hook by name.
         *
         * Each function stored as a hook is called with the provided
         * @a hookname and @a data in the hook insertion order. When a hook
         * returns a value interpretable as false, no more hooks are called.
         *
         * @a data can be any object or even null.
         * @a hookname should be a string.
         *
         * @returns false if any of the hooks returns false, or true otherwise.
         */
        plugins.hook = function(hookname, data) {
            for (var i=0; i<plugins.hooks.length; i++) {
                var h = plugins.hooks[i];
                var ret = h(hookname, data);
                if (!ret) {
                    return false;
                }
            }
            return true;
        };

        return plugins;
    });

/**
 * Directive to include angular templates with directives from plugins into
 * the admin interface
 * This directive is based on the stackoverflow thread:
 * http://stackoverflow.com/questions/17417607/angular-ng-bind-html-unsafe-and-directive-within-it
 **/
angular.module('avRegistration')
.directive(
  'avPluginHtml',
  function ($compile, $sce, $parse)
  {
    return function(scope, element, attrs)
    {
      var parsedHtml = $parse(attrs.ngBindHtml);

      // compile again on template modification
      scope.$watch(
        function()
        {
          return (parsedHtml(scope) || "").toString();
        },
        function()
        {
          // -9999 skips directives in order to prevent recompiling
          // recursively
          $compile(element, null, -9999)(scope);
        }
      );
    };
  }
);
