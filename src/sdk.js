var _ = require('underscore'),
  Amqp = require('amqp'),
  config = require('./config'),
  errors = require('./errors'),
  middleware = require('./middleware'),
  Listener = require('./listener');

var Sdk = function(options) {
  var _options = _.defaults(options, {
    environment: 'development'
  });

  if (_.has(_options, 'rabbitmq_connection_string')) {
    var rabbitmq_connection = Amqp.createConnection({
      url: _options.rabbitmq_connection_string
    });

    rabbitmq_connection.on('error', function(error) {
      console.error('RABBITMQ ERROR');
      console.log(error);
    });

    _options.rabbitmq_connection = rabbitmq_connection;
  }

  config.set(_options);

  return {
    middleware: middleware,
    Listener: Listener
  };
};

module.exports = Sdk;
