var Property = function(node) {
  this.node = node;
};

Property.prototype.name = function() {
  return this.node.key.name;
}

Property.prototype.value = function() {
  return this.node.value;
}

Property.prototype.internalGetters = function() {
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
  
  if (this.node) {
    dfs(this.node.body);
  }
  return getters;
}

Property.prototype.dependants = function() {
  let dependants = [];

  this.internalGetters().forEach((getter) => {
    dependants.push(getter.value.split('.')[0]);
  });

  return dependants;
}

module.exports = Property;
