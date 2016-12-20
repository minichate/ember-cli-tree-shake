let ComputedProperty = require('./computed-property');
let Property = require('./property');

const TYPE = 'ObjectExpression';
const COMPUTED_PROPERTY_MACROS = [
  'and',
  'or',
  'alias',
  'not',
  'bool',
  'empty',
  'equal'
];

let Controller = class Controller {
  constructor(node) {
    this.node = node;
    this._computedProperties = null;
    this._observerProperties = null;
  }

  templatePath() {
    return null;
  }

  methods() {
    let methods = [];
    this.node.arguments.forEach((argument) => {
      if (!argument.properties) {
        return;
      }

      argument.properties.forEach((property) => {
        if (property.type !== 'ObjectMethod') {
          return;
        }

        var method = new Property(property);
        methods.push(method);
      });

      return;
    });

    return methods;
  }

  computed() {
    if (this._computedProperties) {
      return this._computedProperties;
    }

    let computedProperties = this._computed('computed');

    this._computedProperties = computedProperties;
    return computedProperties;
  }

  observer() {
    if (this._observerProperties) {
      return this._observerProperties;
    }

    let observerProperties = this._computed('observer');

    this._observerProperties = observerProperties;
    return observerProperties;
  }

  classNameBindings() {
    let classNameBindings = [];

    this.node.arguments.forEach((argument) => {
      if (!argument.properties) {
        return;
      }
      argument.properties.forEach((property) => {
        if (property.key.name === 'classNameBindings' && property.value.elements) {
          classNameBindings = property.value.elements.map(function(element) {
            return element.value.split(':')[0];
          });
        }
      });
    });

    return classNameBindings;
  }

  _computed(type) {
    let computedProperties = [];
    this.node.arguments.forEach((argument) => {
      if (!argument.properties) {
        return;
      }

      argument.properties.forEach((property) => {
        if (!property.value) {
          return;
        }

        if (property.value.type === 'CallExpression' && property.value.callee.type === 'MemberExpression') {
          let callee = property.value.callee

          if ((callee.object.name === 'Ember' && callee.property.name === type) || COMPUTED_PROPERTY_MACROS.indexOf(callee.property.name) > 0) {
            var computedProperty = new ComputedProperty(property);
            computedProperties.push(computedProperty);
          }
        }
      });
      return;
    });

    return computedProperties;
  }
}

module.exports = Controller;
