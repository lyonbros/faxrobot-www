/**
 * util.js
 *
 * This sets up our util object, which defines a way to export Composer
 * components and also defines a number of helper functions the rest of the
 * system will use.
 * -----------------------------------------------------------------------------
 *
 * Composer.js is an MVC framework for creating and organizing javascript 
 * applications. For documentation, please visit:
 *
 *     http://lyonbros.github.com/composer.js/
 * 
 * -----------------------------------------------------------------------------
 *
 * Copyright (c) 2011, Lyon Bros Enterprises, LLC. (http://www.lyonbros.com)
 * 
 * Licensed under The MIT License. 
 * Redistributions of files must retain the above copyright notice.
 */
(function() {
    "use strict";

    var global = this;
    if(!global.Composer) global.Composer = {
        // note: this used to be "export" but IE is a whiny little bitch, so now
        // we're sup3r 1337 h4x0r5
        exp0rt: function(obj)
        {
            Object.keys(obj).forEach(function(key) {
                global.Composer[key] = obj[key];
            });
        }
    };

    /**
     * You must override this function in your app.
     */
    var sync = function(method, model, options) { return options.success(); };

    // a closure that returns incrementing integers. these will be unique across
    // the entire app since only one counter is instantiated
    var cid = (function() {
        var counter = 1;
        return function(inc) { return 'c'+counter++; };
    })();

    // wraps error callbacks for syncing functions
    var wrap_error = function(callback, model, options)
    {
        return function(resp)
        {
            if(callback)
            {
                callback(model, resp, options);
            }
            else
            {
                this.fire_event('error', options, model, resp, options);
            }
        };
    };

    // Composer equality function. Does deep-inpection and is able to tell the
    // difference between {key: 3} and {key: 3, key2: 4} (_.eq had problems with
    // this back in the day).
    var eq = function(a, b)
    {
        if ( a === b ) return true;
        if(a instanceof Function) return false;
        if(typeof(a) != typeof(b)) return false;
        if((a && a.constructor) && !b || !b.constructor) return false;
        if((b && b.constructor) && !a || !a.constructor) return false;
        if(a && b && a.constructor != b.constructor) return false;
        if(a instanceof Array || Object.prototype.toString.call(a) === '[object Array]')
        {
            if(a.length != b.length) return false;
            // TODO: check if array indexes are always sequential
            for(var i = 0, n = a.length; i < n; i++)
            {
                if(!b.hasOwnProperty(i)) return false;
                if(!eq(a[i], b[i])) return false;
            }
        }
        else if(a instanceof Object)
        {
            for( var p in b )
            {
                if( b.hasOwnProperty(p) && ! a.hasOwnProperty(p) ) return false;
            }
            for( var p in a )
            {
                if ( ! a.hasOwnProperty( p ) ) continue;
                if ( ! b.hasOwnProperty( p ) ) return false;
                if ( a[ p ] === b[ p ] ) continue;
                if ( typeof( a[ p ] ) !== "object" ) return false;
                if ( ! eq( a[ p ],  b[ p ] ) ) return false;
            }
        }
        else if(a != b)
        {
            return false;
        }
        return true;
    };

    // create an extension function that merges specific properties from
    // inherited objects
    var merge_extend = function(cls, properties)
    {
        var _extend = cls.extend;
        cls.extend = function(def, base)
        {
            base || (base = this);
            var attr = base.prototype;

            properties.forEach(function(prop) {
                def[prop] = Composer.object.merge({}, attr[prop], def[prop]);
            });

            var cls = _extend.call(base, def);
            Composer.merge_extend(cls, properties);
            return cls;
        }
    };

    // some Mootools-reminiscent object utilities Composer uses
    var array = {
        erase: function(arr, item)
        {
            for(var i = arr.length - 1; i >= 0; i--)
            {
                if(arr[i] === item) arr.splice(i, 1);
            }
        },

        is: (function() {
            return ('isArray' in Array) ? 
                Array.isArray :
                function(obj) {
                    return obj instanceof Array || Object.prototype.toString.call(obj) === '[object Array]'
                }
        })()
    };
    var object = {
        each: function(obj, fn, bind)
        {
            if(!obj) return;
            bind || (bind = this);
            Object.keys(obj).forEach(function(key) {
                (fn.bind(bind))(obj[key], key)
            });
        },
        clone: function(obj, options)
        {
            options || (options = {});
            if(options.deep) return JSON.parse(JSON.stringify(obj));

            var clone = {};
            Object.keys(obj).forEach(function(key) {
                clone[key] = obj[key];
            });
            return clone;
        },
        merge: function(to, _)
        {
            var args = Array.prototype.slice.call(arguments, 1);
            args.forEach(function(obj) {
                if(!obj) return;
                Object.keys(obj).forEach(function(key) {
                    to[key] = obj[key];
                });
            });
            return to;
        }
    };

    var promisify = function()
    {
        var create_converter = function(type)
        {
            return function(key)
            {
                var options = arguments[1] || {};
                var options_idx = options.options_idx || 0;
                var names = options.names || ['success', 'error'];

                var _old = Composer[type].prototype[key];
                Composer[type].prototype[key] = function()
                {
                    var args = Array.prototype.slice.call(arguments, 0);
                    if(args.length < options_idx)
                    {
                        var _tmp = new Array(options_idx);
                        args.forEach(function(item, i) { _tmp[i] = item; });
                        args = _tmp;
                    }
                    if(!args[options_idx]) args[options_idx] = {};
                    var _self = this;
                    var options = args[options_idx];
                    if(options.promisified) return _old.apply(_self, args);
                    return new Promise(function(resolve, reject) {
                        if(names[0]) options[names[0]] = resolve;
                        if(names[1]) options[names[1]] = function(_, err) { reject(err); };
                        options.promisified = true;
                        _old.apply(_self, args);
                    });
                };
            };
        }
        var convert_collection_fn = create_converter('Collection');
        ['fetch', 'save', 'destroy'].forEach(create_converter('Model'));
        ['fetch'].forEach(convert_collection_fn);
        convert_collection_fn('reset_async', {options_idx: 1, names: ['complete']});
    };

    this.Composer.exp0rt({
        sync: sync,
        cid: cid,
        wrap_error: wrap_error,
        eq: eq,
        merge_extend: merge_extend,
        array: array,
        object: object,
        promisify: promisify
    });
}).apply((typeof exports != 'undefined') ? exports : this);

/**
 * class.js
 *
 * Defines the base class system used by Composer (can be standlone as well)
 * -----------------------------------------------------------------------------
 *
 * Composer.js is an MVC framework for creating and organizing javascript
 * applications. For documentation, please visit:
 *
 *     http://lyonbros.github.com/composer.js/
 *
 * -----------------------------------------------------------------------------
 *
 * Copyright (c) 2011, Lyon Bros Enterprises, LLC. (http://www.lyonbros.com)
 *
 * Licensed under The MIT License.
 * Redistributions of files must retain the above copyright notice.
 */
(function() {
    "use strict";

    var global = this;

    /**
     * like typeof, but returns if it's an array or null
     */
    var typeOf = function(obj)
    {
        if(obj == null) return 'null';
        var type = typeof(obj);
        if(type != 'object') return type;
        if(Array.isArray && Array.isArray(obj)) return 'array';
        else if(Object.prototype.toString.call(obj) === '[object Array]') return 'array';
        return type;
    };

    /**
     * Merge object `from` into `into`
     */
    var merge = function(into, from, options)
    {
        options || (options = {});
        for(var k in from)
        {
            if(!from.hasOwnProperty(k)) continue;
            if(options.transform) options.transform(into, from, k);
            into[k] = from[k];
        }
        return into;
    };

    /**
     * Wraps an overriding method to track its state so get_parent() can pull
     * out the right function.
     */
    var wrapfn = function(origfn, k)
    {
        return function()
        {
            if(!this.$state.levels[k]) this.$state.levels[k] = 0;
            this.$state.levels[k]++;
            this.$state.fn.unshift(k);
            var val = origfn.apply(this, arguments);
            this.$state.fn.shift();
            this.$state.levels[k]--;
            return val;
        };
    };

    /**
     * Takes care of "parentizing" overridden methods when merging prototypes
     */
    var do_extend = function(to_prototype, from_prototype)
    {
        return merge(to_prototype, from_prototype, {
            transform: function(into, from, k) {
                if(typeof into[k] != 'function' || into[k].prototype.$parent || typeof from[k] != 'function' || from[k].prototype.$parent) return false;
                from[k] = wrapfn(from[k], k);
                from[k].$parent = into[k];
            }
        });
    };

    /**
     * Given an object, copy the subobjects/subarrays recursively
     */
    var copy = function(obj)
    {
        for(var k in obj)
        {
            var val = obj[k];
            switch(typeOf(val))
            {
            case 'object':
                obj[k] = copy(merge({}, val));
                break;
            case 'array':
                obj[k] = val.slice(0);
                break;
            }
        }
        return obj;
    }

    /**
     * Create a new class prototype from the given base class.
     */
    var create = function(base)
    {
        base.$initializing = true;
        var prototype = new base();
        delete base.$initializing;

        var cls = function Omni()
        {
            copy(this);
            if(cls.$initializing) return this;
            this.$state = {levels: {}, fn: []};
            if(this.initialize) return this.initialize.apply(this, arguments);
            else return this;
        };
        cls.$constructor = prototype.$constructor = cls;
        cls.prototype = prototype;
        cls.prototype.$parent = base;

        return cls;
    };

    /**
     * Once base to rule them all (and in the darkness bind them)
     */
    var Base = function() {};

    /**
     * Main extension method, creates a new class from the given object
     */
    Base.extend = function(obj)
    {
        var base = this;
        var cls = create(base);
        do_extend(cls.prototype, obj);
        cls.extend = Base.extend;

        cls.prototype.$get_parent = function()
        {
            var key = this.$state.fn[0];
            if(!key) return false;
            var level = this.$state.levels[key];
            var parent = cls.prototype[key]; for(var i = 0; i < level && parent; i++) { parent = parent.$parent; }
            return parent || false;
        };
        cls.prototype.parent = function()
        {
            var fn = this.$get_parent();
            if(fn) return fn.apply(this, arguments);
            throw 'Class.js: Bad parent method: '+ this.$state.fn[0];
        };

        return cls;
    };

    // wrap base class so we can call it directly or as .extend()
    function Class(obj) { return Base.extend(obj); };
    Class.extend = Class;

    this.Composer.exp0rt({ Class: Class });

}).apply((typeof exports != 'undefined') ? exports : this);