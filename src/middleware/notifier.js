var _ = require('underscore'),
  config = require('./../config');

/**
 * @class Notifier
 * @constructor
 * @param {object} options - The options.
 * @param {object} options.exchange_name - The RabbitMQ exchange to publish to.
 * @static
 * @module middleware
 * @submodule notifier
 * @main middleware
 * @namespace contxt-sdk-nodejs.sdk.middleware
 * @example
 *  var notifier = require('contxt-sdk-nodejs').Sdk().middleware.Notifier({exchange_name: 'test'});
 */

var Notifier = function(options) {
  /**
   * @property _config
   * @private
   * @type object
   */
  var _config = config.get();

  /**
   * @property environment
   * @private
   * @type string
   */
  var environment = _config.environment;

  /**
   * @property rabbitmq_connection
   * @private
   * @type object
   */
  var rabbitmq_connection = _config.rabbitmq_connection;

  /**
   * @property exchange
   * @private
   * @type object
   */
  var exchange;

  rabbitmq_connection.on('ready', function() {
    exchange = rabbitmq_connection.exchange(environment + '.' + options.exchange_name, {
      type: 'topic',
      durable: true,
      autoDelete: false
    }, function(exchange) {
      console.log('Exchange ' + exchange.name + ' is open');
    });
  });

  /**
   * Publish message over RabbitMQ exchange.
   *
   * @method notify
   * @async
   * @param {string} routing_key - The routing key for the exchange.
   * @return {function} anonymous - Anonymous function reference to be executed by the middleware.
   */
  var notify = function(routing_key) {
    return function(req, res, next) {
      if (!_.has(res, 'data')) {
        res.data = {};
      }

      console.log('Published message', res.data);
      console.log('on exchange', exchange.name, 'with routing key', environment + '.' + routing_key);

      exchange.publish(environment + '.' + routing_key, res.data);

      next();
    };
  };

  return {
    notify: notify
  };
};

module.exports = Notifier;
