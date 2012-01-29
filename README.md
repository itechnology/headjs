Modified version of head.js [http://headjs.com](http://headjs.com)


* [Try it](http://itechnology.github.com/headjs/)

Changed from head.js v0.96:

    * Added/changed some browser detections
    * Removed conditional comments in css3.js
      * Replaced css3.js browser regex with simpler switch/case
    * Made css3 tests reflect actual css attribute naming convention
    * Corrected some closure usage
    * Added eq, lte, gte detections for browser/versions & height/width
      * ie, ie-eq6, h-gte468, w-lte1024
    * Restricted html5 shiv to ie < 9
    * Inverted css router naming convention
      * page-name, section-name
    * Inverted feature detection naming convention & made them boolean
      * js-true, font-face-false, border-radius-true
    * Using viewport size detection instead of resolution detection


Typo:

    * On head.js site it is stated that Iphone cannot cache files larger than 15Ko/25Ko
      * There seems to be a lot of contradictory info out there
    * But please check this out if you feel concerned
      * http://www.yuiblog.com/blog/2010/07/12/mobile-browser-cache-limits-revisited/
      * http://www.yuiblog.com/blog/2010/06/28/mobile-browser-cache-limits/