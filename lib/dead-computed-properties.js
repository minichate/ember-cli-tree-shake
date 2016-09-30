const Controllers = require('./controllers');
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
  var controllers = new Controllers(this.tree).find();
  controllers.forEach((node) => {
    let dependants = {};
    node.computed().forEach((computed) => {
      computed.dependants().forEach((dep) => {
        dependants[dep] = computed;
      });
    });

    node.observer().forEach((observer) => {
      observer.dependants().forEach((dep) => {
        dependants[dep] = observer;
      });
    });

    let jsPath = path.relative(this.paths.app + '/controllers', this.filepath);
    let controllerDirPath = path.dirname(jsPath);
    let templatePath = path.join(
      this.paths.app,
      '/templates/',
      controllerDirPath,
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
        console.log(
          colors.yellow('Warning:'),
          'Possibly dead computed property',
          '"' + colors.green(computed.name()) + '"',
          this.filepath
        );
      }
    });
  });
};

module.exports = DeadComputedProperties;
