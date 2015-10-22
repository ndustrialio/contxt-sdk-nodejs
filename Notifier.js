var errors = require('./errors');

var Notifier = function(environment, exchangeName, amqpConnection) {
  var conn = amqpConnection;
  var env = environment;

  var notify = function(routing_key) {
    var exchange;

    conn.on('ready', function() {
      console.log("rabbit ready");
      exchange = conn.exchange(env + '.' + exchangeName, {
        type: 'topic',
        durable: true,
        autoDelete: false
      }, function(exchange) {
        console.log('Exchange ' + exchange.name + ' is open');
      });
    });

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
