var Job  =   Composer.Model.extend({
    defaults: {
        status: 'new',
        cost: 0,
        cover_cost: 0,
        attempts: 0,
        num_pages: 0,
        send_authorized: false,
        cover: false,
        destination: null,
        cover_name: '',
        cover_address: '',
        cover_city: '',
        cover_state: '',
        cover_zip: '',
        cover_country: '',
        cover_phone: '',
        cover_email: '',
        cover_company: '',
        cover_to_name: '',
        cover_subject: '',
        cover_comments: '',
        access_key: '',
        cover_edited: false,
        failed: false,
        fail_code: 0,
        data_deleted: false
    },

    init: function(options) {},

    new_file: function() {
        this.set({
            status:             'new',
            cost:               0,
            cover_cost:         0,
            num_pages:          0,
            send_authorized:    false,
            failed:             false,
            fail_code:          0
        });
    }
});
var Jobs = Composer.Collection.extend({
    model: Job
});