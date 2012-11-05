/*!
 * HeadJS          The only script in your <HEAD>    
 * Created By      Tero Piirainen  (tipiirai)
 * Maintained By   Robert Hoffmann (itechnology)
 * License         MIT / http://bit.ly/mit-license
 *
 * Version 0.98
 * http://headjs.com
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
    api.load = function () {
        ///<summary>
        /// INFO: use cases
        ///    head.load("http://domain.com/file.js", callBack)
        ///    head.load("http://domain.com/file.js","http://domain.com/file.js", callBack)
        ///    head.load({ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }, callBack)
        ///</summary> 
            
        // we need a reference to arguments because of the function inside each() below
        var args      = arguments,
            callback  = args[args.length - 1],
            items     = {};
            
        if (!isFunction(callback)) {
            callback = noop;
        }
            

        /* START Older Browser support
        ******************************/
        if (!isAsync) {
            // 1st in older browsers we want to make sure we are ready()
            if (!isReady) {
                queue.push(function () {
                    api.load.apply(null, args);
                });

                return api;
            }

            /* Preload with text/cache hack (not good!) http://blog.getify.com/on-script-loaders/
             * In certain browser, make sure that scripts are executed in the same order as loaded
             * If caching is not configured correctly on server, this will cause scripts to load twice
             ******************************************************************************************/
            each(args, function (item) {
                if (item !== callback) {
                    preload(getScript(item));
                }
            });
        }
        /* END Older Browser support
        ****************************/
            

        each(args, function (item, i) {                
            if (item !== callback) {
                item             = getScript(item);
                items[item.name] = item;

                // Only run the callback once when we finished looping over the other items
                load(item, (i === args.length - 2) ? function () {                        
                    if (allLoaded(items)) {
                        one(callback);
                    }

                } : null);
            }
        });           

        return api;
    };

    // INFO: for retro compatibility
    api.js = api.load;

    api.test = function (test, success, failure, callback) {
        ///<summary>
        /// INFO: use cases:
        ///    head.test(condition, null       , "file.NOk" , callback);
        ///    head.test(condition, "fileOk.js", null       , callback);        
        ///    head.test(condition, "fileOk.js", "file.NOk" , callback);
        ///    head.test(condition, "fileOk.js", ["file.NOk", "file.NOk"], callback);
        ///    head.test({
        ///               test    : condition,
        ///               success : [{ label1: "file1Ok.js"  }, { label2: "file2Ok.js" }],
        ///               failure : [{ label1: "file1NOk.js" }, { label2: "file2NOk.js" }],
        ///               callback: callback
        ///    );  
        ///    head.test({
        ///               test    : condition,
        ///               success : ["file1Ok.js" , "file2Ok.js"],
        ///               failure : ["file1NOk.js", "file2NOk.js"],
        ///               callback: callback
        ///    );         
        ///</summary>    
        var obj = (typeof test === 'object') ? test : {
            test    : test,
            success : !!success ? isArray(success) ? success : [success] : false,
            failure : !!failure ? isArray(failure) ? failure : [failure] : false,
            callback: callback || noop
        };

        // Test Passed ?
        var passed = !!obj.test;
        
        // Do we have a success case
        if (passed && !!obj.success) {
            obj.success.push(obj.callback);
            api.load.apply(null, obj.success);
        }
        // Do we have a fail case
        else if (!passed && !!obj.failure) {
            obj.failure.push(obj.callback);                
            api.load.apply(null, obj.failure);
        }
        else {
            callback();
        }
        
        return api;
    };

    api.ready = function (key, fn) {
        ///<summary>
        /// INFO: use cases:
        ///    head.ready(callBack)
        ///    head.ready(document , callBack)
        ///    head.ready("file.js", callBack);
        ///    head.ready("label"  , callBack);        
        ///</summary>
                   
        // INFO: retro compatibiliy ..we don't even support things like ready(window) or on other elements, so we fire on document no matter what
        if (key === doc) {
            key = "ALL";
        }
        
        // shift arguments
        if (isFunction(key)) {
            fn  = key;
            key = "ALL";
        }    

        // make sure arguments are sane
        if (typeof key !== 'string' || !isFunction(fn)) {
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
    
    function each(arr, fn) {
        if (!arr) {
            return;
        }

        // arguments special type
        if (typeof arr === 'object') {
            arr = [].slice.call(arr);
        }

        // do the job
        for (var i = 0, l = arr.length; i < l; i++) {
            fn.call(arr, arr[i], i);
        }
    }

    // http://bonsaiden.github.com/JavaScript-Garden/#types
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    function isFunction(el) {
        return is("Function", el);
    }
    
    function isArray(el) {
        return is("Array", el);
    }
    
    function toLabel(url) {
        ///<summary>Converts a url to a file label</summary>
        var els   = url.split("/"),
             name = els[els.length -1],
             i    = name.indexOf("?");

        return i !== -1 ? name.substring(0, i) : name;
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

    function getScript(item) {
        ///<summary>
        /// Gets a script in the form of
        /// { 
        ///     name: label,
        ///     url : url
        /// }
        ///</summary>
        var script = {};

        if (typeof item === 'object') {
            for (var label in item) {
                if (!!item[label]) {
                    script = {
                        name: label,
                        url : item[label]
                    };
                }
            }
        }
        else {
            script = {
                name: toLabel(item),
                url : item
            };
        }

        // is the item already existant
        var existing = scripts[script.name];
        if (existing && existing.url === script.url) {
            return existing;
        }

        scripts[script.name] = script;                
        return script;
    }

    function allLoaded(items) {       
        items = items || scripts;

        var isLoaded = false;
        
        for (var name in items) {
            if (items.hasOwnProperty(name) && items[name].state !== LOADED) {
                return false;
            }
            
            isLoaded = true;
        }
        
        return isLoaded;
    }

    function onPreload(script) {
        ///<summary>Used with text/cache hack</summary>
        script.state = PRELOADED;

        each(script.onpreload, function (item) {
            item.call();
        });
    }

    function preload(script) {
        ///<summary>User with text/cache hack</summary>
        if (script.state === undefined) {
            script.state     = PRELOADING;
            script.onpreload = [];

            scriptTag({ src: script.url, type: 'cache' }, function () {
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
            return script.onpreload.push(function () {                
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
            // IE 6-9 will trigger 3 events
            //   1) event.type = readystatechange, s.readyState = loading
            //   1) event.type = readystatechange, s.readyState = loaded
            //   1) event.type = readystatechange, s.readyState = complete
            
            // IE 10 will trigger 2 events
            //   1) event.type = readystatechange, s.readyState = loading
            //   2) event.type = load            , s.readyState = complete

            // All other browsers seem trigger 1 event
            //   1) event.type = load, s.readyState = undefined
            if (event.type === 'load' || /complete/.test(s.readyState)) {                
                // release event listeners
                s.onload = s.onreadystatechange = s.onerror = null;
                callback();
            }
            
            /* This part is for the text/cache handling & older browser support
            ********************************************************************/
            var script = getScript(s.src || s.href); // should be moving this to the top, or change main method so we can act on the state of the script more easily
            
            if (event.type === 'readystatechange' && /loading/.test(s.readyState)) {
                script.state = LOADING;
            }
            
            if (event.type === 'readystatechange' && /loaded/.test(s.readyState)) {                
                script.state = LOADED;
                
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
