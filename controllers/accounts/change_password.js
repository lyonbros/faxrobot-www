var AccountsChangePasswordController = BaseModalController.extend({

    inject: faxrobot.main_container_selector,

    el: false,

    template: 'accounts_change_password', 

    model: null,
    closable: true,

    reset_hash: null,
    reset_title: 'Reset Password',

    elements: {
        'h2': 'heading',
        '#old_password': 'old_password',
        '#new_password_1': 'new_password_1',
        '#new_password_2': 'new_password_2',
        'strong.error': 'error',
        'button': 'button'
    },

    events: {
        'submit form': 'submit'
    },

    init: function()
    {
        this.model = faxrobot.account;
        this.render();
        return this;
    },


    render: function()
    {
        var data = this.model.toJSON();
        var html = faxrobot.render_template(this.template, data);
        this.html(html);

        var temporary_password = this.model.get('temporary_password');
        
        if (temporary_password || this.reset_hash) {
            this.old_password.value = temporary_password;
            this.old_password.parentNode.style.display = 'none';
        }
        if (this.reset_hash)
            this.heading.textContent = this.reset_title;

        this.show();
        return this;
    },

    before_close: function() {
        if (faxrobot.controllers.pages.cur_controller == false)
            faxrobot.route('/');
    },

    submit: function(e) {
        e.preventDefault();

        util.remove_class(this.old_password.parentNode, 'error');
        util.remove_class(this.new_password_1.parentNode, 'error');
        util.remove_class(this.new_password_2.parentNode, 'error');
        this.error.textContent = ''

        if (!this.new_password_1.value) {
            this.new_password_1.parentNode.className += ' error';
            this.error.textContent = 'Please enter a new password.'
            return false;
        }

        if (this.new_password_1.value != this.new_password_2.value) {
            this.new_password_1.parentNode.className += ' error';
            this.new_password_2.parentNode.className += ' error';
            this.error.textContent = 'Please check that you typed your new password in properly.'
            return false;
        }

        this.button.disabled = true;

        var data = new FormData();
        if (!this.reset_hash) {
            data.append('api_key', faxrobot.account.get('api_key'));
            data.append('old_password', this.old_password.value);
        } else {
            data.append('reset_hash', this.reset_hash);
        }
        data.append('password', this.new_password_1.value);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                this.button.disabled = false;
                var response = JSON.parse(xhr.response);

                if (xhr.status == 200) {
                    if (this.model.get('temporary_password')) {
                        this.model.unset('temporary_password', {silent: true});
                        this.model.set({changed_tmp_pwd: true}, {silent: true});
                    }
                    if (!this.reset_hash) {
                        this.model.set(response);
                        util.notify('Password changed!');
                    } else {
                        this.model.login(response);
                        util.notify('Welcome, '+this.model.name()+'!');
                    }
                    this.close();
                } else if (response && response.code == 6016) {
                    this.old_password.parentNode.className += ' error';
                    this.error.textContent = response.msg;
                } else if (response && response.code == 6017) {
                    this.error.textContent = 'Password reset link has expired.';
                } else
                    faxrobot.error.api(xhr.status, xhr.response);
            }
        }.bind(this);
        if (!this.reset_hash)
            xhr.open("post", API_URL + '/accounts/update', true);
        else
            xhr.open("post", API_URL + '/accounts/reset_password', true);
        xhr.send(data);
    }
});