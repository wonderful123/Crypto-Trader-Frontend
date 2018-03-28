import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from '../../config/environment';

export default Controller.extend({
    breadCrumb: 'Backend',

    cableService: service('cable'),

    init() {
      let self = this;
      this._super(...arguments);

      //this.set('jobStatus', "Ready")

      var consumer = this.get('cableService').createConsumer(ENV.actioncableHost);
      console.log('CONSUMER', consumer)

      let subscription = consumer.subscriptions.create({ channel: "AdminChannel" }, {
        connected() {
          this.set('jobStatus', "Connected to Admin ActionCable Channel")
        },
        received(data) {
          console.log("data recevived", data)
          self.set('jobStatus', data.message );
        },
        disconnected() {
          this.set('jobStatus', "Admin Channel Disconnted");
        }
      });
      console.log('SUBSCRIPTION', subscription)

      this.set('consumer', consumer)
      this.set('subscription', subscription);
    },

    actions: {
      testSend() {
        console.log("testSend");
        this.get('subscription').send({message: "TEST"});
      }
    },
});
