/*!
 * HeadJS          The only script in your <HEAD>    
 * Created By      Tero Piirainen  (tipiirai)
 * Maintained By   Robert Hoffmann (itechnology)
 * License         MIT / http://bit.ly/mit-license
 *
 * Version 0.98
 * http://headjs.com
 */
; (function(win, undefined) {
    "use strict";
    
    var doc   = win.document,
        nav   = win.navigator,
        loc   = win.location,
        html  = doc.documentElement,
        klass = [],
        
        /* CSS Moderniser */
        cssEle   = doc.createElement("i"),
        style    = cssEle.style,
        domPrefs = 'Webkit Moz O ms Khtml'.split(' '),
        
        conf  = {
            width     : [240, 320, 480, 640, 768, 800, 1024, 1280, 1440, 1680, 1920],
            widthCss  : { "gt": true, "gte": false, "lt": true, "lte": false, "eq": false },
            height    : [240, 320, 480, 600, 768, 800, 900, 1050, 1080],
            heightCss : { "gt": true, "gte": false, "lt": true, "lte": false, "eq": false },
            browsers  : [
                          { ie     : { min: 6, max:  9 } }
                       //,{ chrome : { min: 8, max: 24 } }
                       //,{ ff     : { min: 3, max: 19 } }
                       //,{ ios    : { min: 3, max:  6 } }
                       //,{ android: { min: 2, max:  4 } }
                       //,{ webkit : { min: 9, max: 12 } }
                       //,{ opera  : { min: 9, max: 12 } }
                        ],
            browserCss: { "gt": true, "gte": false, "lt": true, "lte": false, "eq": true },
            section   : "section-",
            page      : "page-",
            head      : "head"
         };

    if (win.head_conf) {
        for (var item in win.head_conf) {
            if (win.head_conf[item] !== undefined) {
                conf[item] = win.head_conf[item];
            }
        }
    }
    
    function pushClass(name) {
        klass[klass.length] = name;
    }

    function removeClass(name) {
        var re  = new RegExp("\\b" + name + "\\b");
        html.className = html.className.replace(re, '');
    }

    function each(arr, fn) {
        for (var i = 0, l = arr.length; i < l; i++) {
            fn.call(arr, arr[i], i);
        }
    }
         
    // API
    var api = win[conf.head] = function() {
        api.ready.apply(null, arguments);
    };

    /* Feature Detections
    *********************/
    api.features = {};
    
    // INFO: add a use case to enable
    // head.feature("box-shadow", success, failure)
    api.feature  = function(key, enabled, queue) {

        // internal: apply all classes
        if (!key) {
            html.className += ' ' + klass.join( ' ' );
            klass = [];
            return api;
        }

        if (Object.prototype.toString.call(enabled) === '[object Function]') {
            enabled = enabled.call();
        }

        // css friendly (dashed lowercase)
        //  js friendly (lowerCamelCase)
        var cssKey = key.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });

        pushClass(cssKey + '-' + enabled);
        api.features[key] = !!enabled;

        // apply class to HTML element
        if (!queue) {
            removeClass(cssKey + '-false');
            removeClass(cssKey + '-true');
            api.feature();
        }

        return api;
    };
    
    /* CSS Moderniser, Thanks Paul Irish!
    *************************************/
    api.cssPropertyExists = function(prop) {
        ///<summary>
        /// Checks for the existance of a given css property
        /// cssPropertyExists("borderRadius")
        /// </summary>
        ///<param name="prop">loweCamelCase version of the property</param>
        
        var camel = prop.charAt(0).toUpperCase() + prop.substr(1),
            props = (prop + ' ' + domPrefs.join(camel + ' ') + camel).split(' ');

        for (var i in props) {
            if (style[props[i]] !== undefined) {
                return true;
            }
        }

        return false;
    };
    /* CSS Moderniser
    *************************/

    // no queue here, so we can remove any eventual pre-existing no-js class
    api.feature("js", true);

    // browser type & version
    var ua     = nav.userAgent.toLowerCase(),
        mobile = /mobile|midp/.test(ua);
    
    // useful for enabling/disabling feature (we can consider a desktop navigator to have more cpu/gpu power)        
    api.feature("mobile" ,  mobile, true);
    api.feature("desktop", !mobile, true);
    
    // http://www.zytrax.com/tech/web/browser_ids.htm
    // http://www.zytrax.com/tech/web/mobile_ids.html
    ua = /(chrome|firefox)[ \/]([\w.]+)/.exec(ua)                 || // Chrome & Firefox
         /(iphone|ipad|ipod)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || // Mobile IOS
         /(android)(?:.*version)?[ \/]([\w.]+)/.exec(ua)          || // Mobile Webkit
         /(webkit|opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua)     || // Safari & Opera
         /(msie) ([\w.]+)/.exec(ua)                               || [];


    var browser = ua[1],
        version = parseFloat(ua[2]);    
    
    switch(browser) {
        case 'msie':
            browser = 'ie';
            version = doc.documentMode || version;
            break;

        case 'firefox':
            browser = 'ff';
            break;

        case 'ipod':
        case 'ipad':
        case 'iphone':
            browser = 'ios';
            break;
    }
    

    // Browser vendor and version
    api.browser = {
        name   : browser,
        version: version        
    };
    api.browser[browser] = true;

    for (var i = 0, l = conf.browsers.length; i < l; i++) {
        for (var key in conf.browsers[i]) {            
            if (browser === key) {
                pushClass(key);
                pushClass(key + '-true');

                var min = conf.browsers[i][key].min;
                var max = conf.browsers[i][key].max;

                for (var v = min; v <= max; v++) {
                    if (version > v) {
                        if (conf.browserCss["gt"])
                            pushClass(key + "-gt" + v);
                        
                        if (conf.browserCss["gte"])
                            pushClass(key + "-gte" + v);                        
                    }
                    
                    else if (version < v) {
                        if (conf.browserCss["lt"])
                            pushClass(key + "-lt" + v);
                        
                        if (conf.browserCss["lte"])
                            pushClass(key + "-lte" + v);                        
                    }
                    
                    else if (version === v) {
                        if (conf.browserCss["lte"])
                            pushClass(key + "-lte" + v);
                        
                        if (conf.browserCss["eq"])
                            pushClass(key + "-eq" + v);
                        
                        if (conf.browserCss["gte"])
                            pushClass(key + "-gte" + v);                        
                    }
                }
            }
            else {
                pushClass(key + '-false');
            }
        }
    }    


    // IE lt9 specific
    if (browser === "ie" && version < 9) {
        // HTML5 support : you still need to add html5 css initialization styles to your site
        // See: dist/html5.css
        each("abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video".split("|"), function(el) {
            doc.createElement(el);
        });
    }


    // CSS "router"
    each(loc.pathname.split("/"), function(el, i) {
        if (this.length > 2 && this[i + 1] !== undefined) {
            if (i) {
                pushClass(conf.section + this.slice(1, i + 1).join("-").toLowerCase());
            }
        }
        else {
            // pageId
            var id = el || "index", index = id.indexOf(".");
            if (index > 0) {
                id = id.substring(0, index);
            }
            html.id = conf.page + id.toLowerCase();

            // on root?
            if (!i) {
                pushClass(conf.section + "root");
            }
      }
    });


    // basic screen info
    api.screen = {        
        height: win.screen.height,
        width : win.screen.width
    };
    

    // viewport resolutions: w-eq320, w-lte480, w-lte1024 / h-eq600, h-lte768, h-lte1024
    function screenSize() {
        // remove earlier sizes
        html.className = html.className.replace(/ (w|w-eq|w-gt|w-gte|w-lt|w-lte|h|h-eq|h-gt|h-gte|h-lt|h-lte|portrait|no-portrait|landscape|no-landscape)\d+/g, "");

        // Viewport width
        var iw = win.innerWidth || html.clientWidth,
            ow = win.outerWidth || win.screen.width;

        api.screen['innerWidth'] = iw;
        api.screen['outerWidth'] = ow;

        // for debugging purposes, not really useful for anything else
        pushClass("w" + iw);

        each(conf.width, function (width) {
            if (iw > width) {
                if (conf.widthCss["gt"])
                    pushClass("w-gt" + width);
                
                if (conf.widthCss["gte"])
                    pushClass("w-gte" + width);
            }

            else if (iw < width) {
                if (conf.widthCss["lt"])
                    pushClass("w-lt" + width);
                
                if (conf.widthCss["lte"])
                    pushClass("w-lte" + width);
            }

            else if (iw === width) {
                if (conf.widthCss["lte"])
                    pushClass("w-lte" + width);
                
                if (conf.widthCss["eq"])
                    pushClass("w-eq" + width);
                
                if (conf.widthCss["gte"])
                    pushClass("w-gte" + width);
            }
        });
        

        // Viewport height
        var ih = win.innerHeight || html.clientHeight,
            oh = win.outerHeight || win.screen.height;

        api.screen['innerHeight'] = ih;
        api.screen['outerHeight'] = oh;

        // for debugging purposes, not really useful for anything else
        pushClass("h" + ih);

        each(conf.height, function(height) {
            if (ih > height) {
                if (conf.heightCss["gt"])
                    pushClass("h-gt" + height);
                
                if (conf.heightCss["gte"])
                    pushClass("h-gte" + height);
             }

            else if (ih < height) {
                if (conf.heightCss["lt"])
                    pushClass("h-lt" + height);
                
                if (conf.heightCss["lte"])
                    pushClass("h-lte" + height);
             }

            else if (ih === height) {
                if (conf.heightCss["lte"])
                    pushClass("h-lte" + height);
                
                if (conf.heightCss["eq"])
                    pushClass("h-eq" + height);
                
                if (conf.heightCss["gte"])
                    pushClass("h-gte" + height);                
             }
        });        

        // no need for onChange event to detect this
        api.feature("portrait" , (ih > iw));
        api.feature("landscape", (ih < iw));
    }
        
    screenSize();
    
    // Throttle navigators from triggering too many resize events
    var resizeId = 0;    
    function onResize() {
        win.clearTimeout(resizeId);
        resizeId = win.setTimeout(screenSize, 100);        
    }
    
    // Manually attach, as to not overwrite existing handler
    if (win.addEventListener) {
        win.addEventListener("resize", onResize, false);

    } else {
        win.attachEvent("onresize", onResize);
    }
})(window);
// Test for browser flash support
head.feature("flash", function () {
    if (!!navigator.plugins["Shockwave Flash"]) {
        return true;
    }

    var minVersion = 9;
    var maxVersion = 11;                        
    for (var i = maxVersion; i >= minVersion; i--)
    {
        try
        {
            return !!new window.ActiveXObject("ShockwaveFlash.ShockwaveFlash." + i);
        }
        catch (e) { }
    }                        

    return false;
}, true);
// Test for browser geolocation support
head.feature("geolocation", function () {
    return "geolocation" in navigator;
}, true);
// Test for browser localStorage support
head.feature("localStorage", function () {
    try {
        // Firefox won't allow localStorage if cookies are disabled
        if (!!window.localStorage) {
            // Safari's "Private" mode throws a QUOTA_EXCEEDED_ERR on setItem
            window.localStorage.setItem("head:localstorage", true);
            window.localStorage.removeItem("head:localstorage");

            return true;
        }
    } catch (e) {}

    return false;
}, true);
// Test for device retina support
head.feature("retina", function () {
    return (window.devicePixelRatio > 1);
}, true);

// Test for device touch support
head.feature("touch", function () {
    return "ontouchstart" in window;
}, true);

// Trigger feature(), since all tests where added via queue
head.feature();

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
    // INFO: Even better. Look into promises/defered like jQuery is doing
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

        // INFO: we need a reference back to this, so maybe we should be passing it to the main function to begin with
        var script = getScript(s.src || s.href);
        function error(event) {
            // need some error handling here !

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
        // INFO: ready will fire too soon if scripts are currently in the process of loading
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
