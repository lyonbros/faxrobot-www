var JobsCreateController = Composer.Controller.extend({
    inject: faxrobot.main_container_selector,
    el: false,
    template: 'jobs_create',  

    model: null,

    xhr: null,
    stripe: null,
    stripe_token: null,
    stripe_wait_interval: null,
    confirmed_password: null,
    button_text_original: null,

    default_cost_text: 'Just $0.06 per page!',

    elements: {
        'input[type=file]': 'input_file',
        'input[type=checkbox]': 'input_coversheet',
        '.edit': 'coversheet_edit_link',
        'input[name=destination]': 'input_destination',
        '.choose_file em': 'filename_area',
        '.cost strong': 'cost_area',
        '.row.destination': 'destination_row',
        '.row.file': 'file_row',
        'button': 'button'
    },

    events: {
        'click .choose_file a': 'choose_file',
        'click .preview': 'choose_file',
        'change input[type=checkbox]': 'change_coversheet_checkbox',
        'click .edit a': 'open_coversheet_editor',
        'change input[type=file]': 'handle_file',
        'change input[name=destination]': 'handle_destination',
        'click button': 'handle_submit'
    },

    init: function()
    {
        util.set_title('Send a fax');
        this.model = new Job();
        this.render();
        this.render_cost();

        this.stripe_wait_interval = setInterval(function() {
            if (typeof StripeCheckout != "undefined") {
                this.stripe = StripeCheckout.configure({
                    key: STRIPE_PUBLIC_KEY,
                    bitcoin: true,
                    token: function(token) {
                        this.stripe_token = token;
                        this.process_stripe_token();
                    }.bind(this),
                    closed: function() {
                        if (!this.stripe_token)
                            this.enable_send_button();
                    }.bind(this)
                });
                clearInterval(this.stripe_wait_interval);
            }
        }.bind(this), 100);
        
        document.body.style.backgroundColor = 'green';

        return this;
    },


    render: function()
    {
        var data = {};
        var html = faxrobot.render_template(this.template, data);
        this.html(html);
        return this;
    },

    choose_file: function(e) {

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.input_file.click();
    },

    change_coversheet_checkbox: function(e) {

        if (e)
            e.preventDefault();

        this.model.set({cover: this.input_coversheet.checked});

        if (this.model.get('cover_edited') == false)
            this.open_coversheet_editor();

        setTimeout(function() {
            this.coversheet_edit_link.style.display = 'inline';
        }.bind(this), 500);

        this.render_cost();
    },

    open_coversheet_editor: function(e) {

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.track_subcontroller('coversheet', function() {
            return new JobsCoverSheetController({
                model: this.model
            });
        }.bind(this));
    },

    handle_destination: function(e) {
        var destination = this.input_destination.value;
        var row = this.destination_row

        destination = destination.replace(/[-\(\)\s]/g, '');
        console.log('destination: ', destination);

        if (destination.length == 10) {
            row.className = row.className.replace(/error/g, '');
            this.model.set({destination: destination});
            return true;
        } else {
            row.className += ' error';
            return false;
        }
    },

    handle_file: function(e) {

        this.model.new_file();

        var file = this.input_file.files[0];
        var ext = file.name.split('.').pop();

        if (SUPPORTED_FILETYPES.indexOf(ext) == -1) {
            faxrobot.error.show(100);
            return this.eject_file();
        }

        this.file_row.className = this.file_row.className.replace(/error/g, '');

        this.model.set({
            status: 'uploading'
        });
        var data = new FormData();
        data.append('file', file);

        this.render_filename_area(file.name, ext);
        this.render_cost();

        if (this.model.get('destination'))
            data.append('destination', this.model.get('destination'));

        if (this.xhr) {
            this.xhr.abort();
            this.xhr = null;
        }

        this.xhr = new XMLHttpRequest();
        var xhr = this.xhr;

        if(xhr.upload)
            xhr.upload.onprogress = this.upload_progress;

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                if (xhr.status == 200)
                    this.upload_success(JSON.parse(xhr.response));
                else
                    this.handle_error(xhr.status, xhr.response);
            }
        }.bind(this);
        xhr.open("post", API_URL + '/jobs/create', true);
        xhr.send(data);
    },

    eject_file: function() {
        this.file_row.className += ' error';
        this.render_cost();
        this.render_filename_area();
    },

    render_filename_area: function(filename, extension) {
        if (filename) {
            
            switch (extension) {
                case 'docx':
                case 'doc':
                    var icon = 'docx.png';
                    break;
                case 'pdf':
                    var icon = 'pdf.png';
                    break;
                default:
                    var icon = 'other.png';
            }
            var s = '<img src="images/icons/'+icon+'">' + filename;
        } else {
            var s = 'Please choose a supported file';
        }
        this.filename_area.innerHTML = s;
    },

    render_cost: function() {
        if (this.model.get('status') == 'new') {

            var html = this.default_cost_text;
        } else if (this.model.get('failed')) {

            var html = this.default_cost_text;
        } else if (!this.model.get('cost')) {

            var html = '<img src="images/ajax-load.gif"> Calculating cost...';
        } else {

            var calculated_cost = this.model.get('cost');

            if (this.model.get('cover'))
                calculated_cost += this.model.get('cover_cost');

            var html = 'Just $'+calculated_cost.toFixed(2)+ ' ';
            html += '(' + this.model.get('num_pages') + ' page';

            if (this.model.get('num_pages') > 1)
                html += 's';

            if (this.model.get('cover'))
                html += ' + cover';

            html += ')';
        }
        
        this.cost_area.innerHTML = html;
    },

    upload_progress: function(e) {
        // console.log('progress lol: ', e);
    },

    handle_error: function(status, response) {

        var decoded = JSON.parse(response);

        var error_code = decoded && decoded.code ? decoded.code : 0;
        
        switch (error_code) {
            case 5001: // phone number was shitty
                faxrobot.error.show(error_code);
                break;
            default:
                faxrobot.error.api(status, response);
                this.model.new_file();
                this.eject_file();
        }
        this.trigger('fail');
    },

    upload_success: function(result) {
        console.log('result: ', result);

        this.model.set({
            access_key: result.access_key,
            id: 109
        });

        setTimeout(function() {
            this.monitor_status(result.access_key);
        }.bind(this), STATUS_POLL_DELAY);
    },

    monitor_status: function(access_key) {

        console.log('Polling status for ' + access_key);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                if (this.model.get('access_key') != access_key)
                    return console.log('NEVERMIND! '+access_key+' was aborted');

                if (xhr.status == 200) {
                    var response = JSON.parse(xhr.response);

                    if (response.status == 'failed') {

                        this.model.set({
                            status: response.status,
                            failed: true,
                            fail_code: response.fail_code
                        });
                        this.eject_file();
                        faxrobot.error.show(response.fail_code);
                        this.trigger('fail');

                    } else if (response.status != 'ready') {

                        setTimeout(function() {
                            this.monitor_status(access_key);
                        }.bind(this), STATUS_POLL_DELAY);

                    } else {

                        this.job_ready(response);
                    }

                } else {
                    this.handle_error(xhr.status, xhr.response);
                }
            }
        }.bind(this);

        xhr.open("get", API_URL + '/jobs/get/' + access_key, true);
        xhr.send();
    },

    job_ready: function(data) {
        console.log('JOB IS READY: ', data);

        this.model.set({
            status:     data.status,
            cost:       data.cost,
            cover_cost: data.cover_cost,
            num_pages:  data.num_pages
        });
        this.render_cost();
        this.trigger('ready');
    },

    unbind_upload_listeners: function() {
        this.unbind('ready', 'submit_ready_listener');
        this.unbind('fail', 'submit_fail_listener');
    },

    disable_send_button: function() {
        console.log('disable_send_button');
        this.button_text_original = this.button.textContent;
        this.button.textContent = '...';
        this.button.disabled = true;
    },

    enable_send_button: function() {
        console.log('enable_send_button');
        this.button.textContent = this.button_text_original;
        this.button.disabled = false;
    },

    handle_submit: function(e) {
        e.preventDefault();

        var fail = function() {
            this.unbind_upload_listeners();
            this.enable_send_button();

            var modal = this.get_subcontroller('uploading_modal');
            if (modal)
                modal.close();
        }.bind(this);

        var validate = function() {
            var status = this.model.get('status');

            if (status != 'ready' && status != 'uploading') {
                faxrobot.error.show(ERR_NO_FILE_ATTACHED);
                this.file_row.className += ' error';
                return false;
            } else if (!this.handle_destination()) {
                faxrobot.error.show(ERR_BAD_DESTINATION);
                return false;
            }

            return true;
        }.bind(this);

        if (!validate())
            return false;

        this.disable_send_button();

        if (this.model.get('status') == 'ready')
            return this.handle_payment();

        console.log('STATUS: '+ this.model.get('status'));

        this.track_subcontroller('uploading_modal', function() {
            return new BlockingModalController({
                text: 'Please wait while your file uploads...'
            });
        }.bind(this));

        this.with_bind_once(this, 'ready', this.handle_payment.bind(this),
            'submit_ready_listener');
        this.with_bind_once(this, 'fail', fail, 'submit_fail_listener');
    },

    handle_payment: function() {
        var modal = this.get_subcontroller('uploading_modal');
            if (modal)
                modal.close();

        if (
            !faxrobot.account.is_logged_in()
            || (
                faxrobot.account.get('credit') - this.model.get('cost') < 0
                && !faxrobot.account.get('auto_recharge')
            )
        )
            this.checkout();
        else
            this.send_fax();
    },

    checkout: function() {
        this.unbind_upload_listeners();

        var modal = this.get_subcontroller('uploading_modal');
        if (modal)
            modal.close();

        this.stripe.open({
            name: 'Buy ' + PROJECT_NAME + ' Credit ($2)',
            description: 'For whenever you need to send a fax.',
            amount: PAYMENT_DEFAULT_AMOUNT * 100
        });

        this.with_bind_once(faxrobot.router, 'route', function() {
            console.log('act now supplies are limited');
            this.stripe.close();
        }.bind(this));
    },

    process_stripe_token: function() {

        if (!this.stripe_token)
            return false; // safety's off mothafucka

        var data = new FormData();
        if (faxrobot.account.get('api_key'))
            data.append('api_key', faxrobot.account.get('api_key'));
        data.append('email', this.stripe_token.email);
        data.append('stripe_token', this.stripe_token.id);
        data.append('amount', PAYMENT_DEFAULT_AMOUNT);

        if (this.confirmed_password)
            data.append('password', this.confirmed_password);            

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                var response = JSON.parse(xhr.response);

                if (xhr.status == 200) {
                    this.stripe_token = null;
                    this.confirmed_password = null;
                    faxrobot.account.login(response);

                    if (typeof hooks != 'undefined')
                        if (typeof hooks.payment == 'function')
                            hooks.payment(PAYMENT_DEFAULT_AMOUNT, 'bootstrap');

                    return this.send_fax();
                } else if (response && response.code == 6004) { // login needed
                    this.track_subcontroller('confirm_password',
                        function() {
                            var confirm = new JobsConfirmPasswordController();

                            this.with_bind_once(confirm, 'close', function() {
                                this.stripe_token = null;
                                this.enable_send_button();
                            }.bind(this), 'confirm_password_close');

                            this.with_bind_once(confirm, 'confirm', function(p){
                                this.confirmed_password = p;
                                this.process_stripe_token();
                            }.bind(this), 'confirm_password_confirm');

                            return confirm;
                        }.bind(this));
                } else {
                    this.enable_send_button();
                    this.stripe_token = null;
                    faxrobot.error.api(xhr.status, xhr.response);
                }
            }
        }.bind(this);
        xhr.open("post", API_URL + '/accounts/bootstrap', true);
        xhr.send(data);

    },

    send_fax: function() {
        console.log('sending fax');
        var d = new FormData();
        d.append('api_key', faxrobot.account.get('api_key'));
        d.append('destination', this.model.get('destination'));
        d.append('send_authorized', true);
        d.append('cover', this.model.get('cover'));
        d.append('cover_name', this.model.get('cover_name'));
        // d.append('cover_address', this.model.get('cover_address'));
        // d.append('cover_city', this.model.get('cover_city'));
        // d.append('cover_state', this.model.get('cover_state'));
        // d.append('cover_zip', this.model.get('cover_zip'));
        // d.append('cover_country', this.model.get('cover_country'));
        d.append('cover_phone', this.model.get('cover_phone'));
        d.append('cover_email', this.model.get('cover_email'));
        d.append('cover_company', this.model.get('cover_company'));
        d.append('cover_to_name', this.model.get('cover_to_name'));
        // d.append('cover_cc', this.model.get('cover_cc'));
        d.append('cover_subject', this.model.get('cover_subject'));
        // d.append('cover_status', this.model.get('cover_status'));
        d.append('cover_comments', this.model.get('cover_comments'));

        var url = API_URL+'/jobs/update/'+this.model.get('access_key');

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                var res = JSON.parse(xhr.response);

                if (xhr.status == 200) {
                    faxrobot.account.set({changed_tmp_pwd: false});
                    util.notify('Thanks! Your fax is queued for sending.');
                    faxrobot.route('/jobs');
                } else if (res && res.code >= 5005 && res.code <= 5017){
                    this.enable_send_button();
                    this.track_subcontroller('coversheet', function() {
                        return new JobsCoverSheetController({
                            model: this.model,
                            error: res
                        });
                    }.bind(this));
                } else {
                    this.enable_send_button();
                    faxrobot.error.api(xhr.status, xhr.response);
                }
            }
        }.bind(this);
        xhr.open("post", url, true);
        xhr.send(d);
    }



});