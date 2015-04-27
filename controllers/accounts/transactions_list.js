var AccountsTransactionsListController = Composer.Controller.extend({

    template: 'accounts_transactions_list',  

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
    },

    init: function() {
        this.with_bind(faxrobot.account, 'change', this.release.bind(this));
        this.render();
        this.load_transactions();
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

    load_transactions: function() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4)
            {
                var response = JSON.parse(xhr.response);
                
                if (xhr.status == 200) {
                    this.collection = new Transactions(response.transactions);
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

        xhr.open("get", API_URL + '/accounts/transactions?' + qry, true);
        xhr.send();
    },

    update: function(page) {
        this.page = page;
        this.collection = null;
        this.render();
        this.load_transactions();
    }

});