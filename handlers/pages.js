var pages = {
    faq: function(jump) {
        this._load('faq', 'Frequently Asked Questions', 'DarkSlateBlue ', jump);
    },

    api: function(jump) {
        this._load('api', 'API', 'Olive', jump);
    },

    privacy: function(jump) {
        this._load('privacy', 'Privacy Policy', 'LightSlateGray', jump);
    },

    tos: function(jump) {
        this._load('tos', 'Terms of Service', 'black', jump);
    },

    _load: function(page, title, color, jump) {
        var pages = faxrobot.controllers.pages;

        if (
            pages.cur_controller instanceof ContentPageController
            &&
            pages.cur_controller.page == page
        ) {
            pages.cur_controller.jump_to = jump;
            pages.cur_controller.jump();
        } else {
            pages.load(ContentPageController, {
                page: page,
                title: title,
                jump_to: jump,
                color: color
            });
        }
    },

    not_found: function() {
        alert('404 lol ');
    }
}