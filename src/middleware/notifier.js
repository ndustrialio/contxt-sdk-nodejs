var _ = require('underscore'),
  config = require('./../config');

var Notifier = function(options) {
  var _config = config.get(),
    environment = _config.environment,
    rabbitmq_connection = _config.rabbitmq_connection,
    exchange;

  rabbitmq_connection.on('ready', function() {
    exchange = rabbitmq_connection.exchange(environment + '.' + options.exchange_name, {
      type: 'topic',
      durable: true,
      autoDelete: false
    }, function(exchange) {
      console.log('Exchange ' + exchange.name + ' is open');
    });
  });

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
