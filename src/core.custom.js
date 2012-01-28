/**
    Head JS     The only script in your <HEAD>
    Copyright   Tero Piirainen (tipiirai)
    License     MIT / http://bit.ly/mit-license
    Version     0.96

    http://headjs.com

    Custom implementation:
        * Removed feature detection code
        * Added e, lt, gt, lte, gte detections for browser versions & height/width
        * Restricted html5 shiv to ie-lt9
        * Inverted css router naming conventions
*/
(function(window, undefined) {

    var html = window.document.documentElement, conf = {
            width  : [320, 480, 640, 768, 1024, 1280, 1440, 1680, 1920],
            height : [240, 320, 480, 600, 768, 800, 900, 1080],
            section: "section-",
            page   : "page-",
            head   : "head"
         },
         klass = [];


    if (window.head_conf) {
        for (var key in window.head_conf) {
            if (window.head_conf[key] !== undefined) {
                conf[key] = window.head_conf[key];
            }
        }
    }

    function pushClass(name) {
        klass[klass.length] = name;
    }

    function each(arr, fn) {
        for (var i = 0, arr_length = arr.length; i < arr_length; i++) {
            fn.call(arr, arr[i], i);
        }
    }

    // API
    var api = window[conf.head] = function() {
        api.ready.apply(null, arguments);
    };

    api.feature = function(key, enabled, queue) {
        // internal: apply all classes
        html.className += ' ' + klass.join( ' ' );
        klass = [];
    };

    // browser type & version
    var ua = window.navigator.userAgent.toLowerCase();

    ua = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
         /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
         /(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
         /(msie) ([\w.]+)/.exec( ua ) ||
         !/compatible/.test( ua ) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) || [];

    var browser = ua[1];
    var version = parseFloat(ua[2]);

    var start = 0;
    var stop  = 0;
    switch(browser) {
        case "msie":
            browser = 'ie';
            version = window.document.documentMode || version;

            start = 6;
            stop  = 10;
            break;

        case "chrome":
            start = 13;
            stop  = 18;
            break;

        case "opera":
            start = 9;
            stop  = 12;
            break;

        case "mozilla":
            start = 3;
            stop  = 11;
            break;
    }

    api.browser        = { version: version };
    api.browser[browser] = true;

    pushClass(browser);
    for (var ver = start; ver <= stop; ver++) {
        if (version < ver) {
            pushClass(browser + "-lt" + ver);
        }
        if (version == ver) {
            pushClass(browser + "-e"   + ver);
            pushClass(browser + "-lte" + ver);
            pushClass(browser + "-gte" + ver);
        }
        if (version > ver) {
            pushClass(browser + "-gt" + ver);
        }
    }


    // IE lt9 specific
    if (api.browser.ie && version < 9) {
        // HTML5 support
        each("abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video".split("|"), function(el) {
            window.document.createElement(el);
        });
    }


    // CSS "router"
    each(location.pathname.split("/"), function(el, i) {

        if (this.length > 2 && this[i + 1] !== undefined) {
            if (i) { pushClass(conf.section + this.slice(1, i + 1).join("-")); }

        } else {

            // pageId
            var id = el || "index", index = id.indexOf(".");
            if (index > 0) { id = id.substring(0, index); }
            html.id = conf.page + id;

            // on root?
            if (!i) { pushClass(conf.section + "root"); }
      }
    });


    // viewport resolutions: w-e320, w-lt480, w-lt1024 / h-e600, h-lt768, h-lt1024
    function screenSize() {
        // remove earlier sizes
        html.className = html.className.replace(/ (w-e|w-gt|w-gte|w-lt|w-lte|h-e|h-gt|h-gte|h-lt|h-lte)\d+/g, "");

        // Viewport width
        var w = html.clientWidth;
        each(conf.width, function(width) {
            if (w > width) { pushClass("w-gt" + width); }

            if (w === width) {
                pushClass("w-e"   + width);
                pushClass("w-gte" + width);
                pushClass("w-lte" + width);
            }

            if (w < width) { pushClass("w-lt" + width); }
        });

        // Viewport height
        var h = html.clientHeight;
        each(conf.height, function(height) {
            if (h > height) { pushClass("h-gt" + height); }

            if (h === height) {
                pushClass("h-e"   + height);
                pushClass("h-gte" + height);
                pushClass("h-lte" + height);
            }

            if (h < height) { pushClass("h-lt" + height); }
        });

        api.feature();
    }

    screenSize();
    window.onresize = screenSize;
})(window);


