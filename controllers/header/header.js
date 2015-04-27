var HeaderController = Composer.Controller.extend({
    inject: 'header',
    el: false,
    template: 'header_header',

    elements: {
        'ul.menu': 'menu',
        'ul.nav': 'nav',
        'div.avatar': 'avatar'
    },

    events: {
        'click a.login': 'login',
        'click a.register': 'register'
    },

    init: function()
    {
        this.render();
        this.with_bind(faxrobot.account, 'change', this.render.bind(this));
        return this;
    },

    render: function()
    {
        var data = faxrobot.account.toJSON();

        if (data.email) {
            data.hash = new MD5().hash(data.email.toLowerCase());
            if (!data.first_name)
                // substr(0, data.email.indexOf('@'));
                data.first_name = data.email;
        }


        var html = faxrobot.render_template(this.template, data);
        this.html(html);

        if (this.avatar) {
            this.avatar.addEventListener('click', this.show_menu.bind(this));
            this.menu.addEventListener('mouseleave', this.hide_menu.bind(this));
        }

        this.state_change();

        return this;
    },

    login: function(e) {
        e.preventDefault();
        new AccountsLoginController({});
    },

    register: function(e) {
        e.preventDefault();
        new AccountsRegisterController({});
    },

    show_menu: function(e) {
        this.menu.style.display = 'block';
    },

    hide_menu: function(e) {
        this.menu.style.display = 'none';
    },

    state_change: function() {
        var trim = window.location.origin.length + 1;
        var path = window.location.pathname.substr(1);
        
        for (var i=0; i < this.nav.childNodes.length; i++) {
            var node = this.nav.childNodes[i];
            if (node.tagName) {

                var node_path = node.firstChild.href.substr(trim);

                if (node_path && path.indexOf(node_path) != -1)
                    node.className = 'sel';
                else if (!path && !node_path)
                    node.className = 'sel';
                else
                    node.className = '';
            }
        }
    }

});