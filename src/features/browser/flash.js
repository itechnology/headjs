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