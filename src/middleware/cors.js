/**
 * @class Cors
 * @constructor
 * @static
 * @module middleware
 * @submodule cors
 * @main middleware
 * @namespace contxt-sdk-nodejs.sdk.middleware
 */

var Cors = function() {

  /**
   * Header to setting up CORS.
   *
   * @member headers
   * @async
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {function} next - Callback to execute the next Express middleware.
   */
  var headers = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    next();
  };

  return {
    headers: headers
  };
};

module.exports = Cors();
