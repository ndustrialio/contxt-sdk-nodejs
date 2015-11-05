var _ = require('underscore'),
  qs = require('qs'),
  _Request = require('request'),
  errors = require('./errors');

var Request = function(default_options) {
  var _options = _.defaults(default_options, {});

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

    request.get({
      url: _url
    }, function(error, response, body) {
      if (error) {
        return callback(error);
      }

      if (response.statusCode !== 200) {
        return callback(new errors.interservice_error('Unable to GET ' + _url + ' - status code: ' + response.statusCode));
      }

      callback(null, JSON.parse(body));
    }).auth(null, null, true, options.token);
  };

  var post = function(options, callback) {
    var _url = _prepare_url(options);

    request.post({
      url: _url,
      formData: options.data
    }, function(error, response, body) {
      if (error) {
        return callback(error);
      }

      if (response.statusCode !== 201) {
        return callback(new errors.interservice_error('Unable to POST ' + _url + ' - status code: ' + response.statusCode));
      }

      callback(null, JSON.parse(body));
    }).auth(null, null, true, options.token);
  };

  var put = function(options, callback) {
    var _url = _prepare_url(options);

    request.put({
      url: _url,
      formData: options.data
    }, function(error, response, body) {
      if (error) {
        return callback(error);
      }

      if (response.statusCode !== 204) {
        return callback(new errors.interservice_error('Unable to PUT ' + _url + ' - status code: ' + response.statusCode));
      }

      callback(null, JSON.parse(body));
    }).auth(null, null, true, options.token);
  };

  var del = function(options, callback) {
    var _url = _prepare_url(options);

    request.del({
      url: _url
    }, function(error, response, body) {
      if (error) {
        return callback(error);
      }

      if (response.statusCode !== 204) {
        return callback(new errors.interservice_error('Unable to DELETE ' + _url + ' - status code: ' + response.statusCode));
      }

      callback();
    }).auth(null, null, true, options.token);
  };

  return {
    get: get,
    post: post,
    put: put,
    del: del
  };
};

module.exports = Request;
