import Component from '@ember/component';

export default Component.extend({
  didInsertElement() {
    let defaultModule = this.get('modules')[0]; // set default to the first module
    this.set('selectedModules', [defaultModule]);
  },

  actions: {
    toggleCollapse(module) {
      let toggle = module.collapsedToggle === undefined ? false : !module.collapsedToggle;
      module.set('collapsedToggle', toggle);
    },
  },
});
