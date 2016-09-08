var _ = require('underscore'),
  jwt = require('express-jwt'),
  rsaValidation = require('auth0-api-jwt-rsa-validation'),
  errors = require('./../errors');

/**
 * @class Auth
 * @constructor
 * @param {object} options - The options.
 * @param {string} options.auth0_issuer - The Auth0 issuer URL.
 * @param {string} options.auth0_audience - The Auth0 audience.
 * @static
 * @module middleware
 * @submodule auth
 * @main middleware
 * @namespace contxt-sdk-nodejs.sdk.middleware
 * @example
 *  var auth = require('contxt-sdk-nodejs').Sdk().middleware.Auth({
 *    auth0_issuer: 'https://ndustrial.auth0.com/'
 *    auth0_audience: '<my_client_id>'
 *  });
 */

var Auth = function(options) {
  /**
   * @property _options
   * @private
   * @type object
   */
  var _options = _.defaults(options, {
    auth0_issuer: 'https://ndustrial.auth0.com/'
  });

  if (!_.has(_options, 'auth0_audience')) {
    throw new Error('auth0_audience must be provided!');
  }

  /**
   * Auth0 authorization middleware based on JWT.
   *
   * @member authorize
   * @async
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {function} next - Callback to execute the next Express middleware.
   */
  var authorize = function(req, res, next) {
    var regex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+\/=]*$/;

    if (!_.has(req.headers, 'authorization')) {
      return next(new errors.validation_error('Authorization header not found!'));
    }

    var token = req.headers.authorization.split(' ');

    if (token.length !== 2) {
      return next(new errors.validation_error('Invalid authorization header. Must be Bearer <token>'));
    }

    token = token[1];

    var result = token.match(regex);

    if (!result) {
      return next(new errors.validation_error('Invalid token. Must be JWT token.'));
    }

    jwt({
      secret: rsaValidation(),
      algorithms: ['RS256'],
      issuer: _options.auth0_issuer,
      audience: _options.auth0_audience
    })(req, res, next);
  };

  return {
    authorize: authorize
  };
};

module.exports = Auth;
