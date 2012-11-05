﻿// Test for browser silverlight support
head.feature("silverlight", function () {
    if (!!navigator.plugins["Silverlight Plug-In"]) {
        return true;
    }

    try {
        var control = new window.ActiveXObject('AgControl.AgControl');
        if (control) {
            var minVersion = 3;
            var maxVersion = 5;
            for (var i = maxVersion; i >= minVersion; i--) {
                if (control.isVersionSupported(i + ".0")) {
                    return true;
                }
            }
        }
    } catch (e) { }

    return false;
}, true);