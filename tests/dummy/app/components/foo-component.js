import Ember from 'ember';

Ember.Component.extend({
  foo: true,

  unused: Ember.computed('foo', function() {}),

  used_in_template: Ember.computed.not('foo')
});
