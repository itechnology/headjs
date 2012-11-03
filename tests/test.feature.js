/**
 * Test Feature Detection
 */
module('head.features.js');
 
var classes = " " + document.documentElement.className;

function hasClass(css) {
    return classes.indexOf(" " + css) !== -1;
}

test("Features", function () {
    expect(1);
    
    ok(hasClass('box-shadow-true') || hasClass('box-shadow-false'), 'Tested for: box-shadow');
});