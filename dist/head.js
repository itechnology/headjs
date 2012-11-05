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
            widthCss  : { "gt": true, "gte": true, "lt": true, "lte": true, "eq": true },
            height    : [240, 320, 480, 600, 768, 800, 900, 1050, 1080],
            heightCss : { "gt": true, "gte": true, "lt": true, "lte": true, "eq": true },
            browsers  : [
                          { ie     : { min: 6, max: 10 } },
                          { chrome : { min: 8, max: 24 } },
                          { ff     : { min: 3, max: 19 } },
                          { ios    : { min: 3, max:  6 } },
                          { android: { min: 2, max:  4 } },
                          { webkit : { min: 9, max: 12 } },
                          { opera  : { min: 9, max: 12 } }
                        ],
            browserCss: { "gt": true, "gte": true, "lt": true, "lte": true, "eq": true },
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
