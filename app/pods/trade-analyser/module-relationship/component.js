import Component from '@ember/component';

const relationshipList = [
  "AND",
  "THEN",
  "AFTER",
];

export default Component.extend({
  relationshipList: relationshipList,
  collapsedToggle: true,

  didInsertElement() {
    this.set('relationship', relationshipList[0]);
  },

  actions: {
    toggleCollapse() {
      this.set('collapsedToggle', !this.collapsedToggle);
    },

    changeRelation(selected) {
      this.set('relationship', selected);
      this.send('toggleCollapse');
    }
  },
});
