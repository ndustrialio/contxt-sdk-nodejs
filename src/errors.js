var util = require('util');

/**
 * Useful error messages and codes.
 *
 * @class Errors
 * @constructor
 * @static
 * @module contxt
 * @namespace contxt-sdk-nodejs
 * @example var errors = require('contxt-sdk-nodejs').errors;
 */

var Errors = function() {

  /**
   * @method not_found
   * @param {string} message - Message.
   */
  var not_found = function(message) {
    this.code = 404;
    this.message = message;

    Error.call(this);
  };

  /**
   * @method no_content
   * @param {string} message - Message.
   */
  var no_content = function(message) {
    this.code = 204;
    this.message = message;

    Error.call(this);
  };

  /**
   * @method not_implemented
   * @param {string} message - Message.
   */
  var not_implemented = function(message) {
    this.code = 501;
    this.message = message;

    Error.call(this);
  };

  /**
   * @method not_authorised
   * @param {string} message - Message.
   */
  var not_authorised = function(message) {
    this.code = 401;
    this.message = message;

    Error.call(this);
  };

  /**
   * @method bad_request
   * @param {string} message - Message.
   */
  var bad_request = function(message) {
    this.code = 400;
    this.message = message;

    Error.call(this);
  };

  /**
   * @method server_error
   * @param {string} message - Message.
   */
  var server_error = function(message) {
    this.code = 500;
    this.message = message;

    Error.call(this);
  };

  /**
   * @method validation_error
   * @param {string} message - Message.
   * @param {string} path - Path.
   */
  var validation_error = function(message, path) {
    this.code = 400;
    this.message = message;
    this.errors = {};
    this.errors[path] = {
      message: message,
      name: 'ValidationError',
      path: path,
      type: 'user defined'
    };

    Error.call(this);
  };

  /**
   * @method interservice_error
   * @param {string} message - Message.
   */
  var interservice_error = function(message) {
    this.code = 503;
    this.message = message;

    Error.call(this);
  };

  util.inherits(not_found, Error);
  util.inherits(no_content, Error);
  util.inherits(not_implemented, Error);
  util.inherits(not_authorised, Error);
  util.inherits(bad_request, Error);
  util.inherits(validation_error, Error);
  util.inherits(server_error, Error);
  util.inherits(interservice_error, Error);

  return {
    not_found: not_found,
    no_content: no_content,
    not_implemented: not_implemented,
    not_authorised: not_authorised,
    bad_request: bad_request,
    validation_error: validation_error,
    server_error: server_error,
    interservice_error: interservice_error
  };
};

module.exports = Errors();
