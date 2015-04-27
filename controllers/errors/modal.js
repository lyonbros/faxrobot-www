var ErrorModalController = BaseModalController.extend({

    inject: faxrobot.main_container_selector,

    el: false,
    code: 0,

    template: 'errors_modal', 

    elements: {
    },

    events: {
        'click button': 'close'
    },

    init: function()
    {
        this.render();
        return this;
    },

    render: function()
    {
        var data = false;

        for (var i=0; i<ERRORS.length; i++) {
            if (this.code == ERRORS[i].code)
                data = ERRORS[i];
        }
        if (!data)
            data = ERRORS[0];

        data.detail = data.detail.replace(
            '{SUPPORTED_FILETYPES}',
            SUPPORTED_FILETYPES.join(', ')
        );

        console.log('data: ', data);

        var html = faxrobot.render_template(this.template, data);
        this.html(html);
        this.show();
        return this;
    }
});