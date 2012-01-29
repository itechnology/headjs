Modified version of head.js [http://headjs.com](http://headjs.com)


    Changes:

        * Added/changed some browser detections
        * Added e, lt, gt detections for browser/versions & height/width
          * ie, ie-e6, h-gt468, w-lt1024
        * Restricted html5 shiv to ie-lt9
        * Inverted css router naming convention
          * page-name, section-name
        * Inverted feature detection naming convention & made them boolean
          * js-true, fontface-false
        * Using viewport size detection instead of resolution detection
