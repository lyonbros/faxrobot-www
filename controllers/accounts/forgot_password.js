var AccountsForgotPasswordController = BaseModalController.extend({

    inject: faxrobot.main_container_selector,

    closable: true,
    el: false,
    code: 0,

    prefill_email: null,

    template: 'accounts_forgot_password',

    default_button_text: 'Reset Password',

    elements: {
        '#forgot_email': 'email',
        'button': 'button'
    },

    events: {
        'submit form': 'email_password_reset'
    },

    init: function() {
        this.render();
        return this;
    },

    render: function() {
        var data = {email: this.prefill_email};

        var html = faxrobot.render_template(this.template, data);
        this.html(html);

        this.button.textContent = this.default_button_text;

        this.show();
        return this;
    },

    after_show: function() {
        this.email.focus();
    },

    email_password_reset: function(e) {
        e.preventDefault();

        this.button.disabled = true;
        this.button.textContent = 'wait...';

        var data = new FormData();
        data.append('email', this.email.value);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                faxrobot.controllers.pages.track_subcontroller(
                    'check_email_modal',
                    function() {
                        return new BlockingModalController({
                            text: 'Please check your email!'
                        });
                    }
                );
                setTimeout(function() {
                    var modal = this.get_subcontroller('check_email_modal');
                    if (modal)
                        modal.close();
                }.bind(faxrobot.controllers.pages), 5000);
                this.close();
            }
        }.bind(this);
        xhr.open("post", API_URL + '/accounts/email_password_reset', true);
        xhr.send(data);
    }
});