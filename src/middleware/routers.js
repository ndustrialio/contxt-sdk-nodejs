var _ = require('underscore'),
  errors = require('./../errors');

/**
 * @class Routers
 * @constructor
 * @static
 * @module middleware
 * @submodule routes
 * @main middleware
 * @namespace contxt-sdk-nodejs.sdk.middleware
 * @example
 *  var routers = require('contxt-sdk-nodejs').Sdk().middleware.Routers();
 */

var Routers = function() {

  /**
   * End an Express request.
   *
   * @method end
   * @async
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {function} next - Callback to execute the next Express middleware.
   */
  var end = function(req, res, next) {
    if (_.has(res, 'data')) {
      res.send(res.data);
    } else {
      res.end();
    }
  };

  /**
   * Convert boolean, null, and number values to true type.
   *
   * @method body_cleanup
   * @async
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {function} next - Callback to execute the next Express middleware.
   */
  var body_cleanup = function(req, res, next) {
    function cleanup(items) {
      _.each(items, function(value, key) {
        if (_.isObject(value) || _.isArray(value)) {
          cleanup(value);
        } else {
          switch (value) {
            case 'null':
              items[key] = null;
              break;

            case 'true':
              items[key] = true;
              break;

            case 'false':
              items[key] = false;
              break;

            default:
              // If string is a integer or float, convert to that type
              if (/^-?\d*\.?\d+$/.test(value)) {
                items[key] = parseFloat(value);
              }
          }
        }
      });
    }

    cleanup(req.body);

    next();
  };

  /**
   * Add the "Authorization" header to each of the batch calls.
   *
   * @method batch_auth
   * @async
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {function} next - Callback to execute the next Express middleware.
   */
  var batch_auth = function(req, res, next) {
    _.each(req.body, function(value) {
      value.headers = {
        Authorization: req.headers.authorization
      };
    });

    next();
  };

  return {
    end: end,
    body_cleanup: body_cleanup,
    batch_auth: batch_auth
  };
};

module.exports = Routers;
