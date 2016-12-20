const Controllers = require('./controllers');
const Components = require('./components');
const HTMLBarsSyntax = require('htmlbars/dist/cjs/htmlbars-syntax');
const fs = require('fs');
const path = require('path');
const walk = require('fs-walk');
const colors = require('colors/safe');


var DeadComputedProperties = function(tree, paths, filepath) {
  this.tree = tree;
  this.filepath = filepath;
  this.paths = paths;
};

DeadComputedProperties.prototype.emit = function() {
  this.collect().forEach((property) => {
    console.log(
      colors.yellow('Warning:'),
      'Possibly dead computed property',
      '"' + colors.green(property.name) + '"',
      property.path
    );
  });
}

DeadComputedProperties.prototype.collect = function() {
  var possiblyDead = [];
  var controllers = new Controllers(this.tree).find();
  var components = new Components(this.tree).find();

  
  return this.collectFor(controllers, 'controllers').concat(
    this.collectFor(components, 'components')
  );
};

DeadComputedProperties.prototype.collectFor = function(type, typePath) {
  var possiblyDead = [];

  type.forEach((node) => {
    let dependants = {};
    node.computed().forEach((computed) => {
      computed.dependants().forEach((dep) => {
        dependants[dep] = true;
      });
    });

    node.observer().forEach((observer) => {
      observer.dependants().forEach((dep) => {
        dependants[dep] = true;
      });
    });

    node.classNameBindings().forEach((binding) => {
      dependants[binding] = true;
    });

    node.methods().forEach((method) => {
      method.dependants().forEach((dep) => {
        dependants[dep] = true
      });
    })

    let jsPath = path.relative(this.paths.app + '/' + typePath, this.filepath);
    let controllerDirPath = path.dirname(jsPath);
    let templatePathPart = '/templates/';

    if (typePath !== 'controllers') {
      templatePathPart += typePath + '/';
    }

    let templatePath = path.join(
      this.paths.app,
      templatePathPart,
      path.basename(jsPath, '.js') + '.hbs'
    );
    let walker, htmlbars;

    try {
      if (fs.statSync(templatePath)) {
        let code = fs.readFileSync(templatePath, 'utf8');
        htmlbars = HTMLBarsSyntax.parse(code);
        walker = new HTMLBarsSyntax.Walker();
      }
    } catch (_) {
    }

    node.computed().forEach((computed) => {
      let maybeDead = true;

      if (dependants[computed.name()]) {
        maybeDead = false;
      }

      if (walker) {
        let visit = (walker, hbsTree) => {
          walker.visit(hbsTree, (hbsNode) => {
            if (hbsNode.original === computed.name() || (hbsNode.path && hbsNode.path.original === computed.name())) {
              maybeDead = false;
            }

            if (hbsNode.attributes) {
              hbsNode.attributes.forEach((attribute) => {
                visit(walker, attribute);
              })
            }

            if (hbsNode.parts) {
              hbsNode.parts.forEach((part) => {
                visit(walker, part);
              })
            }

            if (hbsNode.pairs) {
              hbsNode.pairs.forEach((pair) => {
                visit(walker, pair);
              })
            }

            if (hbsNode.params) {
              hbsNode.params.forEach((param) => {
                visit(walker, param);
              })
            }

            if (hbsNode.value) {
              visit(walker, hbsNode.value);
            }

            if (hbsNode.hash) {
              visit(walker, hbsNode.hash);
            }

            if (hbsNode.program) {
              visit(walker, hbsNode.program);
            }

            if (hbsNode.path && hbsNode.path.original === 'partial') {
              let jsPath = path.relative(this.paths.app + '/controllers', this.filepath);
              let templatePath = path.join(
                this.paths.app,
                '/templates/',
                hbsNode.params[0].original + '.hbs'
              );

              try {
                if (fs.statSync(templatePath)) {
                  let code = fs.readFileSync(templatePath, 'utf8');
                  partialHtmlbars = HTMLBarsSyntax.parse(code);
                  partialWalker = new HTMLBarsSyntax.Walker();

                  visit(partialWalker, partialHtmlbars);
                }
              } catch (_) {
              }
            }
          });
        }

        visit(walker, htmlbars);
      }

      if (maybeDead) {
        possiblyDead.push({
          'name': computed.name(),
          'path': this.filepath
        });
      }
    });
  });

  return possiblyDead;
};

module.exports = DeadComputedProperties;
