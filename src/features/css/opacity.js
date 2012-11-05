// Test for css opacity support
head.feature("opacity", function () {
    var el = document.createElement("i");
    return el.style.opacity === '';
}, true);