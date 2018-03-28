import Controller from '@ember/controller';
import { inject as service } from '@ember/service'
import { debounce, next } from '@ember/runloop';
import $ from 'jquery';
import config from '../config/environment';

export default Controller.extend({
  session: service(),
  breadCrumb: 'Home',
  showNavigationBar: true,
  windowWidth: 0,
  topBarClass: '',
  bottomBarClass: '',

  // Theme Options
  autoHideMenu: true,
  nonFixedTopBar: false,
  nonFixedBottomBar: false,
  hideTopToolbar: false,
  hideBottomToolbar: true,
  hideBreadCrumbs: false,

  init() {
    this._super(...arguments);

    this.resize();
  },

  resize() {
    $(window).resize(this.onResize.bind(this));
  },

  onResize(event, action) {
    if (this.get('autoHideMenu')) {
      if (action !== 'click' && this.get('windowWidth') !== action && event.target.window === event.target) {
        debounce(this, function() {
          if ($(document).width() >= 900 && $(document).width() <= 1024) {
            this.set('showNavigationBar', false);
          } else if ($(document).width() >= 1264) {
            this.set('showNavigationBar', true);
          }
        }, 100);
      }
    }
  },

  actions: {
    toggleNavBar: function() {
      this.toggleProperty('showNavigationBar');
      this.set('windowWidth', $(document).width());

      // Emmit resize event to resize some charts libraries
      next(this, function() {
        setTimeout(function() {
          $(window).trigger('resize', ['click']);
        }, 400);
      });

      // Center toast view depending on expanded or collapsed app-container
      if (this.get('showNavigationBar')) {
        config['ember-toastr'].toastrOptions.positionClass = 'toast-top-center toast-options ember-dashboard-toast-long';
      } else {
        config['ember-toastr'].toastrOptions.positionClass = 'toast-top-center toast-options ember-dashboard-toast-short';
      }
    },

    logout: function() {
      this.toast.info('Logout');
      this.get('session').invalidate();
    },

    login: function() {
      this.transitionToRoute('login.login-form');
    }
  }
});
