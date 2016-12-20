let Controller = require('./controller');

let Component = class Component extends Controller {
  templatePath() {
    return 'components';
  }
};

module.exports = Component;
