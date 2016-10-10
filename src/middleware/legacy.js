var _ = require('underscore');

/**
 * @class Legacy
 * @constructor
 * @static
 * @module middleware
 * @submodule legacy
 * @main middleware
 * @namespace contxt-sdk-nodejs.sdk.middleware
 * @since 0.3.0
 * @example
 *  var legacy = require('contxt-sdk-nodejs').Sdk().middleware.legacy;
 */

var Legacy = function() {

  /**
   * Set up user data on the req object.
   *
   * @member user
   * @async
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {function} next - Callback to execute the next Express middleware.
   */
  var user = function(req, res, next) {
    var user_id = 1; // By default the `user_id` is set to the default superuser

    if (_.has(req, 'user') && _.has(req.user, 'sub')) {
      if (req.user.sub.indexOf('auth0|') !== -1) {
        // The auth0 user id will most likely be formatted like: `auth0|123`
        var id = req.user.sub.split('|')[1];

        if (_.isNumber(id)) {
          user_id = id;
        }
      }
    } else if (_.has(req, 'user') && _.has(req.user, 'id')) {
      // The legacy middleware sets the user id to `req.user.id`
      user_id = req.user.id;
    }

    // user_id is being used by legacy systems to do implicit filtering
    req.user_id = parseInt(user_id);

    next();
  };

  return {
    user: user
  };
};

module.exports = Legacy();
