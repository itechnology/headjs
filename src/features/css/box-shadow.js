// Test for css box-shadow support
head.feature("boxShadow", function () {
    return head.cssPropertyExists("boxShadow");
}, true);