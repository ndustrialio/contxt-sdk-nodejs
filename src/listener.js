var config = require('./config');
errors = require('./errors');

var Listener = function(queue_name) {
  var _config = config.get(),
    environment = _config.environment,
    rabbitmq_connection = _config.rabbitmq_connection,
    queue;

  rabbitmq_connection.on('ready', function() {
    queue = rabbitmq_connection.queue(environment + '.' + queue_name, {
      durable: true,
      autoDelete: false
    }, function(queue) {
      //console.log('Queue ' + queue.name + ' is open');
    });
  });

  var listen = function(exchange_name, routing_key, callback) {
    queue.bind(environment + '.' + exchange_name, environment + '.' + routing_key);

    queue.subscribe(function(message, headers, delivery_info, message_object) {
      var data  = JSON.parse(message.data.toString());

      callback(delivery_info.routingKey, data);
    });
  };

  return {
    listener: listener
  };
};

module.exports = Listener;
