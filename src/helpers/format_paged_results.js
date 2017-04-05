/**
 * @function format_paged_results
 * @param {object} paginationObj - The pagination request data object.
 * @param {string} modelResults - The results returned by data model.
 * @module helpers
 * @submodule format_paged_results
 * @main helpers
 * @namespace contxt-sdk-nodejs.sdk.helpers
 * @example
 *  var format_paged_results = require('contxt-sdk-nodejs').Sdk().helpers.format_paged_results;
 */

var format_paged_results = function(paginationObj, count, records) {
    return {
      '_meta': {
        totalRecords: parseInt(count),
        'offset': parseInt(paginationObj['offset'])
      },
      'records': records
    };
};

module.exports = format_paged_results;