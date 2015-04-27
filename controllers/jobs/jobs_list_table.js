var JobsListTableController = Composer.Controller.extend({

    template: 'jobs_list_table',  

    collection: null,
    filter: 'all',
    page: 1,
    pages: 0,
    per_page: 0,
    total: 0,
    has_next: false,
    has_prev: false,

    elements: {
    },

    events: {
        'click a.status': 'click_status',
        'click td': 'click_row'
    },

    init: function() {
        this.with_bind(faxrobot.account, 'change', this.release.bind(this));
        this.render();
        this.load_jobs();
        return this;
    },

    render: function()
    {
        var data = {
            collection: this.collection ? this.collection.toJSON() : null,
            pages:      this.pages,
            filter:     this.filter,
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

    load_jobs: function() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                var response = JSON.parse(xhr.response);
                
                if (xhr.status == 200) {
                    this.collection = new Jobs(response.jobs);
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

        if (this.filter != 'all')
            qry += '&filter=' + this.filter;

        xhr.open("get", API_URL + '/jobs/list?' + qry, true);
        xhr.send();
    },

    click_status: function(e) {
        e.preventDefault();
        this.show_status(e.target.parentNode.parentNode.id.substr(4));
    },

    click_row: function(e) {
        if (!e.defaultPrevented)
            this.show_status(e.target.parentNode.id.substr(4));
    },

    show_status: function(id) {
        faxrobot.route('/job/'+id);
    },

    update: function(filter, page) {
        this.filter = filter;
        this.page = page;
        this.collection = null;
        this.render();
        this.load_jobs();
    }

});