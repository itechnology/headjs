/**
 * Unittests: javascript loader
 */

// or "localhost"
var s = "http://localhost:62875";

module('Responsive.js');

test("Detections", function () {
    expect(8);

    ok(typeof head.features.js === "boolean", 'Tested for: head.features.js');
    ok(typeof head.features.touch === "boolean", 'Tested for: head.features.touch');
    ok(typeof head.screen.width === "number", 'Tested for: head.screen.width');
    ok(typeof head.screen.height === "number", 'Tested for: head.screen.height');
    ok(typeof head.screen.innerWidth === "number", 'Tested for: head.screen.innerWidth');
    ok(typeof head.screen.innerHeight === "number", 'Tested for: head.screen.innerHeight');
    ok(typeof head.screen.innerWidth === "number", 'Tested for: head.screen.innerWidth');
    ok(typeof head.screen.innerHeight === "number", 'Tested for: head.screen.innerHeight');
});



