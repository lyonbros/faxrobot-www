var AccountsRegisterController = BaseModalController.extend({

    inject: faxrobot.main_container_selector,

    closable: true,
    el: false,
    code: 0,

    template: 'accounts_register',

    default_button_text: 'Register',

    elements: {
        '.center_row.email': 'email_row',
        '.center_row.password': 'password_row',
        '#register_name': 'name',
        '#register_email': 'email',
        '#register_password': 'password',
        'button': 'button',
        'h2': 'title',
        '.error': 'error'
    },

    events: {
        'submit form': 'register'
    },

    init: function() {
        this.render();
        return this;
    },

    render: function() {
        var data = {};

        var html = faxrobot.render_template(this.template, data);
        this.html(html);

        this.button.textContent = this.default_button_text;

        this.show();
        return this;
    },

    after_show: function() {
        this.name.focus();
    },

    before_close: function() {
        if (faxrobot.controllers.pages.cur_controller == false)
            faxrobot.route('/');
    },

    register: function(e) {
        e.preventDefault();

        util.remove_class(this.name.parentNode, 'error');
        util.remove_class(this.email.parentNode, 'error');
        util.remove_class(this.password.parentNode, 'error');
        this.error.textContent = '';

        if (!this.name.value) {
            this.name.parentNode.className += ' error';
            this.error.textContent = 'Please enter a name';
            return;
        }
        
        this.button.disabled = true;
        this.button.textContent = 'wait...';

        var space_index = this.name.value.indexOf(' ');
        if (space_index !== -1) {
            var first_name = this.name.value.substr(0, space_index);
            var last_name = this.name.value.substr(space_index + 1);
        }

        var data = new FormData();
        data.append('first_name', first_name);
        data.append('last_name', last_name);
        data.append('email', this.email.value);
        data.append('password', this.password.value);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                var res = JSON.parse(xhr.response);

                if (xhr.status == 200) {
                    faxrobot.account.login(res);
                    util.notify('Welcome, '+faxrobot.account.name()+'!');
                    this.close();
                } else {
                    this.button.textContent = this.default_button_text;
                    this.button.disabled = false;

                    if (res && (res.code >= 6000 && res.code <= 6003)) {
                        this[res.field].parentNode.className += ' error';
                        this.error.textContent = res.msg;                    
                    } else {
                        faxrobot.error.api(xhr.status, xhr.response);
                    }
                }
            }
        }.bind(this);
        xhr.open("post", API_URL + '/accounts/create', true);
        xhr.send(data);
    }
});