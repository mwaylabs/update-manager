/**
 * Created by timoweiss on 01.04.14.
 */
"use strict";

var loader = require('../updateLoader');
var fs = require('fs');

console.log(loader.update);

var globalExtensionDir = "/Users/timoweiss/Library/Application Support/Brackets/extensions/user";
globalExtensionDir = globalExtensionDir.replace(/\/[^\/]+$/, '');

var options = {
    updateVersionURL: "http://localhost:8000/version.json",
    globalExtensionDir: globalExtensionDir
}
fs.unlink(globalExtensionDir + 'quickrequire/assets/version.json', function(err) {
    loader.update(options);
});