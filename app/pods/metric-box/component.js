import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    classNames: ['metric-component'],
    classNameBindings: ['smallProgressBar', 'boxShadow', 'borderLess'],
    boxShadow: true,
    smallProgressBar: false,
    showProgressBar: false,
    isLarge: false,
    progressValue: 0,
    type: null,
    minValue: 0,
    maxValue: 100,
    showProgressLabel: false,
    largeProgressBar: computed.not('smallProgressBar'),
    showProgressLabelComputed: computed.and('showProgressLabel', 'largeProgressBar'),
    animate: false,
    striped: false
});
