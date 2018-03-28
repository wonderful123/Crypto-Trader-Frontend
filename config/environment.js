'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'frontend',
    podModulePrefix: 'frontend/pods',
    environment,
    rootURL: '/',
    locationType: 'auto',
    'ember-simple-auth': {
      authenticationRoute: 'login.login-form'
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    'ember-toastr': {
      toastrOptions: {
        progressBar: false,
        showDuration: '500',
        timeOut: '1500',
        positionClass: 'toast-top-center toast-options ember-dashboard-toast-long',
      }
    },

    APP: {
      contentSecurityPolicy: {
        'script-src': "'self' 'unsafe-inline' 'unsafe-eval' http://180.181.138.193:4200/ http://localhost:4200 http://127.0.0.1:7020",
        'style-src': "'self' 'unsafe-inline'",
        'connect-src': "'self' 'localhost:8086' 'http://localhost:8086' ws://127.0.0.1:3000/cable http://127.0.0.1:3000 ws://127.0.0.1:7020",
        'img-src': "'self' data: http://static.anychart.com"
      },
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.influxDBHost = 'http://localhost:8086',
    ENV.railsHost = 'http://127.0.0.1:3000',
    ENV.actioncableHost = 'ws://127.0.0.1:3000/cable'
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    ENV.proxyURL = 'https://cors-anywhere.herokuapp.com/',
      ENV.influxDBHost = ENV.proxyURL + 'http://180.181.138.193:8086',
      ENV.railsHost = 'http://180.181.138.193:3000',
      ENV.actioncableHost = 'ws://180.181.138.193:3000/cable'
  }

  return ENV;
};
