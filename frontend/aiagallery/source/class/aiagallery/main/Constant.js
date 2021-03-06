/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Constants needed by the application
 */
qx.Class.define("aiagallery.main.Constant",
{
  statics :
  {
    SERVICES_URL : "/rpc",
    
    // Maximum upload file sizes
    // After testing we find out appengine only allow about 350kb upload,
    // therefore the multiplier is modified from 1024 to keep it constant.
    MAX_IMAGE_FILE_SIZE  : (1 * 350 * 1024),
    MAX_SOURCE_FILE_SIZE : (8 * 1024 * 1024),
    MAX_APK_FILE_SIZE    : (16 * 1024 * 1024),
    
    // valid upload MIME types
    VALID_IMAGE_TYPES  : ["image/gif", "image/jpeg", "image/png"],
    VALID_SOURCE_TYPES : [ "application/zip", "application/x-zip-compres" ],
    VALID_APK_TYPES    : 
    [ 
      "application/vnd.android.package-archive",
      "application/octet-stream"
    ],
    
    // Page names, used as unique and static identifiers of modules/tabs
    PageName :
      {
        Home       : "Home",
        FindApps   : "FindApps",
        MyApps     : "MyApps",
        Testing    : "Testing",
        Management : "Management",
        AppInfo    : "App",
        User       : "Profile",
        PublicUser : "PublicUser",
        Contest    : "Contest"
      }
  }
});
