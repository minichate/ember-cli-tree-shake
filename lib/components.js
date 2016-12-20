let Controllers = require('./controllers');
let Component = require('./component');

const LAST_CALL_EXPRESSION = 'extend';

let Components = class Components extends Controllers {
  type() {
    return 'Component';
  }

  typeClass() {
    return Component;
  }
};

module.exports = Components;
