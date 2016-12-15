import Ember from 'ember';

Ember.Component.extend({
  classNameBindings: ['used_in_class_name_binding'],

  foo: true,

  unused: Ember.computed('foo', function() {}),

  used_in_template: Ember.computed.not('foo'),

  used_by_observer: Ember.computed('foo', () => {}),

  observes_used_by_observer: Ember.observer('used_by_observer', () => {}),

  used_in_class_name_binding: Ember.computed('foo', () => {})
});
