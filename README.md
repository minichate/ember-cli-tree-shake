# ember-cli-tree-shake

This Ember CLI addon uses tree shaking to discover dead code within an Ember
application.

Currently, only dead/unused computed properties are considered, with a few
caveats:

- Plain function's usage of computed property doesn't get considered as dependency
- Mixins don't get considered when considering aliveness of a property

## Installation

* `npm install --save-dev ember-cli-tree-shake`

## Running

* `ember tree-shake`

## Contributing

* `npm test`
