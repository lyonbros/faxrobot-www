var IncomingProvisionController = Composer.Controller.extend({
    inject: faxrobot.main_container_selector,
    el: false,
    model: null,
    template: 'incoming_provision',  

    elements: {
        "a.login": "login_link",
        'input[name="area_code"]': 'area_code',
        '#provision_cta': 'provision_cta',
        '#already_provisioned': 'already_provisioned',
        '#already_provisioned strong': 'already_strong',
        'h2': 'h2'
    },

    events: {
        "click a.login": "login",
        "submit form.signup": "register",
        "submit form.account": "account"
    },

    init: function()
    {
        util.set_title('Receive faxes');
        this.model = faxrobot.account;
        this.render();
        this.maybe_hide_link();
        this.with_bind(faxrobot.account, 'change', this.maybe_hide_link.bind(this));
        
        document.body.style.backgroundColor = '#480';

        return this;
    },


    render: function()
    {
        var data = {};
        var html = faxrobot.render_template(this.template, data);
        this.html(html);
        return this;
    },

    maybe_hide_link: function() {

        if (faxrobot.account.is_logged_in()) {
            this.login_link.style.display = 'none';

            if (faxrobot.account.get('incoming_number')) {
                this.provision_cta.style.display = 'none';
                this.already_provisioned.style.display = 'block';
                this.h2.textContent = 'Thanks for your business!';
                this.already_strong.textContent = util.format_phone(faxrobot.account.get('incoming_number'));
                document.body.style.backgroundColor = '#d23636';
            } else {
                this.provision_cta.style.display = 'block';
                this.already_provisioned.style.display = 'none';
            }
        } else
            this.login_link.style.display = 'block';
    },

    register: function(e) {
        if (e) e.preventDefault();

        if (faxrobot.account.is_logged_in())
            return this.logged_in();

        new AccountsRegisterController({default_button_text: 'Next >'});
        this.do_bind();
    },

    login: function(e) {
        if (e) e.preventDefault();
        new AccountsLoginController({});
        this.do_bind();
    },

    do_bind: function() {
        faxrobot.account.unbind('change', 'dumb_bind');
        this.with_bind_once(faxrobot.account, 'change', this.logged_in.bind(this), 'dumb_bind');
    },

    logged_in: function() {
        if (this.model.get('has_stripe_token')) {
            if (!this.model.get('auto_recharge')) {
                if (confirm('This action will turn on auto-bill for your account in order to keep your fax number active.'))
                    return this.auto_recharge_and_provision(['auto_recharge']);
                return;
            }
            return this.provision_number();
        }
        this.track_subcontroller('payment_info', function() {
            var payment_info = new AccountsPaymentInfoController({
                model: this.model,
                show_incoming_onboarding: true,
                default_button_text: 'Confirm Payment'
            });

            this.with_bind_once(payment_info, 'success', function() {
                this.auto_recharge_and_provision(['last4', 'stripe_token', 'auto_recharge']);
            }.bind(this), 'updated_payment_info');

            return payment_info;
        }.bind(this));
    },

    auto_recharge_and_provision: function(fields) {
        this.plz_wait();
        this.model.set({auto_recharge: 1});
        this.model.save_fields(fields, {
            success: function(response) {
                this.provision_number();
            }.bind(this)
        });
    },

    plz_wait: function() {
        this.track_subcontroller('plz_wait', function() {
            return new BlockingModalController();
        }.bind(this));
    },

    provision_number: function() {
        var data = new FormData();
        data.append('api_key', faxrobot.account.get('api_key'));
        data.append('area_code', this.area_code.value);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                
                var modal = this.get_subcontroller('plz_wait');
                if (modal) modal.close();

                var response = JSON.parse(xhr.response);

                if (xhr.status == 200) {
                    faxrobot.account.set(response)
                    util.notify('Your fax number was created!');
                } else if (response.code == 6022) {
                    faxrobot.route('/account');
                    faxrobot.error.show(602);
                } else if (response.code == 6018 || response.code == 6019) 
                    faxrobot.error.show(104);
                else if (response.code == 6020)
                    faxrobot.error.show(600);
                else if (response.code == 6021)
                    faxrobot.error.show(601);

                
            }
        }.bind(this);
        xhr.open("post", API_URL + '/incoming/provision', true);
        xhr.send(data);
    },

    account: function(e) {
        e.preventDefault();
        faxrobot.route('/jobs/received');
    }
});