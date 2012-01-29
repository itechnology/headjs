/**
    Head JS     The only script in your <HEAD>
    Copyright   Tero Piirainen (tipiirai)
    License     MIT / http://bit.ly/mit-license
    Version     0.96

    http://headjs.com
    *****************

    Further modifications by: https://github.com/itechnology

    Changes:
        * Added/changed some browser detections
        * Added e, lt, gt detections for browser/versions & height/width
          * ie, ie-e6, h-gt468, w-lt1024
        * Restricted html5 shiv to ie-lt9
        * Inverted css router naming convention
          * page-name, section-name
        * Inverted feature detection naming convention & made them boolean
          * js-true, fontface-false
        * Using viewport size detection instead of resolution detection
*/
;(function(win, undefined) {
    var doc  = win.document, nav = win.navigator;
    var html = doc.documentElement, conf = {
            width : [320, 480, 640, 768, 800, 1024, 1280, 1440, 1680, 1920],
            height : [240, 320, 480, 600, 768, 800, 900, 1080],
            section: "section-",
            page   : "page-",
            head   : "head"
         },
         klass = [];

    if (win.head_conf) {
        for (var key in win.head_conf) {
            if (win.head_conf[key] !== undefined) {
                conf[key] = win.head_conf[key];
            }
        }
    }

    function pushClass(name) {
        klass[klass.length] = name;
    }

    function removeClass(name) {
        var re = new RegExp("\\b" + name + "\\b");
        html.className = html.className.replace(re, '');
    }

    function each(arr, fn) {
        for (var i = 0, arr_length = arr.length; i < arr_length; i++) {
            fn.call(arr, arr[i], i);
        }
    }

    // API
    var api = win[conf.head] = function() {
        api.ready.apply(null, arguments);
    };

    api.feature = function(key, enabled, queue) {

        // internal: apply all classes
        if (!key) {
            html.className += ' ' + klass.join( ' ' );
            klass = [];
            return;
        }

        if (Object.prototype.toString.call(enabled) == '[object Function]') {
            enabled = enabled.call();
        }

        pushClass(key + '-' + enabled);
        api[key] = !!enabled;

        // apply class to HTML element
        if (!queue) {
            removeClass(key + '-false');
            removeClass(key + '-true');
            api.feature();
        }

        return api;
    };

    // browser type & version
    var ua = nav.userAgent.toLowerCase();

    // http://www.zytrax.com/tech/web/browser_ids.htm
    // http://www.zytrax.com/tech/web/mobile_ids.html
    ua = /(chrome|firefox)[ \/]([\w.]+)/.exec( ua )                 || // Chrome & Firefox
         /(iphone|ipad|ipod)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) || // Mobile IOS
         /(android)(?:.*version)?[ \/]([\w.]+)/.exec( ua )          || // Mobile Webkit
         /(webkit|opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua )     || // Safari & Opera
         /(msie) ([\w.]+)/.exec( ua )                               || [];


    var browser = ua[1];
    var version = parseFloat(ua[2]);

    var start = 0;
    var stop  = 0;
    switch(browser) {
        case "msie":
            browser = 'ie';
            version = doc.documentMode || version;

            start = 6;
            stop  = 10;
            break;

        // Add/remove extra tests here
        case "chrome":
            start = 13;
            stop  = 18;
            break;

        case "firefox":
            browser = "ff";

            start = 3;
            stop  = 11;
            break;

        case "ipod":
        case "ipad":
        case "iphone":
            browser = "ios";

            start = 3;
            stop  = 5;
            break;

        case "android":
            start = 2;
            stop  = 4;
            break;

        case "webkit":
            browser = "safari";

            start = 9;
            stop  = 12;
            break;

        case "opera":
            start = 9;
            stop  = 12;
            break;
    }

    // name can be used further on for various tasks, like fontface detection in css3.js
    api.browser = {
        name   : browser,
        version: version
    };
    api.browser[browser] = true;

    pushClass(browser);
    for (var v = start; v <= stop; v++) {
        if (version < v) {
            pushClass(browser + "-lt" + v);
        }
        // unfortunately we are skipping numbers like 3.6 here which are rounded to 3...
        if (version === v) {
            pushClass(browser + "-e" + v);
        }
        if (version > v) {
            pushClass(browser + "-gt" + v);
        }
    }

    // IE lt9 specific
    if (api.browser.ie && version < 9) {
        // HTML5 support
        each("abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video".split("|"), function(el) {
            doc.createElement(el);
        });
    }

    // CSS "router"
    each(win.location.pathname.split("/"), function(el, i) {
        if (this.length > 2 && this[i + 1] !== undefined) {
            if (i) {
                pushClass(conf.section + this.slice(1, i + 1).join("-"));
            }
        } else {
            // pageId
            var id = el || "index", index = id.indexOf(".");
            if (index > 0) {
                id = id.substring(0, index);
            }
            html.id = conf.page + id;

            // on root?
            if (!i) {
                pushClass(conf.section + "root");
            }
      }
    });


    // viewport resolutions: w-e320, w-lt480, w-lt1024 / h-e600, h-lt768, h-lt1024
    function screenSize() {
        // remove earlier sizes
        html.className = html.className.replace(/ (w|w-e|w-gt|w-lt|h|h-e|h-gt|h-lt)\d+/g, "");

        // Viewport width
        var w = html.clientWidth;

        // just for debugging purposes
        pushClass("w" + w);

        each(conf.width, function(width) {
            if (w > width) {
                pushClass("w-gt" + width);
            }
            else if (w < width) {
                pushClass("w-lt" + width);
            }
            else {
                // this will rarely happen
                pushClass("w-e" + width);
            }
        });

        // Viewport height
        var h = html.clientHeight;

        // just for debugging purposes
        pushClass("h" + h);

        each(conf.height, function(height) {
             if (h > height) {
                 pushClass("h-gt"  + height);
             }
             else if (h < height) {
                 pushClass("h-lt" + height);
             }
             else {
                 // this will rarely happen
                 pushClass("h-e" + height);
             }
        });

        api.feature();
    }

    screenSize();
    win.onresize = screenSize;

    //api.feature("js", true).feature();
})(window);