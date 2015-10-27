var config = require('./config');
  errors = require('./errors');

var Notifier = function(exchange_name) {
  var _config = config.get(),
    environment = _config.environment,
    rabbitmq_connection = _config.rabbitmq_connection,
    exchange;

  rabbitmq_connection.on('ready', function() {
    exchange = rabbitmq_connection.exchange(environment + '.' + exchange_name, {
      type: 'topic',
      durable: true,
      autoDelete: false
    }, function(exchange) {
      console.log('Exchange ' + exchange.name + ' is open');
    });
  });

  var notify = function(routing_key) {
    return function(req, res, next) {
      exchange.publish(environment + '.' + routing_key, res.data);

      next();
    };
  };

  return {
    notify: notify
  };
};

module.exports = Notifier;
