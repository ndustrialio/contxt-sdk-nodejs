var request = require('request'),
  _ = require('underscore'),
  errors = require('./../errors');

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

      // TODO: set the whole user object on the req object
      req.user_id = result.id;
      req.is_superuser = result.is_superuser;
      req.user_organization_id = result.organization_id;

      next();
    });
  };

  return {
    authorize: authorize
  };
};

module.exports = Auth;
