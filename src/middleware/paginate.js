var errors = require('./../errors'),
    _ = require('underscore'),
    config = require('./../config');


/**
 * @class Paginate
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
 *    service_url: 'test'
 *    TOKEN_CACHE_EXPIRES: 3600
 *  });
 */
var Paginate = function(options) {
  /**
   * @property _options
   * @private
   * @type object
   */
  var _options = _.defaults(options, {
  });

  /**
   * @property _config
   * @private
   * @type object
   */
  var _config = config.get();
  
  /**
   * 
   *
   */
  var paginate =  function (req, res, next) {
    req.pagination = {};

    if (_.has(req.filters, 'offset')) {
        req.pagination.offset = req.filters.offset;
        delete req.filters.offset;
    } else {
        req.pagination.offset = 0;
    }
    if (_.has(req.filters, 'limit')) {
        req.pagination.limit = parseInt(req.filters.limit);
        if (!req.pagination.limit) {
            return next(new errors.validation_error('limit must be a number between 0 and 100'));
        }
        if (req.pagination.limit > 100) {
            return next(new errors.validation_error('limit cannot be greater than 100'));
        }
        if (req.pagination.limit <= 0) {
            return next(new errors.validation_error('limit cannot be 0 or less'));
        }
        delete req.filters.limit;
    } else {
        req.pagination.limit = 10;
    }

    if (_.has(req.filters, 'orderBy')) {
        req.pagination.orderBy = req.filters.orderBy;
        delete req.filters.orderBy;
    }

    next();
  };
    
  return {
    paginate: paginate
  };
};

module.exports = Paginate;
