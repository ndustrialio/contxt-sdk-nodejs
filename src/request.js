var _ = require('underscore'),
  qs = require('qs'),
  async = require('async'),
  _Request = require('request'),
  errors = require('./errors');

var Request = function(default_options) {
  var _options = _.defaults(default_options, {}),
    RETRY_TIMES = 3,
    RETRY_INTERVAL = 200;

  var request = _Request.defaults({
    headers: {
      something: 'something'
    }
  });

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

  var get = function(options, callback) {
    var _url = _prepare_url(options);

    async.retry({
      times: RETRY_TIMES,
      interval: RETRY_INTERVAL
    }, function(cb) {
      request.get({
        url: _url
      }, function(error, response, body) {
        if (error) {
          console.log('Failed calling (', url, '). Retrying...');
        }

        cb(error, {
          response: response,
          body: body
        });
      }).auth(null, null, true, options.token);
    }, function(error, result) {
      if (error) {
        return callback(error);
      }

      if (result.response.statusCode !== 200) {
        return callback(new errors.interservice_error('Unable to GET ' + _url + ' - status code: ' + result.response.statusCode));
      }

      callback(null, JSON.parse(result.body));
    });
  };

  var post = function(options, callback) {
    var _url = _prepare_url(options);

    async.retry({
      times: RETRY_TIMES,
      interval: RETRY_INTERVAL
    }, function(cb) {
      request.post({
        url: _url,
        formData: options.data
      }, function(error, response, body) {
        if (error) {
          console.log('Failed calling (', url, '). Retrying...');
        }

        cb(error, {
          response: response,
          body: body
        });
      }).auth(null, null, true, options.token);
    }, function(error, result) {
      if (error) {
        return callback(error);
      }

      if (result.response.statusCode !== 201) {
        return callback(new errors.interservice_error('Unable to POST ' + _url + ' - status code: ' + result.response.statusCode));
      }

      callback(null, JSON.parse(result.body));
    });
  };

  var put = function(options, callback) {
    var _url = _prepare_url(options);

    async.retry({
      times: RETRY_TIMES,
      interval: RETRY_INTERVAL
    }, function(cb) {
      request.put({
        url: _url,
        formData: options.data
      }, function(error, response, body) {
        if (error) {
          console.log('Failed calling (', url, '). Retrying...');
        }

        cb(error, {
          response: response,
          body: body
        });
      }).auth(null, null, true, options.token);
    }, function(error, result) {
      if (error) {
        return callback(error);
      }

      if (result.response.statusCode !== 204) {
        return callback(new errors.interservice_error('Unable to PUT ' + _url + ' - status code: ' + result.response.statusCode));
      }

      callback(null, JSON.parse(result.body));
    });
  };

  var del = function(options, callback) {
    var _url = _prepare_url(options);

    async.retry({
      times: RETRY_TIMES,
      interval: RETRY_INTERVAL
    }, function(cb) {
      request.del({
        url: _url
      }, function(error, response, body) {
        if (error) {
          console.log('Failed calling (', url, '). Retrying...');
        }

        cb(error, {
          response: response,
          body: body
        });
      }).auth(null, null, true, options.token);
    }, function(error, result) {
      if (error) {
        return callback(error);
      }

      if (result.response.statusCode !== 204) {
        return callback(new errors.interservice_error('Unable to DELETE ' + _url + ' - status code: ' + result.response.statusCode));
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
