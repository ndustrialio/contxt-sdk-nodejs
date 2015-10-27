var _ = require('underscore'),
  config = require('./config'),
  errors = require('./errors'),
  middleware = require('./middleware'),
  Notifier = require('./notifier');

var Sdk = function(options) {
  var _options = _.defaults(options, {
    environment: 'development',
  });

  config.set(_options);

  return {
    errors: errors,
    middleware: middleware,
    Notifier: Notifier
  };
};

module.exports = Sdk;
