Fax Robot WWW
=============
#### The [Fax Robot website][1]! Based on the [composer.js][5] JavaScript framework!

**You're probably more interested in [faxrobot][2], the Fax Robot API project.**

Introduction
------------
This is the frontend web app for Fax Robot, the Python API that allows anyone
with a faxmodem to run their own fax server. This code is licensed under
[the GNU General Public License, Version 3][3], although keep in mind the name
"Fax Robot" is trademarked, so if you want to run this code in production,
you'll have to change the `PROJECT_NAME` (we've made that easy to customize).


Installation
------------
There are a few files you'll need to create to deploy this project:

* `config/local.js`: This is the local environment configuration. It contains
  consants used throughout the app, such as the base URL of the Fax Robot API.
  You can find a template of this file in `config/local.EXAMPLE.js`.
* `pages/faq.html`: Frequently asked questions page. Make your own.
* `pages/privacy.html`: Privacy policy page. Make your own.
* `pages/tos.html`: Terms of service page. Make your own.

#### Development of JavaScript code

This project is configured to use [Grunt][4] to automatically minify its code
whenever you make a change. If you don't have Grunt, you'll have to
`sudo npm install -g grunt`. (You'll need `npm` installed to do that ;).

To install the required packages to minify the code, `cd` to the project
directory and then enter `npm install`.

Once the packages are installed, you can run the `grunt` command in its own
terminal whenever you are modifying the source code, and the site will
automatically be recompiled after each change.

#### Example nginx configuration

```
server {
    listen 80;
    server_name faxrobot.dev;
    set $server_root /htdocs/faxrobot-www;
    root $server_root;

    charset utf-8;

    access_log /var/log/nginx/faxrobot.dev-access.log;
    error_log /var/log/nginx/faxrobot.dev-error.log;

    location ~* ^.+.(html)$ {
        break;
    }

    location / {
        index index.html index.htm;

        # screw best practices.
        if (-f $request_filename) {
            add_header Cache-Control "public, max-age=315360000";
            break;
        }
        if (-d $request_filename) {
            break;
        }

        rewrite ^/(.+)$ / last;
    }

    ## Images and static content is treated different
    location ~* ^.+.(jpg|jpeg|gif|css|png|js|ico|xml)$ {
        access_log        off;
        expires           30d;
    }
}
```

[1]: https://faxrobot.io
[2]: https://github.com/lyonbros/faxrobot
[3]: https://www.gnu.org/copyleft/gpl.html
[4]: http://gruntjs.com/
[5]: https://lyonbros.github.io/composer.js/