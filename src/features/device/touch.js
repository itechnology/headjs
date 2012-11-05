// Test for device touch support
head.feature("touch", function () {
    return "ontouchstart" in window;
}, true);
