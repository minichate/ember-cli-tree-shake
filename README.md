# ember-cli-tree-shake

This Ember CLI addon uses tree shaking to discover dead code within an Ember
application.

Currently, only dead/unused computed properties are considered, with a few
caveats:

- Plain function's usage of computed property doesn't get considered as dependency
- Mixins don't get considered when considering aliveness of a property

## Installation

* `git clone <repository-url>` this repository
* `cd ember-cli-tree-shake`
* `npm install`
* `bower install`

## Running

* `ember tree-shake`

## Running Tests

* `npm test`
