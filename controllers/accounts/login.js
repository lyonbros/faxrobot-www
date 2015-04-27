var AccountsLoginController = BaseModalController.extend({

    inject: faxrobot.main_container_selector,

    closable: true,
    el: false,
    code: 0,

    template: 'accounts_login',

    default_button_text: 'Login',

    elements: {
        '.center_row.email': 'email_row',
        '.center_row.password': 'password_row',
        '#login_email': 'email',
        '#login_password': 'password',
        'button': 'button',
        'h2': 'title'
    },

    events: {
        'submit form': 'login',
        'click .forgot': 'forgot_password'
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
        this.email.focus();
    },

    before_close: function() {
        if (faxrobot.controllers.pages.cur_controller == false)
            faxrobot.route('/');
    },

    login: function(e) {
        e.preventDefault();

        this.button.disabled = true;
        this.button.textContent = 'wait...';

        var data = new FormData();
        data.append('email', this.email.value);
        data.append('password', this.password.value);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                if (xhr.status == 200) {
                    var response = JSON.parse(xhr.response);
                    faxrobot.account.login(response);
                    util.notify('Welcome, '+faxrobot.account.name()+'!');
                    this.close();
                } else {
                    console.log('FAIL', xhr.status, xhr.response);
                    this.email_row.className += ' error';
                    this.password_row.className += ' error';
                    this.button.disabled = false;
                    this.title.textContent = 'Login failed! Try again!';
                    this.button.textContent = this.default_button_text;
                }
            }
        }.bind(this);
        xhr.open("post", API_URL + '/accounts/login', true);
        xhr.send(data);
    },

    forgot_password: function(e) {
        e.preventDefault();

        setTimeout(function() {
            new AccountsForgotPasswordController({
                prefill_email: this.email.value
            });
        }.bind(this), 250);

        this.close();
    }
});