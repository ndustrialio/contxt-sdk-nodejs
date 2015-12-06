var _ = require('underscore'),
  Amqp = require('amqp'),
  config = require('./config'),
  errors = require('./errors'),
  middleware = require('./middleware'),
  Listener = require('./listener');

/**
 * Provides useful functions.
 * @class Sdk
 * @constructor
 * @param {object} options - The options.
 * @static
 * @module contxt
 * @submodule sdk
 * @main contxt
 * @namespace contxt-sdk-nodejs
 */

var Sdk = function(options) {
  /**
   * @property _options
   * @type Object
   */
  var _options = _.defaults(options, {
    environment: 'development'
  });

  if (_.has(_options, 'rabbitmq_connection_string')) {
    var rabbitmq_connection = Amqp.createConnection({
      url: _options.rabbitmq_connection_string
    });

    rabbitmq_connection.ready = false;

    rabbitmq_connection.on('error', function(error) {
      console.error('RABBITMQ ERROR');
      console.log(error);
    });

    rabbitmq_connection.on('ready', function() {
      rabbitmq_connection.ready = true;
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
