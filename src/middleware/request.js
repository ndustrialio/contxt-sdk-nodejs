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
    // TODO: Return error if fields are sent but are not in the validation list?

    return function(req, res, next) {
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

  return {
    end: end,
    body_cleanup: body_cleanup,
    validate_fields: validate_fields
  };
};

module.exports = Request;
