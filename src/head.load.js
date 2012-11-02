/**
    Head JS     The only script in your <HEAD>
    Copyright   Tero Piirainen (tipiirai)
    License     MIT / http://bit.ly/mit-license
    Version     0.97a

    http://headjs.com
*/
;(function(win, undefined) {
    "use strict";

    var doc      = win.document,
        queue    = [], // waiters for the "head ready" event
        handlers = {}, // user functions waiting for events
        scripts  = {}, // loadable scripts in different states
        isAsync  = doc.createElement("script").async === true || "MozAppearance" in doc.documentElement.style || win.opera,
        isReady,

        /*** public API ***/
        headVar = win.head_conf && win.head_conf.head || "head",
        api     = win[headVar] = (win[headVar] || function() { api.ready.apply(null, arguments); }),

        // states
        PRELOADED  = 1,
        PRELOADING = 2,
        LOADING    = 3,
        LOADED     = 4;

    // Method 1: simply load and let browser take care of ordering
    if (isAsync) {
        api.js = function() {

            var args = arguments,
                 fn  = args[args.length - 1],
                 els = {};

            if (!isFunc(fn)) {
                fn = null;
            }

            each(args, function(el, i) {

                if (el != fn) {
                    el = getScript(el);
                    els[el.name] = el;

                    load(el, fn && i === args.length - 2 ? function () {
                        if (allLoaded(els)) {
                            one(fn);
                        }

                    } : null);
                }
            });

            return api;
        };

    // Method 2: preload with text/cache hack
    } else {
        api.js = function() {

            var args = arguments,
                rest = [].slice.call(args, 1),
                next = rest[0];

            // wait for a while. immediate execution causes some browsers to ignore caching
            if (!isReady) {
                queue.push(function()  {
                    api.js.apply(null, args);
                });
                
                return api;
            }

            // multiple arguments
            if (next) {

                // load
                each(rest, function(el) {
                    if (!isFunc(el)) {
                        preload(getScript(el));
                    }
                });

                // execute
                load(getScript(args[0]), isFunc(next) ? next : function() {
                    api.js.apply(null, rest);
                });


            // single script
            }
            else {
                load(getScript(args[0]));
            }

            return api;
        };
    }

    // Alias for logical reasons
    api.css = api.js;

    api.ready = function (key, fn) {
        ///<summary>
        /// INFO: use cases:
        ///    head.ready(document  , callBack)
        ///    head.ready("filename", callBack);
        ///    head.ready("label"   , callBack);        
        ///</summary>
                   
        // INFO: retro compatibiliy ..we don't even support things like ready(window) or on other elements, so we fire on document no matter what
        if (key === doc) {
            key = "ALL";
        }
        
        // shift arguments
        if (isFunc(key)) {
            fn  = key;
            key = "ALL";
        }    

        // make sure arguments are sane
        if (typeof key !== 'string' || !isFunc(fn)) {
            return api;
        }

        // This can also be called when we trigger events based on filenames & labels
        var script = scripts[key];
        // INFO: allLoaded() seems to be false quite often !!!
        if (script && script.state === LOADED || key === 'ALL' && allLoaded() && isReady) {
            one(fn);
            return api;
        }

        var arr = handlers[key];
        if (!arr) {
            arr = handlers[key] = [fn];
        }
        else {
            arr.push(fn);
        }

        return api;
    };

    /* private functions
    *********************/
    function noop() {
        // does nothing
    }
    
    // call function once
    function one(fn) {
        fn = fn || noop;
        
        if (fn._done) {
             return;
        }
        
        fn();
        fn._done = 1;
    }


    function toLabel(url) {
        var els   = url.split("/"),
             name = els[els.length -1],
             i    = name.indexOf("?");

        return i !== -1 ? name.substring(0, i) : name;
    }


    function getScript(url) {
        var script = {};

        if (typeof url === 'object') {
            for (var key in url) {
                if (url[key]) {
                    script = { name: key, url: url[key] };
                }
            }
        }
        else {
            script = { name: toLabel(url),  url: url };
        }

        var existing = scripts[script.name];
        if (existing && existing.url === script.url) {
            return existing;
        }

        scripts[script.name] = script;
        return script;
    }


    function each(arr, fn) {
        if (!arr) {
            return;
        }

        // arguments special type
        if (typeof arr == 'object') {
            arr = [].slice.call(arr);
        }

        // do the job
        for (var i = 0, l = arr.length; i < l; i++) {
            fn.call(arr, arr[i], i);
        }
    }

    function isFunc(el) {
        return Object.prototype.toString.call(el) == '[object Function]';
    }

    function allLoaded(els) {       
        els = els || scripts;       

        var isLoaded = false;
        
        for (var name in els) {
            if (els.hasOwnProperty(name) && els[name].state !== LOADED) {
                return false;
            }
            
            isLoaded = true;
        }
        
        return isLoaded;
    }


    function onPreload(script) {
        script.state = PRELOADED;

        each(script.onpreload, function(el) {
            el.call();
        });
    }

    function preload(script) {        
        if (script.state === undefined) {
            script.state     = PRELOADING;
            script.onpreload = [];

            scriptTag({ src: script.url, type: 'cache'}, function()  {
                onPreload(script);
            });
        }
    }

    function load(script, callback) {
        callback = callback || noop;
        
        if (script.state === LOADED) {
            return callback && callback();
        }

        if (script.state === LOADING) {
           return api.ready(script.name, callback);
        }

        if (script.state === PRELOADING) {
            return script.onpreload.push(function() {
                load(script, callback);
            });
        }

        script.state = LOADING;

        scriptTag(script.url, function() {

            script.state = LOADED;
            callback();

            // handlers for this script
            each(handlers[script.name], function (fn) {
                one(fn);
            });

            // everything ready
            if (allLoaded() && isReady) {
                each(handlers.ALL, function (fn) {
                    one(fn);
                });
            }
        });
    }
        
    function scriptTag(src, callback) {
        var s;
        
        if (/\.css$/i.test(src)) {
            s      = doc.createElement('link');
            s.type = 'text/' + (src.type || 'css');
            s.rel  = 'stylesheet';
            s.href = src.src || src;
        }
        else {
            s      = doc.createElement('script');
            s.type = 'text/' + (src.type || 'javascript');
            s.src  = src.src || src;           
        }
        
        loadAsset(s, callback);
    }
    
    function loadAsset(s, callback) {
        callback = callback || noop;
        
        // code inspired from: https://github.com/unscriptable/curl/blob/master/src/curl.js
        s.onload  = s.onreadystatechange = process;
        s.onerror = error;
        s.async   = false;

        function error(event) {
            // need some error handling here !

            // release event listeners
            s.onload = s.onreadystatechange = s.onerror = null;
        }

        function process(event) {
            event = event || win.event;
            // IE 6-9 will trigger 1 event : s.readyState (1: complete)
            // IE 10  will trigger 2 events: s.readyState (1: loaded, 2: complete)
            // All other browsers seem trigger 1 event.type (1: load)
            if (event.type === 'load' || /complete/.test(s.readyState)) {
                // release event listeners
                s.onload = s.onreadystatechange = s.onerror = null;
                callback();
            }
        };

        // use insertBefore to keep IE from throwing Operation Aborted (thx Bryan Forbes!)
        var head = doc['head'] || doc.getElementsByTagName('head')[0];
        // but insert at end of head, because otherwise if it is a stylesheet, it will not ovverride values
        head.insertBefore(s, head.lastChild);
    }
    
    /* START READY
     * The much desired DOM ready check
     * Thanks to jQuery and http://javascript.nwbox.com/IEContentLoaded/
     ********************************************************************/
    function fireReady() {
        // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
        if (!doc.body) {
            win.setTimeout(fireReady, 5);
            return;
        }

        if (!isReady) {
            isReady = true;

            each(queue, function (fn) {
                one(fn);
            });
            
            each(handlers.ALL, function (fn) {
                one(fn);
            });
        }
    }
    
    function domContentLoaded() {
        if (doc.addEventListener) {
            doc.removeEventListener("DOMContentLoaded", domContentLoaded, false);
            fireReady();
        } else if (doc.readyState === "complete") {
            // we're here because readyState === "complete" in oldIE
            // which is good enough for us to call the dom ready!
            doc.detachEvent("onreadystatechange", domContentLoaded);
            fireReady();
        }
    };
    
    if (!isReady) {
        if (doc.readyState === "complete") {
            // INFO: why would we set a timeout here ?
            // win.setTimeout(fireReady, 5);
            fireReady();
        }
        else if (doc.addEventListener) {
            // Use the handy event callback
            doc.addEventListener("DOMContentLoaded", domContentLoaded, false);

            // A fallback to window.onload, that will always work
            win.addEventListener("load", fireReady, false);
        }
        else {
            // Ensure firing before onload, maybe late but safe also for iframes
            doc.attachEvent("onreadystatechange", domContentLoaded);

            // A fallback to window.onload, that will always work
            win.attachEvent("onload", fireReady);
            
            // If IE and not a frame
            // continually check to see if the document is ready
            var top = false;

            try {
                top = win.frameElement == null && doc.documentElement;
            } catch (e) { }
            
            if (top && top.doScroll) {
                (function doScrollCheck() {
                    if (!isReady) {

                        try {
                            // Use the trick by Diego Perini
                            // http://javascript.nwbox.com/IEContentLoaded/
                            top.doScroll("left");
                        } catch (error) {
                            win.setTimeout(doScrollCheck, 50);
                            return;
                        }

                        // and execute any waiting functions
                        fireReady();
                    }
                })();
            }
        }

    }
    /* END READY
    ***************************************************/
})(window);