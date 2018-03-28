import Controller from '@ember/controller';

export default Controller.extend({
    breadCrumb: 'Platforms',

    actions: {
      createPlatform(platform) {
        var data = this.store.createRecord('platform', { name: platform.name, website: platform.website, apiName: platform.apiName });
        data.save();
      },

      clear: function() {
        this.set('platform.name', '');
        this.set('platform.website', '');
        this.set('platform.apiName', '');
      },

      delete(platform) {
        platform.destroyRecord();
      }
    },
});
