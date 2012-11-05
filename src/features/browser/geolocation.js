// Test for browser geolocation support
head.feature("geolocation", function () {
    return "geolocation" in navigator;
}, true);