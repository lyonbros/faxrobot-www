var Account  =   Composer.Model.extend({
    defaults: {
        'api_key': null,
        'email': '',
        'first_name': '',
        'last_name': '',
        'address': '',
        'address2': '',
        'city': '',
        'state': '',
        'zip': '',
        'credit': 0,
        'auto_recharge': 0,
        'has_stripe_token': false,
        'email_success': 1,
        'email_fail': 1,
        'email_list': 1,
        'incoming_number': null
    },

    init: function(options) {},

    is_logged_in: function() {
        return this.get('api_key') ? true : false;
    },

    login: function(data) {
        this.set(data);
        this.set_cookie();
    },

    set_cookie: function() {
        faxrobot.util.set_cookie('API_KEY', this.get('api_key'), 14);
    },

    logout: function() {
        this.clear({silent: true});
        this.set(this.defaults); 
        faxrobot.util.set_cookie('API_KEY', '', 14);
    },

    name: function() {
        if (this.get('first_name') && this.get('last_name'))
            return this.get('first_name') + ' ' + this.get('last_name');
        else if (this.get('first_name'))
            return this.get('first_name');
        else if (this.get('email'))
            return this.get('email');
        else
            return 'Guest';
    },

    save_fields: function(fields, options) {
        options || (options = {});
        options.success || (options.success = function() {});
        options.error || (options.error = function() {});

        console.log('saving: ', fields);

        var data = new FormData();
        data.append('api_key', faxrobot.account.get('api_key'));

        for (var i=0; i < fields.length; i++)
            data.append(fields[i], this.get(fields[i]));

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var response = JSON.parse(xhr.response);

                if (xhr.status == 200) {
                    this.set(response);
                    options.success(response);
                } else if (response && response.field) {
                    options.error(response);                    
                } else if (response && response.code == 6006) 
                    faxrobot.error.show(104);
                else
                    faxrobot.error.api(xhr.status, xhr.response);
            }
        }.bind(this);
        xhr.open("post", API_URL + '/accounts/update', true);
        xhr.send(data);

    },

});