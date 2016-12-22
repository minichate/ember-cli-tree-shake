const Controllers = require('./controllers');
const Components = require('./components');
const HTMLBarsSyntax = require('htmlbars/dist/cjs/htmlbars-syntax');
const fs = require('fs');
const path = require('path');
const walk = require('fs-walk');
const colors = require('colors/safe');
const beautify = require('js-beautify').js_beautify;
const align = require('align-text');


let DeadComputedProperties = class DeadComputedProperties {
  constructor(tree, paths, filepath) {
    this.tree = tree;
    this.filepath = filepath;
    this.paths = paths;
  }

  emit(pass = 1) {
    let shake = this.collect();

    shake.forEach((property) => {
      console.log(
        'Possibly dead computed property',
        '"' + colors.green(property.name) + '"',
        property.path
      );
      console.log(
        colors.grey(align(beautify(property.source), 4)),
        "\n"
      );
    });

    if (shake.length > 0) {
      this.emit(pass + 1);
    }
  }

  collect() {
    let possiblyDead = [];
    let controllers = new Controllers(this.tree).find();
    let components = new Components(this.tree).find();

    
    return this.collectFor(controllers).concat(
      this.collectFor(components)
    );
  }

  collectFor(type) {
    let possiblyDead = [];

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

      let jsPath = path.relative(this.paths.app, this.filepath);
      let controllerDirPath = path.dirname(jsPath);
      if (controllerDirPath.startsWith('controllers')) {
        jsPath = path.relative('controllers', jsPath);
      }

      let templatePath = path.join(
        this.paths.app,
        'templates',
        path.dirname(jsPath),
        path.basename(jsPath, path.extname(jsPath)) + '.hbs'
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
          let source = computed.node.getSourceCode();
          computed.node.parentElement.removeChildren(
            computed.node,
            computed.node.nextSibling
          );

          possiblyDead.push({
            'name': computed.name(),
            'path': this.filepath,
            'source': source
          });
        }
      });
    });

    return possiblyDead;
  }
};

module.exports = DeadComputedProperties;
