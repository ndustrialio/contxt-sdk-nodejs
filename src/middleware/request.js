var _ = require('underscore'),
  errors = require('./../errors');

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

  var validate_fields = function(fields_to_validate) {
    return function(req, res, next) {
      // TODO: Return error if fields are sent but are not in the validation list?

      var invalid_fields = [],
        fields = req.body;

      _.each(fields_to_validate, function(field_to_validate_value, field_to_validate_key) {
        var found = false,
          valid = false,
          field_to_validate_value_defaulted;

        field_to_validate_value_defaulted = _.defaults(field_to_validate_value, {
          mandatory: false,
          type: 'string'
        });

        _.each(fields, function(field_value, field_key) {
          if (field_key === field_to_validate_key) {
            found = true;

            if (typeof field_value == field_to_validate_value_defaulted.type) {
              valid = true;
            }
          }
        });

        if (!valid || (field_to_validate_value_defaulted.mandatory && !found)) {
          invalid_fields.push(field_to_validate_key);
        }
      });

      if (invalid_fields.length > 0) {
        return next(new errors.validation_error('The following fields are invalid/required: ' + invalid_fields.join()));
      }

      next();
    };
  };

  var validate_params = function() {
    // TODO: Get params whitelist from the config

    return function(req, res, next) {
      var params = _.extend(req.query, req.params),
        params_whitelist = [
          'id',
          'organization_id',
          'facility_id',
          'building_id',
          'feed_id',
          'key',
          'output_id',
          'alert_id',
          'blast_cell_id',
          'is_active',
          'user_id',
          'email',
          'start_node_id',
          'access_id',
          'type',
          'dateStart',
          'dateEnd',
          'timeStart',
          'timeEnd',
          'hourStart',
          'hourEnd',
          'location_id',
          'window',
          'category',
          'fields',
          'field_human_name',
          'field_id',
          'utility_account_id',
          'utility_meter_id',
          'meter_statement_id',
          'year',
          'month',
          'metric_id',
          'metric_name',
          'units',
          'module_id',
          'metric_suffix',
          'view_id',
          'layout_id',
          'slug',
          'rate_schedule_id',
          'rate_period_id',
          'rate_season_id',
          'rate_season_period_id',
          'numNext',
          'statement_year',
          'statement_month',
          'storm_topology_uuid',
          'forward_id',
          'geometry_id',
          'area_id',
          'environment',
          'configuration_id',
          'value_id',
          'output_state_id',
          'output_type_id',
          'group_id',
          'group_name',
          'worker_uuid',
          'is_default'
        ],
        invalid_params = _.difference(_.keys(params), params_whitelist);

      if (invalid_params.length > 0) {
        return next(new errors.validation_error('Invalid parameters: ' + invalid_params.join()));
      }

      req.params = params;

      next();
    };
  };

  return {
    end: end,
    body_cleanup: body_cleanup,
    validate_fields: validate_fields,
    validate_params: validate_params
  };
};

module.exports = Request;
