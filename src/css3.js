/**
    Head JS     The only script in your <HEAD>
    Copyright   Tero Piirainen (tipiirai)
    License     MIT / http://bit.ly/mit-license
    Version     Modified: v0.96

    https://github.com/itechnology/headjs
*/
;(function(win, undefined) {
    var doc  = win.document, nav = win.navigator;

    /*
        To add a new test:

        head.feature("video", function() {
            var tag = document.createElement('video');
            return !!tag.canPlayType;
        });

        Good place to grab more tests

        https://github.com/Modernizr/Modernizr/blob/master/modernizr.js
    */

    /* CSS modernizer */
    var el = doc.createElement("i"),
         style    = el.style,
         prefs    = ' -o- -moz- -ms- -webkit- -khtml- '.split(' '),
         domPrefs = 'Webkit Moz O ms Khtml'.split(' '),

         head_var = win.head_conf && win.head_conf.head || "head",
         api      = win[head_var];

    win.test = style;
     // Thanks Paul Irish!
    function testProps(props) {
        for (var i in props) {
            if (style[props[i]] !== undefined) {
                return true;
            }
        }
    }


    function testAll(prop) {
        var camel = prop.charAt(0).toUpperCase() + prop.substr(1),
            props = (prop + ' ' + domPrefs.join(camel + ' ') + camel).split(' ');

        return !!testProps(props);
    }

    var tests = {

        gradient: function() {
            var s1 = 'background-image:',
                s2 = 'gradient(linear,left top,right bottom,from(#9f9),to(#fff));',
                s3 = 'linear-gradient(left top,#eee,#fff);';

            style.cssText = (s1 + prefs.join(s2 + s1) + prefs.join(s3 + s1)).slice(0,-s1.length);
            return !!style.backgroundImage;
        },

        rgba: function() {
            style.cssText = "background-color:rgba(0,0,0,0.5)";
            return !!style.backgroundColor;
        },

        opacity: function() {
            return el.style.opacity === '';
        },

        text_shadow: function() {
            return style.textShadow === '';
        },

        multiple_background: function() {
            style.cssText = "background:url(//:),url(//:),red url(//:)";
            return new RegExp("(url\\s*\\(.*?){3}").test(style.background);
        },

        box_shadow: function() {
            return testAll("boxShadow");
        },

        border_image: function() {
            return testAll("borderImage");
        },

        border_radius: function() {
            return testAll("borderRadius");
        },

        box_reflect: function() {
            return testAll("boxReflect");
        },

        transform: function() {
            return testAll("transform");
        },

        transition: function() {
            return testAll("transition");
        },

        /* Euhmm ..
         * i guess version numbers all depend on what kind of font detection you actually want: svg, woff, ttf/otf, or eot
         * http://caniuse.com/#search=font
         * The following values are set up for WOFF
         ***********************/
        font_face: function() {
            var browser = api.browser.name, version = api.browser.version;

            switch(browser) {
                case "ie":
                    return version >= 9;

                case "chrome":
                    return version >= 13;

                case "ff":
                    return version >= 6;

                case "ios":
                    return version >= 5;

                case "android":
                    return false;

                case "safari":
                    return version >= 5.1;

                case "opera":
                    return version >= 10;

                default:
                    return false;
            }

            return false;
        }
    };

    // queue features
    for (var key in tests) {
        if (tests[key]) {
            api.feature(key, tests[key].call(), true);
        }
    }

    // enable features at once
    api.feature();

})(window);