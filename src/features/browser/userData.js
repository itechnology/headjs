// Test for browser userData support
head.feature("userData", function () {
    try {
        return !!(document.documentElement && document.documentElement.addBehavior);
    }
    catch (e) { }
    
    return false;
}, true);