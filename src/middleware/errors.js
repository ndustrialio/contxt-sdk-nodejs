var config = require('./../config');

/**
 * @class Errors
 * @constructor
 * @static
 * @module middleware
 * @submodule errors
 * @main middleware
 * @namespace contxt-sdk-nodejs.sdk.middleware
 */

var Errors = function() {
  var _config = config.get();

  /**
   * Handle errors.
   *
   * @member handler
   * @async
   * @param {object} err - The forwarded error object.
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {function} next - Callback to execute the next Express middleware.
   */
  var handler = function(err, req, res, next) {
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
    handler: handler
  };
};

module.exports = Errors();
