import Route from '@ember/routing/route';

export default Route.extend({
    activate: function() {
        this.controllerFor('login.login-form').setProperties({
            email: null,
            password: null,
            rememberMe: null
        });
    }
});
