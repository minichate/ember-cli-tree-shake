var Controller = require('./controller');

const LAST_CALL_EXPRESSION = 'extend';

var Controllers = function(tree) {
  this.tree = tree;
};

Controllers.prototype.find = function() {
  let foundControllers = [];
  this.tree.selectNodesByType('CallExpression').forEach(node => {
    if (!node.callee.property || !node.callee.object.property) {
      return;
    }

    if (node.callee.property.name === LAST_CALL_EXPRESSION && node.callee.object.property.name === 'Component') {
      foundControllers.push(new Controller(node));
    }
  });
  return foundControllers;
};

module.exports = Controllers;
