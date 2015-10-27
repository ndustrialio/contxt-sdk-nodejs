var config = require('./config');
  errors = require('./errors');

var Notifier = function(exchangeName, amqpConnection) {
  var env = config.environment,
    exchange;

  amqpConnection.on('ready', function() {
    exchange = amqpConnection.exchange(env + '.' + exchangeName, {
      type: 'topic',
      durable: true,
      autoDelete: false
    }, function(exchange) {
      console.log('Exchange ' + exchange.name + ' is open');
    });
  });

  var notify = function(routing_key) {
    return function(req, res, next) {
      exchange.publish(env + '.' + routing_key, res.data);

      next();
    };
  };

  return {
    notify: notify
  };
};

module.exports = Notifier;
