var request = require('request');
var errors = require('./errors');
var _ = require('underscore');

var Auth = function(environment, versionedUrl) {
  var authUrl = versionedUrl;
  var env = environment;

  var authorize = function(req, res, next) {
    var bearer = req.header('Authorization'),
      token;

    if (!bearer) {
      return next(new errors.not_authorised('Access token not provided'));
    }

    // TODO: Throw error if the token string is invalid
    token = bearer.split(' ')[1];

    // Store the token on the request object to be used further along the line
    req.token = token;

    request({
      url: authUrl + '/users/current',
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

      req.user_id = result.id;
      req.is_superuser = result.is_superuser;
      req.user_organization_id = result.organization_id;

      next();
    });
  };

  var endRequest = function(req, res, next) {
    if (_.has(res, 'data')) {
      res.send(res.data);
    } else {
      res.end();
    }
  };


  return {
    authorize: authorize,
    endRequest: endRequest
  };
};

module.exports = Auth;
