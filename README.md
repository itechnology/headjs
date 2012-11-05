Modified version of head.js [http://headjs.com](http://headjs.com)


* [Try it](http://itechnology.github.com/headjs/)

0.98:

 * Conditional loader (testing)
 * rewrote big part of ready() code
   * fixes problems with ready() not being executed in certain cases
 * rewrote main function of loading code
   * fixes loading from inside <head> tag
   * fixes problems with callback not being executed in older browsers

Changed from head.js v0.96:

    * Added/changed some browser version detections
      * added browser-false classes      
      * added desktop/mobile feature detection
      * added landscape/portrait feature detection
    * Removed conditional comments in css3.js
      * Replaced css3.js browser regex with simpler switch/case
    * Made css3 tests reflect actual css attribute naming convention
      * js  features lowerCamelCase
      * css features lowercase dashed
    * Moved features to head.features namespace
    * Added head.screen namespace
      * added screen.inner/outerWidth
      * added screen.inner/outerHeight
      * added screen.height/width
    * Corrected some closure usage
    * Added eq, lte, gte detections for browser/versions & height/width
      * ie, ie-eq6, h-gte468, w-lte1024
    * Restricted html5 shiv to ie < 9
    * Inverted css router naming convention
      * page-name, section-name
      * force them to be lowerCase
    * Inverted feature detection naming convention & made them boolean
      * js-true, font-face-false, border-radius-true
    * Detect viewport size instead of resolution


Reminder to me:

    * http://www.yuiblog.com/blog/2010/07/12/mobile-browser-cache-limits-revisited/
    * http://www.yuiblog.com/blog/2010/06/28/mobile-browser-cache-limits/