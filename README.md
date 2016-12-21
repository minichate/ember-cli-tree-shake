# ember-cli-tree-shake

This Ember CLI addon uses tree shaking to discover dead code within an Ember
application.

Currently, only dead/unused computed properties are considered, with a few
caveats:

- Mixins don't get considered when considering aliveness of a property

## Installation

* `npm install --save-dev ember-cli-tree-shake`

## Running

* `ember tree-shake`

This addon will currently look for computed properties and observers that are
not actually used in either internal methods or in the associated template. For
example:

```javascript
Ember.Component.extend({
  foo: true,

  used: Ember.computed.alias('foo'),

  unused: Ember.computed.not('used')
});
```

`ember-cli-tree-shake` will identity that the `unused` property isn't actually
used within the component.

However, if there was an associated template:

```htmlbars
{{#if (or used unused)}}
  Hello, world!
{{/if}}
```

In this case, the "`unused`" property is actually being evaluated in the
template, and therefor isn't actually dead code. `ember-cli-tree-shake` would
no longer identify it as such.

Finally, `ember-cli-tree-shake` will do a 2nd, 3rd ... nth pass over the tree
and keep shaking until no more dead code falls off.

## Contributing

* `npm test`
