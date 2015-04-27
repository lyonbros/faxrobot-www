var jobs = {
    create: function() {

        faxrobot.controllers.pages.load(JobsCreateController, {});
    },

    list: function(filter, page) {
        filter || (filter = 'all');
        page || (page = 1);

        var pages = faxrobot.controllers.pages;

        if (pages.cur_controller instanceof JobsListController) {
            var sub = pages.cur_controller.get_subcontroller('list_table');
            if (sub)
                sub.update(filter, parseInt(page));
        }
        else {
            pages.load(JobsListController, {
                filter: filter,
                page: parseInt(page)
            });
        }
    },

    view: function(access_key) {
        var data = {access_key: access_key};
        var pages = faxrobot.controllers.pages;

        if (pages.cur_controller instanceof JobsListController) {
            var sub = pages.cur_controller.get_subcontroller('list_table');
            if (sub) {
                var model = sub.collection.find(function(m) { 
                    return m.get('access_key') == access_key;
                });
                if (model)
                    data.model = model;
            }
        }
        faxrobot.controllers.pages.load(JobsInfoController, data);
    }

}