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
              var number_value = parseFloat(value);

              if (number_value) {
                items[key] = number_value;
              }
          }
        }
      });
    }

    cleanup(req.body);

    next();
  };

  return {
    end: end,
    body_cleanup: body_cleanup
  };
};

module.exports = Routers;
