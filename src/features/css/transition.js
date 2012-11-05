// Test for css transition support
head.feature("transition", function () {
    return head.cssPropertyExists("transition");
}, true);