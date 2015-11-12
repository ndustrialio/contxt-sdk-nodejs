var config = require('./../config');

var Errors = function() {
  var _config = config.get();

  var handler = function(err, req, res, next) {
    var error_code = err.code || 500,
      error_message = err.message || 'Internal server error',
      environment = _config.environment;

    switch (environment) {
      case 'production':
        console.log(req.method, req.url, err);
        break;

      case 'test':
        console.log(req.method, req.url, err);
        break;

      case 'development':
        if (error_code === 500) {
          throw err;
          //throw JSON.stringify(err);
        }
        break;
    }

    res.status(error_code).send(message);
  };

  return {
    handler: handler
  };
};

module.exports = Errors();
