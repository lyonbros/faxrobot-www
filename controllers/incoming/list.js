var IncomingListController = Composer.Controller.extend({
    inject: faxrobot.main_container_selector,
    el: false,
    template: 'incoming_list',  

    model: null,

    page: 1,

    elements: {
        'div.table': 'table'
    },

    events: {
        'click a.login': 'login',
    },

    init: function() {
        util.set_title('My received faxes');
        this.with_bind(faxrobot.account, 'change', this.render.bind(this));
        this.render();
        document.body.style.backgroundColor = '#acd';
        return this;
    },

    login: function(e) {
        e.preventDefault();
        new AccountsLoginController();
    },

    render: function()
    {
        var data = {
            logged_in: faxrobot.account.is_logged_in(),
            incoming_number: faxrobot.account.get('incoming_number'),
        };
        var html = faxrobot.render_template(this.template, data);
        this.html(html);

        if (data.logged_in)
            this.track_subcontroller('incoming_table', function() {
                return new IncomingListTableController({
                    page: this.page,
                    inject: this.table
                });
            }.bind(this));

        return this;
    },
});