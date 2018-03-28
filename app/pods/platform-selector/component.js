import Component from '@ember/component';

export default Component.extend({
  selectedPlatformIds: null,
  actions: {
    checkboxChanged(id, isChecked) {
      if (isChecked) this.selectedPlatformIds.pushObject(id);
      else this.selectedPlatformIds.removeObject(id);

      this.get('onPlatformSelection')(this.get('selectedPlatformIds'));
    }
  },
});
