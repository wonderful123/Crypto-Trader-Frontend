import Controller from '@ember/controller';
import { set } from '@ember/object';

const selectedPlatformIds = [];

export default Controller.extend({
  breadCrumb: "Platform Spread",
  canRenderTable: false,
  selectedPlatformIds: selectedPlatformIds,

  actions: {
    setSelectedPlatformIds(selectedPlatformIds) {
      set(this, 'selectedPlatformIds', Array.from(selectedPlatformIds));

      if (selectedPlatformIds.length > 1)
        this.set('canRenderTable', true)
      else
        this.set('canRenderTable', false)
    }
  }
});
