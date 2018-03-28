import Controller from '@ember/controller';

var nowDate = new Date(),
    tomorrow = new Date().setDate(nowDate.getDate() + 1),
    next3Days = new Date().setDate(nowDate.getDate() + 3),
    next4Days = new Date().setDate(nowDate.getDate() + 4),
    next6Days = new Date().setDate(nowDate.getDate() + 6),
    events = [
        { title: 'First Date', start: Date.now() },
        { title: 'Movies', start: tomorrow },
        { title: 'Dinner', start: next3Days },
        { title: 'Dinner', start: next4Days },
        { title: 'Dinner', start: next6Days }
    ];

export default Controller.extend({
  init() {
    this._super(...arguments);

    this.breadCrumb = 'Calendar';
    this.events = events;
    this.header = {
        left:   'title',
        center: 'month,agendaWeek,agendaDay',
        right:  'today prev,next'
    };
  },

  actions: {
    /* jshint unused:false */
    clicked: function(event, jsEvent, view) {
      alert('${event.title} was clicked!', view);
      // Prints: Hackathon was clicked!
    }
  }
});
