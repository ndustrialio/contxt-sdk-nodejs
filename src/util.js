var _ = require('underscore');

/**
 * Provides useful functions.
 *
 * @class Util
 * @constructor
 * @static
 * @module contxt
 * @submodule util
 * @main contxt
 * @namespace contxt-sdk-nodejs
 * @example var util = require('contxt-sdk-nodejs').util;
 */

var Util = function() {

  /**
   * Transform an array to an object.
   *
   * @method array_to_dictionary
   * @param {array} results - The array to be transformed.
   * @return {object} result - The transformed dictionary.
   */
  var array_to_dictionary = function(results) {
    return _.object(_.map(results, function(result) {
      return [result.key, result.value];
    }));
  };

  /**
   * Transform an array to a tree.
   *
   * @method array_to_tree
   * @param {array} array - The array to be transformed.
   * @param {object} parent - The parent node.
   * @param {object} first - Used by the recursive function.
   * @param {object} picked_fields - Fields from the tree to be in the final result.
   * @return {object} tree - The transformed tree.
   */
  var array_to_tree = function(array, parent, first, picked_fields) {
    var first = typeof first !== 'undefined' ? first : false,
      tree = [];

    var children = _.filter(array, function(child) {
      return child.parent_node_id === parent.id;
    });

    if (!_.isEmpty(children)) {
      if (first) {
        tree = parent;
      }

      parent.children = children;

      _.each(children, function(child) {
        array_to_tree(array, child, false, picked_fields);
      });

      parent.children = _.map(children, function(child) {
        return _.pick(child, picked_fields);
      });
    } else {
      parent.children = [];
    }

    return _.pick(tree, picked_fields);
  };

  /**
   * Transform a tree to a multidimensional array.
   *
   * @method tree_to_array
   * @param {object} node - The tree node to start from.
   * @param {array} array - Required for recursive function.
   * @param {array} array - The tree flattened into an array.
   */
  var tree_to_array = function(node, array) {
    var array = array || [];

    if (node.id === null || node.id === undefined) {
      node.temporary_id = Math.random().toString(36).substr(2, 5);
    }

    node.parent_node_id = node.parent_node_id || null;
    array.push(_.omit(node, 'children'));

    if (_.has(node, 'children')) {
      node.children.forEach(function(child) {
        child.parent_node_id = node.id || node.temporary_id;

        tree_to_array(child, array);
      });
    }

    return array;
  };

  /**
   * Returns the node parent of the provided tree.
   *
   * @method get_node_parent
   */
  var get_node_parent = function(node, tree) {
    var array = tree_to_array(tree);

    array.forEach(function(n) {
      if (node.parent_node_id === n.id) {
        return n;
      }
    });

    return false;
  };

  /**
   * Returns the children nodes of the provided node.
   *
   * @method get_node_children
   */
  var get_node_children = function(node, tree) {
    var array = tree_to_array(tree),
      children = [];

    array.forEach(function(n) {
      if (node.id === n.parent_node_id) {
        children.push(_.omit(n, 'children'));
      }
    });

    return children;
  };

  /**
   * Order tree.
   *
   * @method order_tree
   */
  var order_tree = function(treeLevelNodes, count) {
    _.each(treeLevelNodes, function(node) {
      node.lft = count++;

      if (node.children.length > 0) {
        count = order_tree(node.children, count);
      }

      node.rgt = count++;
    });

    return count;
  };

  /**
   * Checks for the input to be an object literal.
   *
   * @method is_dictionary
   */
  var is_dictionary = function(dictionary) {
    var _test = dictionary;

    if (typeof dictionary !== 'object' || dictionary === null) {
      return false;
    } else {
      while (!false) {
        if (Object.getPrototypeOf(_test = Object.getPrototypeOf(_test)) === null) {
          break;
        }
      }

      return Object.getPrototypeOf(dictionary) === _test;
    }
  };

  /**
   * Validation.
   *
   * @method validate_part
   */
  var validate_part = function(part) {
    var supported_field_operators = ['$eq', '$gt', '$gte', '$lt', '$lte', '$ne', '$or', '$and', '$not', '$nor'],
      supported_logical_operators = ['$or', '$and', '$not', '$nor'],
      supported_field_prefixes = ['output_field_id'];

    if (_.indexOf(supported_field_operators, part.operator) == -1) {
      return 'Invalid operator: ' + part.operator;
    }

    // only if there are no subqueries in this part will we check the field name
    if (part.parts.length === 0) {
      var field_name = part.field.split('::')[0];

      if (_.indexOf(supported_field_prefixes, field_name) == -1) {
        return 'Invalid prefix: ' + field_name;
      }
    }

    return true;
  };

  return {
    array_to_dictionary: array_to_dictionary,
    array_to_tree: array_to_tree,
    tree_to_array: tree_to_array,
    get_node_parent: get_node_parent,
    get_node_children: get_node_children,
    order_tree: order_tree,
    is_dictionary: is_dictionary,
    validate_part: validate_part
  };
};

module.exports = Util();
