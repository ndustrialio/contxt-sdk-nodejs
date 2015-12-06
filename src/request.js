var _ = require('underscore'),
  qs = require('qs'),
  async = require('async'),
  _Request = require('request'),
  errors = require('./errors');

/**
 * Allows to call remote services.
 *
 * @class Request
 * @constructor
 * @param {object} options - The options.
 * @static
 * @module contxt
 * @submodule request
 * @main contxt
 * @namespace contxt-sdk-nodejs
 */

var Request = function(default_options) {
  /**
   * @property _options
   * @private
   * @type object
   */
  var _options = _.defaults(default_options, {});

  /**
   * @property RETRY_TIMES
   * @private
   * @type integer
   * @final
   */
  var RETRY_TIMES = 3;

  /**
   * @property RETRY_INTERVAL
   * @private
   * @type integer
   * @final
   */
  var RETRY_INTERVAL = 200;

  /**
   * @property request
   * @private
   * @type object
   */
  var request = _Request.defaults({
    headers: {
      something: 'something'
    }
  });

  /**
   * Prepare url.
   *
   * @method _prepare_url
   * @private
   * @param {object} options - Options.
   * @param {string} options.url - The URL to call.
   * @param {object[]} options.query - URL query params.
   * @param {string} options.token - OAuth2 token.
   * @return {string} url - The callback that handles the response.
   */
  var _prepare_url = function(options) {
    // TODO: Check for the URL to be set on options
    var _url = options.url;

    if (_.has(_options, 'base_url')) {
      _url = base_url + url;
    }

    if (_.has(options, 'query')) {
      var query = qs.stringify(options.query);

      _url += '?' + query;
    }

    return _url;
  };

  /**
   * Prepare params.
   *
   * @method _prepare_params
   * @private
   * @param {object} options - Options.
   * @param {string} options.url - The URL to call.
   * @param {object[]} options.query - URL query params.
   * @param {string} options.token - OAuth2 token.
   * @return {object} params - The callback that handles the response.
   */
  var _prepare_params = function(options) {
    var _url = _prepare_url(options);

    var params = {
      url: _url
    };

    if (_.has(options, 'data')) {
      _.extend(params, {
        form: options.data
      });
    }

    if (_.has(options, 'token')) {
      _.extend(params, {
        auth: {
          bearer: options.token
        }
      });
    }

    return params;
  };

  /**
   * Makes a GET call.
   *
   * @method get
   * @param {object} options - Options.
   * @param {string} options.url - The URL to call.
   * @param {object[]} options.query - URL query params.
   * @param {string} options.token - OAuth2 token.
   * @param {function} callback - The callback that handles the response.
   */
  var get = function(options, callback) {
    var params = _prepare_params(options);

    async.retry({
      times: RETRY_TIMES,
      interval: RETRY_INTERVAL
    }, function(cb) {
      console.log('Calling GET (', params.url, ') with', params.form ?
        params.form : 'no payload');

      request.get(params, function(error, response, body) {
        if (error) {
          console.log('Failed calling (', params.url, '). Retrying...');
        }

        cb(error, {
          response: response,
          body: body
        });
      });
    }, function(error, result) {
      if (error) {
        return callback(error);
      }

      if (result.response.statusCode !== 200) {
        return callback(new errors.interservice_error('Unable to GET ' +
          params.url + ' - status code: ' + result.response.statusCode));
      }

      callback(null, JSON.parse(result.body));
    });
  };

  /**
   * Makes a POST call.
   *
   * @method post
   * @async
   * @param {object} options - Options.
   * @param {string} options.url - The URL to call.
   * @param {object[]} options.data - Data to be posted.
   * @param {string} options.token - OAuth2 token.
   * @param {function} callback - The callback that handles the response.
   */
  var post = function(options, callback) {
    var params = _prepare_params(options);

    async.retry({
      times: RETRY_TIMES,
      interval: RETRY_INTERVAL
    }, function(cb) {
      console.log('Calling POST (', params.url, ') with', params.form ?
        params.form : 'no payload');

      request.post(params, function(error, response, body) {
        if (error) {
          console.log('Failed calling (', params.url, '). Retrying...');
        }

        cb(error, {
          response: response,
          body: body
        });
      });
    }, function(error, result) {
      if (error) {
        return callback(error);
      }

      if (!_.contains([200, 201], result.response.statusCode)) {
        return callback(new errors.interservice_error('Unable to POST ' +
          params.url + ' - status code: ' + result.response.statusCode));
      }

      callback(null, JSON.parse(result.body));
    });
  };

  /**
   * Makes a PUT call.
   *
   * @method put
   * @async
   * @param {object} options - Options.
   * @param {string} options.url - The URL to call.
   * @param {object[]} options.data - Data to be posted.
   * @param {string} options.token - OAuth2 token.
   * @param {function} callback - The callback that handles the response.
   */
  var put = function(options, callback) {
    var params = _prepare_params(options);

    async.retry({
      times: RETRY_TIMES,
      interval: RETRY_INTERVAL
    }, function(cb) {
      console.log('Calling PUT (', params.url, ') with', params.form ?
        params.form : 'no payload');

      request.put(params, function(error, response, body) {
        if (error) {
          console.log('Failed calling (', params.url, '). Retrying...');
        }

        cb(error, {
          response: response,
          body: body
        });
      });
    }, function(error, result) {
      if (error) {
        return callback(error);
      }

      if (!_.contains([200, 204], result.response.statusCode)) {
        return callback(new errors.interservice_error('Unable to PUT ' +
          params.url + ' - status code: ' + result.response.statusCode));
      }

      callback(null, JSON.parse(result.body));
    });
  };

  /**
   * Makes a DELETE call.
   *
   * @method del
   * @async
   * @param {object} options - Options.
   * @param {string} options.url - The URL to call.
   * @param {string} options.token - OAuth2 token.
   * @param {function} callback - The callback that handles the response.
   */
  var del = function(options, callback) {
    var params = _prepare_params(options);

    async.retry({
      times: RETRY_TIMES,
      interval: RETRY_INTERVAL
    }, function(cb) {
      console.log('Calling DELETE (', params.url, ') with', params.form ?
        params.form : 'no payload');

      request.del(params, function(error, response, body) {
        if (error) {
          console.log('Failed calling (', params.url, '). Retrying...');
        }

        cb(error, {
          response: response,
          body: body
        });
      });
    }, function(error, result) {
      if (error) {
        return callback(error);
      }

      if (!_.contains([200, 204], result.response.statusCode)) {
        return callback(new errors.interservice_error('Unable to DELETE ' +
          params.url + ' - status code: ' + result.response.statusCode));
      }

      callback(null, JSON.parse(result.body));
    });
  };

  return {
    get: get,
    post: post,
    put: put,
    del: del
  };
};

module.exports = Request;
