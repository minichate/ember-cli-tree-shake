var ComputedProperty = function(node) {
  this.node = node;
};

ComputedProperty.prototype.name = function() {
  return this.node.key.name;
}

ComputedProperty.prototype.value = function() {
  return this.node.value;
}

ComputedProperty.prototype.arguments = function() {
  if (!this.value().arguments) {
    return [];
  }

  return this.value().arguments;
}

ComputedProperty.prototype.internalGetters = function() {
  const args = this.arguments();
  const fn = args[args.length - 1];
  const getters = [];

  var dfs = (el) => {
    if (el && el.childElements) {
      el.childElements.forEach((element) => {
        if (element.type == 'CallExpression' && element.callee.property && element.callee.property.name === 'get') {
          const dependant = element.arguments[0];

          if (dependant.value) {
            getters.push(dependant);
          }
        }

        dfs(element.nextSibling);
        dfs(element);
      });
    }
  }
  
  dfs(fn.body);
  return getters;
}

ComputedProperty.prototype.dependants = function() {
  let dependants = [];
  this.arguments().forEach((argument) => {
    if (argument.type !== 'StringLiteral') {
      return;
    }

    dependants.push(argument.value.split('.')[0]);
  });

  this.internalGetters().forEach((getter) => {
    dependants.push(getter.value.split('.')[0]);
  });

  return dependants;
}

module.exports = ComputedProperty;
