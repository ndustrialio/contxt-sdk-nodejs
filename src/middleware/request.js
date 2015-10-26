var _ = require('underscore');

var Request = function() {
  var end = function(req, res, next) {
    if (_.has(res, 'data')) {
      res.send(res.data);
    } else {
      res.end();
    }
  };

  var body_cleanup = function(req, res, next) {
    function cleanup(items) {
      _.each(items, function(value, key) {
        if (_.isObject(value) || _.isArray(value)) {
          cleanup(value);
        } else {
          switch (value) {
            case 'null':
              items[key] = null;
              break;

            case 'true':
              items[key] = true;
              break;

            case 'false':
              items[key] = false;
              break;
          }
        }
      });
    }

    cleanup(req.body);

    next();
  };

  return {
    end: end,
    body_cleanup: body_cleanup
  };
};

module.exports = Request;
