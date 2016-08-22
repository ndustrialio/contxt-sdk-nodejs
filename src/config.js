/**
 * Store and retrive configurations.
 *
 * @class Config
 * @constructor
 * @static
 * @module contxt
 * @submodule config
 * @main contxt
 * @namespace contxt-sdk-nodejs
 * @example var config = require('contxt-sdk-nodejs').config;
 */

var Config = function() {
  /**
   * @property _configs
   * @private
   * @type object
   */
  var _configs = {};

  /**
   * Set All configurations at once (overwriting existing ones as well)
   *
   * @method set
   * @param {Object} obj - The configuration object.
   */
  var init = function(obj) {
    _configs = obj;
  };
  
  /**
   * Set configurations with new value.
   *
   * @method set
   * @param {string} key - The key
   * @param {string} value - The value
   */
  var set = function(key, value) {
      _configs[key] = value;
  }

  /**
   * Get configurations.
   *
   * @method get
   * @return {object} _configs
   */
  var get = function() {
    return _configs;
  };

  return {
    init: init,
    set: set,
    get: get
  };
};

module.exports = Config();
