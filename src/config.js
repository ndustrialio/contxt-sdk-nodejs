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
 */

var Config = function() {
  /**
   * @property _configs
   * @private
   * @type object
   */
  var _configs = {};

  /**
   * Set configurations with new value.
   *
   * @method set
   * @param {string} value - The value.
   */
  var set = function(value) {
    _configs = value;
  };

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
    set: set,
    get: get
  };
};

module.exports = Config();
