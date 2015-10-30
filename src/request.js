var _ = require('underscore'),
  qs = require('qs'),
  Request = require('request'),
  errors = require('./errors');

var Request = function(options) {
  var _options = _.defaults(options, {});

  var request = Request.defaults({
    headers: {
      something: 'something'
    }
  });

  var _prepare_url = function(url, req) {
    var _url = url;

    if (_.has(_options, 'base_url')) {
      _url = base_url + url;
    }

    if (_.has(req, 'query')) {
      var query = qs.stringify(req.query);

      _url += '?' + query;
    }

    return _url;
  };

  var get = function(url, req, callback) {
    var _url = _prepare_url(url, req);

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
    }).auth(null, null, true, req.token);
  };

  var post = function(url, req, callback) {
    var _url = _prepare_url(url, req);

    request.post({
      url: _url,
      formData: req.body
    }, function(error, response, body) {
      if (error) {
        return callback(error);
      }

      if (response.statusCode !== 201) {
        return callback(new errors.interservice_error('Unable to POST ' + _url + ' - status code: ' + response.statusCode));
      }

      callback(null, JSON.parse(body));
    }).auth(null, null, true, token);
  };

  var put = function(url, req, callback) {
    var _url = _prepare_url(url, req);

    request.put({
      url: _url,
      formData: req.body
    }, function(error, response, body) {
      if (error) {
        return callback(error);
      }

      if (response.statusCode !== 204) {
        return callback(new errors.interservice_error('Unable to PUT ' + _url + ' - status code: ' + response.statusCode));
      }

      callback(null, JSON.parse(body));
    }).auth(null, null, true, req.token);
  };

  var del = function(url, req, callback) {
    var _url = _prepare_url(url, req);

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
    }).auth(null, null, true, req.token);
  };

  return {
    get: get,
    post: post,
    put: put,
    del: del
  };
};

module.exports = Request;
