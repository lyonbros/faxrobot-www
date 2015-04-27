var util = { 
    set_cookie: function(name, val, expire_days)
    {
        var d = new Date();
        d.setTime(d.getTime()+(expire_days*24*60*60*1000));
        var expires = "expires="+d.toGMTString();
        document.cookie = name + "=" + val + "; " + expires + "; path=/";
    },
    get_cookie: function(cname)
    {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++)
        {
            var c = ca[i].trim();
            if (c.indexOf(name)==0)
                return c.substring(name.length,c.length);
        }
        return "";
    },
    
    set_title: function(title) {

        var escape_regexp_chars = function(str) {
            return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        };
        var regex   =   new RegExp('(\\s*\\|\\s*'+escape_regexp_chars(faxrobot.base_window_title)+')*(\\s*\\|)?$', 'g');
        title       =   title.replace(regex, '');
        if(title == '') title = faxrobot.base_window_title;
        else title = title + ' — ' + faxrobot.base_window_title;
        document.title  =   title;
    },

    format_phone: function(n) {
        if (!n)
            return '';
        return n.substr(0,3)+'-'+n.substr(3,3)+'-'+n.substr(6)
    },

    format_date: function(d) {
        if (!d)
            return '-';
        d = new Date(d);
        return (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear()+'&nbsp;'+(d.getHours() > 12 ? d.getHours() - 12 : d.getHours())+':'+(d.getMinutes() >= 10 ? d.getMinutes() : '0'+d.getMinutes())+(d.getHours() > 12 ? 'pm' : 'am')
    },

    remove_class: function(el, class_name) {
        el.className = el.className.replace(new RegExp(class_name, "g"), '');
    },

    notify: function(str) {
        var n = document.createElement('div');
        n.className = 'notification closed';
        n.textContent = str;
        var removed = false;
        var close = function() {
            if (removed)
                return;
            removed = true;
            n.className += ' closed';
            setTimeout(function() {
                document.body.removeChild(n);
            }, 500);
        }
        n.addEventListener('click', function() {
            close();
        });
        document.body.appendChild(n);
        setTimeout(function() {
            this.remove_class(n, 'closed');
        }.bind(this), 50);
        var timer = setTimeout(function() {
            close();
        }, 5000);
    }
};