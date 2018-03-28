import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['options-list-component'],
  platformsSubmenu: service(),

  // default selection
  selectedMenu: 'platforms',
  fixedTopToolbar: true,
  fixedBottomToolbar: true,
  hideTopToolbar: false,
  hideBottomToolbar: true,
  hideBreadCrumbs: false,

  init() {
    this._super(...arguments);

    this.updateNavigationOnInit();
  },

  updateNavigationOnInit() {
    let currentPath = this.get('currentPath');
    let baseRoute = currentPath.split('.')[0];

    if (baseRoute) {
      switch (baseRoute) {
        case 'platforms':
          this.set('selectedMenu', 'platforms');
          break;
        case 'tools':
          this.set('selectedMenu', 'tools');
          break;
        case 'admin':
          this.set('selectedMenu', 'admin');
          break;
        case 'login':
          this.set('selectedMenu', 'login');
          break;
        case 'landing':
          this.set('selectedMenu', 'landing');
          break;
        default:
          this.set('selectedMenu', 'platforms');
      }
    }
  },

});
