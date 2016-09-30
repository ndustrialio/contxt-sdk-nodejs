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
 *    controller_regex: /(["'])((?:(?=(?:\\)*)\\.|.)*?)\1/gm
 *  });
 */

var RoutesScanner = function(options) {
  /**
   * @property _options
   * @private
   * @type object
   */
  var _options = _.defaults(options, {
    exclude: [],
    controller_regex: /(["'])((?:(?=(?:\\)*)\\.|.)*?)\1/gm
  });

  /**
   * Read the routes directory and scan each file getting route definitions.
   *
   * @method scan
   * @param {string} path - The path to scan for route definitions.
   * @return {object} scope_definitions - The controllers defined on the routes.
   */
  var scan = function(path) {
    if (!_.isUndefined(path)) {
      throw new Error('path must be provided!');
    }

    var scope_definitions = {},
      routes = fs.readdirSync(path);

    routes.forEach(function(route) {
      var route_name = route.split('.')[0],
        content = fs.readFileSync(path.join(path, route), 'utf-8'),
        lines = content.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');

      if (_.has(_options.exclude, route_name)) {
        return;
      }

      scope_definitions['read:' + route_name] = [];
      scope_definitions['write:' + route_name] = [];

      lines.forEach(function(line) {
        if (line.indexOf('router.') !== -1) {
          // Assume the controller is the last matched element
          var parts = line.match(_options.controller_regex),
            controller = parts[parts.length - 1];

          // Remove quotes
          controller = controller.substring(1);
          controller = controller.substring(0, controller.length - 1);

          if (line.indexOf('router.get') !== -1) {
            scope_definitions['read:' + route_name].push(controller);
          } else if (line.indexOf('router.post') !== -1 ||
            line.indexOf('router.delete') !== -1 ||
            line.indexOf('router.put') !== -1) {
            scope_definitions['write:' + route_name].push(controller);
          }
        }
      });
    });

    return scope_definitions;
  };

  return {
    scan: scan
  };
};

module.exports = RoutesScanner();
