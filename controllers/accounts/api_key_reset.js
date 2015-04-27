var AccountsAPIKeyResetController = BaseModalController.extend({

    inject: faxrobot.main_container_selector,

    el: false,

    template: 'accounts_api_key_reset', 

    model: null,
    closable: true,

    elements: {
        'input': 'password',
        '.error': 'error',
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
        this.show();
        return this;
    },

    submit: function(e) {
        e.preventDefault();

        util.remove_class(this.password.parentNode, 'error');
        this.error.textContent = ''
        this.button.disabled = true;

        var data = new FormData();
        data.append('api_key', faxrobot.account.get('api_key'));
        data.append('password', this.password.value);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                this.button.disabled = false;
                var response = JSON.parse(xhr.response);

                if (xhr.status == 200) {
                    this.model.set(response);
                    this.model.set_cookie();
                    util.notify('API key changed!');
                    setTimeout(function() {
                        new AccountsAPIKeyController();
                    }, 250);
                    this.close();
                } else if (response && response.code == 6004) {
                    this.password.parentNode.className += ' error';
                    this.error.textContent='Please double check that password.';
                } else
                    faxrobot.error.api(xhr.status, xhr.response);
            }
        }.bind(this);
        xhr.open("post", API_URL + '/accounts/reset_api_key', true);
        xhr.send(data);
    }
});