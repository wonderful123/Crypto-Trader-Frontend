import Controller from '@ember/controller';

export default Controller.extend({
  breadCrumb: 'Toastr',
  closeButton: true,
  progressBar: true,
  preventDup: true,
  newestOnTop: true,
  type: 'info',
  position: 'toast-top-center',
  showDuration: '300',
  hideDuration: '1000',
  actions: {
    toast: function() {
      var options = {
        closeButton: this.get('closeButton'),
        progressBar: this.get('progressBar'),
        positionClass: this.get('position'),
        preventDuplicates: this.get('preventDup'),
        newestOnTop: this.get('newestOnTop'),
        showDuration: this.get('showDuration'),
        hideDuration: this.get('hideDuration'),
      };
      switch (this.get('type')) {
        case 'success':
          this.toast.success(this.get('message') || 'Message', this.get('title') || 'Title', options);
          break;
        case 'warning':
          this.toast.warning(this.get('message') || 'Message', this.get('title') || 'Title', options);
          break;
        case 'error':
          this.toast.error(this.get('message') || 'Message', this.get('title') || 'Title', options);
          break;
        default:
          this.toast.info(this.get('message') || 'Message', this.get('title') || 'Title', options);
          break;
      }
    }
  }
});
