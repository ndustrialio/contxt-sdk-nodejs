var Errors = function() {
  var handler = function(err, req, res, next) {
    var error_code = err.code || 500,
      error_message = err.message || 'Internal server error',
      config = {env: 'development'}; // TODO: get global env variables

    switch (config.env) {
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

    res.send(error_code, {
      code: error_code,
      message: error_message
    });
  };

  return {
    handler: handler
  };
};

module.exports = Errors();
