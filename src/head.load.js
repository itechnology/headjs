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
        handlers = {}, // user functions waiting for events
        scripts  = {}, // loadable scripts in different states
        isAsync  = "async" in doc.createElement("script") || "MozAppearance" in doc.documentElement.style || win.opera,
        isDomReady,

        /*** public API ***/
        headVar = win.head_conf && win.head_conf.head || "head",
        api     = win[headVar] = (win[headVar] || function() { api.ready.apply(null, arguments); }),

        // states
        LOADING    = 1,
        LOADED     = 2;

    // Method 1: simply load and let browser take care of ordering
    api.load = function () {
        ///<summary>
        /// INFO: use cases
        ///    head.load("http://domain.com/file.js","http://domain.com/file.js", callBack)
        ///    head.load({ label1: "http://domain.com/file.js" }, { label2: "http://domain.com/file.js" }, callBack)
        ///</summary> 
        var current  = arguments[0],
            callback = arguments[arguments.length - 1];
        
        if (!current) {
            return api;
        }

        if (!isFunction(callback)) {
            callback = noop;
        }
        
        if (current == callback) {
            callback();
            return api;
        }
                
        if (isAsync) {
            var items    = {},
                allItems = [].slice.call(arguments, 0);
            
            each(allItems, function (item) {
                if (item !== callback) {
                    item             = getScript(item);
                    items[item.name] = item;
                    load(item, function() {
                        if (allLoaded(items)) {
                            callback();
                        }
                    });
                }
            });
        }
        else {
            current  = getScript(current);
            var left = [].slice.call(arguments, 1);
            /* Preload with text/cache hack (not good!)
             * http://blog.getify.com/on-script-loaders/
             * http://www.nczonline.net/blog/2010/12/21/thoughts-on-script-loaders/
             * If caching is not configured correctly on the server, then scripts will load twice !
             **************************************************************************************/
            preLoad(current, function () {                
                api.js.apply(null, left);
            });
        }          

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

    api.ready = function (key, callback) {
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
            callback = key;
            key      = "ALL";
        }    

        // make sure arguments are sane
        if (typeof key !== 'string' || !isFunction(callback)) {
            return api;
        }

        // This can also be called when we trigger events based on filenames & labels
        var script = scripts[key];

        // script already loaded --> execute and return
        if (script && script.state === LOADED || key === 'ALL' && allLoaded() && isDomReady) {
            one(callback);
            return api;
        }

        var arr = handlers[key];
        if (!arr) {
            arr = handlers[key] = [callback];
        }
        else {
            arr.push(callback);
        }

        return api;
    };


    /* private functions
    *********************/
    function noop() {
        // does nothing
    }
    
    function each(arr, callback) {
        if (!arr) {
            return;
        }

        // arguments special type
        if (typeof arr === 'object') {
            arr = [].slice.call(arr);
        }

        // do the job
        for (var i = 0, l = arr.length; i < l; i++) {
            callback.call(arr, arr[i], i);
        }
    }

    // http://bonsaiden.github.com/JavaScript-Garden/#types
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    function isFunction(item) {
        return is("Function", item);
    }
    
    function isArray(item) {
        return is("Array", item);
    }
    
    function toLabel(url) {
        ///<summary>Converts a url to a file label</summary>
        var items = url.split("/"),
             name = items[items.length - 1],
             i    = name.indexOf("?");

        return i !== -1 ? name.substring(0, i) : name;
    }
    
    // INFO: this look like a "im triggering callbacks all over the place, but only wanna run it one time function" ..should try to make everything work without it if possible
    // INFO: Even better. Look into promises/defered's like jQuery is doing
    function one(callback) {
        ///<summary>Execute a callback only once</summary>
        callback = callback || noop;
        
        if (callback._done) {
             return;
        }
        
        callback();
        callback._done = 1;
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

        for (var name in items) {
            if (items.hasOwnProperty(name) && items[name].state !== LOADED) {
                return false;
            }
        }
        
        return true;
    }

    function preLoad(script, callback) {
        ///<summary>Used with text/cache hack</summary>
        callback = callback || noop;

        scriptTag({ src: script.url, type: 'cache' }, function () {
            // Delete state, because we already passed by load() for the preLoad() here
            delete script.state;
            load(script, callback);
        });
    }

    function load(script, callback) {
        ///<summary>Used with normal loading logic</summary>
        callback = callback || noop;

        if (script.state === LOADED) {
            callback();
            return;
        }

        // INFO: why would we trigger a ready event when its not really loaded yet ?
        if (script.state === LOADING) {
            api.ready(script.name, callback);
            return;
        }

        script.state = LOADING;

        scriptTag(script.url, function() {
            script.state = LOADED;
            callback();
            
            // handlers for this script
            each(handlers[script.name], function (fn) {
                one(fn);
            });

            // dom is ready & no scripts are queued for loading
            // INFO: shouldn't we be doing the same test above ?
            if (isDomReady && allLoaded()) {
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
        
        /* Good read, but doesn't give much hope !
         * http://blog.getify.com/on-script-loaders/
         * http://www.nczonline.net/blog/2010/12/21/thoughts-on-script-loaders/
         * https://hacks.mozilla.org/2009/06/defer/
         */
        
        // ASYNC: load in parellel and execute as soon as possible
        s.async = false;
        // DEFER: load in parallel but maintain execution order
        s.defer = false;

        // INFO: we need a reference back to this (because we are setting the script.state below), so maybe we should be passing it to the main function to begin with
        var script = getScript(s.src || s.href);
        function error(event) {
            // need some error handling here !
            // probably also a max timout to limit how long a script is allowed to stay in a LOADING state

            // Consider as loaded even though we have an error, otherwise we might block other scripts from loading, or .ready() event from firing.
            script.state = LOADED;
            
            // release event listeners
            s.onload = s.onreadystatechange = s.onerror = null;
            callback();
        }

        function process(event) {
            event = event || win.event;
            // IE 6-9 triggers 2 events
            //   1) event.type = readystatechange, s.readyState = loading
            //   2) event.type = readystatechange, s.readyState = loaded
            //       a) We get this event when loading from a server
            //   2) event.type = readystatechange, s.readyState = complete
            //       a) We get this event when loading from the browsers cache
            
            // IE 10 triggers 2 events
            //   1) event.type = readystatechange, s.readyState = loading
            //   2) event.type = load            , s.readyState = complete

            // Other browsers trigger 1 event
            //   1) event.type = load, s.readyState = undefined
            //console.log("type:", event.type, " ,readyState:", s.readyState, " ", s.src, " ", s.type);
            if (event.type === 'load' || /complete/.test(s.readyState)) {                                
                script.state = LOADED;
                
                // release event listeners
                s.onload = s.onreadystatechange = s.onerror = null;
                callback();
            }
            
            /* This part is for the text/cache handling & older browser support
            ********************************************************************/
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
    var readyTimeout;
    function domReady() {
        // INFO: head.ready() will fire too soon if scripts are currently in the process of loading
        // INFO: This however means that head.ready() is now dependant on head.js() having finished loading all queued scripts
        if (!allLoaded()) {
            // let's not get nasty by setting a timeout too small.. (loop mania guaranteed if scripts are queued)
            win.clearTimeout(readyTimeout);
            readyTimeout = win.setTimeout(domReady, 50);
            return;
        }
        
        // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
        if (!doc.body) {
            // let's not get nasty by setting a timeout too small.. (loop mania guaranteed if scripts are queued)
            win.clearTimeout(readyTimeout);
            readyTimeout = win.setTimeout(domReady, 50);
            return;
        }

        if (!isDomReady) {
            isDomReady = true;

            each(handlers.ALL, function (fn) {
                one(fn);
            });
        }
    }    
    function domContentLoaded() {
        if (doc.addEventListener) {
            doc.removeEventListener("DOMContentLoaded", domContentLoaded, false);
            domReady();
        } else if (doc.readyState === "complete") {
            // we're here because readyState === "complete" in oldIE
            // which is good enough for us to call the dom ready!
            doc.detachEvent("onreadystatechange", domContentLoaded);
            domReady();
        }
    };
    
    if (!isDomReady) {
        if (doc.readyState === "complete") {
            // let's not get nasty by setting a timeout too small.. (loop mania guaranteed if scripts are queued)
            // INFO: why would we set a timeout here ?
            win.clearTimeout(readyTimeout);
            readyTimeout = win.setTimeout(domReady, 1);
            //domReady();
        }
        else if (doc.addEventListener) {
            // Use the handy event callback
            doc.addEventListener("DOMContentLoaded", domContentLoaded, false);

            // A fallback to window.onload, that will always work
            win.addEventListener("load", domReady, false);
        }
        else {
            // Ensure firing before onload, maybe late but safe also for iframes
            doc.attachEvent("onreadystatechange", domContentLoaded);

            // A fallback to window.onload, that will always work
            win.attachEvent("onload", domReady);
            
            // If IE and not a frame
            // continually check to see if the document is ready
            var top = false;

            try {
                top = win.frameElement == null && doc.documentElement;
            } catch (e) { }
            
            if (top && top.doScroll) {
                (function doScrollCheck() {
                    if (!isDomReady) {
                        try {
                            // Use the trick by Diego Perini
                            // http://javascript.nwbox.com/IEContentLoaded/
                            top.doScroll("left");
                        } catch (error) {
                            // let's not get nasty by setting a timeout too small.. (loop mania guaranteed if scripts are queued)
                            win.clearTimeout(readyTimeout);
                            readyTimeout = win.setTimeout(doScrollCheck, 50);
                            return;
                        }

                        // and execute any waiting functions
                        domReady();
                    }
                })();
            }
        }

    }
    /* END READY
    ***************************************************/
})(window);