var request = require('request'),
  _ = require('underscore'),
  Redis = require('redis'),
  config = require('./../config'),
  errors = require('./../errors');

/**
 * @class Auth
 * @constructor
 * @param {object} options - The options.
 * @param {object} options.service_url - The OAuth2 service URL.
 * @param {string} options.TOKEN_CACHE_EXPIRES - The expiration time of the auth token in seconds.
 * @static
 * @module middleware
 * @submodule auth
 * @main middleware
 * @namespace contxt-sdk-nodejs.sdk.middleware
 * @deprecated Use `Sdk.middleware.Auth0` instead
 * @example
 *  var auth = require('contxt-sdk-nodejs').Sdk().middleware.Auth({
 *    service_url: 'test'
 *    TOKEN_CACHE_EXPIRES: 3600
 *  });
 */

var Auth = function(options) {
  /**
   * @property _options
   * @private
   * @type object
   */
  var _options = _.defaults(options, {
    TOKEN_CACHE_EXPIRES: 3600 // 1h
  });

  /**
   * @property _config
   * @private
   * @type object
   */
  var _config = config.get();

  /**
   * @property _redis_connection
   * @private
   * @type object
   */
  var _redis_connection = _config.redis_connection;

  /**
   * Call the auth service and return the parsed results.
   *
   * @member _call_auth_service
   * @async
   * @private
   * @param {string} bearer - OAuth2 token bearer string.
   * @param {function} callback - Callback to execute when the response is parsed.
   */
  var _call_auth_service = function(bearer, callback) {
    request({
      url: _options.service_url + '/users/current',
      headers: {
        'Authorization': bearer
      }
    }, function(err, response, body) {

      if (err) {
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

      // TODO: Better check for if the response body is an user object or an auth error
      if (_.has(result, 'code')) {
        return callback(result);
      }

      callback(null, result);
    });
  };

  /**
   * Call an OAuth endpoint to authorize the request.
   *
   * @member authorize
   * @async
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {function} next - Callback to execute the next Express middleware.
   */
  var authorize = function(req, res, next) {
    var bearer = req.header('Authorization'),
      token;

    if (!bearer) {
      return next(new errors.not_authorised('Access token not provided'));
    }

    token = bearer.split(' ')[1];

    if (!token) {
      return next(new errors.validation_error('Access token is malformed'));
    }

    // Store the token on the request object to be used further along the line
    req.token = token;

    if (_redis_connection) {
      console.info('Found cache configuration. Trying to get token from cache...');

      _redis_connection.hgetall(token, function(err, cached_user) {
        if (cached_user === null || err) {
          console.info('Token not found in cache. Trying service...');

          _call_auth_service(bearer, function(err, result) {
            if (err) {
              return next(err);
            }

            // Set the token information in cache with expiration
            _redis_connection.hmset(token, result, function() {
              _redis_connection.expire(token, _options.TOKEN_CACHE_EXPIRES, Redis.print);
            });

            req.user = result;

            next();
          });
        } else {
          console.info('Token found in cache.');

          req.user = cached_user;

          next();
        }
      });
    } else {
      console.info('No cache configuration found. Trying service...');

      _call_auth_service(bearer, function(err, result) {
        if (err) {
          return next(err);
        }

        req.user = result;

        next();
      });
    }
  };

  return {
    authorize: authorize
  };
};

module.exports = Auth;
