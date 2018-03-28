import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('platforms');
  this.route('platform', { path: '/platform/:platform_id' }, function() {
    this.route('market', { path: '/market/:market_id' });
  });

  this.route('tools', function() {
    this.route('platform-spread');
    this.route('historic-analyser');
    this.route('trade-analyser');
    this.route('trade-simulator');
    this.route('historic-multidate');
  });

  this.route('admin', {}, function() {
      this.route('backend');
      this.route('platforms');
      this.route('users');
  });

  this.route('login', {}, function() {
      this.route('login-form');
      this.route('registration-form');
      this.route('password-recovery');
      this.route('lock-screen');
  });

  this.route('landing', {}, function() {
      this.route('landing-page');
  });
});

export default Router;
