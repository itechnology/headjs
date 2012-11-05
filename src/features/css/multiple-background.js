// Test for css multiple-background support
head.feature("multipleBackground", function () {
    var ele   = document.createElement("i"),
        style = ele.style;
    
    style.cssText = "background:url(//:),url(//:),red url(//:)";
    return new RegExp("(url\\s*\\(.*?){3}").test(style.background);
}, true);