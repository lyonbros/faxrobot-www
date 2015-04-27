var JobsInfoController = Composer.Controller.extend({
    inject: faxrobot.main_container_selector,
    el: false,
    template: 'job_info',  

    access_key: null,
    model: null,

    elements: {
        'button': 'button'
    },

    events: {
        'click a.status': 'click_status',
        'click button': 'start',
        'click a.login': 'login'
    },

    init: function() {
        util.set_title('Job details');
        this.with_bind(faxrobot.account, 'change', this.render.bind(this));
        this.render();
        document.body.style.backgroundColor = 'black';

        return this;
    },

    login: function(e) {
        e.preventDefault();
        new AccountsLoginController();
    },

    render: function() {
        var data = {
            logged_in: faxrobot.account.is_logged_in(),
            model: this.model ? this.model.toJSON() : null,
            reason: ERRORS[0].title,
            detail: ERRORS[0].detail
        };
        if (this.model && this.model.get('status') == 'failed') {
            for (var i = 0; i < ERRORS.length; i++) {
                if (ERRORS[i].code == this.model.get('fail_code')) {
                    data.reason = ERRORS[i].title;
                    data.detail = ERRORS[i].detail;
                }
            }
        }
        var html = faxrobot.render_template(this.template, data);
        this.html(html);

        if (!this.model && faxrobot.account.is_logged_in())
            this.populate();

        return this;
    },

    populate: function() {
        console.log('Loading job: ', this.access_key);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                if (xhr.status == 200) {
                    this.model = new Job(JSON.parse(xhr.response));
                    this.render();
                } else
                    faxrobot.access_denied();
            }
        }.bind(this);
        if (this.access_key.length == 64)
            var url = API_URL + '/jobs/get/' + this.access_key;
        else
            var url = API_URL + '/jobs/get_by_id/' + this.access_key;
        xhr.open("get", url +'?api_key='+faxrobot.account.get('api_key'), true);
        xhr.send();
    },

    click_status: function(e) {
        e.preventDefault();
    },

    start: function(e) {
        e.preventDefault();
        this.button.disabled = true;
        this.button.textContent = '...';

        var data = new FormData();
        data.append('api_key', faxrobot.account.get('api_key'));

        if (e.target.className.indexOf('restart') != -1) {
            var url = API_URL + '/jobs/restart/' + this.access_key;
            var success_text = 'Your fax is restarting.';
        } else {
            data.append('access_key', this.access_key);
            data.append('send_authorized', 1);
            var url = API_URL + '/jobs/update';
            var success_text = 'Your fax is starting!';
        }

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                if (xhr.status == 200) {
                    this.model = new Job(JSON.parse(xhr.response));
                    util.notify(success_text);
                    this.render();
                }
                else
                    faxrobot.access_denied();
            }
        }.bind(this);
        xhr.open("post", url, true);
        xhr.send(data);

    }

});