var request = require('request'),
  _ = require('underscore'),
  errors = require('./../errors');

var Auth = function(versionedUrl) {
  var authorize = function(req, res, next) {
    var bearer = req.header('Authorization'),
      token;

    if (!bearer) {
      return next(new errors.not_authorised('Access token not provided'));
    }

    token = bearer.match(/[a-z0-9]{40}/g);

    if (!token) {
      return next(new errors.validation_error('Access token is malformed'));
    }

    // Store the token on the request object to be used further along the line
    req.token = token;

    request({
      url: versionedUrl + '/users/current',
      headers: {
        'Authorization': bearer
      }
    }, function(error, response, body) {

      if (error) {
        return next(new errors.interservice_error("Unable to authorise request. Authentication service unavailable"));
      }

      var result = JSON.parse(body);

      // TODO: Better check for if the response body is an user object or an auth error
      if (_.has(result, 'code')) {
        return next(result);
      }

      req.user = result;

      next();
    });
  };

  return {
    authorize: authorize
  };
};

module.exports = Auth;
