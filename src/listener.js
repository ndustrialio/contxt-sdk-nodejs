var async = require('async'),
  _ = require('underscore'),
  config = require('./config');

/**
 * Listen for messages on queue.
 *
 * @class Listener
 * @constructor
 * @param {object} options - The options.
 * @static
 * @module contxt
 * @submodule sdk
 * @main contxt
 * @namespace contxt-sdk-nodejs.sdk
 */

var Listener = function(options) {
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
   * @property connection
   * @private
   * @type object
   */
  var connection = _config.rabbitmq_connection;

  /**
   * @property queues
   * @private
   * @type array
   */
  var queues = [];

  /**
   * Call a callback when the RabbitMQ connection is ready.
   *
   * @method _ready
   * @private
   * @async
   * @param {function} callback - The callback that handles the response.
   */
  var _ready = function(callback) {
    async.retry({
      times: 10,
      interval: 1000
    }, function(callback) {
      if (connection.ready === true) {
        callback();
      } else {
        callback('RabbitMQ connection is taking too long to initialize.');
      }
    }, callback);
  };

  /**
   * Bind the queue to the exchange with the routing key.
   *
   * @method _create_binding
   * @private
   * @async
   * @param {object} queue - RabbitMQ queue.
   * @param {object} options - Options.
   * @param {string} options.routing_key - The routing key.
   * @param {string} options.queue_name - The queue name.
   * @param {string} options.exchange_name - The exchange name.
   * @param {function} callback - The callback that handles the response.
   */
  var _create_binding = function(queue, options, callback) {
    console.log('Binded queue', queue.name, '(', environment + '.' +
      options.routing_key, ') to exchange', environment + '.' +
      options.exchange_name);

    queue.bind(environment + '.' + options.exchange_name,
      environment + '.' + options.routing_key);

    queue.subscribe(function(message, headers, delivery_info, message_object) {
      console.log('Received message', message, 'on queue', queue.name,
        'with routing key', delivery_info.routingKey);

      var short_routing_key = delivery_info.routingKey;

      // Return the routing key without the environment for simplicity
      short_routing_key = short_routing_key.split('.');
      short_routing_key.shift();
      short_routing_key = short_routing_key.join('.');

      callback(short_routing_key, message);
    });
  };

  /**
   * Listen for messages on queue.
   *
   * @method listen
   * @async
   * @param {object} options - Options.
   * @param {string} options.routing_key - The routing key.
   * @param {string} options.queue_name - The queue name.
   * @param {string} options.exchange_name - The exchange name.
   * @param {function} callback - The callback that handles the response.
   */
  var listen = function(options, callback) {
    _ready(function(err) {
      if (err) {
        console.log(err);

        return;
      }

      var queue;

      if (_.contains(queues, options.queue_name)) {
        queue = queues[options.queue_name];

        _create_binding(queue, options, callback);
      } else {
        queue = connection.queue(environment + '.' + options.queue_name, {
          durable: true,
          autoDelete: false
        }, function(queue) {
          console.log('Queue ' + queue.name + ' is created');

          _create_binding(queue, options, callback);
        });

        queues[options.queue_name] = queue;
      }
    });
  };

  return {
    listen: listen
  };
};

module.exports = Listener;
