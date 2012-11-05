// Test for css border-radius support
head.feature("borderRadius", function () {
    return head.cssPropertyExists("borderRadius");
}, true);