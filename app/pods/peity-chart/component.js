import Component from '@ember/component';

const options = {};

export default Component.extend({
    classNames: ['peity-chart-component'],
    type: 'line',
    options: options,
    didInsertElement: function() {
        this.$('.peity-chart').peity(this.get('type'), this.get('options'));
    },
});
