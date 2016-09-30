var ComputedProperty = require('./computed-property');

const TYPE = 'ObjectExpression';

var Controllers = function(node) {
  this.node = node;
  this._computedProperties = null;
};

Controllers.prototype._computed = function(type) {
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

        if ((callee.object.name === 'Ember' && callee.property.name === type ) || (callee.property.name === 'and')){
          var computedProperty = new ComputedProperty(property);
          computedProperties.push(computedProperty);
        }
      }
    });
    return;
  });

  return computedProperties;
};

Controllers.prototype.computed = function() {
  if (this._computedProperties) {
    return this._computedProperties;
  }

  let computedProperties = this._computed('computed');

  this._computedProperties = computedProperties;
  return computedProperties;
};

Controllers.prototype.observer = function() {
  if (this._observerProperties) {
    return this._observerProperties;
  }

  let computedProperties = this._computed('observer');

  this._observerProperties = computedProperties;
  return computedProperties;
};

module.exports = Controllers;
