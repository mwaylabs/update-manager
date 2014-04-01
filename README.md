#update-manager

**update-manager** is a simple to use Node Packaged Module to keep all your files up to date.

There are several different use-cases. For example you can use it to deliver continuously new versions of your files. You can also use it for lazy loading.

##How it works
The usage is quit simple. You simply call the update-manager with a config object which contains a `extractPat`and a URL to a `version.json`.

everytime the update-manager is called, he compares the local version and the remote version. If the remote version is greater than the local, the download starts automatically.

###The version file

    {
        "version": "1.1.1",
        "updateURL": "http://example.com/path/to/your/files.zip"
    }

###Installation

`npm install update-manager`

###How to use

    var updateManager = require('update-manager');
    
    var config = {
        updateVersionURL: 'http://example.com/path/to/your/version.json',
        extractPath: 'global/path/to/your/dest'
    }
    
    // everytime init() is called, the update-manager looks for a new available version
    function init() {
        updateManager.update(config);
    }
