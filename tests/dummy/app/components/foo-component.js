import Ember from 'ember';

Ember.Component.extend({
  classNameBindings: ['used_in_class_name_binding'],

  foo: true,

  unused: Ember.computed('foo', function() {}),

  used_in_template: Ember.computed.not('foo'),

  used_by_observer: Ember.computed('foo', () => {}),

  observes_used_by_observer: Ember.observer('used_by_observer', () => {}),

  used_in_class_name_binding: Ember.computed('foo', () => {}),

  used_in_plain_method: Ember.computed.alias('foo'),

  unused_by_shake2: Ember.computed.alias('foo'),

  unused_by_shake1: Ember.computed.alias('unused_by_shake2'),

  usesInPlainMethod() {
    this.get('used_in_plain_method');
  }
});
