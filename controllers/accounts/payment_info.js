var AccountsPaymentInfoController = BaseModalController.extend({

    inject: faxrobot.main_container_selector,

    el: false,

    template: 'accounts_payment_info', 

    model: null,
    closable: true,

    elements: {
        '#card_number': 'card_number',
        '#expires_month': 'expires_month',
        '#expires_year': 'expires_year',
        '#cvc': 'cvc',
        'button': 'button'
    },

    events: {
        'submit form': 'submit',
        'keyup #card_number': 'insert_annoying_dashes'
    },

    stripe_check_interval: null,
    prev_length: 0,

    init: function()
    {
        this.render();

        this.stripe_check_interval = setInterval(function() {
            if (Stripe) {
                Stripe.setPublishableKey(STRIPE_PUBLIC_KEY);
                clearInterval(this.stripe_check_interval);
                this.button.disabled = false;
            }
        }.bind(this), 500);
        this.card_number.focus();

        return this;
    },


    render: function()
    {
        var data = this.model.toJSON();
        var html = faxrobot.render_template(this.template, data);
        this.html(html);
        this.show();

        if (!document.getElementById('stripe_script')) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.id = 'stripe_script';
            script.src = 'https://js.stripe.com/v2/';
            document.head.appendChild(script);
        }
        return this;
    },

    insert_annoying_dashes: function(e) {
        var n = this.get_number();
        var c = Math.ceil(n.length / 4) - 1;
        
        if (n.length<this.prev_length || (n.length%4==0 && e.keyCode==173)) {
            this.prev_length = n.length;
            return;
        }
        this.prev_length = n.length;
        
        for (var i = 0; i < c; i++)
            n = n.substr(0, (i+1)*4+i) + '-' + n.substr((i+1)*4+i); // TROLOLOLO

        this.card_number.value = n.substr(0, 19);
    },

    get_number: function() {
        return this.card_number.value.replace(/[\s-]/g, '');
    },

    submit: function(e) {
        e.preventDefault();
        this.button.disabled = true;

        util.remove_class(this.card_number.parentNode, 'error');
        util.remove_class(this.expires_month.parentNode, 'error');
        util.remove_class(this.cvc.parentNode, 'error');

        Stripe.card.createToken({
            number: this.get_number(),
            cvc: this.cvc.value,
            exp_month: this.expires_month.value,
            exp_year: this.expires_year.value
        }, function(status, response) {
            this.button.disabled = false;

            if (response.error) {
                if (response.error.param)
                    switch (response.error.param) {
                        case 'number':
                            this.card_number.parentNode.className += ' error';
                            break;
                        case 'exp_month':
                        case 'exp_year':
                            this.expires_month.parentNode.className += ' error';
                            break;
                        case 'cvc':
                            this.cvc.parentNode.className += ' error';
                    }
                faxrobot.error.show(103);
            } else {
                this.model.set({
                    'last4': response.card.last4,
                    'stripe_token': response.id
                }, {silent: true});
                this.trigger('success');
                this.close();
            }
        }.bind(this));
    }
});