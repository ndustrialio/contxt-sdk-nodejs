var config = require('./../config');

/**
 * @class Handlers
 * @constructor
 * @static
 * @module middleware
 * @submodule handlers
 * @main middleware
 * @namespace contxt-sdk-nodejs.sdk.middleware
 * @example
 *  var handlers = require('contxt-sdk-nodejs').Sdk().middleware.handlers;
 */

var Handlers = function() {
  /**
   * @property _config
   * @private
   * @type object
   */
  var _config = config.get();

  /**
   * Handle errors.
   *
   * @member errors
   * @async
   * @param {object} err - The forwarded error object.
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {function} next - Callback to execute the next Express middleware.
   */
  var errors = function(err, req, res, next) {
    var error_code = err.code || 500,
      error_message = err.message || 'Internal server error',
      environment = _config.environment;

    switch (environment) {
      case 'production':
        console.log(req.method, req.url, err);
        break;

      case 'test':
        console.log(req.method, req.url, err);
        break;

      case 'development':
        if (error_code === 500) {
          throw err;
          //throw JSON.stringify(err);
        }
        break;
    }

    res.status(error_code).send({
      code: error_code,
      message: error_message
    });
  };

  return {
    errors: errors
  };
};

module.exports = Handlers();
