var AccountsManageController = Composer.Controller.extend({
    inject: faxrobot.main_container_selector,
    el: false,
    template: 'accounts_manage',  

    model: null,
    account_fields: ['first_name', 'last_name', 'email', 'address', 'address2',
                     'city', 'state', 'zip'],

    elements: {
        '#auto_recharge': 'auto_recharge',
        '.edit_form': 'form',
        '.cancel_edit': 'cancel',
        '.edit_account': 'edit',
        '.account_info button': 'button',
        '#first_name': 'first_name',
        '#last_name': 'last_name',
        '#email': 'email',
        '#address': 'address',
        '#address2': 'address2',
        '#city': 'city',
        '#state': 'state',
        '#zip': 'zip',
        'strong.error': 'error_info'
    },

    events: {
        'click a.login': 'login',
        'click a.cancel_edit': 'cancel_edit',
        'click a.remove_card': 'remove_card',
        'click a.payment_info': 'edit_payment_info',
        'click a.one_off': 'one_off_payment',
        'click a.edit_account': 'edit_account',
        'click a.change_password': 'change_password',
        'click a.api_key': 'view_api_key',
        'change #auto_recharge': 'change_recharge',
        'change input.email_pref': 'change_email_pref',
        'submit form.edit_form': 'save_account'
    },

    init: function() {
        util.set_title('My account');
        this.model = faxrobot.account;
        this.with_bind(faxrobot.account, 'change', this.render.bind(this));
        this.render();

        document.body.style.backgroundColor = '#337';

        return this;
    },

    login: function(e) {
        e.preventDefault();
        new AccountsLoginController();
    },

    render: function()
    {
        var data = this.model.toJSON();
        data.logged_in = faxrobot.account.is_logged_in();

        var html = faxrobot.render_template(this.template, data);
        this.html(html);

        return this;
    },

    change_recharge: function() {
        var auto_recharge = this.auto_recharge.checked ? 1 : 0;
        
        if (auto_recharge && !faxrobot.account.get('has_stripe_token'))
            this.edit_payment_info()

        this.model.set({auto_recharge: auto_recharge});
        this.save_fields(['auto_recharge']);
    },

    edit_payment_info: function(e) {
        if (e)
            e.preventDefault();

        this.track_subcontroller('payment_info', function() {
            var payment_info = new AccountsPaymentInfoController({
                model: this.model
            });

            this.with_bind_once(payment_info, 'success', function() {
                this.save_fields(['last4', 'stripe_token']);
            }.bind(this), 'updated_payment_info');

            return payment_info;
        }.bind(this));
    },

    save_fields: function(fields) {

        console.log('saving: ', fields);

        var data = new FormData();
        data.append('api_key', faxrobot.account.get('api_key'));

        for (var i=0; i < fields.length; i++) {
            if (typeof this[fields[i]] != "undefined")
                util.remove_class(this[fields[i]].parentNode, 'error');

            data.append(fields[i], this.model.get(fields[i]));
        }

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var response = JSON.parse(xhr.response);

                if (xhr.status == 200) {
                    this.model.set(response);
                    util.notify('Account updated!');
                } else if (response && response.field) {
                    console.log('lol: ', typeof this[response.field]);
                    if (typeof this[response.field] != "undefined") {
                        this[response.field].parentNode.className += ' error';
                        this[response.field].focus();
                        this.error_info.textContent = response.msg;
                    }

                } else if (response && response.code == 6006) 
                    faxrobot.error.show(104);
                else
                    faxrobot.error.api(xhr.status, xhr.response);
            }
        }.bind(this);
        xhr.open("post", API_URL + '/accounts/update', true);
        xhr.send(data);

    },

    remove_card: function(e) {
        if (e)
            e.preventDefault();

        this.track_subcontroller('remove_card_modal', function() {
            return new BlockingModalController();
        }.bind(this));

        var data = new FormData();
        data.append('api_key', faxrobot.account.get('api_key'));
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {

                var modal = this.get_subcontroller('remove_card_modal');
                if (modal)
                    modal.close();

                var response = JSON.parse(xhr.response);

                if (xhr.status == 200) {
                    this.model.set(response);
                    util.notify('Your card was removed.');
                } else
                    faxrobot.error.api(xhr.status, xhr.response);
            }
        }.bind(this);
        xhr.open("post", API_URL + '/accounts/remove_card', true);
        xhr.send(data);
    },

    one_off_payment: function(e) {
        if (e)
            e.preventDefault();

        var amount = parseInt(e.target.textContent.substr(1));

        this.track_subcontroller('checkout_modal', function() {
            return new BlockingModalController();
        }.bind(this));

        this.stripe = StripeCheckout.configure({
            key: STRIPE_PUBLIC_KEY,
            closed: function() {
                var modal = this.get_subcontroller('checkout_modal');
                if (modal)
                    modal.close();
            }.bind(this),
            token: function(token) {
                console.log('STRIPE SUCCESS:', token);

                var data = new FormData();
                data.append('api_key', faxrobot.account.get('api_key'));
                data.append('email', faxrobot.account.get('email'));
                data.append('amount', amount);
                data.append('stripe_token', token.id);

                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4)
                    {
                        var modal = this.get_subcontroller('checkout_modal');
                        if (modal)
                            modal.close();

                        var response = JSON.parse(xhr.response);

                        if (xhr.status == 200) {
                            this.model.set(response);
                            util.notify('Thanks for your purchase!');
                        } else if (response && response.code == 6005) 
                            faxrobot.error.show(103);
                        else
                            faxrobot.error.api(xhr.status, xhr.response);
                    }
                }.bind(this);
                xhr.open("post", API_URL + '/accounts/bootstrap', true);
                xhr.send(data);

            }.bind(this)
        });

        this.stripe.open({
            name: 'Buy Fax Robot Credit ($'+amount+')',
            description: 'For whenever you need to send a fax.',
            amount: amount * 100
        });
    },

    change_email_pref: function(e) {
        var data = {}
        data[e.target.id] = e.target.checked ? 1 : 0;
        this.model.set(data);
        this.save_fields([e.target.id]);
    },

    edit_account: function(e) {
        if (e)
            e.preventDefault();

        this.cancel.style.display = 'block';
        this.edit.style.display = 'none';
        this.button.style.display = 'block';

        var els = this.form.querySelectorAll('input');

        for (var i = 0; i < els.length; i++)
            els[i].disabled = false;
    },

    cancel_edit: function(e) {
        if (e)
            e.preventDefault();

        this.form.reset();
        this.grab_form();
        this.cancel.style.display = 'none';
        this.edit.style.display = 'block';
        this.button.style.display = 'none';

        var els = this.form.querySelectorAll('input');

        for (var i = 0; i < this.account_fields.length; i++)
            util.remove_class(this[this.account_fields[i]].parentNode, 'error');

        this.error_info.textContent = '';

        for (var i = 0; i < els.length; i++)
            els[i].disabled = true;
    },

    save_account: function(e) {
        if (e)
            e.preventDefault();

        for (var i = 0; i < this.account_fields.length; i++)
            util.remove_class(this[this.account_fields[i]].parentNode, 'error');

        this.grab_form();
        this.save_fields(this.account_fields);
    },

    grab_form: function() {
        this.model.set({
            'first_name': this.first_name.value,
            'last_name': this.last_name.value,
            'email': this.email.value,
            'address': this.address.value,
            'address2': this.address2.value,
            'city': this.city.value,
            'state': this.state.value,
            'zip': this.zip.value
        }, {silent: true});
    },

    change_password: function(e) {
        e.preventDefault();
        new AccountsChangePasswordController();
    },

    view_api_key: function(e) {
        e.preventDefault();
        new AccountsAPIKeyController();
    }

});