var BaseModalController = Composer.Controller.extend({

    elements: {
        '.overlay': 'overlay',
        '.modal_container': 'modal_container',
        '.modal': 'modal'
    },

    events: {
        'click .modal_container': 'close_if_closable',
        'click a.close': 'close'
    },

    show: function() {

        if (this.closable) {
            var a = document.createElement('a');
            a.className = 'close';
            a.textContent = '×';
            a.href = '#';
            this.modal.appendChild(a);
        }

        this.modal.className += ' invisible';

        setTimeout(function() {

            this.overlay.className += ' visible';
            this.modal.className =this.modal.className.replace(/invisible/g,'');

            if (typeof this.after_show == 'function')
                this.after_show();

        }.bind(this), 15);
    },

    close_if_closable: function(e) {
        if (e.target == this.modal_container && this.closable) {
            e.preventDefault();
            this.close();
        }
    },

    close: function(e) {
        if (e)
            e.preventDefault();

        this.overlay.className = this.overlay.className.replace(/visible/g, '');
        this.modal.className += ' invisible';

        setTimeout(function() {
            if (typeof this.before_close == 'function')
                this.before_close();
            this.release();
        }.bind(this), 250);
    },

});