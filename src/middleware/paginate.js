var _ = require('underscore'),
  errors = require('./../errors');

/**
 * @class Paginate
 * @constructor
 * @param {object} options - The options.
 * @static
 * @module middleware
 * @submodule paginate
 * @main middleware
 * @namespace contxt-sdk-nodejs.sdk.middleware
 * @since 0.2.0
 * @beta
 * @example
 *  var paginate = require('contxt-sdk-nodejs').Sdk().middleware.Paginate({});
 */

var Paginate = function(options) {
  /**
   * @property _options
   * @private
   * @type object
   */
  var _options = _.defaults(options, {});

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
