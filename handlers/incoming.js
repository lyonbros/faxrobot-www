var incoming = {
    
    provision: function() {
        faxrobot.controllers.pages.load(IncomingProvisionController, {});
    },

    list: function(page) {
        page || (page = 1);

        var pages = faxrobot.controllers.pages;

        if (pages.cur_controller instanceof IncomingListController) {
            var sub = pages.cur_controller.get_subcontroller('list_table');
            if (sub)
                sub.update(parseInt(page));
        }
        else {
            pages.load(IncomingListController, {
                page: parseInt(page)
            });
        }
    },
}