var config = require('./config');

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
      var data = JSON.parse(message.data.toString()),
        short_routing_key = delivery_info.routingKey;

      // Return the routing key without the environment for simplicity
      short_routing_key = short_routing_key.split('.');
      short_routing_key.shift();
      short_routing_key = short_routing_key.join('.');

      callback(short_routing_key, data);
    });
  };

  return {
    listen: listen
  };
};

module.exports = Listener;
