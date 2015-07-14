var faxrobot = {

    // base window title
    base_window_title: PROJECT_NAME,

    // holds the DOM object that turtl does all of its operations within
    main_container_selector: '#main',

    last_url: '',

    // tells the pages controller whether or not to scroll to the top of the
    // window after a page load 
    scroll_to_top: true,

    router: null,

    // a place to reference composer controllers by name
    controllers: {},

    // will hold the user's account
    account: false,

    // will hold the utility functions

    _tmp: {},

    init: function()  {

        this.account = new Account();

        this.util = util;

        this.load_controller('pages', PagesController);
        this.load_controller('header', HeaderController);

        var router = new Composer.Router(routes);
        router.bind_links({
            exclude_class: 'external'
        });
        router.bind('fail', function(err) {
            console.log('route: fail: ', err);
        });
        router.bind('statechange', function(e) {
            this.controllers.header.state_change();
        }.bind(this));
        this.router = router;

        document.getElementById('contact_link').href = 'mailto:'+EMAIL_CONTACT;

        this.login_from_cookie();
    },

    load_controller: function(name, controller, params, options) {

        options || (options = {});

        if(this.controllers[name]) return this.controllers[name];

        this.controllers[name]  =   new controller(params, options);
        return this.controllers[name];
    },

    render_template: function(template, data) {

        var rendered = _.template(document.getElementById(template).innerHTML);
        return rendered(data)
    },

    route: function(url, options) {

        this.router.route(url, options);
    },

    access_denied: function() {
        this.route('/');
        this.error.show(ERR_ACCESS_DENIED);
    },

    error: {
        api: function(status, response) {

            if (typeof response == 'string')
                var decoded_response = JSON.parse(response);
            else
                var decoded_response = response;

            if (decoded_response) {
                this.show(decoded_response.code);
            } else {
                console.error('Undecipherable error: ', status, response);
                this.show(0);
            }
        },

        show: function(code) {

            new ErrorModalController({ code: code });
        }
    },

    login_from_cookie: function() {
        var _api_key = faxrobot.util.get_cookie('API_KEY');
        if (_api_key) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status == 200)
                    faxrobot.account.login(JSON.parse(xhr.response));
            }.bind(this);
            xhr.open("get", API_URL + '/accounts/get?api_key=' +_api_key, true);
            xhr.send();
        }
    },
}

var init = function() {
    faxrobot.init();
}

var state = document.readyState;
if (state=="complete" || state=="loaded" || state=="interactive")
    init();
else if (document.addEventListener)
    document.addEventListener('DOMContentLoaded', init, false);
