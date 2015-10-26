var _ = require('underscore');

var Request = function() {
  var end = function(req, res, next) {
    if (_.has(res, 'data')) {
      res.send(res.data);
    } else {
      res.end();
    }
  };

  return {
    end: end
  };
};

module.exports = Request;
