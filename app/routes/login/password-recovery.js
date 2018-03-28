import Route from '@ember/routing/route';

export default Route.extend({
    activate: function() {
        this.controllerFor('login.password-recovery').setProperties({
            email: null
        });
    }
});
