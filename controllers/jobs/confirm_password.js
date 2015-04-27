var JobsConfirmPasswordController = BaseModalController.extend({

    inject: faxrobot.main_container_selector,

    el: false,
    closable: true,

    confirmed: null,

    template: 'jobs_confirm_password', 

    elements: {
        '#confirm_password': 'password'
    },

    events: {
        'submit form': 'confirm'
    },

    init: function() {
        this.render();
        return this;
    },

    render: function() {
        var html = faxrobot.render_template(this.template, {});
        this.html(html);
        this.show();
        return this;
    },

    confirm: function(e) {
        e.preventDefault();
        
        this.confirmed = this.password.value;
        this.close();
    },

    before_close: function() {
        if (this.confirmed)
            this.trigger('confirm', this.confirmed);
        else
            this.trigger('close');
    }
});