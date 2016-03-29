var request = require('request'),
  _ = require('underscore'),
  errors = require('./../errors');

/**
 * @class Auth
 * @constructor
 * @param {object} options - The options.
 * @param {object} options.service_url - The OAuth2 service URL.
 * @static
 * @module middleware
 * @submodule auth
 * @main middleware
 * @namespace contxt-sdk-nodejs.sdk.middleware
 * @example
 *  var auth = require('contxt-sdk-nodejs').Sdk().middleware.Auth({service_url: 'test'});
 */

var Auth = function(options) {

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

    token = _.first(bearer.match(/[A-Za-z0-9]{255}/g));

    if (!token) {
      return next(new errors.validation_error('Access token is malformed'));
    }

    // Store the token on the request object to be used further along the line
    req.token = token;

    request({
      url: options.service_url + '/users/current',
      headers: {
        'Authorization': bearer
      }
    }, function(error, response, body) {

      if (error) {
        return next(new errors.interservice_error('Unable to authorise request. Authentication service unavailable'));
      }

      if (response.statusCode != 200) {
        if (response.statusCode == 502) {
          return next(new errors.interservice_error('Unable to authorise request. Authentication service unavailable'));
        } else {
          return next(new errors.not_authorised(body));
        }
      }

      var result = JSON.parse(body);

      // TODO: Better check for if the response body is an user object or an auth error
      if (_.has(result, 'code')) {
        return next(result);
      }

      req.user = result;

      next();
    });
  };

  return {
    authorize: authorize
  };
};

module.exports = Auth;
