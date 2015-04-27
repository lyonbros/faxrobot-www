var accounts = {
    login: function() {
         new AccountsLoginController({});
    },

    register: function() {
         new AccountsRegisterController({});
    },

    logout: function() {
        faxrobot.account.logout();
        util.notify('Goodbye!');
        if (faxrobot.router)
            faxrobot.route('/', {replace_state: true});
        else
            window.location.replace('/');
    },

    manage: function() {
        faxrobot.controllers.pages.load(AccountsManageController, {});
    },

    transactions: function(page) {
        page || (page = 1);

        var pages = faxrobot.controllers.pages;

        if (pages.cur_controller instanceof AccountsTransactionsController) {
            var sub = pages.cur_controller.get_subcontroller('list_table');
            if (sub)
                sub.update(parseInt(page));
        }
        else
            pages.load(AccountsTransactionsController, {page: parseInt(page)});
    },

    reset_password: function(reset_hash) {
        new AccountsChangePasswordController({
            reset_hash: reset_hash
        });
    }

}