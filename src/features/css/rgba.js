// Test for css rgba support
head.feature("rgba", function () {
    var ele   = document.createElement("i"),
        style = ele.style;
    
    style.cssText = "background-color:rgba(0,0,0,0.5)";
    return !!style.backgroundColor;
}, true);