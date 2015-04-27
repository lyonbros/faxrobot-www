var ContentPageController = Composer.Controller.extend({
    inject: faxrobot.main_container_selector,
    el: false,
    template: 'page',  

    html_content: null,
    page: '',
    title: '',
    jump_to: null,
    color: 'black',

    elements: {
    },

    events: {
        'click a.api_key': 'show_api_key',
        'click a.support': 'contact_support'
    },

    init: function() {
        util.set_title(this.title);
        this.with_bind(faxrobot.account, 'change', this.render.bind(this));
        this.render();

        document.body.style.backgroundColor = this.color;

        return this;
    },

    render: function() {
        var data = { html: this.html_content };
        var html = faxrobot.render_template(this.template, data);
        this.html(html);

        if (!this.html_content)
            this.populate();
        else
            this.jump();

        return this;
    },

    populate: function() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                if (xhr.status == 200) {
                    this.html_content = xhr.response;
                    this.render();
                } else {
                    var e ='<h1>404</h1>/pages/'+this.page+'.html not found :(';
                    this.html_content = e;
                    this.render();
                }
            }
        }.bind(this);
        xhr.open("get", '/pages/'+this.page+'.html', true);
        xhr.send();
    },

    show_api_key: function(e) {
        e.preventDefault();
        if (faxrobot.account.is_logged_in())
            new AccountsAPIKeyController();
        else
            faxrobot.route('/account');
    },

    jump: function() {

        if (!this.jump_to)
            return;

        var el = document.getElementById(this.jump_to);
        if (el)
            el.scrollIntoView();
    },

    contact_support: function(e) {
        e.preventDefault();
        window.location.href = 'mailto:'+EMAIL_SUPPORT;
    }

});