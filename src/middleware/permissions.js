var request = require('request'),
  _ = require('underscore'),
  config = require('./../config'),
  errors = require('./../errors');

/**
 * @class Permissions
 * @constructor
 * @param {object} options - The options.
 * @param {object} options.definitions - The literal with scope mappings.
 * @param {string} options.controllers - The reference to the controllers functions.
 * @static
 * @module middleware
 * @submodule permissions
 * @main middleware
 * @namespace contxt-sdk-nodejs.sdk.middleware
 * @since 0.2.0
 * @beta
 * @example
 *  var auth = require('contxt-sdk-nodejs').Sdk().middleware.Permissions({
 *    definitions: {}
 *    controllers: {}
 *  });
 */

var Permissions = function(options) {
  /**
   * @property _options
   * @private
   * @type object
   */
  var _options = _.defaults(options, {});

  /**
   * @property _config
   * @private
   * @type object
   */
  var _config = config.get();

  if (!_.has(_options, 'controllers')) {
    throw new Error('Permissions middleware needs controllers map!');
  }

  var _scopes_by_controller = {};
  var _roles_map = {};
  var _controllers = _options.controllers;

  _.map(_options.definitions, function(controllers, scope) {
    _.each(controllers, function(controller) {
      if (!_.has(_scopes_by_controller, controller)) {
        _scopes_by_controller[controller] = [];
      }

      _scopes_by_controller[controller].push(scope);
    });
  });

  request({
    method: 'POST',
    url: 'https://ndustrial.auth0.com/oauth/token',
    headers: {
      'content-type': 'application/json'
    },
    json: {
      client_id: _config.client_id,
      client_secret: _config.client_secret,
      audience: _config.contxt_audience,
      grant_type: 'client_credentials'
    }
  }, function(error, response, body) {
    if (error) throw new Error(error);

    if (response.statusCode == 200) {
      var auth_token = body.access_token;

      _get_service_scope_mappings(auth_token, function(err, results) {
        if (err) {
          console.log('ERROR', err);
        }
        console.log(results);
      });
    } else {
      console.log(response.statusCode, body);
    }
  });

  var _get_service_scope_mappings = function(bearer, callback) {
    console.log('GETTING SERVICE SCOPES');
    console.log(_config.contxt_url + 'clients/' + _config.client_id + '/init');

    request({
      url: _config.contxt_url + 'clients/' + _config.client_id + '/init',
      headers: {
        'Authorization': 'Bearer ' + bearer
      }
    }, function(err, response, body) {
      if (err) {
        console.log(err);

        return callback(new errors.interservice_error('Unable to authorise request. Authentication service unavailable'));
      }

      if (response.statusCode != 200) {
        if (response.statusCode == 502) {
          return callback(new errors.interservice_error('Unable to authorise request. Authentication service unavailable'));
        } else {
          return callback(new errors.not_authorised(body));
        }
      }

      var result = JSON.parse(body);

      if (!_.has(result, 'role_mappings')) {
        return callback(new errors.server_error('Role mapping were not included in Contxt init!'));
      }

      _roles_map = result.role_mappings;

      console.log('ROLES MAP', _roles_map);

      callback(null, result);
    });
  };

  var init = function(callback) {
    request({
      method: 'POST',
      url: 'https://ndustrial.auth0.com/oauth/token',
      headers: {
        'content-type': 'application/json'
      },
      json: {
        client_id: config.get('client_id'),
        client_secret: config.get('client_secret'),
        audience: config.get('contxt_audience'),
        grant_type: 'client_credentials'
      }
    }, function(error, response, body) {
      if (error) throw new Error(error);

      console.log(body);

      config.set('contxt_token', JSON.parse(body).access_token);
    });
  };

  var check = function(controller_path) {
    var controller_path_parts = controller_path.split('.'),
      controller = controller_path_parts[0],
      method = controller_path_parts[1],
      needs_write_access = _.contains(['create', 'update', 'remove'], method);

    return function(req, res, next) {
      console.log(req.user);

      if (_.isEmpty(_roles_map)) {
        return next(new errors.server_error('Error - Permissions roles are unregistered or the server encountered an error retrieving roles from Contxt API Service'));
      }

      var scope = _scopes_by_controller[controller_path];

      if (!scope) {
        console.log('No scope for controller: ' + controller_path);
      } else {
        console.log('Scopes: ' + scope);
      }

      var allow = false;

      if (req.user.sub.indexOf('@clients') != -1) { // this is a client_credentials grant
        var scopes = req.user.scope.split(' ');

        if (_.indexOf(scopes, scope[0]) != -1) {
          allow = true;
        }
      } else {
        if (!_.has(req.user, 'user_metadata')) {
          return next(new errors.not_authorised('User has not been assigned any roles.'));
        } else {
          _.each(req.user.user_metadata.roles, function(role) {
            console.log(_roles_map);

            if (role in _roles_map) {
              _.each(_roles_map[role], function(aScope) {
                if (scope == aScope) {
                  allow = true;
                }
              });
            }
          });
        }
      }

      if (allow) {
        console.log('ALLOWED!!!!');
        req.scope = scope;
        var fn = _controllers[controller][method];

        if (typeof fn === 'function') {
          fn(req, res, next);
        }
      } else {
        console.log('~~~~ DENIED');
        next(new errors.not_authorised('Access denied for scope ' + scope));
      }
    };
  };

  return {
    check: check
  };
};

module.exports = Permissions;
