var AccountsAPIKeyController = BaseModalController.extend({

    inject: faxrobot.main_container_selector,

    el: false,

    template: 'accounts_api_key', 

    model: null,
    closable: true,

    events: {
        'click a.reset': 'reset'
    },

    init: function()
    {
        this.model = faxrobot.account;
        this.render();
        return this;
    },


    render: function()
    {
        var data = this.model.toJSON();
        var html = faxrobot.render_template(this.template, data);
        this.html(html);
        this.show();
        return this;
    },

    reset: function(e) {
        e.preventDefault();
        setTimeout(function() {
            new AccountsAPIKeyResetController();
        }, 250);
        this.close();
    }
});