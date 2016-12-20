var Controller = require('./controller');

const LAST_CALL_EXPRESSION = 'extend';

let Controllers = class Controllers {
  constructor(tree) {
    this.tree = tree;
  }

  type() {
    return 'Controller';
  }

  typeClass() {
    return Controller;
  }

  find() {
    let foundControllers = [];
    this.tree.selectNodesByType('CallExpression').forEach(node => {
      if (!node.callee.property || !node.callee.object.property) {
        return;
      }

      if (node.callee.property.name === LAST_CALL_EXPRESSION && node.callee.object.property.name === this.type()) {
        let type = this.typeClass();
        foundControllers.push(new type(node));
      }
    });
    return foundControllers;
  }
}

module.exports = Controllers;
