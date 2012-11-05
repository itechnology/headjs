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

