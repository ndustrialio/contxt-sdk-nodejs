var _ = require('underscore'),
  errors = require('./../errors');

/**
 * @class Paginate
 * @constructor
 * @param {object} options - The options.
 * @param {string} options.limit - The pagination limit.
 * @param {string} options.offset - The pagination offset.
 * @static
 * @module middleware
 * @submodule paginate
 * @main middleware
 * @namespace contxt-sdk-nodejs.sdk.middleware
 * @since 0.2.0
 * @beta
 * @example
 *  var paginate = require('contxt-sdk-nodejs').Sdk().middleware.Paginate({
 *    limit: 10,
 *    offset: 0
 *  });
 */

var Paginate = function(options) {
  /**
   * @property _options
   * @private
   * @type object
   */
  var _options = _.defaults(options, {
    limit: 10,
    offset: 0
  });

  /**
   * Handle pagination based on req values.
   *
   * @member paginate
   * @async
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {function} next - Callback to execute the next Express middleware.
   */
  var paginate = function(req, res, next) {
    req.pagination = {
      limit: _options.limit,
      offset: _options.offset
    };

    if (_.has(req.filters, 'limit')) {
      req.pagination.limit = parseInt(req.filters.limit);

      delete req.filters.limit;
    }

    if (_.has(req.filters, 'offset')) {
      req.pagination.offset = req.filters.offset;

      delete req.filters.offset;
    }

    if (_.has(req.filters, 'orderBy')) {
      req.pagination.orderBy = req.filters.orderBy;

      delete req.filters.orderBy;
    }

    if (req.pagination.limit > _options.limit) {
      return next(new errors.validation_error('limit cannot be greater than ' + _options.limit));
    }

    if (req.pagination.limit <= 0) {
      return next(new errors.validation_error('limit cannot be 0 or less'));
    }

    next();
  };

  return {
    paginate: paginate
  };
};

module.exports = Paginate;
