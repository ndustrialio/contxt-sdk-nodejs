var request = require('request'),
  _ = require('underscore'),
  jwt = require('express-jwt'),
  rsaValidation = require('auth0-api-jwt-rsa-validation'),
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
 * @example
 *  var auth = require('contxt-sdk-nodejs').Sdk().middleware.Auth({
 *    auth0_issuer_url: 'https://ndustrial.auth0.com/'
 *    auth0_audience: '<my_client_id>
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
  
  if (!_.has(_options, 'client_id')) {
    throw new Error('client_id must be provided!');
  }

  /**
   * @property _config
   * @private
   * @type object
   */
  var _config = config.get();

  
  
  var tokenCheck = function(req, res, next) {
      if (!_.has(req.headers, 'authorization')) {
          return next(new errors.validation_error('Authorization header not found!'));
      }
      var token = req.headers.authorization.split(' ');
      if (token.length != 2) {
          return next(new errors.validation_error('Invalid authorization header. Must be Bearer <token>'));
      }
      token = token[1];
      var regex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+\/=]*$/;
      var result = token.match(regex);
      if (!result) {
          return next(new errors.validation_error('Invalid token. Must be JWT token.'));
      }
      
      next();
  }
  
  var jwtVerify = jwt({
    secret: rsaValidation(),
    algorithms: ['RS256'],
    issuer: "https://ndustrial.auth0.com/",
    audience: _options.client_id
  });


  return {
    tokenCheck: tokenCheck,
    jwtVerify: jwtVerify
  };
};

module.exports = Auth;
