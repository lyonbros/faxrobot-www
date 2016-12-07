var Incoming  =   Composer.Model.extend({
    defaults: {
        access_key: '',
        cost: 0,
        create_date: null,
        data_deleted: false,
        from_number: '',
        id: null,
        num_pages: 0,
        to_number: ''
    },

    init: function(options) {},
});
var Incomings = Composer.Collection.extend({
    model: Incoming
});