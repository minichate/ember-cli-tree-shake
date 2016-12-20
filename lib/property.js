let Property = class Property {
  constructor(node) {
    this.node = node;
  }

  get body() {
    return this.node.body;
  }

  name() {
    return this.node.key.name;
  }

  get functionBody() {
    return this.body;
  }

  dependants() {
    let dependants = [];

    this._internalGetters().forEach((getter) => {
      dependants.push(getter.value.split('.')[0]);
    });

    return dependants;
  }

  _internalGetters() {
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
      dfs(this.functionBody);
    }
    return getters;
  }
};

module.exports = Property;
