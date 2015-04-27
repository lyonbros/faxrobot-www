var AccountsTransactionsController = Composer.Controller.extend({
    inject: faxrobot.main_container_selector,
    el: false,
    template: 'accounts_transactions',  

    model: null,

    page: 1,

    elements: {
        'div.table': 'table'
    },

    events: {
        'click a.login': 'login'
    },

    init: function() {
        util.set_title('My transactions');
        this.with_bind(faxrobot.account, 'change', this.render.bind(this));
        this.render();

        document.body.style.backgroundColor = 'purple';

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
            credit: faxrobot.account.get('credit')
        };
        var html = faxrobot.render_template(this.template, data);
        this.html(html);

        if (data.logged_in)
            this.track_subcontroller('list_table', function() {
                return new AccountsTransactionsListController({
                    page: this.page,
                    inject: this.table
                });
            }.bind(this));

        return this;
    }

});