import Ember from 'ember';

Ember.Controller.extend({
  foo: true,

  bar: [],

  baz: 'baz',

  unused: Ember.computed('foo', 'bar', function() {
    if (this.get('foo')) {
      return this.get('bar.length');
    }

    return -1;
  }),

  unused_bare: Ember.computed(function() {
    return this.plain_function();
  }),

  unused_alias: Ember.computed.alias('foo'),

  dependant: Ember.computed.not('foo'),

  unused_dependant: Ember.computed.alias('dependant'),

  used_in_template: Ember.computed.not('foo'),

  used_in_template_condition: Ember.computed('foo', function() {}),

  used_in_template_condition_body: Ember.computed.not('foo'),

  used_in_component_argument: Ember.computed.not('foo'),

  plain_function() {

  }
});