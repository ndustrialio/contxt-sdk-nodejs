var async = require('async'),
  _ = require('underscore'),
  config = require('./config');

var Listener = function(options) {
  var _config = config.get(),
    environment = _config.environment,
    connection = _config.rabbitmq_connection,
    queues = [];

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
