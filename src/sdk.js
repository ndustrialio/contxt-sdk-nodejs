var _ = require('underscore'),
  Amqp = require('amqp'),
  Redis = require('redis'),
  config = require('./config'),
  errors = require('./errors'),
  middleware = require('./middleware'),
  Listener = require('./listener');

/**
 * Contains components that require configuration.
 *
 * @class Sdk
 * @constructor
 * @param {object} options - Options stored and used by subcomponents.
 * @param {object} options.environment - The environment loaded.
 * @param {object} options.rabbitmq_connection_string - RabbitMQ conection string.
 * @param {object} options.redis_connection_string - Redis conection string.
 * @static
 * @module contxt
 * @submodule sdk
 * @main contxt
 * @namespace contxt-sdk-nodejs
 * @example
 *  var sdk = require('contxt-sdk-nodejs').Sdk({
 *    environment: 'development',
 *    rabbitmq_connection_string: 'amqp://0.0.0.0',
 *    redis_connection_string: 'redis://0.0.0.0:6379/0'
 *  });
 */

var Sdk = function(options) {
  /**
   * @property _options
   * @private
   * @type object
   */
  var _options = _.defaults(options, {
    environment: 'development'
  });

  if (_.has(_options, 'rabbitmq_connection_string')) {
    var rabbitmq_connection = Amqp.createConnection({
      url: _options.rabbitmq_connection_string
    });

    rabbitmq_connection.ready = false;

    rabbitmq_connection.on('error', function(err) {
      console.error('RABBITMQ ERROR');
      console.log(err);
    });

    rabbitmq_connection.on('ready', function() {
      rabbitmq_connection.ready = true;
    });

    _options.rabbitmq_connection = rabbitmq_connection;
  }

  if (_.has(_options, 'redis_connection_string')) {
    var redis_connection = Redis.createClient({
      url: _options.redis_connection_string
    });

    redis_connection.on('error', function(err) {
      console.error('REDIS ERROR');
      console.log(err);
    });

    redis_connection.on('ready', function() {
      redis_connection.ready = true;
    });

    _options.redis_connection = redis_connection;
  }

  config.set(_options);

  return {
    middleware: middleware,
    Listener: Listener
  };
};

module.exports = Sdk;
