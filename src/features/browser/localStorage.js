﻿// Test for browser localStorage support
head.feature("localStorage", function () {
    try {
        // Firefox won't allow localStorage if cookies are disabled
        if (!!window.localStorage) {
            // Safari's "Private" mode throws a QUOTA_EXCEEDED_ERR on setItem
            window.localStorage.setItem("head:localstorage", true);
            window.localStorage.removeItem("head:localstorage");

            return true;
        }
    } catch (e) {}

    return false;
}, true);