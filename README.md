Modified version of head.js [http://headjs.com](http://headjs.com)


* [Try it](http://itechnology.github.com/headjs/)

Changes:

    * Added/changed some browser detections
    * Removed conditional comments in css3.js
      * Replaced css3.js browser regex with simpler switch/case
    * Corrected some closure usage
    * Added eq, lte, gte detections for browser/versions & height/width
      * ie, ie-eq6, h-gte468, w-lte1024
    * Restricted html5 shiv to ie < 9
    * Inverted css router naming convention
      * page-name, section-name
    * Inverted feature detection naming convention & made them boolean
      * js-true, fontface-false
    * Using viewport size detection instead of resolution detection
