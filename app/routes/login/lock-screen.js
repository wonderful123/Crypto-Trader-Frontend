import Route from '@ember/routing/route';

export default Route.extend({
    activate: function() {
        this.controllerFor('login.lock-screen').setProperties({
            password: null
        });
    }
});
