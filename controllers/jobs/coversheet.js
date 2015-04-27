var JobsCoverSheetController = BaseModalController.extend({

    inject: faxrobot.main_container_selector,

    el: false,

    template: 'jobs_coversheet', 

    model: null,
    error: null,
    closable: true,

    elements: {
        '.error': 'msg'
    },

    events: {
        'change input': 'do_change',
        'change textarea': 'do_change',
        'click button': 'close'
    },

    init: function()
    {
        this.model.set({cover_edited: true});
        this.render();
        return this;
    },


    render: function()
    {
        var data = this.model.toJSON();
        var html = faxrobot.render_template(this.template, data);
        this.html(html);

        if (this.error && this.error.field) {
            var el = document.getElementById(this.error.field);
            if (el) {
                el.parentNode.className += ' error';
                this.msg.textContent = this.error.msg;
            }
        }


        this.show();
        return this;
    },

    do_change: function(e) {
        var data = {};
        data[e.target.id] = e.target.value;
        this.model.set(data);
    },
});