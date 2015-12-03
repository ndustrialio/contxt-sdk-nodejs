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
