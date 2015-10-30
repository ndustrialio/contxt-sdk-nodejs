var Config = function() {
  var configs = {};

  var set = function(value) {
    configs = value;
  };

  var get = function() {
    return configs;
  };

  return {
    set: set,
    get: get
  };
};

module.exports = Config();
