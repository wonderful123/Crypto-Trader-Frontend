import Component from '@ember/component';

export default Component.extend({
    menuText: '',
    open: false,

    actions: {
        toggleNavBar: function() {
          this.toggleNavBar();
        },
        logout() {
          this.logout();
        },
        login() {
          this.login();
        }
    }
});
