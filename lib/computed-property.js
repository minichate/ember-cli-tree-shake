let Property = require('./property');

let ComputedProperty = class ComputedProperty extends Property {
  value() {
    return this.node.value;
  }

  arguments() {
    if (!this.value().arguments) {
      return [];
    }

    return this.value().arguments;
  }

  get functionBody() {
    const args = this.arguments();
    return args[args.length - 1];
  }

  dependants() {
    let dependants = [];
    this.arguments().forEach((argument) => {
      if (argument.type !== 'StringLiteral') {
        return;
      }

      dependants.push(argument.value.split('.')[0]);
    });

    return dependants.concat(super.dependants());
  }
};

module.exports = ComputedProperty;
