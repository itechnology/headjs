// Test for css text-shadow support
head.feature("textShadow", function () {
    var el = document.createElement("i");
    return el.style.textShadow === '';
}, true);