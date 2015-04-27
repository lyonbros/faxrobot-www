var BlockingModalController = BaseModalController.extend({

    inject: faxrobot.main_container_selector,

    el: false,

    template: 'blocking_modal',
    text: 'Please wait...',

    elements: {
    },

    events: {
    },

    init: function()
    {
        this.render();
        return this;
    },


    render: function()
    {
        var html = faxrobot.render_template(this.template, {text: this.text});
        this.html(html);
        this.show();
        return this;
    }
});