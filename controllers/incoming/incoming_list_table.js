var IncomingListTableController = Composer.Controller.extend({

    template: 'incoming_list_table',  

    collection: null,
    page: 1,
    pages: 0,
    per_page: 0,
    total: 0,
    has_next: false,
    has_prev: false,

    elements: {
    },

    events: {
        'click a.view': 'click_view',
        'click a.delete': 'click_delete',
        'click td': 'click_row'
    },

    init: function() {
        this.with_bind(faxrobot.account, 'change', this.release.bind(this));
        this.render();
        this.load_incoming();
        return this;
    },

    render: function()
    {
        var data = {
            collection: this.collection ? this.collection.toJSON() : null,
            pages:      this.pages,
            page:       this.page,
            per_page:   this.per_page,
            total:      this.total,
            has_next:   this.has_next,
            has_prev:   this.has_prev
        };
        var html = faxrobot.render_template(this.template, data);
        this.html(html);

        return this;
    },

    load_incoming: function() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                var response = JSON.parse(xhr.response);
                
                if (xhr.status == 200) {
                    this.collection = new Incomings(response.faxes);
                    this.pages      = response.pages;
                    this.per_page   = response.per_page;
                    this.total      = response.total;
                    this.has_next   = response.has_next;
                    this.has_prev   = response.has_prev;
                    this.render();

                } else if (response && response.code == 4000) {
                    faxrobot.access_denied();
                }
            }
        }.bind(this);
        var qry = 'api_key='+faxrobot.account.get('api_key')+'&page='+this.page;

        xhr.open("get", API_URL + '/incoming/list?' + qry, true);
        xhr.send();
    },

    click_view: function(e) {
        e.preventDefault();
        this.show_fax(e.target.parentNode.parentNode.parentNode.id.substr(4))        
    },

    click_delete: function(e) {
        e.preventDefault();

        if (!confirm('Are you sure you wish to delete this fax?'))
            return false;

        this.track_subcontroller('plz_wait', function() {
            return new BlockingModalController();
        }.bind(this));

        var access_key = e.target.parentNode.parentNode.id.substr(4)
        var data = new FormData();

        data.append('api_key', faxrobot.account.get('api_key'));
        data.append('access_key', access_key);

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var modal = this.get_subcontroller('plz_wait');
                if (modal) modal.close();

                if (xhr.status == 200) {
                    this.collection = null;
                    this.render();
                    this.load_incoming();
                } else 
                    faxrobot.error.show(0);        
            }
        }.bind(this);

        xhr.open("post", API_URL + '/incoming/delete', true);
        xhr.send(data);
    },

    click_row: function(e) {
        if (!e.defaultPrevented)
            this.show_fax(e.target.parentNode.id.substr(4));
    },

    show_fax: function(access_key) {
        window.open(API_URL + '/incoming/view?access_key='+access_key+'&api_key='+faxrobot.account.get('api_key'))
    },

    update: function(filter, page) {
        this.page = page;
        this.collection = null;
        this.render();
        this.load_incoming();
    }

});