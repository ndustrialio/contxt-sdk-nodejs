var fs = require('fs'),
  path = require('path'),
  _ = require('underscore');

/**
 * Generates scope definitions based on route files.
 *
 * @class RoutesScanner
 * @constructor
 * @param {object} options - The options.
 * @param {array} options.exclude - List of routes to exclude.
 * @param {regex} options.controller_regex - Regex to match the controller.
 * @static
 * @module contxt
 * @submodule routescanner
 * @main contxt
 * @namespace contxt-sdk-nodejs
 * @example
 *  var routes_scanner = require('contxt-sdk-nodejs').RoutesScanner({
 *    exclude: []
 *    controller_regex: /check\('([a-z.]+)'\)/g
 *  });
 */

var RoutesScanner = function(options) {
  /**
   * @property _options
   * @private
   * @type object
   */
  var _options = _.defaults(options, {
    exclude: []
  });

  /**
   * Read the routes directory and scan each file getting route definitions.
   *
   * @method scan
   * @param {string} routes_path - The path to scan for route definitions.
   * @return {object} scope_definitions - The controllers defined on the routes.
   */
  var scan = function(routes_path) {
    if (_.isUndefined(routes_path)) {
      throw new Error('path must be provided!');
    }

    var scope_definitions = {},
      routes = fs.readdirSync(routes_path);

    routes.forEach(function(route) {
      var route_name = route.split('.')[0],
        content = fs.readFileSync(path.join(routes_path, route), 'utf-8'),
        lines = content.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');

      if (_.contains(_options.exclude, route_name)) {
        return;
      }

      scope_definitions['read:' + route_name] = [];
      scope_definitions['write:' + route_name] = [];

      lines.forEach(function(line) {
        var match, controller;

        while ((match = _options.controller_regex.exec(line)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (match.index === _options.controller_regex.lastIndex) {
            _options.controller_regex.lastIndex++;
          }

          controller = match[1];
        }

        if (!controller) {
          return;
        }

        // TODO: parameterize router.get, router.post, router.delete, and router.put
        if (line.indexOf('router.get') !== -1) {
          scope_definitions['read:' + route_name].push(controller);
        } else if (line.indexOf('router.post') !== -1 ||
          line.indexOf('router.delete') !== -1 ||
          line.indexOf('router.put') !== -1) {
          scope_definitions['write:' + route_name].push(controller);
        }
      });
    });

    return scope_definitions;
  };

  return {
    scan: scan
  };
};

module.exports = RoutesScanner;
