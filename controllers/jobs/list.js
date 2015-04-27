var JobsListController = Composer.Controller.extend({
    inject: faxrobot.main_container_selector,
    el: false,
    template: 'jobs_list',  

    model: null,

    page: 1,
    filter: 'all',

    elements: {
        'div.table': 'table'
    },

    events: {
        'click a.login': 'login',
        'click a.change_password': 'change_password',
    },

    init: function() {
        util.set_title('My faxes');
        this.with_bind(faxrobot.account, 'change', this.render.bind(this));
        this.render();
        document.body.style.backgroundColor = 'brown';
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
            credit: faxrobot.account.get('credit'),
            temporary_password: faxrobot.account.get('temporary_password'),
            changed_tmp_pwd: faxrobot.account.get('changed_tmp_pwd')
        };
        var html = faxrobot.render_template(this.template, data);
        this.html(html);

        if (data.logged_in)
            this.track_subcontroller('list_table', function() {
                return new JobsListTableController({
                    page: this.page,
                    filter: this.filter,
                    inject: this.table
                });
            }.bind(this));

        return this;
    },

    change_password: function(e) {
        e.preventDefault();
        new AccountsChangePasswordController();
    },

});