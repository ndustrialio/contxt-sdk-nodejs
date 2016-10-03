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
 * @param {array} options.reads_regex - Regex to group the read scopes.
 * @param {array} options.writes_regex - Regex to group the write scopes.
 * @static
 * @module contxt
 * @submodule routescanner
 * @main contxt
 * @namespace contxt-sdk-nodejs
 * @since 0.4.0
 * @example
 *  var routes_scanner = require('contxt-sdk-nodejs').RoutesScanner({
 *    exclude: [],
 *    controller_regex: /check\('([a-z.]+)'\)/g,
 *    reads_regex: [],
 *    writes_regex: []
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
    reads_regex: [
      /router.get/g
    ],
    writes_regex: [
      /router.post/g,
      /router.put/g,
      /router.delete/g
    ]
  });

  if (_.isUndefined(_options.controller_regex)) {
    throw new Error('controller_regex must be provided!');
  }

  /**
   * Does a line by line search for the files in the the routes directory and
   * scans for controller paths.
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

        _options.reads_regex.forEach(function(read_regex) {
          if (line.match(read_regex) !== null) {
            scope_definitions['read:' + route_name].push(controller);
          }
        });

        _options.writes_regex.forEach(function(write_regex) {
          if (line.match(write_regex) !== null) {
            scope_definitions['write:' + route_name].push(controller);
          }
        });
      });
    });

    return scope_definitions;
  };

  return {
    scan: scan
  };
};

module.exports = RoutesScanner;
