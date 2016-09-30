/* jshint node: true */
'use strict';

var cst = require('cst');
var mime = require('mime-types');
var fs = require('fs');
var walk = require('fs-walk');
var path = require('path');
var DeadComputedProperties = require('./lib/dead-computed-properties');

module.exports = {
  name: 'ember-cli-tree-shake',
  includedCommands: function() {
    var treePaths = this.treePaths;
    var appPath = treePaths.app;

    return {
      treeShake: {
        name: 'tree-shake',
        description: 'Discover code that is probably dead or unused',
        run: function(commandOptions, rawArgs) {
          var parser = new cst.Parser();

          walk.walkSync(appPath, function(basedir, filename, stat) {
            var filepath = path.join(basedir, filename);
            if (mime.lookup(filepath) !== 'application/javascript') {
              return;
            }

            var code = fs.readFileSync(filepath, 'utf8');
            var tree = parser.parse(code);

            new DeadComputedProperties(tree, treePaths, filepath).emit();
          });
        }
      }
    }
  }
};
